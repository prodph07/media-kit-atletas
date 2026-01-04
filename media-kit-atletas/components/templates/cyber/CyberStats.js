import React from 'react';
import { BarChart3, Share2, Eye, Instagram, ArrowRight, Youtube, Twitter, Smartphone } from 'lucide-react';

const TikTokIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>);

export default function CyberStats({ athleteData, socialMetrics, totalViews }) {
    return (
        <section id="stats"> 
            <div className="flex items-end justify-between mb-8 border-b border-zinc-800 pb-4"> 
                <h3 className="font-display font-bold text-4xl text-white">IMPACTO <span className="text-lime-400">DIGITAL</span></h3> 
                <p className="text-zinc-500 text-sm text-right hidden sm:block">Analytics em tempo real</p> 
            </div> 
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
                {/* BIG CARD: ALCANCE */}
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

                {/* MINI CARDS */}
                <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors"> 
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Engajamento</p> 
                    <p className="font-display font-bold text-3xl text-white">{socialMetrics.engagement}</p> 
                </div> 
                <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center bg-zinc-900"> 
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Impressões</p> 
                    <p className="font-display font-bold text-3xl text-lime-400">{socialMetrics.impressions}</p> 
                </div> 
                <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors"> 
                    <div className="flex items-center gap-2 mb-2 justify-center"> 
                        <Share2 className="w-4 h-4 text-lime-400"/> 
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Shares</p> 
                    </div> 
                    <p className="font-display font-bold text-3xl text-white">{socialMetrics.shares}</p> 
                </div> 
                <div className="md:col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900 transition-colors border border-zinc-800"> 
                    <div className="flex items-center gap-2 mb-2 justify-center"> 
                        <Eye className="w-4 h-4 text-cyan-400"/> 
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Visitas</p> 
                    </div> 
                    <p className="font-display font-bold text-3xl text-white">{totalViews}</p> 
                </div> 

                {/* DEMOGRAFIA */}
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
                            return ( <> <div className="h-full bg-zinc-800 rounded-l-lg flex items-center justify-center relative transition-all hover:bg-zinc-700" style={{width: `${menVal}%`}}><span className="text-xs font-bold text-white">{menVal}% H</span></div> <div className="h-full bg-lime-900/50 rounded-r-lg flex items-center justify-center relative transition-all hover:bg-lime-900/70" style={{width: `${womenVal}%`}}><span className="text-xs font-bold text-lime-400">{womenVal}% M</span></div> </> ) 
                        })()} 
                    </div> 
                </div> 
                
                {/* SOCIAL LINKS GRID */}
                <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4" id="social"> 
                    {athleteData.socials?.instagram?.active && ( <a href={athleteData.socials.instagram.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-pink-900/40 hover:to-purple-900/40 transition-all border border-zinc-800 hover:border-pink-500"> <div className="flex justify-between mb-4"><Instagram className="w-5 h-5 text-pink-500"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div> <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.instagram.followers}</p><p className="text-[10px] text-zinc-500">Instagram</p></div> </a> )} 
                    {athleteData.socials?.tiktok?.active && ( <a href={athleteData.socials.tiktok.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-cyan-900/40 hover:to-blue-900/40 transition-all border border-zinc-800 hover:border-cyan-400"> <div className="flex justify-between mb-4"><TikTokIcon className="w-5 h-5 text-cyan-400"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div> <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.tiktok.followers}</p><p className="text-[10px] text-zinc-500">TikTok</p></div> </a> )} 
                    {athleteData.socials?.youtube?.active && ( <a href={athleteData.socials.youtube.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-red-900/40 hover:to-orange-900/40 transition-all border border-zinc-800 hover:border-red-600"> <div className="flex justify-between mb-4"><Youtube className="w-5 h-5 text-red-600"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div> <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.youtube.followers}</p><p className="text-[10px] text-zinc-500">YouTube</p></div> </a> )} 
                    {athleteData.socials?.x?.active && ( <a href={athleteData.socials.x.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-zinc-900 transition-all border border-zinc-800 hover:border-white"> <div className="flex justify-between mb-4"><Twitter className="w-5 h-5 text-white"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div> <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.x.followers}</p><p className="text-[10px] text-zinc-500">Twitter / X</p></div> </a> )} 
                    {athleteData.socials?.kwai?.active && ( <a href={athleteData.socials.kwai.url} target="_blank" className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-gradient-to-br hover:from-orange-900/40 hover:to-yellow-900/40 transition-all border border-zinc-800 hover:border-orange-500"> <div className="flex justify-between mb-4"><Smartphone className="w-5 h-5 text-orange-500"/><ArrowRight className="w-4 h-4 text-zinc-600"/></div> <div><p className="font-display font-bold text-xl text-white">{athleteData.socials.kwai.followers}</p><p className="text-[10px] text-zinc-500">Kwai</p></div> </a> )} 
                </div> 
            </div> 
        </section>
    );
}