'use client';

import React, { useState } from 'react';
import { getXpToNextLevel, getLevelProgress, getRankInfo } from '../../../lib/gamification';

export default function TabCartel({ perfil, setPerfil, handleStatsChange, handleRecordChange, isPremium }) {

    // --- GAMIFICATION STATS ---
    const level = perfil.level || 1;
    const xp = perfil.xp || 0;
    const rank = getRankInfo(level);
    const progress = getLevelProgress(xp, level);
    const nextXp = getXpToNextLevel(level);

    // --- STATE PARA PRÊMIOS ---
    const [novoPremio, setNovoPremio] = useState('');

    const handleAddPremio = () => {
        if (!novoPremio) return;
        if (!isPremium && perfil.premios.length >= 1) return alert("Limite Free atingido (1 prêmio).");
        setPerfil({ ...perfil, premios: [...perfil.premios, novoPremio] });
        setNovoPremio('');
    };

    const handleDeletePremio = (index) => {
        if (!confirm("Remover este prêmio?")) return;
        const n = [...perfil.premios];
        n.splice(index, 1);
        setPerfil({ ...perfil, premios: n });
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#0a0a0c] text-[#333333] dark:text-[#e5e7eb] font-sans min-h-screen flex flex-col items-center py-6 px-4 sm:px-8 custom-scrollbar">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Teko', sans-serif; }
                .font-sans { font-family: 'Roboto', sans-serif; }
                
                .industrial-input {
                    background-color: #262626;
                    border: 1px solid #404040;
                    color: #f3f4f6;
                    font-family: 'Teko', sans-serif;
                    font-size: 1.25rem;
                    letter-spacing: 0.05em;
                    transition: all 0.2s;
                }
                .industrial-input::placeholder { color: #9ca3af; }
                .industrial-input:focus {
                    background-color: #1f1f1f;
                    border-color: #FFA500;
                    box-shadow: 0 0 0 1px #FFA500;
                    outline: none;
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

                {/* HEADER REMOVED AS REQUESTED */}

                <div className="space-y-6">

                    {/* SECTION 1: ATTRIBUTES */}
                    <section className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFA500] to-transparent opacity-50"></div>
                        <div className="mb-4 flex items-center gap-2">
                            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#FFA500]">
                                Atributos Físicos
                            </h2>
                            <div className="h-px bg-[#2a2a2a] flex-grow ml-4"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">Altura</label>
                                <div className="relative">
                                    <input
                                        className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                        placeholder="0,00m"
                                        type="text"
                                        name="height"
                                        value={perfil.stats.height}
                                        onChange={handleStatsChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">Peso</label>
                                <div className="relative">
                                    <input
                                        className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                        placeholder="00kg"
                                        type="text"
                                        name="weight"
                                        value={perfil.stats.weight}
                                        onChange={handleStatsChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">Envergadura</label>
                                <div className="relative">
                                    <input
                                        className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                        placeholder="0,00m"
                                        type="text"
                                        name="reach"
                                        value={perfil.stats.reach}
                                        onChange={handleStatsChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">Idade</label>
                                <div className="relative">
                                    <input
                                        className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                        placeholder="Anos"
                                        type="text"
                                        name="age"
                                        value={perfil.stats.age}
                                        onChange={handleStatsChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: RECORD */}
                    <section className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00E5FF] to-transparent opacity-50"></div>
                        <div className="mb-4 flex items-center gap-2">
                            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#00E5FF]">
                                Cartel Profissional
                            </h2>
                            <div className="h-px bg-[#2a2a2a] flex-grow ml-4"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#00C853] pl-1">Vitórias</label>
                                <input
                                    className="w-full industrial-input rounded p-1.5 pl-3 border-l-4 !border-l-[#00C853] text-lg"
                                    type="number"
                                    name="wins"
                                    value={perfil.record.wins}
                                    onChange={handleRecordChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#D32F2F] pl-1">Derrotas</label>
                                <input
                                    className="w-full industrial-input rounded p-1.5 pl-3 border-l-4 !border-l-[#D32F2F] text-lg"
                                    type="number"
                                    name="losses"
                                    value={perfil.record.losses}
                                    onChange={handleRecordChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#FFD600] pl-1">Empates</label>
                                <input
                                    className="w-full industrial-input rounded p-1.5 pl-3 border-l-4 !border-l-[#FFD600] text-lg"
                                    type="number"
                                    name="draws"
                                    value={perfil.record.draws}
                                    onChange={handleRecordChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">K.O.s</label>
                                <input
                                    className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                    type="number"
                                    name="knockouts"
                                    value={perfil.record.knockouts}
                                    onChange={handleRecordChange}
                                />
                            </div>
                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] pl-1">Subs</label>
                                <input
                                    className="w-full industrial-input rounded p-1.5 pl-3 text-lg"
                                    type="number"
                                    name="submissions"
                                    value={perfil.record.submissions}
                                    onChange={handleRecordChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: AWARDS */}
                    <section className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFD600] to-transparent opacity-50"></div>
                        <div className="mb-6 flex items-center gap-2">
                            <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-[#FFA500]">
                                Prêmios
                            </h2>
                            <div className="h-px bg-[#2a2a2a] flex-grow ml-4"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        className="w-full industrial-input rounded p-3 pl-4"
                                        placeholder="Ex: Campeão Brasileiro 2024"
                                        type="text"
                                        value={novoPremio}
                                        onChange={(e) => setNovoPremio(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddPremio()}
                                    />
                                </div>
                                <button
                                    onClick={handleAddPremio}
                                    disabled={!isPremium && perfil.premios.length >= 1}
                                    className={`h-full aspect-square md:w-14 md:h-14 rounded flex items-center justify-center transition-all shadow-[0_0_10px_rgba(0,229,255,0.4)] ${(!isPremium && perfil.premios.length >= 1) ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-[#00E5FF] hover:bg-cyan-300 text-black'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl font-bold">add</span>
                                </button>
                            </div>

                            <div className="space-y-3 mt-4">
                                {perfil.premios.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between bg-[#111111] border border-white/5 rounded p-4 group/item hover:border-white/10 hover:bg-[#161616] transition-all">
                                        <span className="font-display font-medium text-lg tracking-wide text-white">{p}</span>
                                        <button
                                            onClick={() => handleDeletePremio(i)}
                                            className="text-[#D32F2F] opacity-50 hover:opacity-100 p-2 hover:bg-[#D32F2F]/10 rounded transition-all"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                ))}
                                {perfil.premios.length === 0 && (
                                    <div className="text-center py-6 text-[#9ca3af] text-sm">
                                        Nenhum prêmio registrado.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}