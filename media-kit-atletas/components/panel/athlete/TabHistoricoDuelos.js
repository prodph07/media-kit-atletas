'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getXpToNextLevel, getLevelProgress, getRankInfo } from '../../../lib/gamification';

export default function TabHistoricoDuelos({
    meusDuelos = [],
    perfilId,
    handleDueloAction,
    perfil = {} // Added perfil prop for header
}) {

    // --- GAMIFICATION STATS ---
    const level = perfil.level || 1;
    const xp = perfil.xp || 0;
    const rank = getRankInfo(level);
    const progress = getLevelProgress(xp, level);
    const nextXp = getXpToNextLevel(level);

    // --- FILTER STATE ---
    const [activeFilter, setActiveFilter] = useState('pending'); // 'pending', 'active' (includes finished)

    // --- DATA PROCESSING ---
    const listaDuelos = meusDuelos || [];

    // Filter logic
    const filteredDuelos = listaDuelos.filter(duelo => {
        const isExpired = new Date(duelo.expires_at) < new Date();
        const isFinished = isExpired && duelo.status !== 'pending';

        if (activeFilter === 'pending') {
            return duelo.status === 'pending';
        } else {
            // 'active' tab includes Active AND Finished/Expired duels for simplicity, or we could split specific 'finished' tab
            return duelo.status === 'active' || isFinished;
        }
    });

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#0a0a0c] text-[#333333] dark:text-[#e5e7eb] font-sans min-h-screen flex flex-col items-center py-4 px-3 sm:py-6 sm:px-8 custom-scrollbar">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Teko', sans-serif; }
                .font-sans { font-family: 'Roboto', sans-serif; }
                
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

            <main className="w-full max-w-5xl space-y-4 sm:space-y-6">

                {/* HEADERA */}
                <header className="w-full bg-[#161616] border border-[#2a2a2a] p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#FFA500]/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-4 sm:gap-6 z-10 w-full md:w-auto justify-start">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 bg-[#FFA500]/20 rounded-full blur-md"></div>
                            <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 relative z-10 drop-shadow-md">shield</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[#FFA500] font-display font-bold text-3xl sm:text-4xl leading-none">{level}</span>
                                <span className="text-white font-display font-medium text-xl sm:text-2xl tracking-wide uppercase">{rank.tier}</span>
                            </div>
                            <span className="text-[#9ca3af] text-xs sm:text-sm uppercase tracking-wider font-bold">Rank Atual</span>
                        </div>
                    </div>
                    <div className="w-full md:max-w-md flex flex-col gap-2 z-10">
                        <div className="flex justify-between items-end text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                            <span>Progresso de XP</span>
                            <span className="text-white">{xp} / {nextXp} XP</span>
                        </div>
                        <div className="w-full h-2 sm:h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-[#FFA500] w-[1%] shadow-[0_0_10px_rgba(255,165,0,0.5)] transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* NAV */}
                <nav className="flex w-full border-b border-[#2a2a2a] justify-between items-center overflow-x-auto">
                    <div className="flex shrink-0">
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-display font-bold tracking-wider uppercase border-b-2 transition-colors focus:outline-none whitespace-nowrap ${activeFilter === 'pending' ? 'text-[#FFA500] border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] border-transparent hover:text-white'}`}
                        >
                            Pendentes
                        </button>
                        <button
                            onClick={() => setActiveFilter('active')}
                            className={`px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-display font-bold tracking-wider uppercase border-b-2 transition-colors focus:outline-none whitespace-nowrap ${activeFilter === 'active' ? 'text-[#FFA500] border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] border-transparent hover:text-white'}`}
                        >
                            Ativos / Histórico
                        </button>
                    </div>

                    <Link href="/duelos/criar" className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#161616] border border-[#2a2a2a] hover:bg-white/5 text-[#9ca3af] hover:text-white transition-all rounded text-xs sm:text-sm uppercase font-bold tracking-wider mb-1 ml-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="hidden sm:inline">Criar Novo</span>
                        <span className="sm:hidden">Novo</span>
                    </Link>
                </nav>

                <div className="space-y-4 sm:space-y-8 min-h-[300px]">
                    <section className="space-y-3 sm:space-y-4">

                        {filteredDuelos.length === 0 && (
                            <div className="text-center py-12 opacity-50">
                                <span className="material-symbols-outlined text-5xl text-gray-600 mb-2">sports_mma</span>
                                <p className="text-sm font-display uppercase tracking-widest text-[#9ca3af]">Nenhum duelo encontrado nesta categoria.</p>
                            </div>
                        )}

                        {filteredDuelos.map(duelo => {
                            // Logic
                            const souP1 = duelo.p1?.id === perfilId;
                            const oponente = souP1 ? duelo.p2 : duelo.p1;
                            if (!oponente) return null;

                            const total = (duelo.votos_1 || 0) + (duelo.votos_2 || 0);
                            const isExpired = new Date(duelo.expires_at) < new Date();
                            const isFinished = isExpired && duelo.status !== 'pending';

                            // Badge Config
                            let badgeText = 'Desconhecido';
                            let badgeStyle = 'border-gray-600 text-gray-400 bg-gray-900/10';

                            if (duelo.status === 'active') {
                                badgeText = 'Ativo';
                                badgeStyle = 'border-green-600/50 text-green-500 bg-green-900/10';
                            } else if (duelo.status === 'pending') {
                                badgeText = 'Pendente';
                                badgeStyle = 'border-yellow-600/50 text-yellow-500 bg-yellow-900/10';
                            } else if (isFinished) {
                                badgeText = 'Finalizado';
                                badgeStyle = 'border-red-600/50 text-red-500 bg-red-900/10';
                            }

                            // Avatar color for variety (optional, preserving similar to HTML concept)
                            // We will use standard gray/orange logic based on if 'souP1' or not to differentiate?
                            // Actually, let's keep it consistent.

                            return (
                                <div key={duelo.id} className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-2.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 hover:border-[#FFA500]/30 transition-all duration-300 group relative overflow-hidden animate-fadeIn">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFA500]/30 group-hover:bg-[#FFA500] transition-colors"></div>

                                    {/* INFO BLOCK */}
                                    <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto relative">
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-[#2a2a2a] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-md">
                                                {oponente.foto_url ? (
                                                    <img src={oponente.foto_url} alt="Oponente" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-xl font-display font-medium">{(oponente.nome || 'O').charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-black border border-[#2a2a2a] text-[8px] sm:text-[10px] font-bold text-white px-1 sm:px-1.5 py-0.5 rounded leading-none flex items-center">
                                                VS
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center h-full text-left flex-grow md:w-48 lg:w-64">
                                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#9ca3af] mb-0.5 leading-none">
                                                {souP1 ? 'Desafiado' : 'Desafiante'}
                                            </span>
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold leading-none mb-0.5 text-white tracking-wide truncate pr-16 md:pr-0">
                                                {oponente.apelido || oponente.nome}
                                            </h3>
                                            {/* Date / Time */}
                                            <div className="flex items-center justify-start gap-1 text-[#9ca3af] text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                                                <span className="material-symbols-outlined text-xs sm:text-sm">schedule</span>
                                                <span>{new Date(duelo.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* BADGE (Mobile) */}
                                        <div className="absolute top-0 right-0 md:hidden">
                                            <div className={`border px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${badgeStyle}`}>
                                                {badgeText}
                                            </div>
                                        </div>
                                    </div>

                                    {/* BADGE (Desktop) */}
                                    <div className="hidden md:flex items-center justify-center px-6 flex-grow">
                                        <div className={`border px-4 py-1.5 rounded text-xs font-bold tracking-widest uppercase ${badgeStyle}`}>
                                            {badgeText}
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-6 md:ml-2 mt-1 md:mt-0">
                                        <div className="flex items-center gap-2 md:flex-col md:items-center md:gap-0 md:mr-4">
                                            <span className="text-sm md:text-xl font-display font-bold text-white">{total}</span>
                                            <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Votos</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/duelos/${duelo.id}`}
                                                target="_blank"
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-[#2a2a2a] bg-[#222] text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center"
                                                title="Visualizar"
                                            >
                                                <span className="material-symbols-outlined text-base sm:text-lg">open_in_new</span>
                                            </Link>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm("Excluir este duelo?")) handleDueloAction(duelo.id, 'delete');
                                                }}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-red-900/30 bg-red-900/10 text-red-500 hover:text-red-400 hover:bg-red-900/20 hover:border-red-500/50 transition-all flex items-center justify-center"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-base sm:text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </section>
                </div>
            </main>
        </div>
    );
}