'use client';

import React, { useState } from 'react';
import { getXpToNextLevel, getLevelProgress, getRankInfo } from '../../../lib/gamification';

export default function TabNotificacoes({
    notificacoes = [],
    convitesEquipe = [],
    convitesParceria = [], // NEW
    handleDueloAction,
    handleEquipeAction,
    handleParceriaAction, // NEW
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
        <div className="bg-[#f3f4f6] dark:bg-[#0a0a0c] text-[#333333] dark:text-[#e5e7eb] font-sans min-h-screen flex flex-col items-center py-4 sm:py-6 px-3 sm:px-8 overflow-y-auto custom-scrollbar">
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

            <main className="w-full max-w-5xl space-y-4 sm:space-y-6">

                {/* HEADERA REMOVED AS REQUESTED */}

                {/* NAV - Optimized for mobile */}
                <nav className="flex w-full border-b border-[#2a2a2a] gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-2 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 sm:px-4 md:px-8 py-2 sm:py-3 text-base sm:text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none whitespace-nowrap flex-shrink-0 ${activeTab === 'all' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('convites')}
                        className={`px-3 sm:px-4 md:px-8 py-2 sm:py-3 text-base sm:text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none whitespace-nowrap flex-shrink-0 ${activeTab === 'convites' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Convites ({convitesEquipe.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('duelos')}
                        className={`px-3 sm:px-4 md:px-8 py-2 sm:py-3 text-base sm:text-lg font-display font-bold tracking-wider uppercase transition-colors focus:outline-none whitespace-nowrap flex-shrink-0 ${activeTab === 'duelos' ? 'text-[#FFA500] border-b-2 border-[#FFA500] bg-[#FFA500]/5' : 'text-[#9ca3af] hover:text-white'}`}
                    >
                        Duelos ({notificacoes.length})
                    </button>
                </nav>

                <div className="space-y-6 sm:space-y-8 min-h-[400px]">

                    {!hasDuelos && !hasConvites && (
                        <div className="text-center p-12 sm:p-20 opacity-50">
                            <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-600 mb-3 sm:mb-4">inbox</span>
                            <p className="text-lg sm:text-xl font-display uppercase tracking-widest text-gray-500">Nenhuma solicitação pendente</p>
                        </div>
                    )}

                    {/* SECTION 1: CONVITES DE EQUIPE (COACH) */}
                    {hasConvites && (activeTab === 'all' || activeTab === 'convites') && (
                        <section className="space-y-3 sm:space-y-4 animate-fadeIn">
                            {/* ... (código existente de Equipes) ... */}
                            {convitesEquipe.map(convite => (
                                <div key={convite.id} className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 hover:border-[#FFA500]/30 transition-all duration-300 group">
                                    {/* ... (mantendo renderização igual) ... */}
                                    <div className="flex flex-row items-center sm:items-start gap-4 text-left w-full overflow-hidden">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#FFA500]/50 transition-colors shadow-md">
                                            {convite.coach?.foto_url ? (
                                                <img src={convite.coach.foto_url} alt="Coach" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-xl sm:text-2xl font-display font-medium">
                                                    {(convite.coach?.nome || 'C').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-center h-full overflow-hidden w-full">
                                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#FFA500] mb-0.5 sm:mb-1">
                                                Convite de Treinador
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-display font-bold leading-none mb-0.5 sm:mb-1 text-white tracking-wide truncate w-full">
                                                {convite.coach?.apelido || convite.coach?.nome || 'Unknown Coach'}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-bold tracking-wider truncate w-full">
                                                {convite.coach?.coach_details?.team ? `Equipe: ${convite.coach.coach_details.team}` : 'Quer te adicionar como aluno'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                                        <button onClick={() => handleEquipeAction(convite.id, 'reject')} className="h-9 sm:h-10 flex-1 sm:flex-none px-4 sm:px-6 rounded border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-[10px] sm:text-xs tracking-widest uppercase focus:outline-none">RECUSAR</button>
                                        <button onClick={() => handleEquipeAction(convite.id, 'accept')} className="h-9 sm:h-10 flex-1 sm:flex-none px-6 sm:px-8 rounded bg-[#FFA500] hover:bg-orange-600 text-black font-bold text-[11px] sm:text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(255,165,0,0.3)] transition-all focus:outline-none clip-path-slant">ACEITAR</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* SECTION 1.5: CONVITES DE EMPRESA (PARCERIAS) */}
                    {convitesParceria && convitesParceria.length > 0 && (activeTab === 'all' || activeTab === 'convites') && (
                        <section className="space-y-3 sm:space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2 mt-6 border-t border-[#2a2a2a] pt-4">
                                <span className="material-symbols-outlined text-purple-500 text-lg sm:text-xl">business_center</span>
                                <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-wider text-white">
                                    Propostas de Patrocínio
                                </h2>
                            </div>

                            {convitesParceria.map(convite => (
                                <div key={convite.id} className="bg-[#161616] rounded-xl border border-purple-500/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 hover:border-purple-500/50 transition-all duration-300 group">
                                    <div className="flex flex-row items-center sm:items-start gap-4 text-left w-full overflow-hidden">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-purple-500/50 transition-colors shadow-md">
                                            {convite.empresa?.foto_url ? (
                                                <img src={convite.empresa.foto_url} alt="Empresa" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-xl sm:text-2xl font-display font-medium">
                                                    {(convite.empresa?.nome || 'E').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-center h-full overflow-hidden w-full">
                                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-purple-400 mb-0.5 sm:mb-1">
                                                Proposta de Time
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-display font-bold leading-none mb-0.5 sm:mb-1 text-white tracking-wide truncate w-full">
                                                {convite.empresa?.apelido || convite.empresa?.nome || 'Empresa'}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-bold tracking-wider truncate w-full">
                                                Quer te adicionar ao time oficial
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                                        <button onClick={() => handleParceriaAction(convite.id, 'reject')} className="h-9 sm:h-10 flex-1 sm:flex-none px-4 sm:px-6 rounded border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-[10px] sm:text-xs tracking-widest uppercase focus:outline-none">RECUSAR</button>
                                        <button onClick={() => handleParceriaAction(convite.id, 'accept')} className="h-9 sm:h-10 flex-1 sm:flex-none px-6 sm:px-8 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] sm:text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all focus:outline-none clip-path-slant">ACEITAR</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* SECTION 2: DUELOS */}
                    {hasDuelos && (activeTab === 'all' || activeTab === 'duelos') && (
                        <section className="space-y-3 sm:space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                <span className="material-symbols-outlined text-[#FFA500] text-lg sm:text-xl">sports_mma</span>
                                <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-wider text-white">
                                    Desafios
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {notificacoes.map(duelo => (
                                    <div key={duelo.id} className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 hover:border-[#FFA500]/30 transition-all duration-300 group">
                                        <div className="flex flex-row items-center sm:items-start gap-4 text-left w-full overflow-hidden">
                                            {/* Avatar / Initials */}
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#FFA500]/50 transition-colors shadow-md">
                                                {duelo.desafiante?.foto_url ? (
                                                    <img src={duelo.desafiante.foto_url} alt="Fighter" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-xl sm:text-2xl font-display font-medium">F</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-center h-full overflow-hidden w-full">
                                                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#FFA500] mb-0.5 sm:mb-1">
                                                    Desafiante
                                                </span>
                                                <h3 className="text-xl sm:text-2xl font-display font-bold leading-none mb-0.5 sm:mb-1 text-white tracking-wide truncate w-full">
                                                    {duelo.desafiante?.apelido || duelo.desafiante?.nome || 'Unknown Fighter'}
                                                </h3>
                                                <p className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-bold tracking-wider truncate w-full">
                                                    Criado em {new Date(duelo.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                                            <button
                                                onClick={() => handleDueloAction(duelo.id, 'reject')}
                                                className="h-9 sm:h-10 flex-1 sm:flex-none px-4 sm:px-6 rounded border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-[10px] sm:text-xs tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-white/20"
                                            >
                                                Recusar
                                            </button>
                                            <button
                                                onClick={() => handleDueloAction(duelo.id, 'accept')}
                                                className="h-9 sm:h-10 flex-1 sm:flex-none px-6 sm:px-8 rounded bg-[#FFA500] hover:bg-orange-600 text-black font-bold text-[11px] sm:text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(255,165,0,0.3)] hover:shadow-[0_0_20px_rgba(255,165,0,0.5)] transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex-1 sm:flex-none clip-path-slant"
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