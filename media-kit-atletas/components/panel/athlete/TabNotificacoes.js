'use client';

import React, { useState } from 'react';
import { getXpToNextLevel, getLevelProgress, getRankInfo } from '../../../lib/gamification';

export default function TabNotificacoes({
    notificacoes = [],
    convitesEquipe = [],
    handleDueloAction,
    handleEquipeAction,
    perfil = {} // Added perfil prop for the header data
}) {

    // --- GAMIFICATION STATS (Safeguarded) ---
    const level = perfil.level || 1;
    const xp = perfil.xp || 0;
    const rank = getRankInfo(level);
    const progress = getLevelProgress(xp, level);
    const nextXp = getXpToNextLevel(level);

    // --- TAB STATE (Simulated navigation as per HTML) ---
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'convites', 'duelos'

    // Helpers to check if empty
    const hasDuelos = notificacoes.length > 0;
    const hasConvites = convitesEquipe && convitesEquipe.length > 0;

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#0a0a0c] text-[#333333] dark:text-[#e5e7eb] font-sans min-h-screen flex flex-col items-center py-6 px-4 sm:px-8 overflow-y-auto custom-scrollbar">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Teko', sans-serif; }
                .font-sans { font-family: 'Roboto', sans-serif; }
                
                .clip-path-slant {
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0c; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }

                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                }
            `}</style>

            <main className="w-full max-w-5xl space-y-6">

                {/* HEADERA (Only render if perfil data exists, otherwise functionality implies just requests) */}
                <header className="w-full bg-[#161616] border border-[#2a2a2a] p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#FFA500]/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-6 z-10">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#FFA500]/20 rounded-full blur-md"></div>
                            <span className="material-symbols-outlined text-6xl text-gray-300 relative z-10 drop-shadow-md">shield</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[#FFA500] font-display font-bold text-4xl leading-none">{level}</span>
                                <span className="text-white font-display font-medium text-2xl tracking-wide uppercase">{rank.tier}</span>
                            </div>
                            <span className="text-[#9ca3af] text-sm uppercase tracking-wider font-bold">Rank Atual</span>
                        </div>
                    </div>
                    <div className="w-full md:max-w-md flex flex-col gap-2 z-10">
                        <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                            <span>Progresso de XP</span>
                            <span className="text-white">{xp} / {nextXp} XP</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-[#FFA500] w-[1%] shadow-[0_0_10px_rgba(255,165,0,0.5)] transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* NAV */}
                <nav className="flex w-full border-b border-[#2a2a2a] gap-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-8 py-3 text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none ${activeTab === 'all' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('convites')}
                        className={`px-8 py-3 text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none ${activeTab === 'convites' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Convites ({convitesEquipe.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('duelos')}
                        className={`px-8 py-3 text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none ${activeTab === 'duelos' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Duelos ({notificacoes.length})
                    </button>
                </nav>

                <div className="space-y-8 min-h-[400px]">

                    {!hasDuelos && !hasConvites && (
                        <div className="text-center p-20 opacity-50">
                            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inbox</span>
                            <p className="text-xl font-display uppercase tracking-widest text-gray-500">Nenhuma solicitação pendente</p>
                        </div>
                    )}

                    {/* SECTION 1: CONVITES */}
                    {hasConvites && (activeTab === 'all' || activeTab === 'convites') && (
                        <section className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-[#FFA500] text-xl">school</span>
                                <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">
                                    Convites de Treinadores/Equipe
                                </h2>
                            </div>

                            {convitesEquipe.map(convite => (
                                <div key={convite.id} className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#FFA500]/30 transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left w-full">
                                        {/* Avatar / Initials */}
                                        <div className="w-14 h-14 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#FFA500]/50 transition-colors shadow-md">
                                            {convite.coach?.foto_url ? (
                                                <img src={convite.coach.foto_url} alt="Coach" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-2xl font-display font-medium">
                                                    {(convite.coach?.nome || 'C').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-center h-full">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFA500] mb-1">
                                                Novo Pedido
                                            </span>
                                            <h3 className="text-2xl font-display font-bold leading-none mb-1 text-white tracking-wide">
                                                {convite.coach?.apelido || convite.coach?.nome || 'Unknown Coach'}
                                            </h3>
                                            <p className="text-xs text-[#9ca3af] uppercase font-bold tracking-wider">
                                                {convite.coach?.coach_details?.team ? `Equipe: ${convite.coach.coach_details.team}` : 'Quer te adicionar como aluno'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
                                        <button
                                            onClick={() => handleEquipeAction(convite.id, 'reject')}
                                            className="h-10 px-6 rounded border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-xs tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-white/20"
                                        >
                                            Recusar
                                        </button>
                                        <button
                                            onClick={() => handleEquipeAction(convite.id, 'accept')}
                                            className="h-10 px-8 rounded bg-[#FFA500] hover:bg-orange-600 text-black font-bold text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(255,165,0,0.3)] hover:shadow-[0_0_20px_rgba(255,165,0,0.5)] transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 clip-path-slant"
                                        >
                                            Aceitar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* SECTION 2: DUELOS */}
                    {hasDuelos && (activeTab === 'all' || activeTab === 'duelos') && (
                        <section className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-[#FFA500] text-xl">sports_mma</span>
                                <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">
                                    Desafios de Duelo
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {notificacoes.map(duelo => (
                                    <div key={duelo.id} className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#FFA500]/30 transition-all duration-300 group">
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left w-full">
                                            {/* Avatar / Initials */}
                                            <div className="w-14 h-14 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#FFA500]/50 transition-colors shadow-md">
                                                {duelo.desafiante?.foto_url ? (
                                                    <img src={duelo.desafiante.foto_url} alt="Fighter" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-2xl font-display font-medium">F</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-center h-full">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFA500] mb-1">
                                                    Desafiante
                                                </span>
                                                <h3 className="text-2xl font-display font-bold leading-none mb-1 text-white tracking-wide">
                                                    {duelo.desafiante?.apelido || duelo.desafiante?.nome || 'Unknown Fighter'}
                                                </h3>
                                                <p className="text-xs text-[#9ca3af] uppercase font-bold tracking-wider">
                                                    Criado em {new Date(duelo.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
                                            <button
                                                onClick={() => handleDueloAction(duelo.id, 'reject')}
                                                className="h-10 px-6 rounded border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-xs tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-white/20"
                                            >
                                                Recusar
                                            </button>
                                            <button
                                                onClick={() => handleDueloAction(duelo.id, 'accept')}
                                                className="h-10 px-8 rounded bg-[#FFA500] hover:bg-orange-600 text-black font-bold text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(255,165,0,0.3)] hover:shadow-[0_0_20px_rgba(255,165,0,0.5)] transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            >
                                                Aceitar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}