'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, BarChart3, Instagram, Play, X as CloseIcon, ArrowRight, Mail, Phone, Share2, Youtube, Twitter, Smartphone, Eye } from 'lucide-react';

// --- ÍCONES PERSONALIZADOS ---
const KwaiIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.005 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm4.7 15.3l-2.6-3.6-2.1 2.1v1.5h-2.4V7.4h2.4v5.3l3.8-5.3h3l-4.1 5.3 4.5 6.6h-2.5z"/>
    </svg>
);

const TikTokIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

export default function TemplateCyber({ data }) {
    const athleteData = data;
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [totalViews, setTotalViews] = useState(0); // Estado para as views
    
    // --- LÓGICA DE VIEWS (Contagem e Registro) ---
    useEffect(() => {
        const ATLETA_ID = athleteData?.id; 
        if (!ATLETA_ID) return;

        const handleViews = async () => {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            
            // 1. Busca o total de views para exibir
            const { count } = await supabase
                .from('profile_views')
                .select('*', { count: 'exact', head: true })
                .eq('perfil_visitado_id', ATLETA_ID);
            
            setTotalViews(count || 0);

            // 2. Registra a nova visita (se não for o dono e não estiver na sessão)
            const sessionKey = `view_registrado_${ATLETA_ID}`;
            if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) return;

            let visitanteId = null;
            let visitanteTipo = 'anonimo';

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                if (user.id === athleteData.user_id) return; 
                visitanteId = user.id;
                const { data: vData } = await supabase.from('atletas').select('tipo_conta').eq('user_id', user.id).single();
                if (vData) visitanteTipo = vData.tipo_conta || 'atleta';
            }

            await supabase.from('profile_views').insert({
                perfil_visitado_id: ATLETA_ID,
                visitante_id: visitanteId,
                visitante_tipo: visitanteTipo
            });
            sessionStorage.setItem(sessionKey, 'true');
            
            // Atualiza o contador localmente para refletir a nova visita imediatamente
            setTotalViews(prev => prev + 1);
        };
        handleViews();
    }, [athleteData]);

    // --- SCROLL EFFECT ---
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
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,600;0,700;1,700&family=Inter:wght@400;500;700&display=swap');
                .font-display { font-family: 'Chakra Petch', sans-serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #a3e635; }
                .glass-panel {
                    background: rgba(24, 24, 27, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                @keyframes glitch {
                    0% { transform: translate(0) }
                    20% { transform: translate(-2px, 2px) }
                    40% { transform: translate(-2px, -2px) }
                    60% { transform: translate(2px, 2px) }
                    80% { transform: translate(2px, -2px) }
                    100% { transform: translate(0) }
                }
                .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
                .hero-mask {
                    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                }
            `}</style>

            {/* Background Grid */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Modal de Mídia */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" onClick={closeMedia}>
                    <div className="relative w-full max-w-6xl" onClick={e => e.stopPropagation()}>
                        <button onClick={closeMedia} className="absolute -top-12 right-0 text-lime-400 hover:text-white transition-colors">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                        {selectedMedia.type === 'video' ? (
                            <div className="aspect-video w-full border border-lime-400/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.1)]">
                                <iframe className="w-full h-full" src={selectedMedia.src} frameBorder="0" allowFullScreen></iframe>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <img src={selectedMedia.src} className="max-h-[85vh] border border-zinc-800 rounded-lg" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] max-w-xl ${scrolled ? 'top-4' : 'top-8'}`}>
                <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
                    <span className="font-display font-bold text-lime-400 tracking-wider">ATHLETE<span className="text-white">.KIT</span></span>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <a href="#stats" className="hover:text-white transition-colors">Stats</a>
                        <a href="#media" className="hover:text-white transition-colors">Mídia</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contato</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
                    <h1 className="font-display font-black text-[15vw] sm:text-[14vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-transparent opacity-50 uppercase whitespace-nowrap">
                        {names.alias || names.main}
                    </h1>
                </div>

                <div className="relative z-10 w-full max-w-lg mx-auto aspect-[3/4] sm:aspect-square flex items-end justify-center">
                    <img 
                        src={athleteData.foto_url || "https://placehold.co/600x800/18181b/FFF?text=FOTO"} 
                        alt="Atleta" 
                        className="h-full object-contain hero-mask drop-shadow-2xl"
                    />
                    
                    {athleteData.nextFight?.date && (
                        <div className="absolute bottom-10 -right-4 sm:-right-12 glass-panel p-4 rounded-xl border-l-4 border-lime-400 animate-fadeIn">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Próximo Combate</p>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="font-display font-bold text-xl leading-none">{athleteData.nextFight.opponent}</p>
                                    <p className="text-xs text-lime-400">{athleteData.nextFight.event}</p>
                                </div>
                                <div className="h-8 w-px bg-zinc-700"></div>
                                <div className="text-center">
                                    <p className="font-display font-bold text-xl leading-none">{athleteData.nextFight.date.split(' ')[0]}</p>
                                    <p className="text-xs text-zinc-500 truncate max-w-[80px]">{athleteData.nextFight.location}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative z-20 text-center mt-[-40px]">
                    <h2 className="font-display font-bold text-4xl sm:text-6xl uppercase tracking-tighter text-white drop-shadow-lg glitch-hover cursor-default">
                        {names.main}
                    </h2>
                    <div className="flex justify-center gap-3 mt-4">
                        {athleteData.category && <span className="px-3 py-1 border border-zinc-700 rounded text-[10px] uppercase tracking-widest text-zinc-400">{athleteData.category}</span>}
                        {athleteData.fightingStyle && <span className="px-3 py-1 bg-lime-400/10 border border-lime-400/20 rounded text-[10px] uppercase tracking-widest text-lime-400">{athleteData.fightingStyle}</span>}
                    </div>
                </div>
            </header>

            {/* Marquee Stats */}
            <div className="w-full bg-lime-400 text-black overflow-hidden py-3 mb-20 relative z-20 transform -skew-y-1">
                <div className="flex justify-around items-center font-display font-black text-xl sm:text-3xl uppercase tracking-tighter">
                    <span>{wins} Vitórias</span>
                    <span className="opacity-30">/</span>
                    <span>{athleteData.record?.knockouts || 0} KOs</span>
                    <span className="opacity-30">/</span>
                    <span>{athleteData.record?.submissions || 0} Subs</span>
                    <span className="opacity-30">/</span>
                    <span>{athleteData.stats?.height || '-'}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 pb-20 relative z-10 space-y-24">
                
                {/* --- ESTATÍSTICAS E REDES SOCIAIS --- */}
                <section id="stats">
                    <div className="flex items-end justify-between mb-8 border-b border-zinc-800 pb-4">
                        <h3 className="font-display font-bold text-4xl text-white">IMPACTO <span className="text-lime-400">DIGITAL</span></h3>
                        <p className="text-zinc-500 text-sm text-right hidden sm:block">Analytics em tempo real</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        
                        {/* Alcance (Grande: 2x2) */}
                        <div className="md:col-span-2 md:row-span-2 glass-panel rounded-3xl p-8 flex flex-col justify-between group hover:border-lime-500/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-zinc-900 rounded-full text-lime-400"><BarChart3 className="w-6 h-6"/></div>
                                <span className="text-xs uppercase tracking-widest text-zinc-500 group-hover:text-lime-400 transition-colors">Alcance Mensal</span>
                            </div>
                            <div>
                                <p className="font-display font-black text-6xl sm:text-8xl text-white tracking-tighter">{socialMetrics.reach}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-lime-400 w-[85%]"></div>
                                    </div>
                                    <span className="text-xs text-lime-400 font-bold">+12%</span>
                                </div>
                            </div>
                        </div>

                        {/* Cards Menores de Métricas (Linha 1) */}
                        <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors">
                            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Engajamento</p>
                            <p className="font-display font-bold text-3xl text-white">{socialMetrics.engagement}</p>
                        </div>

                        <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center bg-zinc-900">
                            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Impressões</p>
                            <p className="font-display font-bold text-3xl text-lime-400">{socialMetrics.impressions}</p>
                        </div>
                        
                        {/* Cards Menores de Métricas (Linha 2) */}
                        <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-2 mb-2 justify-center">
                                <Share2 className="w-4 h-4 text-lime-400"/>
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Shares</p>
                            </div>
                            <p className="font-display font-bold text-3xl text-white">{socialMetrics.shares}</p>
                        </div>

                        {/* CARD DE VIEWS (NOVO) */}
                        <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors border border-zinc-800">
                             <div className="flex items-center gap-2 mb-2 justify-center">
                                <Eye className="w-4 h-4 text-cyan-400"/>
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Visitas</p>
                            </div>
                            <p className="font-display font-bold text-3xl text-white">{totalViews}</p>
                        </div>

                        {/* Demografia (Linha 3 - Full Width) */}
                        <div className="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-zinc-400 uppercase">Público Principal</span>
                                <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full border border-lime-400/20">{athleteData.socials?.instagram?.audience?.age || '20-35 anos'}</span>
                            </div>
                            <div className="flex items-center gap-1 h-10 w-full sm:w-1/2">
                                {(() => {
                                    const genderStr = athleteData.socials?.instagram?.audience?.gender || '';
                                    const menMatch = genderStr.match(/(\d+)% Homens/);
                                    const menVal = menMatch ? parseInt(menMatch[1]) : 50;
                                    const womenVal = 100 - menVal;
                                    return (
                                        <>
                                            <div className="h-full bg-zinc-800 rounded-l-lg flex items-center justify-center relative transition-all hover:bg-zinc-700" style={{width: `${menVal}%`}}><span className="text-xs font-bold text-white">{menVal}% H</span></div>
                                            <div className="h-full bg-lime-900/50 rounded-r-lg flex items-center justify-center relative transition-all hover:bg-lime-900/70" style={{width: `${womenVal}%`}}><span className="text-xs font-bold text-lime-400">{womenVal}% M</span></div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* --- LISTA DE REDES SOCIAIS --- */}
                        <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4" id="social">
                            
                            {athleteData.socials?.instagram?.active && (
                                <a href={athleteData.socials.instagram.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-pink-900/40 hover:to-purple-900/40 transition-all border border-zinc-800 hover:border-pink-500">
                                    <div className="flex justify-between mb-4"><Instagram className="w-5 h-5 text-pink-500"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div>
                                    <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.instagram.followers}</p><p className="text-[10px] text-zinc-500">Instagram</p></div>
                                </a>
                            )}

                            {athleteData.socials?.tiktok?.active && (
                                <a href={athleteData.socials.tiktok.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-cyan-900/40 hover:to-blue-900/40 transition-all border border-zinc-800 hover:border-cyan-400">
                                    <div className="flex justify-between mb-4"><TikTokIcon className="w-5 h-5 text-cyan-400"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div>
                                    <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.tiktok.followers}</p><p className="text-[10px] text-zinc-500">TikTok</p></div>
                                </a>
                            )}

                            {athleteData.socials?.youtube?.active && (
                                <a href={athleteData.socials.youtube.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-red-900/40 hover:to-orange-900/40 transition-all border border-zinc-800 hover:border-red-600">
                                    <div className="flex justify-between mb-4"><Youtube className="w-5 h-5 text-red-600"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div>
                                    <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.youtube.followers}</p><p className="text-[10px] text-zinc-500">YouTube</p></div>
                                </a>
                            )}

                            {athleteData.socials?.x?.active && (
                                <a href={athleteData.socials.x.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-zinc-900 transition-all border border-zinc-800 hover:border-white">
                                    <div className="flex justify-between mb-4"><Twitter className="w-5 h-5 text-white"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div>
                                    <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.x.followers}</p><p className="text-[10px] text-zinc-500">Twitter / X</p></div>
                                </a>
                            )}

                            {athleteData.socials?.kwai?.active && (
                                <a href={athleteData.socials.kwai.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-orange-900/40 hover:to-yellow-900/40 transition-all border border-zinc-800 hover:border-orange-500">
                                    <div className="flex justify-between mb-4"><Smartphone className="w-5 h-5 text-orange-500"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div>
                                    <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.kwai.followers}</p><p className="text-[10px] text-zinc-500">Kwai</p></div>
                                </a>
                            )}

                        </div>
                    </div>
                </section>

                {/* --- BIO E LUTAS --- */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        <h3 className="font-display font-bold text-4xl text-white">SOBRE <span className="text-zinc-600">O ATLETA</span></h3>
                        <p className="text-lg text-zinc-300 leading-relaxed font-light border-l-2 border-lime-400 pl-6">
                            {athleteData.about}
                        </p>
                        <div className="grid grid-cols-1 gap-4 mt-8">
                            {athleteData.awards?.map((award, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                    <div className="text-yellow-500"><Trophy className="w-5 h-5"/></div>
                                    <span className="text-sm font-bold text-zinc-200 leading-tight">{award}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-8 border-t-4 border-t-lime-400">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-display font-bold text-2xl text-white">HISTÓRICO RECENTE</h4>
                            <span className="text-xs font-bold bg-lime-400 text-black px-2 py-1 rounded">Win Rate: {winPercentage}%</span>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {athleteData.fightHistory?.map((fight, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl hover:bg-zinc-900 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${fight.result === 'W' ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {fight.result}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-lime-400 transition-colors">{fight.event}</p>
                                            <p className="text-xs text-zinc-500">{fight.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-400">vs</p>
                                        <p className="text-sm font-bold text-white truncate max-w-[100px]">{fight.opponent}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- MEDIA SECTION --- */}
                {((athleteData.videos && athleteData.videos.length > 0) || (athleteData.gallery && athleteData.gallery.length > 0)) && (
                    <section id="media">
                        <h3 className="font-display font-bold text-4xl text-white mb-8 text-right">GALERIA <span className="text-lime-400">&</span> VÍDEOS</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:auto-rows-[200px]">
                            {/* Vídeos */}
                            {athleteData.videos && athleteData.videos.map((video, idx) => (
                                <div 
                                    key={`vid-${idx}`} 
                                    onClick={() => openMedia('video', video.embedUrl)}
                                    className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 ${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                                >
                                    <img src={video.thumb || "https://placehold.co/400x250/1e293b/a3e635?text=VIDEO"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-black ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                                        <p className="font-display font-bold text-white text-xl truncate">{video.title}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Fotos */}
                            {athleteData.gallery && athleteData.gallery.map((img, idx) => (
                                <div 
                                    key={`img-${idx}`} 
                                    onClick={() => openMedia('image', img.full)}
                                    className="group relative rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 col-span-1 row-span-1 aspect-square"
                                >
                                    <img src={img.thumb} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- CONTATO --- */}
                <section id="contact" className="relative mt-32 rounded-3xl overflow-hidden border border-zinc-800">
                    <div className="absolute inset-0 bg-lime-400/5 z-0"></div>
                    <div className="relative z-10 p-12 md:p-24 text-center">
                        <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-6 uppercase">Pronto para <br/><span className="text-lime-400">fazer história?</span></h2>
                        <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg">
                            Disponível para patrocínios globais, aparições e parcerias de mídia.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-10 text-left">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <div className="p-2 bg-lime-400/10 rounded-lg text-lime-400"><Mail className="w-5 h-5"/></div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-white font-bold text-sm">{athleteData.contact?.email}</p>
                                    <p className="text-zinc-400 text-xs">{athleteData.contact?.managerEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <div className="p-2 bg-lime-400/10 rounded-lg text-lime-400"><Phone className="w-5 h-5"/></div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">WhatsApp</p>
                                    <p className="text-white font-bold text-sm">{athleteData.contact?.phoneDisplay}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href={`https://wa.me/${athleteData.contact?.phone?.replace(/\D/g, '')}`} target="_blank" className="bg-[#25D366] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors flex items-center gap-2">
                                <Phone className="w-6 h-6"/> Chamar no WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="py-8 text-center text-zinc-600 text-xs uppercase tracking-widest">
                © 2025 {athleteData.name} Media Kit. All Rights Reserved.
            </footer>
        </div>
    );
}