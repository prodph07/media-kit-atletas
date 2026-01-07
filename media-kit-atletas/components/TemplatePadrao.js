'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X as XIcon } from 'lucide-react'; 

// --- IMPORTAÇÕES ---
import HeroSection from './templates/padrao/HeroSection';
import StatsSection from './templates/padrao/StatsSection';
import MetricsSection from './templates/padrao/MetricsSection';
import MediaSection from './templates/padrao/MediaSection';
import ContactSection from './templates/padrao/ContactSection';
import CoachSection from './templates/CoachSection';
import TeamSection from './templates/padrao/TeamSection';
import BioStatsAwards from './templates/padrao/BioStatsAwards';
import FightHistory from './templates/padrao/FightHistory';
import NextFightSection from './templates/padrao/NextFightSection';

export function TemplatePadrao({ data }) {
    const athleteData = data;
    const [publicViewCount, setPublicViewCount] = useState(0);

    useEffect(() => {
        const ATLETA_ID = athleteData?.id; 
        if (!ATLETA_ID) return;
        const handleViews = async () => {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            const { data: count, error: countErr } = await supabase.rpc('get_profile_view_count', { profile_id: ATLETA_ID });
            if (!countErr) setPublicViewCount(count || 0);
        };
        handleViews();
    }, [athleteData]);

    const [selectedMedia, setSelectedMedia] = useState(null); 
    const openMedia = (type, src) => setSelectedMedia({ type, src });
    const closeMedia = () => setSelectedMedia(null);

    const formatName = (name, nickname) => {
        if (!name) return { main: '', alias: '' };
        const mainName = nickname ? name.replace(new RegExp(`['"]?${nickname}['"]?`, 'i'), '').trim() : name;
        return { main: mainName, alias: nickname ? `'${nickname}'` : '' };
    };
    const formattedName = formatName(athleteData.name, athleteData.nickname);

    const computedStats = useMemo(() => {
        const w = parseInt(athleteData.record?.wins) || 0; 
        const l = parseInt(athleteData.record?.losses) || 0; 
        const d = parseInt(athleteData.record?.draws) || 0; 
        const k = parseInt(athleteData.record?.knockouts) || 0;
        const total = w + l + d;
        return { total, winRate: total > 0 ? Math.round((w / total) * 100) : 0, koRate: w > 0 ? Math.round((k / w) * 100) : 0 };
    }, [athleteData]);

    const hasInstaMetrics = athleteData.socials?.instagram?.stats?.reach || athleteData.socials?.instagram?.audience?.age;

    if (!athleteData) return <div className="text-white p-10 text-center">Carregando perfil...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20 overflow-x-hidden">
             <style jsx global>{` 
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 4px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0c; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; } 
                .scrollbar-hide::-webkit-scrollbar { display: none; } 
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; } 
             `}</style>
             
             {/* MODAL MIDIA */}
             {selectedMedia && ( 
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-fadeIn backdrop-blur-md" onClick={closeMedia}> 
                    <div className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col" onClick={e => e.stopPropagation()}> 
                        <button onClick={closeMedia} className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"><XIcon size={20} /></button> 
                        {selectedMedia.type === 'video' ? ( 
                            <div className="aspect-video w-full">
                                <iframe className="w-full h-full" src={selectedMedia.src} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            </div> 
                        ) : ( 
                            <div className="w-full h-auto max-h-[80vh] flex items-center justify-center bg-black">
                                <img src={selectedMedia.src} alt="Media" className="max-w-full max-h-[80vh] object-contain" />
                            </div> 
                        )} 
                    </div> 
                 </div> 
             )}
             
             {/* BACKGROUND BLOBS */}
             <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"> 
                <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] bg-cyan-600/10 rounded-full blur-[60px] sm:blur-[120px]"></div> 
                <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] bg-red-600/10 rounded-full blur-[60px] sm:blur-[120px]"></div> 
             </div>
             
             {/* CONTAINER PRINCIPAL */}
             <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-12 sm:gap-16 lg:gap-24">
                
                {/* GRUPO DE CABEÇALHO */}
                <div className="flex flex-col gap-6">
                    <HeroSection 
                        athleteData={athleteData} 
                        formattedName={formattedName} 
                        publicViewCount={publicViewCount} 
                    />

                    <NextFightSection nextFight={athleteData.nextFight} />

                    {/* MENU DE ANCORAGEM */}
                    <div className="flex items-center gap-6 border-b border-slate-800 overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"> 
                        <a href="#stats-section" className="text-sm font-bold uppercase tracking-widest pb-3 text-cyan-400 border-b-2 border-transparent hover:border-cyan-400 hover:text-white transition-all whitespace-nowrap">Estatísticas</a> 
                        {athleteData.is_coach && (
                            <a href="#coach-section" className="text-sm font-bold uppercase tracking-widest pb-3 text-orange-500 border-b-2 border-transparent hover:border-orange-500 hover:text-white transition-all whitespace-nowrap flex items-center gap-1">
                            {/* GraduationCap icon was here, removed import to clean up if not used in nav, added back below if needed inside link */}
                            Treinador
                            </a>
                        )}
                        {hasInstaMetrics && <a href="#metrics-section" className="text-sm font-bold uppercase tracking-widest pb-3 text-pink-500 border-b-2 border-transparent hover:border-pink-500 hover:text-white transition-all whitespace-nowrap">Métricas</a>} 
                        <a href="#media-section" className="text-sm font-bold uppercase tracking-widest pb-3 text-slate-500 border-b-2 border-transparent hover:border-slate-300 hover:text-white transition-all whitespace-nowrap">Galeria</a> 
                        <a href="#contact-section" className="text-sm font-bold uppercase tracking-widest pb-3 text-slate-500 border-b-2 border-transparent hover:border-slate-300 hover:text-white transition-all whitespace-nowrap">Contato</a> 
                    </div>
                </div>
                
                <div id="stats-section" className="scroll-mt-24 flex flex-col gap-12 sm:gap-16 lg:gap-24">
                    <StatsSection athleteData={athleteData} computedStats={computedStats} />
                    <BioStatsAwards athleteData={athleteData} />
                    {athleteData.is_athlete && <FightHistory history={athleteData.historico} />}
                    {athleteData.connected_coaches && athleteData.connected_coaches.length > 0 && <TeamSection coaches={athleteData.connected_coaches} />}
                </div>

                {athleteData.is_coach && (
                    <div id="coach-section" className="scroll-mt-24">
                        <CoachSection coachDetails={athleteData.coach_details} studentsList={athleteData.connected_students} theme="default" />
                    </div>
                )}
                
                {hasInstaMetrics && ( 
                    <div id="metrics-section" className="scroll-mt-24">
                        <MetricsSection athleteData={athleteData} />
                    </div>
                )}
                
                <div id="media-section" className="scroll-mt-24">
                    <MediaSection athleteData={athleteData} onOpenMedia={openMedia} />
                </div>

                <div id="contact-section" className="scroll-mt-24">
                    <ContactSection athleteData={athleteData} />
                </div>
             
             </main>

             <footer className="border-t border-slate-900 bg-[#050506] py-8 sm:py-12 mt-10 sm:mt-20"> 
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-sm text-center md:text-left"> 
                    <p>© 2025 {formattedName.main}. Todos os direitos reservados.</p> 
                    <div className="flex gap-6 justify-center">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a>
                    </div> 
                </div> 
             </footer>
        </div>
    );
}