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
    const [tolerancePercentage, setTolerancePercentage] = useState(5);
    const [worker, setWorker] = useState(null);
    const [includeTerritories, setIncludeTerritories] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

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

        // Use absolute URLs with explicit handling for trailing slashes
        // This ensures proper resolution whether at /globle_solver/ or /globle_solver (no slash)
        let appBase = window.location.href;
        appBase = appBase.split('?')[0].split('#')[0]; // Clean search/hash
        if (appBase.endsWith('index.html')) {
            appBase = appBase.substring(0, appBase.lastIndexOf('/') + 1);
        } else if (!appBase.endsWith('/')) {
            appBase += '/';
        }

        const worldUrl = new URL('world.geojson', appBase).href;
        const distancesUrl = new URL('distances.json', appBase).href;

        w.postMessage({
            type: 'INIT',
            payload: { worldUrl, distancesUrl }
        });
        setWorker(w);

        return () => w.terminate();
    }, []);

    // Helper to trigger filter
    const updateCandidates = (currentClues, currentIncludeTerritories, currentTolerancePct) => {
        if (!worker) return;
        setCalculating(true);
        worker.postMessage({
            type: 'FILTER',
            payload: {
                clues: currentClues,
                includeTerritories: currentIncludeTerritories,
                tolerancePercentage: currentTolerancePct
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
        updateCandidates(newClues, includeTerritories, tolerancePercentage);
    };

    const handleRemoveClue = (index) => {
        const newClues = clues.filter((_, i) => i !== index);
        setClues(newClues);
        updateCandidates(newClues, includeTerritories, tolerancePercentage);
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
        updateCandidates(clues, val, tolerancePercentage);
    };

    const handleToleranceChange = (percent) => {
        setTolerancePercentage(percent);
        updateCandidates(clues, includeTerritories, percent);
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
                tolerancePercentage={tolerancePercentage}
                onToleranceChange={handleToleranceChange}
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
