'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Shield, GraduationCap, Users, ThumbsUp, MessageSquareQuote, Share2, Zap } from 'lucide-react';
import { AvatarLevel } from '../../AvatarLevel'; // Circular Avatar with Level Borders
import { createClient } from '@supabase/supabase-js';
import { processDailyAction, calculateNewLevelState, getRankInfo } from '../../../lib/gamification';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function HeroSection({ athleteData, formattedName, publicViewCount }) {

    const [hasGivenRespect, setHasGivenRespect] = useState(false);
    const [nextLevelXp, setNextLevelXp] = useState(1000);
    const [rankInfo, setRankInfo] = useState({ title: "Novice" });

    // Calculate Next Level XP and Rank Info
    useEffect(() => {
        if (athleteData.level) {
            setNextLevelXp(athleteData.level * 1000);

            // Get Rank Info using gamification lib
            const info = getRankInfo(athleteData.level);
            setRankInfo(info);
        }
    }, [athleteData.level]);

    // Função para Copiar Link
    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            // Feedback visual simples
            const btn = document.getElementById('share-btn-text');
            if (btn) {
                const original = btn.innerText;
                btn.innerText = 'COPIADO!';
                setTimeout(() => btn.innerText = original, 2000);
            } else {
                alert("Link do perfil copiado!");
            }
        }
    };

    const handleRespect = async () => {
        if (hasGivenRespect) return;

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            alert("Faça login para mandar um Respect!");
            return;
        }

        const visitorId = session.user.id;
        if (visitorId === athleteData.user_id) {
            alert("Você não pode dar Respect para si mesmo (mas nós te admiramos!)");
            return;
        }

        setHasGivenRespect(true);

        const { data: visitorData } = await supabase
            .from('atletas')
            .select('xp, level, weekly_stats')
            .eq('user_id', visitorId)
            .single();

        if (visitorData) {
            const result = processDailyAction(visitorData.weekly_stats, 'DAILY_RESPECT');

            if (result.success) {
                const state = calculateNewLevelState(visitorData.xp, visitorData.level, result.xpGained);

                await supabase.from('atletas').update({
                    xp: state.newXp,
                    level: state.newLevel,
                    weekly_stats: result.updatedStats
                }).eq('user_id', visitorId);

                alert(`👊 Respect enviado! (+${result.xpGained} XP na missão diária)`);
            } else {
                alert("👊 Respect enviado!");
            }
        }
    };

    const isAthlete = athleteData.is_athlete;
    const isCoach = athleteData.is_coach;
    const isCoachOnly = isCoach && !isAthlete;

    const coach = athleteData.coach_details || {};
    const stats = athleteData.stats || {};
    const profilePic = athleteData.foto_url || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWtpUlK815AWCpK6IV4mjL42646NbjacY=";

    // Role Logic
    let roleText = "ATLETA";
    let subInfo = "";
    if (isCoachOnly) {
        roleText = "TREINADOR";
        subInfo = coach.team || "Sem Equipe";
    } else if (isAthlete && isCoach) {
        roleText = "ATLETA & TREINADOR";
        subInfo = coach.team ? `Rep. ${coach.team}` : (stats.weight || "");
    } else {
        roleText = athleteData.categoria || "ATLETA";
        subInfo = stats.weight || "";
    }

    // Formatting Name for Visual Effect
    const fullName = formattedName.main || "Atleta";
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const xpProgress = Math.min((athleteData.xp / nextLevelXp) * 100, 100);

    return (
        <header className="relative bg-[#161616] overflow-hidden min-h-[500px] flex items-center animate-fadeIn font-display pt-0 pb-16">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .skew-tag {
                    transform: skew(-12deg);
                }
                .skew-tag-content {
                    transform: skew(12deg);
                }
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .shadow-glow-purple {
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
                }
                .shadow-glow-cyan {
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
                }
            `}</style>

            <div className="absolute inset-0 bg-[#0c0c0c] z-0">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10"></div>
                <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 to-transparent opacity-60 z-0"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#FF4500]/10 blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 lg:gap-16">

                    {/* IMAGE COLUMN - CIRCULAR AVATAR LEVEL */}
                    <div className="relative flex-shrink-0 group mt-10 lg:mt-0">
                        <div className="absolute inset-0 bg-[#FF4500]/20 blur-3xl rounded-full group-hover:bg-[#FF4500]/40 transition-all duration-500"></div>
                        <div className="transform transition-transform">
                            <AvatarLevel
                                foto={profilePic}
                                level={athleteData.level}
                                xp={athleteData.xp}
                                size="xlarge"
                                hideXp={true} // Hides internal XP bar
                            />
                        </div>
                    </div>

                    {/* INFO COLUMN */}
                    <div className="flex-1 flex flex-col items-center lg:items-start space-y-5 text-center lg:text-left w-full">

                        {/* ROLE & NICKNAME */}
                        <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                            <span className="text-[#FF4500] font-bold tracking-[0.2em] text-sm uppercase bg-[#FF4500]/10 px-3 py-1 rounded border border-[#FF4500]/20">
                                {roleText}
                            </span>
                            <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
                            <h2 className="text-[#FFD700] font-display font-bold text-lg tracking-[0.3em] uppercase drop-shadow-md">
                                {formattedName.alias || "THE FIGHTER"}
                            </h2>
                        </div>

                        {/* NAME */}
                        <h1 className="text-white font-display font-black text-6xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tight drop-shadow-2xl">
                            {firstName} <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">{lastName}</span>
                        </h1>

                        {/* STATUS MESSAGE */}
                        {athleteData.status_message && (
                            <div className="flex items-start gap-3 max-w-lg bg-gray-900/50 border-l-4 border-[#FFD700] p-4 rounded-r-lg backdrop-blur-sm">
                                <MessageSquareQuote className="text-[#FFD700] shrink-0 mt-1" size={20} />
                                <p className="text-gray-300 font-body italic text-sm text-left leading-relaxed">
                                    "{athleteData.status_message}"
                                </p>
                            </div>
                        )}

                        {/* LEVEL & XP BAR (THE ONE WE KEEP) */}
                        <div className="w-full max-w-md space-y-2">
                            <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2 text-white">
                                    <span className="text-[#FF4500] text-lg">Lvl {athleteData.level || 1}</span>
                                    <span className="text-gray-500">Rank: {rankInfo.title || athleteData.rank?.tier || "Novice"}</span>
                                </div>
                                <span className="text-gray-400">{athleteData.xp} / {nextLevelXp} XP</span>
                            </div>
                            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-[#FF4500] to-[#FFD700] shadow-[0_0_10px_rgba(255,69,0,0.5)] transition-all duration-1000 relative"
                                    style={{ width: `${xpProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* TAGS & META */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
                            {athleteData.contact?.city && (
                                <div className="flex items-center gap-1.5 text-gray-400 border border-gray-800 px-3 py-1 rounded bg-black/40">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{athleteData.contact.city}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400 border border-gray-800 px-3 py-1 rounded bg-black/40">
                                <Users size={16} className="text-gray-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">{publicViewCount || 0} Views</span>
                            </div>
                            {isAthlete && (
                                <div className="flex items-center gap-1.5 text-gray-400 border border-gray-800 px-3 py-1 rounded bg-black/40">
                                    <Shield size={16} className="text-gray-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {athleteData.record?.wins || 0}-{athleteData.record?.losses || 0}-{athleteData.record?.draws || 0}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS ROW */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                            <button
                                onClick={handleRespect}
                                disabled={hasGivenRespect}
                                className={`group relative bg-gray-900 border ${hasGivenRespect ? 'border-green-500/50' : 'border-purple-500/30 hover:border-purple-500'} text-white px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-300 shadow-glow-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] overflow-hidden`}
                            >
                                <div className={`absolute inset-0 ${hasGivenRespect ? 'bg-green-600/10' : 'bg-purple-600/10 group-hover:bg-purple-600/20'} transition-colors`}></div>
                                <Zap className={`${hasGivenRespect ? 'text-green-400' : 'text-purple-400 group-hover:text-purple-300'} transition-colors`} size={20} />
                                <span className="font-display font-semibold uppercase tracking-wider text-sm relative z-10">
                                    {hasGivenRespect ? "Respect Sent" : "Respect"}
                                </span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="group relative bg-gray-900 border border-cyan-500/30 hover:border-cyan-500 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-300 shadow-glow-cyan hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-cyan-600/10 group-hover:bg-cyan-600/20 transition-colors"></div>
                                <Share2 className="text-cyan-400 group-hover:text-cyan-300 transition-colors" size={20} />
                                <span id="share-btn-text" className="font-display font-semibold uppercase tracking-wider text-sm relative z-10">Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}