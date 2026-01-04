import React from 'react';
import Link from 'next/link';
import { GraduationCap, ExternalLink } from 'lucide-react';

export default function TeamSection({ coaches }) {
    if (!coaches || coaches.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-16 animate-fadeIn">
            <h3 className="text-slate-500 font-bold uppercase text-sm mb-4 flex items-center gap-2 px-4 sm:px-0">
                <GraduationCap size={18} className="text-cyan-500"/> Head Coach / Equipe
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-0">
                {coaches.map((coach, idx) => (
                    <Link 
                        key={idx} 
                        href={`/${coach.slug || coach.id}`} 
                        className="flex items-center gap-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl transition-all group"
                    >
                        {/* Foto do Treinador */}
                        <div className="relative">
                            <img 
                                src={coach.foto_url || "https://placehold.co/100"} 
                                alt={coach.nome} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-500 transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-cyan-600 text-white p-1 rounded-full border border-black">
                                <GraduationCap size={10} />
                            </div>
                        </div>

                        {/* Detalhes */}
                        <div>
                            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-0.5">Treinador</p>
                            <h4 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                                {coach.apelido || coach.nome}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                {coach.coach_details?.team || 'Equipe Independente'} <ExternalLink size={10}/>
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}