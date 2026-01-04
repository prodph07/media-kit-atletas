import React from 'react';
import { AvatarLevel } from '../../AvatarLevel'; // Importando o sistema de níveis

export default function CyberHero({ athleteData, names }) {
    const wins = parseInt(athleteData.record?.wins) || 0; 
    const k = parseInt(athleteData.record?.knockouts) || 0;
    const s = parseInt(athleteData.record?.submissions) || 0;

    return (
        <>
            <header className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden"> 
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none"></div> 
                
                {/* Texto Gigante de Fundo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0"> 
                    <h1 className="font-display font-black text-[15vw] sm:text-[14vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-transparent opacity-50 uppercase whitespace-nowrap"> 
                        {names.alias || names.main} 
                    </h1> 
                </div> 

                {/* Container da Foto Principal */}
                <div className="relative z-10 w-full max-w-lg mx-auto aspect-[3/4] sm:aspect-square flex items-end justify-center"> 
                    
                    {/* --- NOVO: SISTEMA DE NÍVEL (HUD) --- */}
                    {/* Posicionado como um satélite flutuante */}
                    <div className="absolute top-0 left-0 sm:-left-12 z-50 animate-fadeIn">
                        <div className="glass-panel p-4 rounded-full border border-lime-400/30 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                            <AvatarLevel 
                                foto={athleteData.foto_url} 
                                level={athleteData.level} 
                                size="large" // Vai usar a moldura grande
                            />
                        </div>
                    </div>

                    {/* Foto Recortada (Hero Mask) */}
                    <img 
                        src={athleteData.foto_url || "https://placehold.co/600x800/18181b/FFF?text=FOTO"} 
                        alt="Atleta" 
                        className="h-full object-contain hero-mask drop-shadow-2xl" 
                    /> 

                    {/* Card Próxima Luta */}
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

                {/* Nome e Tags */}
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

            {/* Faixa Amarela (Ticker) */}
            <div className="w-full bg-lime-400 text-black overflow-hidden py-3 mb-20 relative z-20 transform -skew-y-1"> 
                <div className="flex justify-around items-center font-display font-black text-xl sm:text-3xl uppercase tracking-tighter"> 
                    <span>{wins} Vitórias</span> <span className="opacity-30">/</span> 
                    <span>{k} KOs</span> <span className="opacity-30">/</span> 
                    <span>{s} Subs</span> <span className="opacity-30">/</span> 
                    <span>{athleteData.stats?.height || '-'}</span> 
                </div> 
            </div>
        </>
    );
}