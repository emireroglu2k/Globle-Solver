import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

async function generate() {
    console.log("Starting distance generation...");
    const publicDir = path.join(process.cwd(), 'public');
    const geoJsonPath = path.join(publicDir, 'world.geojson');

    if (!fs.existsSync(geoJsonPath)) {
        console.error("world.geojson not found at", geoJsonPath);
        process.exit(1);
    }

    const rawData = fs.readFileSync(geoJsonPath, 'utf8');
    const data = JSON.parse(rawData);

    // Simplify heavily for calculation speed
    const tolerance = 0.15; // ~16km
    console.log(`Simplifying geometries with tolerance ${tolerance}...`);
    const simplified = turf.simplify(data, { tolerance: tolerance, mutate: false });

    const features = simplified.features;
    const count = features.length;
    console.log(`Processing ${count} countries...`);

    const distances = {}; // Key: ID (AFG), Value: { ID (AGO): distance }

    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
        const countryA = features[i];
        const idA = countryA.id || countryA.properties.ISO_A3 || countryA.properties.name;
        distances[idA] = {};

        for (let j = 0; j < count; j++) {
            const countryB = features[j];
            const idB = countryB.id || countryB.properties.ISO_A3 || countryB.properties.name;

            if (i === j) {
                distances[idA][idB] = 0;
                continue;
            }

            if (distances[idB] && distances[idB][idA] !== undefined) {
                distances[idA][idB] = distances[idB][idA];
                continue;
            }

            let dist = Infinity;

            if (turf.booleanIntersects(countryA, countryB)) {
                dist = 0;
            } else {
                try {
                    const linesB = turf.polygonToLine(countryB);
                    const pointsA = turf.explode(countryA);

                    const flatLinesB = turf.flatten(linesB);
                    const lineFeaturesB = flatLinesB.features;

                    for (const point of pointsA.features) {
                        for (const line of lineFeaturesB) {
                            const d = turf.pointToLineDistance(point, line, { units: 'kilometers' });
                            if (d < dist) dist = d;
                        }
                    }

                    if (dist > 0) {
                        const linesA = turf.polygonToLine(countryA);
                        const pointsB = turf.explode(countryB);

                        const flatLinesA = turf.flatten(linesA);
                        const lineFeaturesA = flatLinesA.features;

                        for (const point of pointsB.features) {
                            for (const line of lineFeaturesA) {
                                const d = turf.pointToLineDistance(point, line, { units: 'kilometers' });
                                if (d < dist) dist = d;
                            }
                        }
                    }

                } catch (e) {
                    console.error(`Error calculating ${idA} <-> ${idB}`, e.message);
                    dist = 99999;
                }
            }

            distances[idA][idB] = Math.round(dist * 10) / 10;
        }

        if (i % 10 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            console.log(`Processed ${i}/${count} (${Math.round(i / count * 100)}%) in ${Math.round(elapsed)}s...`);
        }
    }

    const outputPath = path.join(publicDir, 'distances.json');
    fs.writeFileSync(outputPath, JSON.stringify(distances, null, 0));
    console.log(`Written distances to ${outputPath}`);
}

generate().catch(console.error);
