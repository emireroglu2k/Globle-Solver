import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Trash2, Edit2, RotateCcw, Info, Globe, Loader, ChevronUp, ChevronDown, GripHorizontal, X } from 'lucide-react';

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
    isLoading,
    tolerancePercentage,
    onToleranceChange
}) => {
    const [distance, setDistance] = useState(0);
    const [inputValue, setInputValue] = useState('');

    // Mobile Sheet State
    const [sheetHeight, setSheetHeight] = useState(40); // % height
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const startHeight = useRef(0);

    const sheetRef = useRef(null);

    // Initial input sync
    useEffect(() => {
        if (selectedCountry) {
            setDistance(0);
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

    // Handlers
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
            setDistance(0);
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

    // Mobile Drag Logic
    const handleDragStart = (e) => {
        setIsDragging(true);
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartY.current = clientY;
        startHeight.current = sheetHeight;
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - dragStartY.current;
            const windowHeight = window.innerHeight;
            const deltaPercent = (deltaY / windowHeight) * 100;

            // Invert delta because dragging up increases height
            let newHeight = startHeight.current - deltaPercent;

            // Clamp
            newHeight = Math.max(15, Math.min(92, newHeight));
            setSheetHeight(newHeight);
        };

        const handleUp = () => {
            if (!isDragging) return;
            setIsDragging(false);
            // Snap logic
            if (sheetHeight > 60) setSheetHeight(92);
            else if (sheetHeight > 30) setSheetHeight(40);
            else setSheetHeight(15);
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
    }, [isDragging, sheetHeight]);

    return (
        <>
            {/* Desktop Sidebar / Mobile Bottom Sheet Wrapper */}
            <div
                ref={sheetRef}
                className={`
                    fixed md:relative z-[2000] bg-white shadow-2xl md:shadow-xl
                    flex flex-col transition-[height] ease-out duration-100
                    bottom-0 left-0 right-0 md:inset-auto md:w-[400px] md:h-full md:border-r border-gray-200
                    rounded-t-2xl md:rounded-none overflow-hidden
                    h-[var(--sheet-height)] md:!h-full
                `}
                style={{
                    '--sheet-height': `${sheetHeight}%`
                }}
            >
                {/* Mobile Drag Handle */}
                <div
                    className="md:hidden flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none bg-white"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 py-3 md:p-5 border-b border-gray-100 flex-shrink-0 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#B592A0]/10 p-2 rounded-xl">
                            <Globe size={22} className="text-[#B592A0]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">Globle Solver</h1>
                            <button
                                onClick={onOpenAbout}
                                className="text-xs text-slate-400 hover:text-[#B592A0] flex items-center gap-1 transition-colors"
                            >
                                <Info size={12} />
                                <span>About & How to use</span>
                            </button>
                        </div>
                    </div>
                    {/* Settings / Controls Summary (Visible if collapsed on mobile could go here, but keeping clean for now) */}
                </div>

                {/* Scrollable Main Content */}
                <div className="flex-1 flex flex-col bg-gray-50/50 overflow-y-auto md:overflow-hidden overscroll-contain">
                    <div className="p-4 space-y-5 flex-shrink-0">

                        {/* INPUT SECTION */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/80">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                        Reference Country
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-[#B592A0] transition-colors" size={18} />
                                        <input
                                            list="country-list"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 
                                            focus:ring-2 focus:ring-[#B592A0]/20 focus:border-[#B592A0] outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Type a country name..."
                                        />
                                        <datalist id="country-list">
                                            {sortedCountries.map((c, i) => (
                                                <option key={i} value={getDisplayName(c)} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Distance Input - Expands when country selected */}
                                <div className="mt-2 text-slate-600">
                                    <div className="pt-1 space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                                Distance from {selectedCountry ? (selectedCountry.properties.ADMIN || selectedCountry.properties.name) : 'country'} (km)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={distance}
                                                    onChange={(e) => setDistance(e.target.value)}
                                                    onFocus={() => distance === 0 && setDistance('')}
                                                    onBlur={() => distance === '' && setDistance(0)}
                                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#B592A0]/20 focus:border-[#B592A0] outline-none transition-all"
                                                    placeholder="Enter the distance in km"
                                                // autoFocus removed to prevent jumping on mobile if always visible
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={distance === ''}
                                                    className="px-6 py-2.5 bg-[#B592A0] hover:bg-[#a17e8c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Tolerance & Options */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <button
                                className="flex items-center justify-between w-full group"
                                onClick={(e) => {
                                    // Optional: keep it expanded or simple
                                    // keeping it straightforward for now
                                }}
                            >
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration</span>
                            </button>
                            <div className="mt-3 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 block mb-1">Error Tolerance</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={tolerancePercentage}
                                                onChange={(e) => onToleranceChange(parseFloat(e.target.value))}
                                                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B592A0]"
                                            />
                                            <div className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono font-medium text-slate-600 w-12 text-center">
                                                {tolerancePercentage}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="include-territories"
                                        className="rounded text-[#B592A0] focus:ring-[#B592A0] border-gray-300 w-4 h-4"
                                        checked={includeTerritories}
                                        onChange={(e) => onToggleTerritories(e.target.checked)}
                                    />
                                    <label htmlFor="include-territories" className="text-sm text-slate-600 select-none cursor-pointer">
                                        Include Territories
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTINGS / CLUES */}
                    <div className="flex-shrink-0 flex flex-col px-4 pb-2">
                        {/* Clues List */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Clues ({clues.length})
                                </h3>
                                {clues.length > 0 && (
                                    <button
                                        onClick={onResetClues}
                                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1"
                                    >
                                        <RotateCcw size={10} /> Reset
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2 h-[200px] overflow-y-auto pr-1 bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-inner">
                                {clues.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                                        No clues added yet
                                    </div>
                                ) : (
                                    clues.map((clue, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#B592A0]/30 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-[#B592A0]/20 rounded-full group-hover:bg-[#B592A0] transition-colors" />
                                                <div>
                                                    <div className="font-semibold text-slate-700 text-sm">
                                                        {getDisplayName(clue.country)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {clue.distance} km
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditClue(clue, index)}
                                                    className="p-1.5 text-slate-300 hover:text-[#B592A0] rounded-lg hover:bg-[#B592A0]/5 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveClue(index)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="flex-shrink-0 flex flex-col px-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${candidates.length > 0 ? 'bg-[#95BF74]/20 text-[#6ea344]' : 'bg-gray-100 text-gray-400'}`}>
                                    {candidates.length}
                                </span>
                            </div>
                            {isLoading && <Loader size={16} className="animate-spin text-[#B592A0]" />}
                        </div>
                        {/* Candidate List - Fixed Height */}
                        <div className="overflow-y-auto h-[300px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-inner">
                            {candidates.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 text-sm">No matching countries found.</p>
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
                                                    px-3 py-2 text-sm cursor-pointer transition-all flex items-center justify-between rounded-lg
                                                    ${isSelected ? 'bg-[#95BF74] text-white shadow-sm'
                                                        : isHovered ? 'bg-[#95BF74]/10 text-[#6ea344]'
                                                            : 'text-slate-600 hover:bg-white hover:shadow-sm'}
                                                `}
                                            >
                                                <span className="font-medium truncate">{name}</span>
                                                {isSelected && <MapPin size={14} />}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop - only visible when sheet is high up */}
            {sheetHeight > 60 && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-[1900] backdrop-blur-[1px] transition-opacity"
                    onClick={() => setSheetHeight(40)}
                />
            )}
        </>
    );
};

export default Sidebar;
