'use client';

import React, { useState, useMemo } from 'react';

// --- ÍCONES (Mantidos originais) ---
const Icon = ({ path, className, size = 24, fill = "none", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={fill === "none" ? "2" : "0"} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        {path}
    </svg>
);

const Trophy = (props) => <Icon {...props} path={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>} />;
const Target = (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>} />;
const Activity = (props) => <Icon {...props} path={<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>} />;
const Mail = (props) => <Icon {...props} path={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>} />;
const Phone = (props) => <Icon {...props} path={<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>} />;
const Share2 = (props) => <Icon {...props} path={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></>} />;
const Download = (props) => <Icon {...props} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>} />;
const MapPin = (props) => <Icon {...props} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
const Dumbbell = (props) => <Icon {...props} path={<><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></>} />;
const Play = (props) => <Icon {...props} fill="currentColor" path={<><polygon points="5 3 19 12 5 21 5 3"/></>} />;
const Star = (props) => <Icon {...props} fill="currentColor" path={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>} />;
const MessageCircle = (props) => <Icon {...props} path={<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>} />;
const XIcon = (props) => <Icon {...props} path={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />;
const Instagram = (props) => <Icon {...props} path={<><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></>} />;
const Youtube = (props) => <Icon {...props} path={<><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></>} />;
const TwitterX = (props) => <Icon {...props} fill="currentColor" path={<><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></>} />;
const TikTok = (props) => <Icon {...props} fill="currentColor" path={<><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></>} />;
const Kwai = (props) => <Icon {...props} fill="currentColor" path={<><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M8.5,16.5l-1-1l3-3l-3-3l1-1l4,4L8.5,16.5z"/></>} />;

// --- SUB-COMPONENTES ---
const formatName = (name, nickname) => {
    if (!name) return { main: '', alias: '' };
    const mainName = nickname ? name.replace(new RegExp(`['"]?${nickname}['"]?`, 'i'), '').trim() : name;
    return {
        main: mainName,
        alias: nickname ? `'${nickname}'` : '',
    };
};

const StatCircle = ({ value, label, color = "text-cyan-400", subLabel }) => {
    const numericValue = parseInt(value) || 0;
    const displayValue = isNaN(numericValue) ? "0%" : `${numericValue}%`;
    const dashOffset = 351 - (351 * numericValue) / 100;

    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                    <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={351} strokeDashoffset={isNaN(numericValue) ? 351 : dashOffset} strokeLinecap="round" className={`${color} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`text-2xl sm:text-3xl font-bold ${color}`}>{displayValue}</span>
                </div>
            </div>
            <span className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
            {subLabel && <span className="text-[10px] sm:text-xs text-slate-500">{subLabel}</span>}
        </div>
    );
};

const StatCard = ({ icon: Icon, value, label, highlight = false }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 sm:p-6 border ${highlight ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 bg-slate-900/50'} backdrop-blur-sm group hover:border-cyan-400/50 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${highlight ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'} transition-colors`} />
        {highlight && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-1">{value || 0}</div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</div>
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent"></div>
    </div>
);

const FightRow = ({ result, event, date }) => {
    const isWin = result === 'W';
    const isDraw = result === 'D';
    
    let badgeClass = 'bg-red-500/20 text-red-400 border-red-500/30';
    let resultText = 'DERROTA';
    
    if (isWin) {
        badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30';
        resultText = 'VITÓRIA';
    } else if (isDraw) {
        badgeClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        resultText = 'EMPATE';
    }

    return (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black text-base sm:text-lg border ${badgeClass}`}>
                   {result}
                </div>
                <div>
                    <h4 className="font-bold text-white text-base sm:text-lg">{event}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">{date}</p>
                </div>
            </div>
            <div className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full uppercase ${isWin ? 'text-green-500 bg-green-900/20' : 'text-slate-500 bg-slate-800'}`}>
                {resultText}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export function TemplatePadrao({ data }) {
    const athleteData = data;
    
    // Fallback de segurança
    if (!athleteData) return <div className="text-white p-10 text-center">Carregando perfil...</div>;

    const [selectedMedia, setSelectedMedia] = useState(null); 
    const formattedName = formatName(athleteData.name, athleteData.nickname);

    // Cálculos Automáticos
    const computedStats = useMemo(() => {
        const w = parseInt(athleteData.record?.wins) || 0;
        const l = parseInt(athleteData.record?.losses) || 0;
        const d = parseInt(athleteData.record?.draws) || 0;
        const k = parseInt(athleteData.record?.knockouts) || 0;
        
        const total = w + l + d;
        const winRate = total > 0 ? Math.round((w / total) * 100) : 0;
        const koRate = w > 0 ? Math.round((k / w) * 100) : 0; 

        return { total, winRate, koRate };
    }, [athleteData]);

    const copyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            alert("Link do perfil copiado para a área de transferência!");
        }
    };

    const getWhatsAppLink = () => {
        const phoneOnlyNumbers = (athleteData.contact?.phone || '').replace(/\D/g, '');
        return `https://wa.me/${phoneOnlyNumbers}?text=Olá,%20vi%20seu%20Media%20Kit%20e%20gostaria%20de%20falar%20sobre%20patrocínio.`;
    };

    const openMedia = (type, src) => {
        setSelectedMedia({ type, src });
    };

    const closeMedia = () => {
        setSelectedMedia(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
             {/* INJETANDO O ESTILO GLOBALMENTE */}
             <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0c; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
            `}</style>
            
            {/* MODAL / POP-UP */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fadeIn backdrop-blur-sm"
                    onClick={closeMedia}
                >
                    <div className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={closeMedia}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                            <XIcon size={24} />
                        </button>
                        
                        {selectedMedia.type === 'video' ? (
                            <div className="aspect-video w-full">
                                <iframe 
                                    className="w-full h-full"
                                    src={selectedMedia.src} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="w-full h-auto max-h-[85vh] flex items-center justify-center bg-black">
                                <img 
                                    src={selectedMedia.src} 
                                    alt="Full size media" 
                                    className="max-w-full max-h-[85vh] object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Efeitos de Fundo */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-cyan-600/10 rounded-full blur-[80px] sm:blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-red-600/10 rounded-full blur-[80px] sm:blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0c]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center font-bold text-black italic">A</div>
                        <span className="font-bold text-lg sm:text-xl tracking-tighter text-white">ATHLETE<span className="text-cyan-500">.PRO</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={copyLink} className="p-2 text-slate-400 hover:text-white transition-colors" title="Compartilhar">
                            <Share2 size={20} />
                        </button>
                        <a href="#contact-section" className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400 transition-colors">
                            <Mail size={16} /> Contato
                        </a>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-16">
                
                {/* HERO SECTION */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
                        <div className="relative group w-full max-w-sm lg:max-w-md mx-auto lg:mx-0 aspect-[4/5] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                            <img 
                                src={athleteData.foto_url || "https://placehold.co/600x800/1e293b/FFF?text=FOTO+DO+ATLETA"} 
                                alt="Foto do Atleta" 
                                className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
                            {athleteData.nextFight && athleteData.nextFight.date && (
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded mb-2">
                                        Próxima Luta
                                    </div>
                                    <div className="text-white text-sm font-medium mb-1 drop-shadow-md">
                                        {athleteData.nextFight.date} • {athleteData.nextFight.location}
                                    </div>
                                    <div className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                                        vs. {athleteData.nextFight.opponent}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                            {athleteData.category && (
                                <span className="px-3 py-1 border border-cyan-500/30 text-cyan-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-cyan-500/5">
                                    {athleteData.category}
                                </span>
                            )}
                            {athleteData.fightingStyle && (
                                <span className="px-3 py-1 border border-slate-700 text-slate-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                    {athleteData.fightingStyle}
                                </span>
                            )}
                        </div>
                        
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2 leading-none">
                            {formattedName.main}
                            {formattedName.alias && (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 block text-3xl sm:text-5xl lg:text-6xl mt-2">
                                    {formattedName.alias}
                                </span>
                            )}
                        </h1>

                        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
                            {athleteData.about}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            <StatCard icon={Trophy} value={athleteData.record?.wins} label="Vitórias" highlight={true} />
                            <StatCard icon={Activity} value={athleteData.record?.knockouts} label="K.O.s" />
                            <StatCard icon={Target} value={athleteData.record?.submissions} label="Finalizações" />
                            <StatCard icon={Dumbbell} value={computedStats.total} label="Lutas" />
                        </div>

                        {/* CARTÕES REDES SOCIAIS (Grid Layout) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                            {athleteData.socials?.instagram?.active && (
                                <a href={athleteData.socials.instagram.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-pink-500 hover:bg-slate-900 transition-all group">
                                    <div className="mb-2 text-slate-400 group-hover:text-pink-500 transition-colors"><Instagram size={24} /></div>
                                    <span className="text-xs font-bold text-white mb-1 truncate w-full text-center">{athleteData.socials.instagram.user}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{athleteData.socials.instagram.followers} Segs</span>
                                </a>
                            )}
                            {athleteData.socials?.youtube?.active && (
                                <a href={athleteData.socials.youtube.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-red-600 hover:bg-slate-900 transition-all group">
                                    <div className="mb-2 text-slate-400 group-hover:text-red-600 transition-colors"><Youtube size={24} /></div>
                                    <span className="text-xs font-bold text-white mb-1 truncate w-full text-center">{athleteData.socials.youtube.user}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{athleteData.socials.youtube.followers} Insc</span>
                                </a>
                            )}
                            {athleteData.socials?.tiktok?.active && (
                                <a href={athleteData.socials.tiktok.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-400 hover:bg-slate-900 transition-all group">
                                    <div className="mb-2 text-slate-400 group-hover:text-cyan-400 transition-colors"><TikTok size={24} /></div>
                                    <span className="text-xs font-bold text-white mb-1 truncate w-full text-center">{athleteData.socials.tiktok.user}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{athleteData.socials.tiktok.followers} Segs</span>
                                </a>
                            )}
                            {athleteData.socials?.twitter?.active && (
                                <a href={athleteData.socials.twitter.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-white hover:bg-slate-900 transition-all group">
                                    <div className="mb-2 text-slate-400 group-hover:text-white transition-colors"><TwitterX size={24} /></div>
                                    <span className="text-xs font-bold text-white mb-1 truncate w-full text-center">{athleteData.socials.twitter.user}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{athleteData.socials.twitter.followers} Segs</span>
                                </a>
                            )}
                            {athleteData.socials?.kwai?.active && (
                                <a href={athleteData.socials.kwai.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-orange-500 hover:bg-slate-900 transition-all group">
                                    <div className="mb-2 text-slate-400 group-hover:text-orange-500 transition-colors"><Kwai size={24} /></div>
                                    <span className="text-xs font-bold text-white mb-1 truncate w-full text-center">{athleteData.socials.kwai.user}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{athleteData.socials.kwai.followers} Segs</span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* MENU DE NAVEGAÇÃO INTERNA */}
                <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-800 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <a href="#stats-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-cyan-400 hover:text-white transition-colors whitespace-nowrap">
                        Estatísticas & Prêmios
                    </a>
                    <a href="#media-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-slate-500 hover:text-white transition-colors whitespace-nowrap">
                        Galeria & Vídeos
                    </a>
                    <a href="#contact-section" className="text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 text-slate-500 hover:text-white transition-colors whitespace-nowrap">
                        Contato & Patrocínio
                    </a>
                </div>
                
                {/* SEÇÃO 1: ESTATÍSTICAS E PRÊMIOS */}
                <section id="stats-section" className="animate-fadeIn scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Estatísticas e <span className="text-cyan-400">Prêmios</span></h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <div className="flex flex-col gap-6 sm:gap-8">
                            {/* ATRIBUTOS FÍSICOS */}
                            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Activity className="text-cyan-400" size={24} /> Atributos Físicos
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4">
                                    <div><div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mb-1">Altura</div><div className="text-2xl sm:text-3xl font-mono text-white">{athleteData.stats?.height}</div></div>
                                    <div><div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mb-1">Peso</div><div className="text-2xl sm:text-3xl font-mono text-white">{athleteData.stats?.weight}</div></div>
                                    <div><div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mb-1">Envergadura</div><div className="text-2xl sm:text-3xl font-mono text-white">{athleteData.stats?.reach}</div></div>
                                    <div><div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mb-1">Idade</div><div className="text-2xl sm:text-3xl font-mono text-white">{athleteData.stats?.age}</div></div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-800">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-400 mb-4 uppercase">Desempenho (Calculado)</h4>
                                    <div className="flex justify-around">
                                        <StatCircle value={computedStats.winRate} label="Vitórias" subLabel="Win Rate" />
                                        <StatCircle value={computedStats.koRate} label="Nocautes" subLabel="% das Vitórias" color="text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* PREMIOS */}
                            {athleteData.awards && athleteData.awards.length > 0 && (
                                <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 sm:p-8">
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Trophy className="text-yellow-500" size={24} /> Prêmios e Cinturões
                                    </h3>
                                    <ul className="space-y-4">
                                        {athleteData.awards.map((award, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm sm:text-base">
                                                <Star className="text-yellow-500" size={20} />
                                                <span className="font-medium">{award}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* HISTÓRICO */}
                        <div className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden h-fit">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-lg sm:text-xl font-bold text-white">Histórico de Lutas</h3>
                                <span className="text-xs text-cyan-400 font-bold uppercase cursor-pointer hover:underline">Ver Completo</span>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                {athleteData.fightHistory?.map((fight, index) => (
                                    <FightRow key={index} {...fight} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 2: GALERIA E MÍDIA */}
                <section id="media-section" className="animate-fadeIn scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Galeria e <span className="text-cyan-400">Vídeos</span></h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>
                    
                    {/* VÍDEOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {athleteData.videos?.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => openMedia('video', item.embedUrl)}
                            className="group relative aspect-video bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-400/50 transition-all"
                        >
                            <img src={item.thumb} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/80 text-black flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                    <Play fill="currentColor" size={20} />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                <p className="text-white font-bold text-sm truncate">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.date}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    {/* FOTOS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {athleteData.gallery?.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => openMedia('image', item.full)}
                            className="aspect-square bg-slate-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer border border-slate-800 hover:border-cyan-400/30"
                        >
                            <img src={item.thumb} alt={`Galeria ${item.id}`} className="w-full h-full object-cover" />
                        </div>
                        ))}
                    </div>
                </section>

                {/* SEÇÃO 3: CONTATO E PATROCÍNIO */}
                <section id="contact-section" className="animate-fadeIn scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Contato e <span className="text-cyan-400">Patrocínio</span></h2>
                        <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <p className="text-slate-400 mb-8">
                                Disponível para lutas, seminários, patrocínios e parcerias de marca. Entre em contato com minha equipe de gestão ou diretamente pelo WhatsApp.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Email Comercial</h4>
                                        <p className="text-slate-400 text-sm break-all">{athleteData.contact?.email}</p>
                                        <p className="text-slate-400 text-sm break-all">{athleteData.contact?.managerEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Telefone / WhatsApp</h4>
                                        <p className="text-slate-400 text-sm">{athleteData.contact?.phoneDisplay || athleteData.contact?.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Base de Treinamento</h4>
                                        <p className="text-slate-400 text-sm">{athleteData.contact?.city}, Brasil</p>
                                        <p className="text-slate-400 text-sm">{athleteData.contact?.trainingCenter}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 justify-center">
                            {/* CARD DE AÇÃO RÁPIDA (WHATSAPP) */}
                            <div className="bg-gradient-to-br from-[#1a1a1e] to-[#0f0f11] p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Parcerias Rápidas</h3>
                                <p className="text-slate-400 text-sm mb-6">Tem uma proposta? Fale diretamente com nossa equipe agora.</p>
                                
                                <a 
                                    href={getWhatsAppLink()} 
                                    target="_blank"
                                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-black py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4 transform hover:scale-105"
                                >
                                    <MessageCircle size={24} /> Chamar no WhatsApp
                                </a>

                                <div className="w-full h-px bg-slate-800 my-4"></div>

                                <div className="flex items-center justify-between w-full">
                                    <div className="text-left">
                                        <h4 className="text-white font-bold text-sm">Media Kit 2025</h4>
                                        <p className="text-slate-500 text-xs">PDF, 4.2 MB</p>
                                    </div>
                                    <button className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-sm font-bold uppercase">
                                        <Download size={16} /> Baixar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-900 bg-[#050506] py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-sm">
                    <p>© 2025 {formattedName.main}. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Press</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}