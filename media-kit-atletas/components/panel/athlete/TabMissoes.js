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
            icon: <Instagram size={18} className="text-pink-500"/>,
            done: isToday(stats.last_daily_story_date),
            instruction: 'O print deve mostrar seu story com a marcação visível.'
        },
        {
            id: 'GEAR_CHECK',
            label: 'Armadura Pronta',
            desc: 'Foto do Equipamento',
            xp: 30,
            icon: <Dumbbell size={18} className="text-blue-500"/>,
            done: isToday(stats.last_daily_gear_date),
            instruction: 'Foto das luvas, kimono ou material de treino arrumado.'
        }
    ];

    const AI_MISSION_UNIQUE = {
        id: 'LINK_IN_BIO',
        label: 'Link na Bio',
        desc: 'Divulgue seu Perfil',
        xp: 200,
        icon: <LinkIcon size={18} className="text-green-500"/>,
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
            icon: <Flame size={18} className={currentStreak > 2 ? "text-orange-600 animate-pulse" : "text-orange-500"}/>
        },
        { 
            label: `Olheiro (${scoutCount}/3)`, 
            desc: "Visitar o perfil de 3 atletas diferentes", 
            xp: 20, 
            done: scoutDone,
            icon: <ScanEye size={18} className="text-blue-400"/>
        },
        { 
            label: "Respect", 
            desc: "Deixar um 'Respect' no perfil de alguém", 
            xp: 10, 
            done: isToday(stats.last_daily_respect_date),
            icon: <ThumbsUp size={18} className="text-purple-500"/>
        },
        { 
            label: "Status de Combate", 
            desc: "Atualizar seu Status do Dia (Painel Geral)", 
            xp: 15, 
            done: isToday(stats.last_daily_status_date),
            icon: <MessageSquareQuote size={18} className="text-green-400"/>
        },
        { 
            label: "Juri Ativo", 
            desc: "Votar em pelo menos 1 duelo", 
            xp: 15, 
            done: isToday(stats.last_vote_date),
            icon: <Zap size={18} className="text-yellow-500"/>
        }
    ];

    const WEEKLY_QUESTS = [
        { 
            label: "Disciplina de Peso", 
            desc: "Atualizar peso no perfil", 
            xp: 50, 
            done: isThisWeek(stats.last_weight_update),
            icon: <Clock size={18} className="text-cyan-500"/>
        },
        { 
            label: "Hype da Semana", 
            desc: "Compartilhar perfil (Botão Olho)", 
            xp: 30, 
            done: isThisWeek(stats.last_share_date),
            icon: <Star size={18} className="text-purple-500"/>
        },
        { 
            label: "Gladiador", 
            desc: "Participar de um Duelo", 
            xp: 75, 
            done: isThisWeek(stats.last_duel_participation_date),
            icon: <Swords size={18} className="text-red-500"/>
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
        <div className="space-y-6 animate-fadeIn">
            
            {/* CABEÇALHO DE NÍVEL (Mantido IDÊNTICO) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">{perfil.level}</span>
                    </div>
                    <div className="absolute -bottom-2 w-full text-center">
                        <span className="bg-yellow-600 text-black text-[10px] font-bold px-2 py-1 rounded uppercase">{rank.tier}</span>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between mb-2">
                        <h2 className="text-xl font-bold text-white uppercase">{rank.title}</h2>
                        <span className="text-slate-400 text-sm font-bold">{perfil.xp} / {nextXp} XP</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">Complete missões para subir de rank e ganhar destaque.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* COLUNA 1: DIÁRIAS (AGORA COM AS NOVAS MISSÕES NO MESMO ESTILO) */}
                <div className="space-y-4">
                    <h3 className="text-orange-500 font-bold uppercase text-sm flex items-center gap-2">
                        <Calendar size={18}/> Diárias (Reset 24h)
                    </h3>
                    <div className="space-y-3">
                        {/* NOVAS MISSÕES DE UPLOAD (I.A.) */}
                        {AI_MISSIONS_DAILY.map((mission) => (
                            <ImageMissionCard key={mission.id} mission={mission} perfil={perfil} />
                        ))}

                        {/* MISSÕES ANTIGAS */}
                        {DAILY_QUESTS.map((quest, i) => (
                            <QuestCard key={i} quest={quest} isRecurring={true} />
                        ))}
                    </div>

                    <h3 className="text-purple-500 font-bold uppercase text-sm flex items-center gap-2 mt-8">
                        <Clock size={18}/> Semanais (Reset 7 Dias)
                    </h3>
                    <div className="space-y-3">
                        {WEEKLY_QUESTS.map((quest, i) => (
                            <QuestCard key={i} quest={quest} isRecurring={true} />
                        ))}
                    </div>
                </div>

                {/* COLUNA 2: CONQUISTAS (INCLUINDO LINK NA BIO NO TOPO) */}
                <div className="space-y-4">
                    <h3 className="text-cyan-500 font-bold uppercase text-sm flex items-center gap-2">
                        <Trophy size={18}/> Conquistas Únicas
                    </h3>
                    
                    {/* LINK NA BIO (DESTAQUE NO TOPO) */}
                    <ImageMissionCard mission={AI_MISSION_UNIQUE} perfil={perfil} />

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 mt-3">
                        {UNIQUE_QUESTS.map((quest) => {
                            const isDone = tasks.includes(quest.id);
                            return (
                                <div key={quest.id} className={`p-3 rounded border flex items-center justify-between transition-all ${isDone ? 'bg-cyan-900/10 border-cyan-500/30' : 'bg-slate-900 border-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${isDone ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
                                            {isDone ? <CheckCircle size={16}/> : <Circle size={16}/>}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${isDone ? 'text-cyan-100' : 'text-slate-400'}`}>{quest.label}</h4>
                                            <p className="text-[10px] text-slate-500">{quest.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold ${isDone ? 'text-cyan-400' : 'text-slate-600'}`}>+{quest.xp} XP</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUBCOMPONENTE DE UPLOAD (VISUALMENTE IDÊNTICO AO QUESTCARD) ---
function ImageMissionCard({ mission, perfil }) {
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

    // Design IDÊNTICO ao QuestCard original
    return (
        <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${mission.done ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${mission.done ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                        {/* Se feito, ícone verde. Se não, cor original do ícone da missão */}
                        {React.cloneElement(mission.icon, { className: mission.done ? "text-green-400" : mission.icon.props.className })}
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${mission.done ? 'text-green-100' : 'text-white'}`}>{mission.label}</h4>
                        <p className="text-[10px] text-slate-500">{mission.desc}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`block text-xs font-bold ${mission.done ? 'text-green-400' : 'text-yellow-500'}`}>+{mission.xp} XP</span>
                    {mission.done && <span className="text-[10px] text-green-600 font-bold uppercase">Feito</span>}
                </div>
            </div>

            {/* Área de Upload (Só aparece se não estiver feito) */}
            {!mission.done && (
                <label className={`w-full mt-1 flex items-center justify-center gap-2 py-2 rounded border border-dashed cursor-pointer transition-all ${loading ? 'bg-slate-800' : 'bg-slate-950 hover:bg-slate-800 border-slate-700'}`}>
                    {loading ? <Loader2 size={14} className="animate-spin text-slate-400"/> : <Upload size={14} className="text-slate-400"/>}
                    <span className="text-xs font-bold text-slate-400">{loading ? 'Analisando...' : 'Enviar Comprovante'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading}/>
                </label>
            )}
        </div>
    );
}

// Subcomponente Antigo (Mantido igual)
function QuestCard({ quest }) {
    return (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${quest.done ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${quest.done ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                    {quest.icon}
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${quest.done ? 'text-green-100' : 'text-white'}`}>{quest.label}</h4>
                    <p className="text-[10px] text-slate-500">{quest.desc}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`block text-xs font-bold ${quest.done ? 'text-green-400' : 'text-yellow-500'}`}>+{quest.xp} XP</span>
                {quest.done && <span className="text-[10px] text-green-600 font-bold uppercase">Feito</span>}
            </div>
        </div>
    );
}