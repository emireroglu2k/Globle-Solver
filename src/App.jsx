import React, { useEffect, useState } from 'react';
import MapComponent from './components/Map';
import Sidebar from './components/Sidebar';
import AboutModal from './components/AboutModal'; // Import new modal
import SolverWorker from './workers/solver.worker?worker';


function App() {
    const [countries, setCountries] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [clues, setClues] = useState([]);
    const [candidates, setCandidates] = useState([]); // Filtered countries
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false); // New state for calculation loading
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [includeTerritories, setIncludeTerritories] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [worker, setWorker] = useState(null);

    // Initialize Worker
    useEffect(() => {
        const w = new SolverWorker();

        w.onmessage = (e) => {
            const { type, countries: loadedCountries, candidates: newCandidates, error } = e.data;

            if (type === 'READY') {
                setCountries(loadedCountries);
                setCandidates(loadedCountries.features || []);
                setLoading(false);
            } else if (type === 'RESULT') {
                setCandidates(newCandidates);
                setCalculating(false);
            } else if (type === 'ERROR') {
                console.error("Worker Error:", error);
                setLoading(false);
                setCalculating(false);
            }
        };

        const baseUrl = import.meta.env.BASE_URL;
        const worldUrl = `${baseUrl}world.geojson`;
        const distancesUrl = `${baseUrl}distances.json`;

        w.postMessage({
            type: 'INIT',
            payload: { worldUrl, distancesUrl }
        });
        setWorker(w);

        return () => w.terminate();
    }, []);

    // Helper to trigger filter
    const updateCandidates = (currentClues, currentIncludeTerritories) => {
        if (!worker) return;
        setCalculating(true);
        worker.postMessage({
            type: 'FILTER',
            payload: {
                clues: currentClues,
                includeTerritories: currentIncludeTerritories
            }
        });
    };

    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
    };

    const handleAddClue = (country, distance) => {
        const newClue = { country, distance };
        const newClues = [...clues, newClue];
        setClues(newClues);
        setSelectedCountry(null);
        updateCandidates(newClues, includeTerritories);
    };

    const handleRemoveClue = (index) => {
        const newClues = clues.filter((_, i) => i !== index);
        setClues(newClues);
        updateCandidates(newClues, includeTerritories);
    };

    const handleResetClues = () => {
        setClues([]);
        if (countries) {
            setCandidates(countries.features);
        }
        setSelectedCountry(null);
    };

    const handleToggleTerritories = (val) => {
        setIncludeTerritories(val);
        updateCandidates(clues, val);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen bg-gray-50 text-gray-500 font-medium">
                Loading Map Data...
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 overflow-hidden">
            <Sidebar
                allCountries={countries ? countries.features : []}
                selectedCountry={selectedCountry}
                onSelectCountry={handleSelectCountry}
                onAddClue={handleAddClue}
                onRemoveClue={handleRemoveClue}
                onResetClues={handleResetClues}
                clues={clues}
                candidates={candidates || []}
                hoveredCountry={hoveredCountry}
                onHoverCountry={setHoveredCountry}
                includeTerritories={includeTerritories}
                onToggleTerritories={handleToggleTerritories}
                onOpenAbout={() => setIsAboutOpen(true)}
                isLoading={calculating}
            />

            <div className="flex-1 relative">
                <MapComponent
                    countries={countries}
                    candidates={candidates}
                    clues={clues}
                    selectedCountry={selectedCountry}
                    onSelectCountry={handleSelectCountry}
                    hoveredCountry={hoveredCountry}
                    onHoverCountry={setHoveredCountry}
                />
            </div>

            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
            />
        </div>
    );
}

export default App;
