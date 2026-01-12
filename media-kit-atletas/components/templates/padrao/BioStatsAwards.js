import React from 'react';
import { Ruler, Weight, Activity, Calendar, Trophy, Instagram, Youtube, Twitter, Video, Film, ExternalLink } from 'lucide-react';

const SOCIAL_ICONS = {
    instagram: { icon: <Instagram size={32} />, color: 'text-pink-500', bg: 'bg-pink-600/10 group-hover:bg-pink-600/20', label: 'Followers' },
    youtube: { icon: <Youtube size={32} />, color: 'text-red-600', bg: 'bg-red-600/10 group-hover:bg-red-600/20', label: 'Subscribers' },
    tiktok: { icon: <Film size={32} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10 group-hover:bg-cyan-400/20', label: 'Followers' },
    x: { icon: <Twitter size={32} />, color: 'text-slate-400', bg: 'bg-slate-400/10 group-hover:bg-slate-400/20', label: 'Followers' },
    kwai: { icon: <Video size={32} />, color: 'text-orange-500', bg: 'bg-orange-500/10 group-hover:bg-orange-500/20', label: 'Followers' },
};

export default function BioStatsAwards({ athleteData }) {
    const stats = athleteData.stats || {};
    const socials = athleteData.socials || {};
    const awards = athleteData.premios || [];

    // Helper to format numbers (e.g. 15000 -> 15K) - Simple version
    const formatNumber = (numStr) => {
        if (!numStr) return '0';
        const num = parseInt(numStr.replace(/\D/g, ''));
        if (isNaN(num)) return numStr;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 animate-fadeIn font-display" id="bio-stats-component">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .industrial-border {
                    border: 1px solid #333333;
                }
                .skew-tag {
                    transform: skew(-12deg);
                }
                .skew-tag-content {
                    transform: skew(12deg);
                }
            `}</style>

            {/* LEFT COLUMN: BIO & SOCIALS */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                {/* BIO SECTION */}
                <section className="relative bg-[#1A1A1A] industrial-border p-6 md:p-10 overflow-hidden h-full shadow-lg rounded-sm" id="bio">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
                    <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none transform rotate-12">
                        <span className="material-symbols-outlined text-9xl text-white">format_quote</span>
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase mb-6 inline-flex flex-col items-start leading-none tracking-tight">
                            Bio & Achievements
                            <span className="h-1.5 w-24 bg-[#FF4500] mt-2 skew-x-[-12deg]"></span>
                        </h2>
                        <div className="prose prose-invert prose-lg max-w-none text-gray-300 font-body font-light leading-relaxed mb-6 whitespace-pre-wrap">
                            {athleteData.about || "Sem biografia cadastrada."}
                        </div>
                    </div>
                </section>

                {/* SOCIAL STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(socials).map(([key, data]) => {
                        if (!data.active || !data.url) return null;
                        const config = SOCIAL_ICONS[key] || SOCIAL_ICONS.instagram; // Fallback
                        return (
                            <a
                                key={key}
                                href={data.url}
                                target="_blank"
                                className={`bg-[#121212] border border-[#333] hover:border-[#FF4500] border-b-4 border-b-${config.color.split('-')[1]}-500 p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-[#1E1E1E] transition-all group rounded-sm`}
                            >
                                <div className={`p-2 md:p-3 rounded-full ${config.bg} transition-colors`}>
                                    <div className={`${config.color}`}>{config.icon}</div>
                                </div>
                                <span className="text-2xl md:text-3xl font-display font-bold text-white mt-1">{formatNumber(data.followers)}</span>
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{config.label}</span>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: ATTRIBUTES & AWARDS */}
            <div className="lg:col-span-5 flex flex-col gap-8">

                {/* ATTRIBUTES SECTION */}
                <section className="bg-[#1A1A1A] industrial-border p-6 md:p-10 shadow-lg rounded-sm" id="stats">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase mb-8 inline-flex flex-col leading-none tracking-tight">
                        Attributes
                        <span className="h-1.5 w-full bg-[#FFD700] mt-2 skew-x-[-12deg]"></span>
                    </h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                        <div className="flex flex-col gap-1 group">
                            <div className="flex items-center gap-2 mb-2">
                                <Ruler size={16} className="text-[#FFD700] group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Height</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold text-white">{stats.height ? stats.height.replace('m', '') : '-'} <span className="text-sm text-gray-500 align-top mt-1 inline-block font-normal font-body">m</span></div>
                        </div>
                        <div className="flex flex-col gap-1 group">
                            <div className="flex items-center gap-2 mb-2">
                                <Weight size={16} className="text-[#FFD700] group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Weight</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold text-white">{stats.weight ? stats.weight.replace('kg', '') : '-'} <span className="text-sm text-gray-500 align-top mt-1 inline-block font-normal font-body">kg</span></div>
                        </div>
                        <div className="flex flex-col gap-1 group">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-[#FFD700] group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reach</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold text-white">{stats.reach ? stats.reach.replace('m', '') : '-'} <span className="text-sm text-gray-500 align-top mt-1 inline-block font-normal font-body">m</span></div>
                        </div>
                        <div className="flex flex-col gap-1 group">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-[#FFD700] group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Age</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold text-white">{stats.age || '-'} <span className="text-sm text-gray-500 align-top mt-1 inline-block font-normal font-body">yo</span></div>
                        </div>
                    </div>
                </section>

                {/* MAJOR TITLES (AWARDS) SECTION */}
                <section className="bg-[#1A1A1A] industrial-border p-6 md:p-10 flex-1 shadow-lg rounded-sm">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase mb-8 inline-flex flex-col leading-none tracking-tight">
                        Major Titles
                        <span className="h-1.5 w-3/4 bg-[#FFD700] mt-2 skew-x-[-12deg]"></span>
                    </h2>
                    <div className="space-y-4">
                        {awards.length > 0 ? (
                            awards.map((award, idx) => (
                                <div key={idx} className="relative bg-[#121212] p-4 border border-[#333] border-l-4 border-l-[#FFD700] overflow-hidden group hover:bg-[#1E1E1E] hover:border-[#FFD700]/50 transition-all rounded-sm">
                                    <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Trophy className="text-5xl text-[#FFD700]" />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] border border-[#FFD700]/20">
                                            <Trophy size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-display font-bold text-white uppercase text-base md:text-lg leading-none group-hover:text-[#FFD700] transition-colors">{award}</h4>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mt-1 tracking-wider">Achievement</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 font-body text-sm text-center py-4 italic border border-dashed border-gray-800 rounded">No major titles listed.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}