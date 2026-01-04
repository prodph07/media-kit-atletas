'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Share2, X as XIcon, GraduationCap } from 'lucide-react'; 

import HeroSection from './templates/padrao/HeroSection';
import StatsSection from './templates/padrao/StatsSection';
import MetricsSection from './templates/padrao/MetricsSection';
import MediaSection from './templates/padrao/MediaSection';
import ContactSection from './templates/padrao/ContactSection';
import CoachSection from './templates/CoachSection';
// NOVO IMPORT:
import TeamSection from './templates/padrao/TeamSection';

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
    const copyLink = () => { if (typeof window !== "undefined") { navigator.clipboard.writeText(window.location.href); alert("Link copiado!"); } };

    if (!athleteData) return <div className="text-white p-10 text-center">Carregando perfil...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
             <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0c; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; } .scrollbar-hide::-webkit-scrollbar { display: none; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; } `}</style>
             
             {selectedMedia && ( 
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fadeIn backdrop-blur-sm" onClick={closeMedia}> 
                    <div className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800" onClick={e => e.stopPropagation()}> 
                        <button onClick={closeMedia} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"><XIcon size={24} /></button> 
                        {selectedMedia.type === 'video' ? ( <div className="aspect-video w-full"><iframe className="w-full h-full" src={selectedMedia.src} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div> ) : ( <div className="w-full h-auto max-h-[85vh] flex items-center justify-center bg-black"><img src={selectedMedia.src} alt="Media" className="max-w-full max-h-[85vh] object-contain" /></div> )} 
                    </div> 
                 </div> 
             )}
             
             <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"> <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-cyan-600/10 rounded-full blur-[80px] sm:blur-[120px]"></div> <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-red-600/10 rounded-full blur-[80px] sm:blur-[120px]"></div> </div>
             
             <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0c]/90 backdrop-blur-md"> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"> 
                    <div className="flex items-center gap-2"> 
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center font-bold text-black italic">A</div> 
                        <span className="font-bold text-lg sm:text-xl tracking-tighter text-white">ATHLETE<span className="text-cyan-500">.PRO</span></span> 
                    </div> 
                    <div className="flex items-center gap-4"> 
                        <button onClick={copyLink} className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 size={20} /></button> 
                        <a href="#contact-section" className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400 transition-colors"><Mail size={16} /> Contato</a> 
                    </div> 
                </div> 
             </nav>
             
             <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-16">
                
                <HeroSection 
                    athleteData={athleteData} 
                    formattedName={formattedName} 
                    publicViewCount={publicViewCount} 
                />

                <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-hide"> 
                    <a href="#stats-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-cyan-400 hover:text-white transition-colors whitespace-nowrap">Estatísticas</a> 
                    {athleteData.is_coach && (
                        <a href="#coach-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-orange-500 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1">
                           <GraduationCap size={14}/> Treinador
                        </a>
                    )}
                    {hasInstaMetrics && <a href="#metrics-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-pink-500 hover:text-white transition-colors whitespace-nowrap">Métricas</a>} 
                    <a href="#media-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-slate-500 hover:text-white transition-colors whitespace-nowrap">Galeria</a> 
                    <a href="#contact-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-slate-500 hover:text-white transition-colors whitespace-nowrap">Contato</a> 
                </div>
                
                <StatsSection 
                    athleteData={athleteData} 
                    computedStats={computedStats} 
                />

                {/* --- SEÇÃO DO ATLETA: MOSTRAR TREINADORES --- */}
                {athleteData.connected_coaches && athleteData.connected_coaches.length > 0 && (
                    <TeamSection coaches={athleteData.connected_coaches} />
                )}

                {/* --- SEÇÃO DO TREINADOR: MOSTRAR ALUNOS --- */}
                {athleteData.is_coach && (
                    <div id="coach-section">
                        <CoachSection 
                            coachDetails={athleteData.coach_details} 
                            studentsList={athleteData.connected_students} // Passa a lista real do banco
                            theme="default" 
                        />
                    </div>
                )}
                
                {hasInstaMetrics && ( <MetricsSection athleteData={athleteData} /> )}
                <MediaSection athleteData={athleteData} onOpenMedia={openMedia} />
                <ContactSection athleteData={athleteData} />
             
             </main>

             <footer className="border-t border-slate-900 bg-[#050506] py-12 mt-20"> 
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-sm"> 
                    <p>© 2025 {formattedName.main}. Todos os direitos reservados.</p> 
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a>
                    </div> 
                </div> 
             </footer>
        </div>
    );
}