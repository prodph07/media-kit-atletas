import React from 'react';
import { BarChart3, TrendingUp, Instagram, MessageCircle, Share2 as ShareIcon, Users, MapPin } from 'lucide-react';
import { StatCard } from '../shared/StatsComponents';

export default function MetricsSection({ athleteData }) {
    return (
        <section id="metrics-section" className="animate-fadeIn scroll-mt-24"> 
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
                    Métricas e <span className="text-pink-500">Alcance</span>
                </h2>
                <div className="h-px bg-slate-800 flex-grow"></div>
            </div> 
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"> 
                {/* PERFORMANCE INSTA */}
                <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-center"> 
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="text-pink-500" size={24} /> Performance Instagram
                    </h3> 
                    <div className="grid grid-cols-2 gap-4 h-full"> 
                        <StatCard icon={TrendingUp} value={athleteData.socials.instagram.stats.reach} label="Alcance" highlight={true} colorClass="text-pink-500" /> 
                        <StatCard icon={Instagram} value={athleteData.socials.instagram.stats.impressions} label="Impressões" /> 
                        <StatCard icon={MessageCircle} value={athleteData.socials.instagram.stats.engagement} label="Engajamento" /> 
                        <StatCard icon={ShareIcon} value={athleteData.socials.instagram.stats.shares} label="Compartilhamentos" /> 
                    </div> 
                </div> 
                
                {/* PÚBLICO */}
                <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 sm:p-8"> 
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="text-pink-500" size={24} /> Público
                    </h3> 
                    <div className="space-y-6"> 
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Faixa Etária Principal</div>
                            <div className="text-xl sm:text-2xl font-bold text-white">{athleteData.socials.instagram.audience.age || '-'}</div>
                        </div> 
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Distribuição de Gênero</div>
                            <div className="text-lg sm:text-xl font-bold text-white">{athleteData.socials.instagram.audience.gender || '-'}</div>
                            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden flex">
                                <div className="h-full bg-cyan-500 w-1/2 opacity-80"></div>
                                <div className="h-full bg-pink-500 w-1/2 opacity-80"></div>
                            </div>
                        </div> 
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Principais Cidades</div>
                            <div className="flex items-start gap-2">
                                <MapPin size={20} className="text-pink-500 mt-1 shrink-0" />
                                <div className="text-base sm:text-lg text-slate-200 leading-snug">{athleteData.socials.instagram.audience.cities || '-'}</div>
                            </div>
                        </div> 
                    </div> 
                </div> 
            </div> 
        </section>
    );
}