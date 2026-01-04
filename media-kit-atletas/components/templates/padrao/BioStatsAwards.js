import React from 'react';
import { Ruler, Weight, Activity, Calendar, Trophy, Instagram, Youtube, Twitter, Video, Film, ExternalLink } from 'lucide-react';

const SOCIAL_ICONS = {
    instagram: { icon: <Instagram size={20}/>, color: 'hover:text-pink-500', bg: 'hover:border-pink-500', label: 'Instagram' },
    youtube: { icon: <Youtube size={20}/>, color: 'hover:text-red-500', bg: 'hover:border-red-500', label: 'YouTube' },
    tiktok: { icon: <Film size={20}/>, color: 'hover:text-cyan-400', bg: 'hover:border-cyan-400', label: 'TikTok' },
    x: { icon: <Twitter size={20}/>, color: 'hover:text-slate-400', bg: 'hover:border-slate-400', label: 'X / Twitter' },
    kwai: { icon: <Video size={20}/>, color: 'hover:text-orange-500', bg: 'hover:border-orange-500', label: 'Kwai' },
};

export default function BioStatsAwards({ athleteData }) {
    const stats = athleteData.stats || {};
    const socials = athleteData.socials || {};
    const awards = athleteData.premios || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 animate-fadeIn">
            
            {/* COLUNA ESQUERDA: BIO + SOCIAL CARDS */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* BIO */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-white font-bold uppercase text-lg mb-4 flex items-center gap-2">
                        <Activity className="text-cyan-500"/> Sobre
                    </h3>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {athleteData.about || "Sem biografia cadastrada."}
                    </p>
                </div>

                {/* SOCIAL CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(socials).map(([key, data]) => {
                        if (!data.active || !data.url) return null;
                        const config = SOCIAL_ICONS[key];
                        return (
                            <a key={key} href={data.url} target="_blank" className={`bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${config.bg} hover:bg-slate-900/80`}>
                                <div className={`text-slate-400 transition-colors ${config.color}`}>{config.icon}</div>
                                <span className="text-xs font-bold text-white uppercase">{config.label}</span>
                                {data.followers && <span className="text-[10px] text-slate-500">{data.followers} Seg.</span>}
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* COLUNA DIREITA: ATRIBUTOS + PRÊMIOS */}
            <div className="lg:col-span-5 space-y-8">
                
                {/* ATRIBUTOS FÍSICOS */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-white font-bold uppercase text-lg mb-6 flex items-center gap-2">
                        <Ruler className="text-yellow-500"/> Atributos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold">Altura</span>
                            <p className="text-white font-bold text-lg flex items-center gap-1"><Ruler size={14} className="text-cyan-500"/> {stats.height || '-'}</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold">Peso</span>
                            <p className="text-white font-bold text-lg flex items-center gap-1"><Weight size={14} className="text-cyan-500"/> {stats.weight || '-'}</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold">Envergadura</span>
                            <p className="text-white font-bold text-lg flex items-center gap-1"><Activity size={14} className="text-cyan-500"/> {stats.reach || '-'}</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold">Idade</span>
                            <p className="text-white font-bold text-lg flex items-center gap-1"><Calendar size={14} className="text-cyan-500"/> {stats.age || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* PRÊMIOS */}
                {awards.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-white font-bold uppercase text-lg mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500"/> Conquistas
                        </h3>
                        <ul className="space-y-3">
                            {awards.map((award, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                    <Trophy size={16} className="text-yellow-500 mt-0.5 flex-shrink-0"/>
                                    <span>{award}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}