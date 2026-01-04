import * as turf from '@turf/turf';

let countries = null; // cached geojson feature collection
let distanceMatrix = null;
let distanceCache = new Map();

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        try {
            const { worldUrl, distancesUrl } = payload;
            await loadData(worldUrl, distancesUrl);
            self.postMessage({ type: 'READY', countries });
        } catch (err) {
            console.error(err);
            self.postMessage({ type: 'ERROR', error: err.message });
        }
    } else if (type === 'FILTER') {
        if (!countries) {
            self.postMessage({ type: 'ERROR', error: 'Data not loaded' });
            return;
        }
        const { clues, includeTerritories } = payload;
        const candidates = filterCandidates(countries.features, clues, includeTerritories);
        self.postMessage({ type: 'RESULT', candidates });
    }
};

async function loadData(worldUrl, distancesUrl) {
    try {
        const [geoResponse, distResponse] = await Promise.all([
            fetch(worldUrl),
            fetch(distancesUrl).catch(e => ({ ok: false }))
        ]);

        if (!geoResponse.ok) {
            throw new Error('Failed to load map data');
        }

        const data = await geoResponse.json();

        data.features.forEach(feature => {
            feature._mainland = getMainland(feature);
        });

        countries = data;

        if (distResponse.ok) {
            try {
                distanceMatrix = await distResponse.json();
            } catch (e) {
                console.warn("Worker: Failed to parse distance matrix");
            }
        }
    } catch (e) {
        console.error("Worker: Error loading data:", e);
        throw e;
    }
}

function getMainland(country) {
    if (country.geometry.type === 'Polygon') {
        return country;
    }

    if (country.geometry.type === 'MultiPolygon') {
        let maxArea = 0;
        let mainPolygon = null;

        country.geometry.coordinates.forEach(coords => {
            const poly = turf.polygon(coords);
            const area = turf.area(poly);
            if (area > maxArea) {
                maxArea = area;
                mainPolygon = poly;
            }
        });

        if (mainPolygon) {
            // Keep properties but use the single polygon geometry
            // We create a new object to avoid mutating the original feature structure too much
            return {
                type: 'Feature',
                properties: country.properties,
                geometry: mainPolygon.geometry
            };
        }
    }

    return country;
}

function getCacheKey(idA, idB, includeTerritories) {
    // Sort IDs to ensure symmetry (A-B is same as B-A)
    const [first, second] = idA < idB ? [idA, idB] : [idB, idA];
    return `${first}|${second}|${includeTerritories}`;
}

function calculateMinDistance(countryA, countryB, includeTerritories = false) {
    const idA = countryA.properties.ISO_A3 || countryA.properties.name;
    const idB = countryB.properties.ISO_A3 || countryB.properties.name;

    // 0. Cache Check
    const cacheKey = getCacheKey(idA, idB, includeTerritories);
    if (distanceCache.has(cacheKey)) {
        return distanceCache.get(cacheKey);
    }

    // 1. Try Matrix Lookup ONLY if we are including territories (standard mode)
    if (includeTerritories && distanceMatrix) {
        if (distanceMatrix[idA] && distanceMatrix[idA][idB] !== undefined) {
            const dist = distanceMatrix[idA][idB];
            distanceCache.set(cacheKey, dist);
            return dist;
        }
        if (distanceMatrix[idB] && distanceMatrix[idB][idA] !== undefined) {
            const dist = distanceMatrix[idB][idA];
            distanceCache.set(cacheKey, dist);
            return dist;
        }
    }

    // 2. Dynamic Calculation
    // Use pre-computed mainland if available and not including territories
    const geomA = includeTerritories ? countryA : (countryA._mainland || getMainland(countryA));
    const geomB = includeTerritories ? countryB : (countryB._mainland || getMainland(countryB));

    if (turf.booleanIntersects(geomA, geomB)) {
        distanceCache.set(cacheKey, 0);
        return 0;
    }

    // Optimization: Use Point-to-Polygon distance
    // This is still heavy, but we do it in a worker now.

    // Convert polygons to lines for border distance
    const linesB = turf.polygonToLine(geomB);
    const pointsA = turf.explode(geomA);
    const lineFeaturesB = linesB.type === 'FeatureCollection' ? linesB.features : [linesB];

    let minDistance = Infinity;

    for (const point of pointsA.features) {
        for (const line of lineFeaturesB) {
            try {
                const dist = turf.pointToLineDistance(point, line, { units: 'kilometers' });
                if (dist < minDistance) minDistance = dist;
            } catch (e) { }
        }
    }

    // Symmetric check: Points of B to Lines of A
    const linesA = turf.polygonToLine(geomA);
    const pointsB = turf.explode(geomB);
    const lineFeaturesA = linesA.type === 'FeatureCollection' ? linesA.features : [linesA];

    for (const point of pointsB.features) {
        for (const line of lineFeaturesA) {
            try {
                const dist = turf.pointToLineDistance(point, line, { units: 'kilometers' });
                if (dist < minDistance) minDistance = dist;
            } catch (e) { }
        }
    }

    distanceCache.set(cacheKey, minDistance);
    return minDistance;
}

function filterCandidates(allCountries, clues, includeTerritories = false) {
    return allCountries.filter(candidate => {
        return clues.every(clue => {
            const dist = calculateMinDistance(candidate, clue.country, includeTerritories);

            if (clue.distance === 0) {
                return dist === 0;
            }

            const tolerance = Math.max(50, clue.distance * 0.05);
            return Math.abs(dist - clue.distance) <= tolerance;
        });
    });
}
