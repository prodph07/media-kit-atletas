import React from 'react';
import { Trophy } from 'lucide-react';

export default function CyberBio({ athleteData, winPercentage }) {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"> 
            {/* BIO ESQUERDA */}
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
            
            {/* HISTÓRICO DIREITA */}
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
    );
}