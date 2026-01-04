// components/templates/shared/StatsComponents.js
import React from 'react';
import { Trophy, Activity, Target, Eye } from 'lucide-react';

export const StatCircle = ({ value, label, color = "text-cyan-400", subLabel }) => {
    const numericValue = parseInt(value) || 0;
    const displayValue = isNaN(numericValue) ? "0%" : `${numericValue}%`;
    const dashOffset = 351 - (351 * numericValue) / 100;
    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                    <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={351} strokeDashoffset={isNaN(numericValue) ? 351 : dashOffset} strokeLinecap="round" className={`${color} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute flex flex-col items-center"><span className={`text-2xl sm:text-3xl font-bold ${color}`}>{displayValue}</span></div>
            </div>
            <span className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
            {subLabel && <span className="text-[10px] sm:text-xs text-slate-500">{subLabel}</span>}
        </div>
    );
};

export const StatCard = ({ icon: Icon, value, label, highlight = false, colorClass = 'text-cyan-400' }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 sm:p-6 border ${highlight ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 bg-slate-900/50'} backdrop-blur-sm group hover:border-cyan-400/50 transition-all duration-300 h-full flex flex-col justify-between`}>
        <div className="flex items-center justify-between mb-2">
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${highlight ? colorClass : 'text-slate-500 group-hover:text-cyan-400'} transition-colors`} />
            {highlight && <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')} animate-pulse`}></div>}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-1 break-all">{value || '-'}</div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</div>
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent"></div>
    </div>
);

export const FightRow = ({ result, event, date }) => {
    const isWin = result === 'W';
    const isDraw = result === 'D';
    let badgeClass = 'bg-red-500/20 text-red-400 border-red-500/30';
    let resultText = 'DERROTA';
    if (isWin) { badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30'; resultText = 'VITÓRIA'; } 
    else if (isDraw) { badgeClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; resultText = 'EMPATE'; }

    return (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-base sm:text-lg border ${badgeClass}`}>{result}</div>
                <div><h4 className="font-bold text-white text-base sm:text-lg">{event}</h4><p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">{date}</p></div>
            </div>
            <div className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full uppercase ${isWin ? 'text-green-500 bg-green-900/20' : 'text-slate-500 bg-slate-800'}`}>{resultText}</div>
        </div>
    );
};