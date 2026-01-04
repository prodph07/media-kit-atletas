'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X as CloseIcon } from 'lucide-react';

// --- IMPORTAÇÕES MODULARES ---
import CyberHero from './templates/cyber/CyberHero';
import CyberStats from './templates/cyber/CyberStats';
import CyberBio from './templates/cyber/CyberBio';
import CyberMedia from './templates/cyber/CyberMedia';
import CyberContact from './templates/cyber/CyberContact';

export default function TemplateCyber({ data }) {
    const athleteData = data;
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [totalViews, setTotalViews] = useState(0); 
    
    // LÓGICA DE VIEWS
    useEffect(() => {
        const ATLETA_ID = athleteData?.id; 
        if (!ATLETA_ID) return;
        const handleViews = async () => {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', ATLETA_ID);
            setTotalViews(count || 0);
        };
        handleViews();
    }, [athleteData]);

    // LÓGICA DE SCROLL NAVBAR
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!athleteData) return <div className="bg-black h-screen text-lime-400 flex items-center justify-center font-mono">CARREGANDO SISTEMA...</div>;

    const formatName = (name, nickname) => {
        if (!name) return { main: '', alias: '' };
        const mainName = nickname ? name.replace(new RegExp(`['"]?${nickname}['"]?`, 'i'), '').trim() : name;
        return { main: mainName, alias: nickname || '' };
    };
    const names = formatName(athleteData.name, athleteData.nickname);
    
    const openMedia = (type, src) => setSelectedMedia({ type, src });
    const closeMedia = () => setSelectedMedia(null);
    
    // Cálculos Rápidos
    const wins = parseInt(athleteData.record?.wins) || 0; 
    const losses = parseInt(athleteData.record?.losses) || 0; 
    const draws = parseInt(athleteData.record?.draws) || 0;
    const totalFights = wins + losses + draws;
    const winPercentage = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
    
    const socialMetrics = { 
        reach: athleteData.socials?.instagram?.stats?.reach || '-', 
        engagement: athleteData.socials?.instagram?.stats?.engagement || '-', 
        impressions: athleteData.socials?.instagram?.stats?.impressions || '-', 
        shares: athleteData.socials?.instagram?.stats?.shares || '-' 
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#09090b] text-[#e4e4e7] font-sans selection:bg-lime-400 selection:text-black">
            
            {/* ESTILOS GLOBAIS (Mantidos aqui por serem específicos do Cyber) */}
            <style jsx global>{` @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,600;0,700;1,700&family=Inter:wght@400;500;700&display=swap'); .font-display { font-family: 'Chakra Petch', sans-serif; } .font-sans { font-family: 'Inter', sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #a3e635; } .glass-panel { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); } @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } } .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; } .hero-mask { mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%); } `}</style>
            
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}> </div>
            
            {/* MODAL DE MEDIA */}
            {selectedMedia && ( <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" onClick={closeMedia}> <div className="relative w-full max-w-6xl" onClick={e => e.stopPropagation()}> <button onClick={closeMedia} className="absolute -top-12 right-0 text-lime-400 hover:text-white transition-colors"> <CloseIcon className="w-8 h-8" /> </button> {selectedMedia.type === 'video' ? ( <div className="aspect-video w-full border border-lime-400/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.1)]"> <iframe className="w-full h-full" src={selectedMedia.src} frameBorder="0" allowFullScreen></iframe> </div> ) : ( <div className="flex justify-center"> <img src={selectedMedia.src} className="max-h-[85vh] border border-zinc-800 rounded-lg" /> </div> )} </div> </div> )}
            
            {/* NAVBAR FLUTUANTE */}
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] max-w-xl ${scrolled ? 'top-4' : 'top-8'}`}> <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl"> <span className="font-display font-bold text-lime-400 tracking-wider">ATHLETE<span className="text-white">.KIT</span></span> <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400"> <a href="#stats" className="hover:text-white transition-colors">Stats</a> <a href="#media" className="hover:text-white transition-colors">Mídia</a> <a href="#contact" className="hover:text-white transition-colors">Contato</a> </div> </div> </nav>
            
            {/* 1. HERO (Agora com AvatarLevel) */}
            <CyberHero athleteData={athleteData} names={names} />
            
            <main className="max-w-7xl mx-auto px-4 pb-20 relative z-10 space-y-24">
                
                {/* 2. STATS */}
                <CyberStats 
                    athleteData={athleteData} 
                    socialMetrics={socialMetrics} 
                    totalViews={totalViews} 
                />
                
                {/* 3. BIO & HISTÓRICO */}
                <CyberBio 
                    athleteData={athleteData} 
                    winPercentage={winPercentage} 
                />
                
                {/* 4. MÍDIA */}
                <CyberMedia 
                    athleteData={athleteData} 
                    onOpenMedia={openMedia} 
                />
                
                {/* 5. CONTATO */}
                <CyberContact athleteData={athleteData} />

            </main>
            
            <footer className="py-8 text-center text-zinc-600 text-xs uppercase tracking-widest"> © 2025 {athleteData.name} Media Kit. All Rights Reserved. </footer>
        </div>
    );
}