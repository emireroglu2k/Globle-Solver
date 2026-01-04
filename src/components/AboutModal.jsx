import React from 'react';
import { X, Globe, ExternalLink } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#B592A0]/10 p-2 rounded-lg text-[#B592A0]">
                            <Globe size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">About Globle Solver</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 text-gray-600 leading-relaxed">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">What is this?</h3>
                        <p>
                            This tool helps you find a mystery country using distances. If you know how far away a mystery country is from other countries, you can enter those clues here. The app will calculate which countries fit all your clues and show them on the map.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">How to use</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>
                                <strong>Add a Clue:</strong> Select a country from the list or type its name, then enter a distance in kilometers.
                            </li>
                            <li>
                                <strong>Visualize the Range:</strong> The tool generates a ring on the map. The target country must be located somewhere along this ring.
                            </li>
                            <li>
                                <strong>Filter Candidates:</strong> As you add more clues, the application calculates the intersection of all active rings.
                                <ul className="list-disc pl-5 mt-1 text-sm text-gray-500">
                                    <li><strong>Highlighted Countries:</strong> Valid options that satisfy all distance constraints.</li>
                                    <li><strong>Greyed-out Countries:</strong> Eliminated candidates that do not fit the criteria.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Territory Mode:</strong> Toggle "Include Overseas Territories" to choose whether distances should be measured from a country's main landmass or its closest territory.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Details</h3>
                        <p className="text-sm">
                            This application uses geodesic triangulation. For each clue, it projects a ring on the Earth's spherical surface at the exact distance specified. By computing the intersection of these multiple rings, the solver eliminates countries that don't fit the criteria. It uses precise geodesic calculations (accounting for the Earth's curvature) to ensure accuracy even over long distances.
                        </p>
                    </section>

                    <section className="bg-[#B592A0]/10 p-4 rounded-xl border border-[#B592A0]/20 text-sm">
                        <h4 className="font-semibold text-slate-800 mb-1">Inspiration</h4>
                        <p className="text-slate-600">
                            The inspiration for this website came from building a helper tool designed to assist players of the daily geography game, Globle.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                    Built with React, Leaflet & D3-Geo
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
