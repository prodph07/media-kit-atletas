'use client';

import React from 'react';
import { getRankInfo, getXpToNextLevel, getLevelProgress } from '../lib/gamification';

// MUDANÇA AQUI: Removemos o 'default'. Agora é apenas 'export function'
export function AvatarLevel({ foto, level = 1, xp = 0, size = "large" }) {
    // 1. Pega as cores e títulos baseados no nível
    const rank = getRankInfo(level);
    
    // 2. Calcula progresso
    const progressPercent = getLevelProgress(xp, level);
    const xpTarget = getXpToNextLevel(level);

    const sizes = {
        small: "w-16 h-16 text-[10px]",
        medium: "w-24 h-24 text-xs",
        large: "w-32 h-32 sm:w-40 sm:h-40 text-sm", 
    };

    const containerSize = sizes[size] || sizes.large;

    return (
        <div className="flex flex-col items-center gap-2">
            
            {/* MOLDURA E FOTO */}
            <div className={`relative ${containerSize} flex items-center justify-center`}>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${rank.style} p-[3px] sm:p-[4px]`}>
                    <div className="w-full h-full bg-slate-900 rounded-full p-[2px]">
                        <img 
                            src={foto || "https://placehold.co/400"} 
                            alt="Avatar" 
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                </div>

                <div className={`absolute -bottom-2 bg-slate-900 border-2 ${rank.style.split(' ')[2]} text-white font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center z-10 shadow-lg`}>
                    <span className="text-xs sm:text-sm">{level}</span>
                </div>
            </div>

            {/* BARRA DE PROGRESSO */}
            <div className="text-center w-full max-w-[180px]">
                <h3 className={`font-bold uppercase tracking-wider text-xs sm:text-sm mb-1 bg-gradient-to-r ${rank.style.split(' ')[0]} ${rank.style.split(' ')[1]} bg-clip-text text-transparent`}>
                    {rank.title}
                </h3>
                
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative group">
                    <div 
                        className={`h-full bg-gradient-to-r ${rank.style} transition-all duration-1000 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[8px] font-bold text-white drop-shadow-md bg-black/50 px-1 rounded">
                            {xp} / {xpTarget} XP
                         </span>
                    </div>
                </div>
            </div>
        </div>
    );
}