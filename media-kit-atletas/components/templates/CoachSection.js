import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, CheckCircle, BookOpen, Star, ExternalLink, Shield } from 'lucide-react';

const SERVICE_LABELS = {
    'personal': 'Personal Fight',
    'group': 'Aulas em Grupo',
    'online': 'Consultoria Online',
    'seminar': 'Seminários',
    'corner': 'Corner / Eventos'
};

export default function CoachSection({ coachDetails, studentsList, theme = 'default' }) {
    if (!coachDetails) return null;

    const { graduation, team, lineage, experience_years, services, specialties, methodology } = coachDetails;
    const isCyber = theme === 'cyber';

    const accentColor = isCyber ? 'text-lime-400' : 'text-orange-500';
    const borderColor = isCyber ? 'border-lime-500/30' : 'border-orange-500/30';
    const bgCard = isCyber ? 'bg-zinc-900/80' : 'bg-slate-900/80';
    const studentBg = isCyber ? 'bg-zinc-900 border-lime-500/20' : 'bg-black/40 border-slate-800';

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-6 animate-fadeIn">
            
            {/* CABEÇALHO */}
            <div className={`relative p-6 rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden`}>
                <div className={`absolute top-0 right-0 p-3 opacity-10 ${accentColor}`}><GraduationCap size={120} /></div>
                <h2 className={`text-2xl font-bold uppercase mb-6 flex items-center gap-2 ${accentColor}`}><GraduationCap /> Perfil do Treinador</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Graduação</span><span className="text-xl text-white font-bold">{graduation || 'Não informada'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Equipe / Bandeira</span><span className="text-xl text-white font-bold flex items-center gap-2"><Users size={18} className="text-slate-400"/> {team || 'Sem equipe'}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Experiência</span><span className="text-xl text-white font-bold">{experience_years ? `${experience_years} Anos` : '-'}</span></div>
                </div>
                {lineage && ( <div className="mt-6 pt-6 border-t border-slate-700/50"><span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">Linhagem</span><p className="text-sm text-slate-300 font-mono italic">"{lineage}"</p></div> )}
            </div>

            {/* --- LISTA DE ALUNOS (AGORA VEM DO BANCO DE DADOS) --- */}
            {studentsList && studentsList.length > 0 && (
                <div className={`p-6 rounded-2xl border border-slate-800 ${bgCard}`}>
                    <h3 className={`font-bold uppercase text-sm mb-4 flex items-center gap-2 ${accentColor}`}>
                        <Users size={16}/> Time / Alunos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {studentsList.map((student, idx) => (
                            <Link key={idx} href={`/${student.slug || student.id}`} target="_blank" className={`flex items-center gap-3 p-3 rounded-lg border hover:border-slate-500 transition-all group ${studentBg}`}>
                                <img src={student.foto_url || "https://placehold.co/100"} alt={student.nome} className="w-12 h-12 rounded-full object-cover border border-slate-700 group-hover:scale-105 transition-transform"/>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-white text-sm truncate group-hover:text-cyan-400 transition-colors">{student.apelido || student.nome}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                        {student.cartel ? (
                                            <span className="flex items-center gap-1"><Shield size={8}/> {student.cartel.wins}-{student.cartel.losses}</span>
                                        ) : (
                                            <span>Atleta</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* SERVIÇOS E METODOLOGIA */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl border border-slate-800 ${bgCard}`}>
                    <h3 className={`font-bold uppercase text-sm mb-4 flex items-center gap-2 ${accentColor}`}><Star size={16}/> Serviços</h3>
                    <ul className="space-y-3">{(services || []).map(svcId => ( <li key={svcId} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle size={16} className={isCyber ? "text-lime-500" : "text-green-500"} />{SERVICE_LABELS[svcId] || svcId}</li> ))}</ul>
                </div>
                <div className={`p-6 rounded-2xl border border-slate-800 ${bgCard}`}>
                    <h3 className={`font-bold uppercase text-sm mb-4 flex items-center gap-2 ${accentColor}`}><BookOpen size={16}/> Metodologia</h3>
                    {specialties && (<div className="flex flex-wrap gap-2 mb-4">{specialties.split(',').map((tag, i) => ( <span key={i} className={`text-[10px] px-2 py-1 rounded border ${isCyber ? 'bg-lime-900/20 border-lime-500/30 text-lime-300' : 'bg-orange-900/20 border-orange-500/30 text-orange-300'}`}>{tag.trim()}</span> ))}</div>)}
                    <p className="text-sm text-slate-400 leading-relaxed">{methodology || "Entre em contato para saber mais sobre as aulas."}</p>
                </div>
            </div>
        </div>
    );
}