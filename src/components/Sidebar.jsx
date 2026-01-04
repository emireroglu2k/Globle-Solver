import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Trash2, Edit2, RotateCcw, Info, Globe, Loader, ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

const Sidebar = ({
    allCountries,
    selectedCountry,
    onSelectCountry,
    onAddClue,
    onRemoveClue,
    onResetClues,
    clues,
    candidates,
    hoveredCountry,
    onHoverCountry,
    includeTerritories,
    onToggleTerritories,
    onOpenAbout,
    isLoading
}) => {
    const [distance, setDistance] = useState('');

    const [inputValue, setInputValue] = useState('');
    const [mobileHeight, setMobileHeight] = useState(40); // vh
    const [isDragging, setIsDragging] = useState(false);

    // Initial load/resize handler to clean up inline styles on desktop if needed,
    // though CSS !important is cleaner.

    const handleDragStart = (e) => {
        setIsDragging(true);
        // Prevent default to stop scrolling/selection while dragging
        // e.preventDefault(); // Optional, might block touch scrolling if not careful
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const windowHeight = window.innerHeight;
            // Calculate percentage
            const newHeight = (clientY / windowHeight) * 100;
            // Clamp between 20vh and 90vh
            const clamped = Math.max(20, Math.min(90, newHeight));
            setMobileHeight(clamped);
        };

        const handleUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging]);

    const toggleExpansion = () => {
        // Snap to 40 or 85
        setMobileHeight(h => h > 50 ? 40 : 85);
    };

    useEffect(() => {
        if (selectedCountry) {
            setDistance('');
            setInputValue(selectedCountry.properties.ADMIN || selectedCountry.properties.name);
        }
    }, [selectedCountry]);

    const sortedCountries = useMemo(() => {
        if (!allCountries) return [];
        return [...allCountries].sort((a, b) => {
            const nameA = a.properties.ADMIN || a.properties.name;
            const nameB = b.properties.ADMIN || b.properties.name;
            return nameA.localeCompare(nameB);
        });
    }, [allCountries]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        const match = allCountries.find(c =>
            (c.properties.ADMIN || c.properties.name) === val
        );
        if (match) {
            onSelectCountry(match);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCountry && distance !== '') {
            onAddClue(selectedCountry, parseFloat(distance));
            setDistance('');
            setInputValue('');
        }
    };

    const handleEditClue = (clue, index) => {
        onSelectCountry(clue.country);
        setDistance(clue.distance);
        setInputValue(clue.country.properties.ADMIN || clue.country.properties.name);
        onRemoveClue(index);
    };

    const getDisplayName = (feature) => feature.properties.ADMIN || feature.properties.name;

    return (
        <div
            className={`
                w-full md:w-[400px] bg-white shadow-xl z-[1000] flex flex-col md:border-r border-b md:border-b-0 border-gray-200 transition-[height] duration-75 ease-out
                md:!h-full
            `}
            style={{ height: `${mobileHeight}vh` }}
        >


            <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex-shrink-0 relative">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#B592A0]/10 p-2 rounded-lg">
                            <Globe size={20} className="text-[#B592A0]" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">Globle Solver</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleExpansion}
                            className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
                        >
                            {mobileHeight > 50 ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                        <button
                            onClick={onOpenAbout}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
                            title="About"
                        >
                            <Info size={20} />
                        </button>
                    </div>
                </div>
                <p className="text-slate-500 text-xs ml-11">Locate the mystery country</p>
            </div>


            <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col bg-gray-50">
                <div className="p-4 md:p-5 space-y-6">
                    {/* Add Clue Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Clue</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1 group">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Reference Country
                                </label>
                                <div className="relative">
                                    <input
                                        list="country-list"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#B592A0]/20 focus:border-[#B592A0] outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Search..."
                                    />
                                    <Search className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <datalist id="country-list">
                                    {sortedCountries.map((c, i) => (
                                        <option key={i} value={getDisplayName(c)} />
                                    ))}
                                </datalist>
                            </div>

                            {selectedCountry && (
                                <div className="animate-in slide-in-from-top-2 duration-200 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 block">Distance (km)</label>
                                        <input
                                            type="number"
                                            value={distance}
                                            onChange={(e) => setDistance(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="distance to the country"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-[#B592A0] hover:bg-[#a17e8c] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        Add Clue
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>


                    <div className="flex items-center gap-3 px-1">
                        <label className="flex items-center gap-3 cursor-pointer group flex-1">
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={includeTerritories}
                                    onChange={(e) => onToggleTerritories(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B592A0]"></div>
                            </div>
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors select-none">Include Territories</span>
                        </label>
                    </div>

                    {/* Active Clues */}
                    {clues.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Clues ({clues.length})</h2>
                                <button
                                    onClick={onResetClues}
                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    <RotateCcw size={12} />
                                    Reset
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[120px] md:max-h-[200px] overflow-y-auto pr-1">
                                {clues.map((clue, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-[#B592A0]/50 hover:border-[#B592A0] rounded-lg shadow-sm group transition-all">
                                        <div className="text-sm">
                                            <span className="font-semibold text-slate-700">{getDisplayName(clue.country)}</span>
                                            <span className="text-slate-300 mx-2">•</span>
                                            <span className="text-[#B592A0] font-medium">{clue.distance} km</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClue(clue, index)}
                                                className="p-1.5 text-slate-400 hover:text-[#B592A0] hover:bg-[#B592A0]/10 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => onRemoveClue(index)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                <div className="flex-shrink-0 md:flex-1 flex flex-col border-t border-gray-200 bg-white md:overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Candidates
                        </span>
                        {isLoading && <Loader size={12} className="animate-spin text-blue-600 mr-2" />}
                        <span className="bg-[#95BF74]/20 text-[#6ea344] text-xs font-medium px-2 py-0.5 rounded-full">
                            {candidates.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {candidates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                                <Search size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No countries match these clues.</p>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {candidates.slice().sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b))).map((c, i) => {
                                    const name = getDisplayName(c);
                                    const isHovered = hoveredCountry && getDisplayName(hoveredCountry) === name;
                                    const isSelected = selectedCountry && getDisplayName(selectedCountry) === name;

                                    return (
                                        <li
                                            key={i}
                                            onMouseEnter={() => onHoverCountry(c)}
                                            onMouseLeave={() => onHoverCountry(null)}
                                            onClick={() => onSelectCountry(c)}
                                            className={`
                                                px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center justify-between
                                                ${isSelected
                                                    ? 'bg-[#95BF74] text-white shadow-sm'
                                                    : isHovered
                                                        ? 'bg-[#95BF74]/10 text-[#95BF74]'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <span className="truncate">{name}</span>
                                            {isSelected && <MapPin size={14} className="flex-shrink-0" />}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Drag Handle (Mobile Only) */}
            <div
                className="md:hidden h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-center cursor-ns-resize touch-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
        </div>
    );
};

export default Sidebar;
