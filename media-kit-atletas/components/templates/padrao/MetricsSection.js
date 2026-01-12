import React from 'react';
import { BarChart3, TrendingUp, Instagram, MessageCircle, Share2, Users, MapPin, PieChart } from 'lucide-react';

export default function MetricsSection({ athleteData }) {
    if (!athleteData?.socials?.instagram) return null;

    const insta = athleteData.socials.instagram;
    const stats = insta.stats || {};
    const audience = insta.audience || {};

    // Helper to extract numbers from strings (e.g. "68% Men" -> 68)
    const parseGender = (str) => {
        if (!str) return { men: 68, women: 32 }; // Default defaults

        const menMatch = str.match(/(\d+)%\s*Homens/i);
        const womenMatch = str.match(/(\d+)%\s*Mulheres/i);

        let men = menMatch ? parseInt(menMatch[1]) : 50;
        let women = womenMatch ? parseInt(womenMatch[1]) : 50;

        // If only one matches, deduce the other (if simple format) or fallback
        if (menMatch && !womenMatch) women = 100 - men;
        if (!menMatch && womenMatch) men = 100 - women;

        return { men, women };
    };

    const { men: menPct, women: womenPct } = parseGender(audience.gender);

    const citiesList = audience.cities ? audience.cities.split(',').map(c => c.trim()) : [];

    return (
        <section className="bg-[#1E1E1E] industrial-border p-8 md:p-12 relative overflow-hidden animate-fadeIn" id="metrics">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .industrial-border { border: 1px solid #333333; }
                .skew-tag { transform: skew(-12deg); }
                .skew-tag-content { transform: skew(12deg); }
            `}</style>

            <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-10 relative z-10 w-full">
                <h2 className="font-display font-black uppercase text-4xl md:text-6xl text-white leading-none tracking-tighter">
                    Social Media Metrics <span className="text-gray-700">&</span> Audience
                </h2>
                <div className="h-2 w-32 bg-pink-600 mt-4 skew-tag shadow-[0_0_20px_rgba(219,39,119,0.6)]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

                {/* COLUMN 1: INSTAGRAM PERFORMANCE */}
                <div className="bg-[#111] border border-[#333] p-6 md:p-8 relative group w-full">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-800 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-pink-600/10 border border-pink-600/30 rounded-sm">
                                <Instagram className="text-pink-500" size={32} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wide">Instagram Performance</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Last 30 Days Activity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-green-500" size={16} />
                            <span className="text-green-500 font-mono font-bold">+24.8%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Reach" value={stats.reach} icon={<Users size={20} />} />
                        <StatBox label="Impressions" value={stats.impressions} icon={<BarChart3 size={20} />} />
                        <StatBox label="Engagement" value={stats.engagement} icon={<MessageCircle size={20} />} />
                        <StatBox label="Shares" value={stats.shares} icon={<Share2 size={20} />} />
                    </div>
                </div>

                {/* COLUMN 2: DEMOGRAPHICS */}
                <div className="bg-[#111] border border-[#333] p-6 md:p-8 flex flex-col justify-between relative w-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 to-transparent opacity-50"></div>

                    <div>
                        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                            <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wide">Demographics</h3>
                            <PieChart className="text-gray-600" size={24} />
                        </div>

                        <div className="space-y-8">
                            {/* AGE RANGE */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Primary Age Range</span>
                                    <span className="font-display font-bold text-2xl text-white">{audience.age || "N/A"}</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 overflow-hidden">
                                    <div className="bg-white w-[65%] h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                </div>
                            </div>

                            {/* GENDER DISTRIBUTION */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Gender Distribution</span>
                                </div>
                                {/* Visual Bar */}
                                <div className="flex w-full h-4 gap-1">
                                    <div
                                        className="h-full bg-cyan-400 skew-tag shadow-[0_0_10px_rgba(34,211,238,0.4)] flex items-center justify-center transition-all duration-500"
                                        style={{ width: `${menPct}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-pink-600 skew-tag shadow-[0_0_10px_rgba(219,39,119,0.4)] transition-all duration-500"
                                        style={{ width: `${womenPct}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider">
                                    <div className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 bg-cyan-400 rounded-full"></span> Men {menPct}%</div>
                                    <div className="text-pink-600 flex items-center gap-1">Women {womenPct}% <span className="w-2 h-2 bg-pink-600 rounded-full"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOP CITIES */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h5 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Top Cities</h5>
                        <div className="space-y-4">
                            {citiesList.length > 0 ? citiesList.map((city, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-pink-600" size={18} />
                                        <span className="font-display font-bold text-white uppercase tracking-wide text-sm">{city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            {/* Randomized width for visual variety since we lack pct data */}
                                            <div className="bg-pink-600 h-full" style={{ width: `${Math.max(30, 80 - (idx * 20))}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-500 text-xs">No cities data available</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

// Sub-component for individual stats
function StatBox({ label, value, icon }) {
    return (
        <div className="bg-[#161616] p-5 border border-gray-800 hover:border-pink-600 transition-colors group/item">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                <div className="text-pink-600 group-hover/item:scale-110 transition-transform">{icon}</div>
            </div>
            <div className="font-display font-bold text-2xl md:text-4xl text-white truncate" title={value}>
                {value || 0}
            </div>
        </div>
    );
}