'use client';

import React from 'react';
import { getRankInfo, getLevelProgress, getXpToNextLevel } from '../lib/gamification';

export function AvatarLevel({ foto, level = 1, xp = 0, size = "large", className = "", hideXp = false }) {
    const rank = getRankInfo(level);

    // 1. Calcula progresso (0 a 100%)
    const progress = getLevelProgress(xp || 0, level);

    // 2. Pega a meta
    const targetXp = getXpToNextLevel(level);

    // Configuração de tamanhos
    let photoClass = "";
    let wrapperClass = "";
    let showRankTitle = false;
    let showXpBar = false;

    switch (size) {
        case "small":
            photoClass = "w-12 h-12";
            wrapperClass = "w-16 h-16";
            break;

        case "xlarge": // Hero Section
            photoClass = "w-32 h-32 md:w-44 md:h-44";
            wrapperClass = "w-48 h-48 md:w-64 md:h-64";
            showXpBar = !hideXp;
            break;

        case "large": // Painel e Padrão
        default:
            photoClass = "w-36 h-36";
            wrapperClass = "w-48 h-48";
            showRankTitle = true;
            showXpBar = !hideXp;
            break;
    }

    const frameStyle = {
        transform: `scale(${rank.frameScale || 1.0})`,
        transition: 'transform 0.3s ease-in-out'
    };

    // --- ALTERAÇÃO AQUI: FORÇANDO A COR DOURADA ---
    const barColorClass = 'bg-yellow-500';

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>

            {/* Wrapper principal */}
            <div className={`relative ${wrapperClass} flex items-center justify-center`}>

                {/* FOTO */}
                <div className={`relative ${photoClass} rounded-full overflow-hidden z-0 bg-slate-900 shadow-lg`}>
                    <img
                        src={foto || "https://placehold.co/400"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* MOLDURA */}
                <img
                    src={rank.frameUrl}
                    alt={rank.title}
                    className={`absolute z-10 pointer-events-none drop-shadow-2xl ${photoClass}`}
                    style={frameStyle}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />

                {/* Badge de Nível (Oculto no xlarge) */}
                {size !== 'xlarge' && (
                    <div className="absolute bottom-1 right-1 bg-black border border-slate-500 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-white z-20 shadow-md">
                        {level}
                    </div>
                )}
            </div>

            {/* BARRA DE XP + TEXTO */}
            {showXpBar && (
                <div className="flex flex-col items-center w-full max-w-[160px] -mt-4 z-30 relative animate-fadeIn">

                    {/* Barra de Fundo (Cinza escuro) - AUMENTADA PARA h-4 */}
                    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600 shadow-lg relative">

                        {/* Barra Dourada (Progresso) */}
                        <div
                            className={`h-full ${barColorClass} transition-all duration-1000 ease-out`}
                            // Adicionei shadow-yellow para brilhar
                            style={{
                                width: `${Math.max(5, progress)}%`,
                                boxShadow: '0 0 15px rgba(234, 179, 8, 0.6)'
                            }}
                        >
                            {/* Efeito de brilho interno na barra */}
                            <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                    </div>

                    {/* Texto de XP */}
                    <div className="mt-1">
                        <span className="text-[10px] font-bold text-yellow-500 font-mono bg-black/80 px-2 py-0.5 rounded border border-yellow-500/30 backdrop-blur-md">
                            {xp || 0} / {targetXp} XP
                        </span>
                    </div>

                </div>
            )}

            {/* Título do Rank */}
            {showRankTitle && (
                <div className="text-center mt-2 relative z-30">
                    <span className={`text-xs font-bold uppercase tracking-widest ${rank.textColor} bg-black/80 px-4 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-xl`}>
                        {rank.title}
                    </span>
                </div>
            )}
        </div>
    );
}