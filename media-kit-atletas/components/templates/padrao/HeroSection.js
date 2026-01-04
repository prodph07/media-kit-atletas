import React from 'react';
import { MapPin, Trophy, Shield, GraduationCap, Users } from 'lucide-react';
import { AvatarLevel } from '../../AvatarLevel';

export default function HeroSection({ athleteData, formattedName, publicViewCount }) {
    
    const isAthlete = athleteData.is_athlete;
    const isCoach = athleteData.is_coach;
    const isCoachOnly = isCoach && !isAthlete;

    const coach = athleteData.coach_details || {};
    const stats = athleteData.stats || {};

    // FALLBACK: Se não tiver foto (null ou vazia), usa uma imagem padrão
    const profilePic = athleteData.foto_url || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWtpUlK815AWCpK6IV4mjL42646NbjacY=";

    let subtitle = "Atleta";
    let subInfo = "";

    if (isCoachOnly) {
        subtitle = coach.graduation || "Treinador";
        subInfo = coach.team || "Sem Equipe";
    } else if (isAthlete && isCoach) {
        subtitle = `${athleteData.categoria || 'Lutador'} & Treinador`;
        subInfo = coach.team ? `Rep. ${coach.team}` : (stats.weight || "");
    } else {
        subtitle = athleteData.categoria || "Categoria Indefinida";
        subInfo = stats.weight || "";
    }

    return (
        <div className="relative pt-20 pb-10 flex flex-col items-center justify-center text-center animate-fadeIn">
            
            <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500"></div>
                
                {/* AvatarLevel recebendo a foto tratada (profilePic) */}
                <AvatarLevel 
                    foto={profilePic} 
                    level={athleteData.level} 
                    xp={athleteData.xp} 
                    size="xlarge" 
                    className="relative z-10"
                />
                
                {isCoach && (
                    <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-2 rounded-full border-4 border-[#0a0a0c] z-20 shadow-lg" title="Treinador Verificado">
                        <GraduationCap size={16} />
                    </div>
                )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">
                <span className="text-slate-500 opacity-50 block text-lg sm:text-xl font-medium tracking-normal mb-1 font-mono uppercase">
                    {formattedName.alias}
                </span>
                {formattedName.main}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base text-slate-400 font-medium uppercase tracking-widest mb-6">
                <span className={isCoachOnly ? "text-orange-500 font-bold" : "text-cyan-400 font-bold"}>{subtitle}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>{subInfo}</span>
                
                {athleteData.contact?.city && (
                    <>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="flex items-center gap-1 text-slate-500">
                            <MapPin size={12}/> {athleteData.contact.city}
                        </span>
                    </>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300 shadow-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {publicViewCount} Views
                </div>

                <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 text-xs font-bold text-yellow-500 shadow-lg">
                    <Trophy size={12} />
                    LVL {athleteData.level || 1}
                </div>

                {isAthlete && (
                    <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 text-xs font-bold text-cyan-400 shadow-lg">
                        <Shield size={12} />
                        {athleteData.record?.wins || 0}-{athleteData.record?.losses || 0}-{athleteData.record?.draws || 0}
                    </div>
                )}
                
                {isCoachOnly && coach.experience_years && (
                    <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 text-xs font-bold text-orange-400 shadow-lg">
                        <Users size={12} />
                        {coach.experience_years} Anos Exp.
                    </div>
                )}
            </div>
        </div>
    );
}