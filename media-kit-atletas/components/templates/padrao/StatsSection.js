import React from 'react';

export default function StatsSection({ athleteData, computedStats }) {
    
    // REGRA DE OURO: Se não for atleta, não mostre estatísticas de luta!
    if (!athleteData.is_athlete) {
        return null; 
    }

    const { total, winRate, koRate } = computedStats;
    const wins = athleteData.record?.wins || 0;
    const losses = athleteData.record?.losses || 0;
    const draws = athleteData.record?.draws || 0;

    return (
        <div id="stats-section" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group">
                <span className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{total}</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Lutas Totais</span>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group">
                <span className="text-4xl font-black text-green-500 mb-1 group-hover:scale-110 transition-transform">{wins}</span>
                <span className="text-xs uppercase tracking-widest text-green-500/50 font-bold">Vitórias</span>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group">
                <span className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{winRate}%</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Aproveitamento</span>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group">
                <span className="text-4xl font-black text-red-500 mb-1 group-hover:scale-110 transition-transform">{koRate}%</span>
                <span className="text-xs uppercase tracking-widest text-red-500/50 font-bold">Taxa de K.O.</span>
            </div>
        </div>
    );
}