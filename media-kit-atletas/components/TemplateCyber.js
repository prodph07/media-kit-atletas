'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
    Mail, Share2, X as XIcon, Zap, Activity, Users, 
    Shield, ExternalLink, Trophy, Skull, Hand, Ban,
    MapPin, Smartphone, CheckCircle, Play, Image as ImageIcon,
    Ruler, Weight, Calendar, Instagram, Youtube, Twitter, Film, Video, BarChart3
} from 'lucide-react';

import { AvatarLevel } from './AvatarLevel'; 

export default function TemplateCyber({ data }) {
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
    const copyLink = () => { if (typeof window !== "undefined") { navigator.clipboard.writeText(window.location.href); alert("SYSTEM: Link copiado."); } };

    if (!athleteData) return <div className="text-lime-400 p-10 text-center font-mono">INITIALIZING SYSTEM...</div>;

    const isCoach = athleteData.is_coach;
    const isCoachOnly = isCoach && !athleteData.is_athlete;
    const subtitle = isCoachOnly ? (athleteData.coach_details?.graduation || "Treinador") : (athleteData.categoria || "Atleta");
    const socials = athleteData.socials || {};
    const record = athleteData.record || {};
    const instaStats = socials.instagram?.stats || {}; // Dados das métricas manuais

    const SOCIAL_CONFIG = [
        { key: 'instagram', icon: <Instagram/>, label: 'INSTAGRAM', color: 'text-pink-500', border: 'hover:border-pink-500/50' },
        { key: 'youtube', icon: <Youtube/>, label: 'YOUTUBE', color: 'text-red-500', border: 'hover:border-red-500/50' },
        { key: 'tiktok', icon: <Film/>, label: 'TIKTOK', color: 'text-cyan-400', border: 'hover:border-cyan-400/50' },
        { key: 'x', icon: <Twitter/>, label: 'X / TWITTER', color: 'text-slate-400', border: 'hover:border-slate-400/50' },
        { key: 'kwai', icon: <Video/>, label: 'KWAI', color: 'text-orange-500', border: 'hover:border-orange-500/50' },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-lime-400 selection:text-black pb-20 relative overflow-x-hidden">
             
             <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,600;0,700;1,700&family=Inter:wght@400;500;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                h1, h2, h3, h4, .font-display { font-family: 'Chakra Petch', sans-serif; }
                .glass-panel { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
                .rank-frame { position: relative; z-index: 10; padding: 4px; background: linear-gradient(45deg, #a3e635, #1a2e05, #a3e635); background-size: 200% 200%; animation: borderGlow 3s ease infinite; clip-path: polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%); }
                @keyframes borderGlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
                @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #09090b; }
                ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #a3e635; }
             `}</style>
             
             {/* BACKGROUND */}
             <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

             {/* MODAL MIDIA */}
             {selectedMedia && ( 
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" onClick={closeMedia}> 
                    <div className="relative w-full max-w-6xl border border-lime-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(163,230,53,0.2)]" onClick={e => e.stopPropagation()}> 
                        <button onClick={closeMedia} className="absolute top-4 right-4 z-10 p-2 bg-red-600/80 text-white hover:bg-red-500 rounded"><XIcon size={24} /></button> 
                        {selectedMedia.type === 'video' ? ( <div className="aspect-video w-full"><iframe className="w-full h-full" src={selectedMedia.src} title="Video" frameBorder="0" allowFullScreen></iframe></div> ) : ( <div className="w-full h-auto max-h-[85vh] flex items-center justify-center bg-black"><img src={selectedMedia.src} alt="Media" className="max-w-full max-h-[85vh] object-contain" /></div> )} 
                    </div> 
                 </div> 
             )}
             
             {/* HERO SECTION */}
             <header className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-16 lg:py-40 flex flex-col lg:flex-row items-center lg:justify-between gap-12 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full lg:w-1/2 text-center lg:text-left z-10 order-2 lg:order-1">
                    <div className="inline-block mb-4">
                        <span className="bg-lime-400/10 border border-lime-500/30 px-3 py-1 text-lime-400 text-xs font-bold uppercase tracking-widest rounded mb-2">
                            {subtitle}
                        </span>
                    </div>
                    <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600 uppercase leading-[0.9] mb-4">
                        {formattedName.main}
                    </h1>
                    {formattedName.alias && (
                        <p className="font-display text-xl lg:text-3xl text-lime-400 tracking-widest uppercase mb-6 glitch-hover">
                            "{formattedName.alias}"
                        </p>
                    )}
                    <p className="text-zinc-400 text-base lg:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                        {athleteData.about || "Perfil profissional conectado ao sistema Athlete.Pro."}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 text-zinc-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-lime-500"/> {publicViewCount} Views
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10 order-1 lg:order-2">
                    <div className="relative w-[280px] lg:w-[400px] aspect-square">
                        <AvatarLevel 
                            foto={athleteData.foto_url} 
                            level={athleteData.level} 
                            xp={athleteData.xp} 
                            size="xlarge"
                            className="scale-110 lg:scale-125 z-20 grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 border border-lime-500/30 rotate-45 scale-75 z-0 animate-pulse hidden lg:block"></div>
                    </div>
                </div>
             </header>

             {/* MAIN CONTENT */}
             <main className="max-w-7xl mx-auto px-6 pb-20 relative z-10 space-y-16">
                
                {/* 1. CARTEL / RECORD (DESTAQUE NO TOPO) */}
                {athleteData.is_athlete && (
                    <section id="cartel" className="animate-fadeIn">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1 h-8 bg-lime-400"></div>
                            <h3 className="font-display font-bold text-3xl text-white">RECORD <span className="text-zinc-500">& ESTATÍSTICAS</span></h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Vitórias */}
                            <div className="glass-panel p-4 rounded-xl border-t-4 border-t-lime-500 bg-zinc-900/40 text-center hover:bg-zinc-900 transition-colors">
                                <div className="text-lime-500 mb-2 flex justify-center"><Trophy size={24}/></div>
                                <p className="font-display font-bold text-4xl text-white">{record.wins || 0}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Vitórias</p>
                            </div>
                            
                            {/* Derrotas */}
                            <div className="glass-panel p-4 rounded-xl border-t-4 border-t-red-600 bg-zinc-900/40 text-center hover:bg-zinc-900 transition-colors">
                                <div className="text-red-600 mb-2 flex justify-center"><XIcon size={24}/></div>
                                <p className="font-display font-bold text-4xl text-white">{record.losses || 0}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Derrotas</p>
                            </div>

                            {/* Empates */}
                            <div className="glass-panel p-4 rounded-xl border-t-4 border-t-zinc-500 bg-zinc-900/40 text-center hover:bg-zinc-900 transition-colors">
                                <div className="text-zinc-500 mb-2 flex justify-center"><Ban size={24}/></div>
                                <p className="font-display font-bold text-4xl text-white">{record.draws || 0}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Empates</p>
                            </div>

                            {/* K.O. */}
                            <div className="glass-panel p-4 rounded-xl border-t-4 border-t-orange-500 bg-zinc-900/40 text-center hover:bg-zinc-900 transition-colors">
                                <div className="text-orange-500 mb-2 flex justify-center"><Skull size={24}/></div>
                                <p className="font-display font-bold text-4xl text-white">{record.knockouts || 0}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">K.O.</p>
                            </div>

                            {/* Finalizações */}
                            <div className="glass-panel p-4 rounded-xl border-t-4 border-t-cyan-500 bg-zinc-900/40 text-center hover:bg-zinc-900 transition-colors col-span-2 md:col-span-1">
                                <div className="text-cyan-500 mb-2 flex justify-center"><Hand size={24}/></div>
                                <p className="font-display font-bold text-4xl text-white">{record.submissions || 0}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Submissões</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. REDES SOCIAIS & SEGUIDORES */}
                <section id="social" className="animate-fadeIn">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-1 h-8 bg-lime-400"></div>
                        <h3 className="font-display font-bold text-3xl text-white">CONEXÕES <span className="text-zinc-500">& MÍDIA</span></h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {SOCIAL_CONFIG.map((net) => {
                            const s = socials[net.key];
                            if (!s?.active || !s?.url) return null;
                            
                            return (
                                <a 
                                    key={net.key} 
                                    href={s.url} 
                                    target="_blank" 
                                    className={`glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group border border-zinc-800 ${net.border} hover:bg-zinc-900`}
                                >
                                    <div className={`${net.color} p-3 bg-zinc-900/80 rounded-full`}>
                                        {net.icon}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{net.label}</p>
                                        <p className="font-display font-bold text-xl text-white">
                                            {s.followers || <span className="text-xs text-zinc-600">--</span>}
                                        </p>
                                        {s.followers && <p className="text-[10px] text-zinc-600">Seguidores</p>}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 group-hover:text-white transition-colors flex items-center gap-1 mt-2">
                                        Ver Perfil <ExternalLink size={10}/>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>

                {/* 3. LAYOUT DIVIDIDO (ATRIBUTOS, HISTÓRICO, INSIGHTS) */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* COLUNA ESQUERDA (DADOS TÉCNICOS) */}
                    <div className="w-full lg:w-2/3 space-y-12">
                        
                        {/* Atributos Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Altura", val: athleteData.stats?.height, icon: <Ruler size={14}/> },
                                { label: "Peso", val: athleteData.stats?.weight, icon: <Weight size={14}/> },
                                { label: "Envergadura", val: athleteData.stats?.reach, icon: <Activity size={14}/> },
                                { label: "Idade", val: athleteData.stats?.age, icon: <Calendar size={14}/> },
                            ].map((item, i) => (
                                <div key={i} className="glass-panel p-4 rounded-xl border-l-2 border-l-lime-400 bg-zinc-900/40">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{item.label}</span>
                                    <p className="font-display font-bold text-lg text-white mt-1 flex items-center gap-1 text-lime-400">{item.icon} {item.val || '-'}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tabela de Lutas */}
                        {athleteData.is_athlete && athleteData.historico?.length > 0 && (
                            <div className="glass-panel p-6 rounded-2xl bg-zinc-900/20">
                                <h4 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2"><Shield className="text-red-500"/> COMBAT LOG</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-zinc-400 min-w-[400px]">
                                        <thead>
                                            <tr className="text-xs uppercase text-zinc-600 border-b border-zinc-800">
                                                <th className="pb-2 pl-2">Resultado</th>
                                                <th className="pb-2">Evento</th>
                                                <th className="pb-2 text-right pr-2">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-mono">
                                            {athleteData.historico.map((fight, i) => (
                                                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
                                                    <td className="py-3 pl-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${fight.result === 'Vitória' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{fight.result}</span>
                                                    </td>
                                                    <td className="py-3 text-white font-bold">{fight.event}</td>
                                                    <td className="py-3 text-xs text-right pr-2">{fight.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Mídia */}
                        <div className="space-y-6">
                            <h3 className="font-display font-bold text-2xl text-white border-l-4 border-lime-400 pl-4">GALERIA</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(athleteData.video_lista || []).map((video, idx) => {
                                    const isString = typeof video === 'string';
                                    const embedUrl = isString ? video : (video.embedUrl || video);
                                    const thumb = isString ? null : video.thumb;
                                    return (
                                        <div key={`vid-${idx}`} onClick={() => openMedia('video', embedUrl)} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-zinc-800">
                                            {thumb ? (<img src={thumb} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />) : (<div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Play className="text-zinc-700 w-10 h-10" /></div>)}
                                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Play className="w-5 h-5 text-black ml-1 fill-black" /></div></div>
                                        </div>
                                    );
                                })}
                                {(athleteData.galeria || []).map((img, idx) => {
                                    const src = typeof img === 'string' ? img : (img.thumb || img.full);
                                    const full = typeof img === 'string' ? img : (img.full || img.thumb);
                                    return (
                                        <div key={`img-${idx}`} onClick={() => openMedia('image', full)} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-zinc-800">
                                            <img src={src} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA (SIDEBAR - CONTATO E INSIGHTS) */}
                    <div className="w-full lg:w-1/3 space-y-8">
                        
                        {/* --- NOVA SEÇÃO: INSIGHTS DIGITAIS --- */}
                        {(instaStats.reach || instaStats.engagement) && (
                            <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-pink-500 bg-zinc-900/30">
                                <h4 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="text-pink-500"/> INSTAGRAM INSIGHTS
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-900/80 p-3 rounded text-center border border-zinc-800">
                                        <p className="text-xl font-display font-bold text-white">{instaStats.reach || '-'}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Alcance</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded text-center border border-zinc-800">
                                        <p className="text-xl font-display font-bold text-cyan-400">{instaStats.engagement || '-'}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Engajamento</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded text-center border border-zinc-800">
                                        <p className="text-lg font-display font-bold text-white">{instaStats.impressions || '-'}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Impressões</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded text-center border border-zinc-800">
                                        <p className="text-lg font-display font-bold text-white">{instaStats.shares || '-'}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Shares</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Card: Categoria / Linhagem */}
                        <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-yellow-400 hover:bg-zinc-900/40 transition-colors">
                            <div className="text-yellow-400 mb-4"><Zap className="w-8 h-8"/></div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{isCoach ? 'Linhagem' : 'Categoria'}</p>
                            <p className="font-display font-bold text-base text-white mt-2 leading-tight">
                                {isCoach ? (athleteData.coach_details?.lineage || '-') : (athleteData.categoria || '-')}
                            </p>
                        </div>

                        {/* Equipe / Alunos */}
                        {(athleteData.connected_students?.length > 0 || athleteData.connected_coaches?.length > 0) && (
                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-display font-bold text-lg text-white mb-4">{isCoach ? 'ALUNOS' : 'HEAD COACH'}</h4>
                                <div className="space-y-3">
                                    {[...(athleteData.connected_students || []), ...(athleteData.connected_coaches || [])].map((person, idx) => (
                                        <a key={idx} href={`/${person.slug || person.id}`} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded hover:bg-zinc-800 transition-colors">
                                            <img src={person.foto_url || "https://placehold.co/100"} className="w-10 h-10 rounded-full object-cover border border-zinc-700"/>
                                            <div>
                                                <p className="font-bold text-white text-sm">{person.apelido || person.nome}</p>
                                                <p className="text-[10px] text-lime-500 uppercase">{person.coach_details ? 'Coach' : 'Atleta'}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contato */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h4 className="font-display font-bold text-lg text-white mb-4">CONTATO</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <Mail size={16} className="text-lime-400"/> {athleteData.contact.email || '-'}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <MapPin size={16} className="text-lime-400"/> {athleteData.contact.city || '-'}
                                </div>
                                {athleteData.contact.phone && (
                                    <a href={`https://wa.me/${athleteData.contact.phone.replace(/\D/g, '')}`} target="_blank" className="block w-full text-center bg-[#25D366] text-black font-bold py-3 rounded hover:bg-white transition-colors">
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

             </main>

             <footer className="py-8 text-center text-zinc-600 text-xs uppercase tracking-widest font-mono">
                <p>System Status: Online</p>
                <p>© 2025 {formattedName.main}. All Rights Reserved.</p>
             </footer>
        </div>
    );
}