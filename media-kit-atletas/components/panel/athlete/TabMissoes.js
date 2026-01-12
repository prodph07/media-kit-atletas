'use client';

import React, { useState } from 'react';
import {
    Trophy, CheckCircle, Circle, Clock, Calendar, Star, Zap, Flame, Swords,
    ScanEye, ThumbsUp, MessageSquareQuote, Instagram, Loader2, Upload, Dumbbell, Link as LinkIcon
} from 'lucide-react';
import { getXpToNextLevel, getLevelProgress, getRankInfo, calculateNewLevelState, processAIMission } from '../../../lib/gamification';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabMissoes({ perfil }) {

    // --- HELPERS DE DATA ---
    const isToday = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        return date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    };

    const isThisWeek = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    // --- DADOS DO PERFIL ---
    const stats = perfil.weekly_stats || {};
    const tasks = perfil.completed_tasks || [];
    const rank = getRankInfo(perfil.level);
    const progress = getLevelProgress(perfil.xp, perfil.level);
    const nextXp = getXpToNextLevel(perfil.level);

    // Lógicas Específicas Antigas
    const currentStreak = stats.login_streak || 0;
    const scoutCount = isToday(stats.last_scout_date) ? (stats.daily_scout_count || 0) : 0;
    const scoutDone = scoutCount >= 3;

    // --- CONFIGURAÇÃO DAS NOVAS MISSÕES DE I.A. ---
    const AI_MISSIONS_DAILY = [
        {
            id: 'STORY_INSTAGRAM',
            label: 'Postar Story',
            desc: 'Marque @nocautepages',
            xp: 100,
            icon: <Instagram size={18} className="text-[#FF4500]" />,
            done: isToday(stats.last_daily_story_date),
            instruction: 'O print deve mostrar seu story com a marcação visível.'
        },
        {
            id: 'GEAR_CHECK',
            label: 'Armadura Pronta',
            desc: 'Foto do Equipamento',
            xp: 30,
            icon: <Dumbbell size={18} className="text-[#FF4500]" />,
            done: isToday(stats.last_daily_gear_date),
            instruction: 'Foto das luvas, kimono ou material de treino arrumado.'
        }
    ];

    const AI_MISSION_UNIQUE = {
        id: 'LINK_IN_BIO',
        label: 'Link na Bio',
        desc: 'Divulgue seu Perfil',
        xp: 200,
        icon: <LinkIcon size={18} className="text-[#FFD700]" />,
        done: tasks.includes('LINK_IN_BIO'),
        instruction: 'Print do seu perfil no Insta mostrando o link nocaute.pro na bio.'
    };

    // --- CONFIGURAÇÃO DAS MISSÕES PADRÃO (ANTIGAS) ---
    const DAILY_QUESTS = [
        {
            label: currentStreak > 1 ? `Presença Confirmada (🔥 ${currentStreak})` : "Presença Confirmada",
            desc: currentStreak > 0 ? `Sequência: ${currentStreak} dias!` : "Fazer login na plataforma",
            xp: 10,
            done: isToday(stats.last_login_date),
            icon: <Flame size={18} className={currentStreak > 2 ? "text-[#FF4500] animate-pulse" : "text-[#FF4500]"} />
        },
        {
            label: `Olheiro (${scoutCount}/3)`,
            desc: "Visitar o perfil de 3 atletas diferentes",
            xp: 20,
            done: scoutDone,
            icon: <ScanEye size={18} className="text-[#FF4500]" />
        },
        {
            label: "Respect",
            desc: "Deixar um 'Respect' no perfil de alguém",
            xp: 10,
            done: isToday(stats.last_daily_respect_date),
            icon: <ThumbsUp size={18} className="text-[#FF4500]" />
        },
        {
            label: "Status de Combate",
            desc: "Atualizar seu Status do Dia (Painel Geral)",
            xp: 15,
            done: isToday(stats.last_daily_status_date),
            icon: <MessageSquareQuote size={18} className="text-[#FF4500]" />
        },
        {
            label: "Juri Ativo",
            desc: "Votar em pelo menos 1 duelo",
            xp: 15,
            done: isToday(stats.last_vote_date),
            icon: <Zap size={18} className="text-[#FFD700]" />
        }
    ];

    const WEEKLY_QUESTS = [
        {
            label: "Disciplina de Peso",
            desc: "Atualizar peso no perfil",
            xp: 50,
            done: isThisWeek(stats.last_weight_update),
            icon: <Clock size={18} className="text-[#FFD700]" />
        },
        {
            label: "Hype da Semana",
            desc: "Compartilhar perfil (Botão Olho)",
            xp: 30,
            done: isThisWeek(stats.last_share_date),
            icon: <Star size={18} className="text-[#FFD700]" />
        },
        {
            label: "Gladiador",
            desc: "Participar de um Duelo",
            xp: 75,
            done: isThisWeek(stats.last_duel_participation_date),
            icon: <Swords size={18} className="text-[#FF4500]" />
        }
    ];

    const UNIQUE_QUESTS = [
        { id: 'SETUP_BUNDLE_BASIC', label: 'Primeiros Passos', desc: 'Foto + Bio + Instagram', xp: 100 },
        { id: 'COMPLETE_PHYSICAL_STATS', label: 'Ficha Técnica', desc: 'Peso, Altura e Envergadura', xp: 25 },
        { id: 'COMPLETE_FIGHT_RECORD', label: 'Cartel Profissional', desc: 'Registrar vitórias e derrotas', xp: 50 },
        { id: 'ADD_AWARDS', label: 'Sala de Troféus', desc: 'Adicionar um prêmio', xp: 25 },
        { id: 'ADD_FIGHT_HISTORY', label: 'Histórico de Luta', desc: 'Adicionar uma luta detalhada', xp: 25 },
        { id: 'GALLERY_TIER_1', label: 'Fotogênico', desc: 'Adicionar 1 foto na galeria', xp: 15 },
        { id: 'GALLERY_TIER_2', label: 'Book Profissional', desc: 'Adicionar 5 fotos na galeria', xp: 50 },
        { id: 'VIDEO_TIER_1', label: 'Highlights', desc: 'Adicionar 1 vídeo', xp: 15 },
        { id: 'JOIN_TEAM', label: 'Networking', desc: 'Entrar para uma equipe/treinador', xp: 200 },
        { id: 'SOCIAL_PRO', label: 'Influenciador', desc: 'Conectar 3 redes sociais', xp: 50 },
        { id: 'STORYTELLER', label: 'Minha História', desc: 'Bio com +100 caracteres', xp: 30 },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative custom-scrollbar bg-[#0c0c0c] min-h-screen text-[#F3F4F6] font-sans">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .industrial-border {
                    border: 1px solid;
                    border-color: #333333;
                }
                
                .progress-stripe {
                    background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
                    background-size: 1rem 1rem;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-tab-content {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                /* Custom Tabs Coloring Logic */
                .peer\/daily:checked ~ div label[for="tab_daily"] span { color: #FF4500; } 
                .peer\/daily:checked ~ div label[for="tab_daily"] div { transform: scaleX(1); }
                
                .peer\/weekly:checked ~ div label[for="tab_weekly"] span { color: #FFD700; } 
                .peer\/weekly:checked ~ div label[for="tab_weekly"] div { transform: scaleX(1); }
                
                .peer\/unique:checked ~ div label[for="tab_unique"] span { color: white; } 
                .peer\/unique:checked ~ div label[for="tab_unique"] div { transform: scaleX(1); }

                /* Material Symbols Setup */
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

            <div className="max-w-7xl mx-auto space-y-8">

                {/* RANK HEADER */}
                <div className="bg-[#161616] industrial-border p-6 lg:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-white">military_tech</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                        <div className="flex flex-col items-center justify-center md:border-r md:border-gray-700 md:pr-12 min-w-[140px]">
                            <span
                                className="text-7xl lg:text-9xl font-display font-bold text-white leading-none drop-shadow-lg"
                                style={{ WebkitTextStroke: '2px #FF4500' }}
                            >
                                {perfil.level}
                            </span>
                            <span className="text-xl lg:text-2xl font-display font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                                {rank.tier}
                            </span>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-end mb-3 gap-2">
                                <h2 className="text-3xl lg:text-4xl font-display font-bold uppercase text-white tracking-wide">
                                    {rank.title}
                                </h2>
                                <span className="font-mono text-[#FF4500] font-bold text-lg">{perfil.xp} / {nextXp} XP</span>
                            </div>
                            <div className="h-6 w-full bg-gray-900 border border-gray-700 relative shadow-inner">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FF4500] to-[#FFD700] progress-stripe flex items-center justify-end px-2 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="h-full w-1 bg-white opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                </div>
                                <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none">
                                    <div className="h-full w-px bg-gray-800"></div>
                                    <div className="h-full w-px bg-gray-800"></div>
                                    <div className="h-full w-px bg-gray-800"></div>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-xs font-bold uppercase text-gray-500 tracking-wider">
                                <span>Current Tier: {rank.tier}</span>
                                <span>Next Tier: Next Level</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <input className="peer/daily hidden" type="radio" name="mission_tabs" id="tab_daily" defaultChecked />
                    <input className="peer/weekly hidden" type="radio" name="mission_tabs" id="tab_weekly" />
                    <input className="peer/unique hidden" type="radio" name="mission_tabs" id="tab_unique" />

                    <div className="flex flex-wrap border-b border-gray-800 mb-8 sticky top-0 bg-[#0c0c0c] z-20 pt-2">
                        <label htmlFor="tab_daily" className="cursor-pointer group relative px-6 py-4 flex items-center gap-3 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 group-hover:text-[#FF4500] transition-colors">restart_alt</span>
                            <span className="font-display font-bold text-lg uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">Diárias</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF4500] scale-x-0 group-hover:scale-x-50 transition-transform origin-left"></div>
                        </label>
                        <label htmlFor="tab_weekly" className="cursor-pointer group relative px-6 py-4 flex items-center gap-3 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 group-hover:text-[#FFD700] transition-colors">calendar_today</span>
                            <span className="font-display font-bold text-lg uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">Semanais</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD700] scale-x-0 group-hover:scale-x-50 transition-transform origin-left"></div>
                        </label>
                        <label htmlFor="tab_unique" className="cursor-pointer group relative px-6 py-4 flex items-center gap-3 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">trophy</span>
                            <span className="font-display font-bold text-lg uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">Conquistas Únicas</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white scale-x-0 group-hover:scale-x-50 transition-transform origin-left"></div>
                        </label>
                    </div>

                    {/* CONTENT 1: DAILY */}
                    <div className="hidden peer-checked/daily:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-tab-content">
                        {/* IA MISSIONS */}
                        {AI_MISSIONS_DAILY.map((mission) => (
                            <ImageMissionCard key={mission.id} mission={mission} perfil={perfil} />
                        ))}
                        {/* STANDARD DAILY */}
                        {DAILY_QUESTS.map((quest, i) => (
                            <QuestCard key={i} quest={quest} />
                        ))}
                    </div>

                    {/* CONTENT 2: WEEKLY */}
                    <div className="hidden peer-checked/weekly:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-tab-content">
                        {WEEKLY_QUESTS.map((quest, i) => (
                            <QuestCard key={i} quest={quest} borderClass="hover:border-[#FFD700]" xpClass="text-[#FFD700]" />
                        ))}
                    </div>

                    {/* CONTENT 3: UNIQUE */}
                    <div className="hidden peer-checked/unique:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-tab-content">
                        {/* LINK IN BIO (Featured) */}
                        <ImageMissionCard mission={AI_MISSION_UNIQUE} perfil={perfil} featured={true} />

                        {/* STANDARD UNIQUE */}
                        {UNIQUE_QUESTS.map((quest) => (
                            <QuestCard
                                key={quest.id}
                                quest={{ ...quest, done: tasks.includes(quest.id) }}
                                borderClass="hover:border-white"
                                xpClass={tasks.includes(quest.id) ? "text-gray-500" : "text-blue-400"}
                                isUnique={true}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- SUBCOMPONENTE DE UPLOAD (Updated Design) ---
function ImageMissionCard({ mission, perfil, featured }) {
    const [loading, setLoading] = useState(false);

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scale = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);

        try {
            const base64 = await resizeImage(file);
            const res = await fetch('/api/validate-mission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, missionType: mission.id })
            });
            const data = await res.json();

            if (data.valid) {
                const result = processAIMission(perfil.weekly_stats, perfil.completed_tasks, mission.id);
                if (result.success) {
                    const newState = calculateNewLevelState(perfil.xp, perfil.level, result.xpGained);
                    await supabase.from('atletas').update({
                        xp: newState.newXp,
                        level: newState.newLevel,
                        weekly_stats: result.updatedStats,
                        completed_tasks: result.updatedTasks
                    }).eq('id', perfil.id);
                    alert(`✅ SUCESSO!\n\n${result.message}`);
                    window.location.reload();
                } else {
                    alert(result.message);
                }
            } else {
                alert(`❌ Não validado: ${data.reason}\n\nDica: ${mission.instruction}`);
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-[#161616] industrial-border p-6 relative group transition-colors flex flex-col ${featured ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.05)]' : 'hover:border-[#FF4500]'}`}>
            {featured && (
                <div className="absolute -top-3 -right-3 bg-[#FFD700] text-black p-2 shadow-lg border border-white rotate-12">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h4 className={`font-display font-bold text-xl uppercase tracking-wide ${featured ? 'text-[#FFD700]' : 'text-white'}`}>{mission.label}</h4>
                <div className="bg-[#202020] border border-gray-700 px-3 py-1 text-xs font-bold text-[#FF4500] uppercase tracking-wider">+{mission.xp} XP</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">{mission.desc}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase">{mission.done ? '0/1 DONE' : '0/1 READY'}</span>

                {mission.done ? (
                    <span className="material-symbols-outlined text-[#FF4500]">check_circle</span>
                ) : (
                    <label className={`font-display font-bold uppercase px-6 py-2 text-sm tracking-wide transition-colors cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(255,69,0,0.3)] ${loading ? 'bg-gray-600' : 'bg-[#FF4500] hover:bg-orange-600 text-white'}`}>
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {loading ? '...' : (featured ? 'UPLOAD' : 'START')}
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
                    </label>
                )}
            </div>
        </div>
    );
}

// --- SUBCOMPONENTE PADRÃO (Updated Design) ---
function QuestCard({ quest, borderClass = "hover:border-[#FF4500]", xpClass = "text-[#FF4500]", isUnique }) {

    // Logic specifically for Unique cards where 'quest' might come pre-merged with 'done' status
    const isDone = quest.done;

    return (
        <div className={`bg-[#161616] industrial-border p-6 relative group transition-colors flex flex-col ${isDone ? 'opacity-50' : borderClass}`}>
            {isDone && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
                    <span className="bg-black text-white px-4 py-2 font-display font-bold uppercase text-sm border border-gray-600 shadow-xl">Completed</span>
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-display font-bold text-xl text-white uppercase tracking-wide">{quest.label}</h4>
                <div className={`bg-[#202020] border border-gray-700 px-3 py-1 text-xs font-bold ${xpClass} uppercase tracking-wider`}>
                    {isDone ? 'Done' : `+${quest.xp} XP`}
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">{quest.desc}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase">{isDone ? 'Completed' : 'Pending'}</span>
                {isDone ? (
                    <span className="material-symbols-outlined text-gray-600">lock</span>
                ) : (
                    <button className="bg-transparent border border-gray-500 hover:border-[#FF4500] hover:text-[#FF4500] text-gray-400 font-display font-bold uppercase px-6 py-2 text-sm tracking-wide transition-colors cursor-default">
                        Active
                    </button>
                )}
            </div>
        </div>
    );
}