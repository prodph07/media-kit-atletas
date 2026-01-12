'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const RESULTADOS = ["W", "L", "D", "NC"];

export default function TabLutas({ perfil, setPerfil, handleNextFightChange, isPremium }) {

    // State for new fight addition (History)
    const [novaLuta, setNovaLuta] = useState({ event: '', date: '', opponent: '', result: 'W' });

    const handleAddLuta = () => {
        if (!isPremium && perfil.historico.length >= 1) return alert("Limite Free atingido (1 luta).");
        // Add new fight to the TOP of the list
        setPerfil({ ...perfil, historico: [novaLuta, ...perfil.historico] });
    };

    const handleFightChange = (index, field, value) => {
        const n = [...perfil.historico];
        n[index][field] = value;
        setPerfil({ ...perfil, historico: n });
    };

    const handleDeleteLuta = (index) => {
        if (!confirm("Remover esta luta?")) return;
        const n = [...perfil.historico];
        n.splice(index, 1);
        setPerfil({ ...perfil, historico: n });
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#0c0c0c] text-gray-800 dark:text-gray-200 font-body min-h-screen">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .industrial-border {
                    border: 1px solid;
                    border-color: #333333;
                }
                
                .dashboard-input {
                    background-color: #000;
                    border: 1px solid #333;
                    color: white;
                    padding: 0.75rem 1rem;
                    font-family: 'Oswald', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.025em;
                    font-size: 1.125rem;
                    width: 100%;
                    transition: all 0.2s;
                }
                .dashboard-input:focus {
                    border-color: #FFD700;
                    outline: none;
                    box-shadow: 0 0 0 1px #FFD700;
                }

                .dashboard-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #9ca3af;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                }

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

            <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">

                {/* NEXT FIGHT SECTION */}
                <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#DC2626] opacity-80"></div>
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <span className="material-symbols-outlined text-[#FFD700] text-3xl">swords</span>
                        <h2 className="font-display font-bold uppercase text-2xl lg:text-3xl text-gray-900 dark:text-white tracking-wide">Próxima Luta</h2>
                    </div>

                    {isPremium ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div>
                                <label className="dashboard-label">Data</label>
                                <input
                                    className="dashboard-input"
                                    type="text"
                                    name="date"
                                    value={perfil.nextFight.date}
                                    onChange={handleNextFightChange}
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>
                            <div>
                                <label className="dashboard-label">Evento</label>
                                <input
                                    className="dashboard-input"
                                    type="text"
                                    name="event"
                                    value={perfil.nextFight.event}
                                    onChange={handleNextFightChange}
                                    placeholder="Nome do Evento"
                                />
                            </div>
                            <div>
                                <label className="dashboard-label">Oponente</label>
                                <input
                                    className="dashboard-input"
                                    type="text"
                                    name="opponent"
                                    value={perfil.nextFight.opponent}
                                    onChange={handleNextFightChange}
                                    placeholder="Nome do Oponente"
                                />
                            </div>
                            <div>
                                <label className="dashboard-label">Local</label>
                                <input
                                    className="dashboard-input"
                                    type="text"
                                    name="location"
                                    value={perfil.nextFight.location}
                                    onChange={handleNextFightChange}
                                    placeholder="Cidade/Arena"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0c0c0c] p-8 border border-dashed border-gray-700 text-center opacity-70">
                            <Lock size={32} className="mx-auto mb-3 text-[#FFD700]" />
                            <p className="font-display uppercase tracking-widest text-[#FFD700]">Recurso Premium</p>
                            <p className="text-xs text-gray-400 mt-2">Atualize seu plano para destacar sua próxima luta.</p>
                        </div>
                    )}
                </div>

                {/* FIGHT HISTORY SECTION */}
                <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-6 lg:p-8 shadow-2xl relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <h2 className="font-display font-bold uppercase text-2xl lg:text-3xl text-gray-900 dark:text-white tracking-wide">Histórico de Lutas</h2>

                        {(isPremium || perfil.historico.length < 1) && (
                            <button
                                onClick={handleAddLuta}
                                className="bg-[#FFD700] hover:bg-yellow-400 text-gray-900 font-display font-bold uppercase px-4 py-2 text-sm tracking-wide transition-colors flex items-center gap-2 group shadow-lg shadow-yellow-500/20"
                            >
                                <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add_circle</span>
                                Adicionar Novo
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {perfil.historico.map((luta, i) => (
                            <div key={i} className="bg-gray-100 dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-800 p-2 sm:p-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:border-gray-400 dark:hover:border-gray-600 group">
                                {/* Result Box */}
                                <div className={`hidden sm:flex h-12 w-16 items-center justify-center flex-shrink-0 ${luta.result === 'W' ? 'bg-[#1b5e20]' : (luta.result === 'L' ? 'bg-[#b91c1c]' : 'bg-gray-700')}`}>
                                    <span className="font-display font-bold text-white text-xl">{luta.result}</span>
                                </div>

                                {/* Mobile Result Bar */}
                                <div className="flex sm:hidden w-full items-center justify-between border-b border-gray-700 pb-2 mb-2">
                                    <select
                                        value={luta.result}
                                        onChange={(e) => handleFightChange(i, 'result', e.target.value)}
                                        className={`font-display font-bold text-white px-3 py-1 text-sm border-none focus:ring-0 ${luta.result === 'W' ? 'bg-[#1b5e20]' : (luta.result === 'L' ? 'bg-[#b91c1c]' : 'bg-gray-700')}`}
                                    >
                                        {RESULTADOS.map(r => <option key={r} value={r} className="text-black">{r}</option>)}
                                    </select>
                                    <span onClick={() => handleDeleteLuta(i)} className="material-symbols-outlined text-red-500 cursor-pointer hover:text-red-400 text-sm">delete</span>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 w-full items-center px-0 sm:px-4 py-2">
                                    <div className="sm:col-span-1 hidden sm:block">
                                        <select
                                            value={luta.result}
                                            onChange={(e) => handleFightChange(i, 'result', e.target.value)}
                                            className="bg-transparent border-none text-white font-bold p-0 w-full focus:ring-0 cursor-pointer text-center"
                                            title="Alterar Resultado"
                                        >
                                            {RESULTADOS.map(r => <option key={r} value={r} className="text-black">{r}</option>)}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-5 flex flex-col justify-center">
                                        <input
                                            className="bg-transparent border-0 border-b border-gray-600 focus:border-[#FFD700] focus:ring-0 text-gray-900 dark:text-white font-display font-medium text-lg uppercase w-full p-0 placeholder-gray-600"
                                            placeholder="Nome do Evento"
                                            type="text"
                                            value={luta.event}
                                            onChange={(e) => handleFightChange(i, 'event', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-4 border-b border-gray-700 sm:border-none pb-2 sm:pb-0">
                                        <input
                                            className="bg-transparent border-0 border-b border-gray-600 focus:border-[#FFD700] focus:ring-0 text-gray-500 dark:text-gray-400 w-full p-0 text-sm font-body placeholder-gray-600"
                                            placeholder="Nome do Oponente"
                                            type="text"
                                            value={luta.opponent}
                                            onChange={(e) => handleFightChange(i, 'opponent', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 text-left sm:text-right">
                                        <input
                                            className="bg-transparent border-0 focus:ring-0 font-mono font-bold text-gray-400 text-sm text-left sm:text-right w-full p-0"
                                            placeholder="dd/mm/aaaa"
                                            type="text"
                                            value={luta.date}
                                            onChange={(e) => handleFightChange(i, 'date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Desktop Delete */}
                                <div onClick={() => handleDeleteLuta(i)} className="hidden sm:flex h-12 w-12 items-center justify-center flex-shrink-0 cursor-pointer hover:bg-red-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">delete</span>
                                </div>
                            </div>
                        ))}

                        {perfil.historico.length === 0 && (
                            <div className="opacity-30 p-4 border border-dashed border-gray-600 text-center">
                                <p className="font-mono text-xs uppercase text-gray-500">More fights will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}