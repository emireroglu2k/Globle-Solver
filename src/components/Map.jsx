import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ countries, candidates, clues, onSelectCountry, selectedCountry, hoveredCountry, onHoverCountry }) => {

    const getName = (feature) => feature.properties.ADMIN || feature.properties.name;

    const candidateNames = React.useMemo(() => {
        return new Set(candidates.map(c => getName(c)));
    }, [candidates]);

    // Style function for countries
    const style = (feature) => {
        const name = getName(feature);

        const isHovered = hoveredCountry && getName(hoveredCountry) === name;
        const isSelected = selectedCountry && getName(selectedCountry) === name;
        const isClue = clues.find(c => getName(c.country) === name);
        const isCandidate = candidateNames.has(name);

        let fillColor = '#e5e7eb'; // Default Gray
        let fillOpacity = 0.5;
        let color = '#374151';
        let weight = 0.5;

        // Solution Space Logic
        if (candidates.length > 0) {
            if (isCandidate) {
                fillColor = '#95BF74'; // Green
                fillOpacity = 1;
            } else {
                fillOpacity = 0.5; // Dim eliminated
            }
        } else {
            fillColor = '#95BF74'; // Start Green
            fillOpacity = 1;
        }

        // Overrides
        if (isClue) {
            fillColor = '#B592A0';
            fillOpacity = 0.8;
            weight = 2;
        }
        if (isSelected) {
            fillColor = '#B592A0';
            fillOpacity = 0.5;
            weight = 2;
        }

        if (isHovered) {
            color = '#111827';
            weight = 2;
        }

        return {
            fillColor,
            fillOpacity,
            color,
            weight,
            opacity: 1
        };
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            click: () => {
                onSelectCountry(feature);
            },
            mouseover: () => {
                onHoverCountry(feature);
            },
            mouseout: () => {
                onHoverCountry(null);
            }
        });

        // Tooltip
        const name = getName(feature);
        layer.bindTooltip(name, { sticky: true });
    };

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#f3f4f6' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                noWrap={true}
            />
            {countries && (
                <GeoJSON
                    data={countries}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    );
};

export default MapComponent;
