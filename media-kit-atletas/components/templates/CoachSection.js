import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, CheckCircle, BookOpen, Star, ExternalLink, Shield, School, Award, Clock } from 'lucide-react';

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

    return (
        <section className="space-y-8 py-12 border-t border-[#333333] animate-fadeIn" id="coach">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .industrial-border { border: 1px solid #333333; }
                .skew-tag { transform: skew(-12deg); }
                .skew-tag-content { transform: skew(12deg); }
            `}</style>

            {/* HEADER */}
            <div>
                <h2 className="font-display font-bold text-5xl md:text-7xl text-white uppercase tracking-tighter leading-none">
                    Head Coach <br className="md:hidden" />Profile
                </h2>
                <div className="h-2 w-24 md:w-40 bg-[#FF4500] mt-2 skew-tag"></div>
            </div>

            {/* PROFILE CARD */}
            <div className="relative bg-[#1E1E1E] industrial-border p-8 md:p-12 overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none select-none text-white">
                    <School size={320} strokeWidth={0.5} />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

                    {/* Column 1: Graduation */}
                    <div className="space-y-2 border-l-4 border-[#FF4500] pl-4">
                        <div className="flex items-center gap-2 text-[#FF4500]">
                            <Award size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Graduation</span>
                        </div>
                        <div className="font-display font-bold text-3xl md:text-4xl text-white uppercase">
                            {graduation || 'Kru Patente'}
                        </div>
                        <div className="text-sm text-gray-400 font-mono italic">
                            {lineage ? `"${lineage}"` : 'Certificado'}
                        </div>
                    </div>

                    {/* Column 2: Team */}
                    <div className="space-y-2 border-l-4 border-gray-700 pl-4 md:border-none md:pl-0">
                        <div className="flex items-center gap-2 text-[#FF4500]">
                            <Users size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Team</span>
                        </div>
                        <div className="font-display font-bold text-3xl md:text-4xl text-white uppercase">
                            {team || 'No Team'}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">Head Coach</div>
                    </div>

                    {/* Column 3: Experience */}
                    <div className="space-y-2 border-l-4 border-gray-700 pl-4 md:border-none md:pl-0">
                        <div className="flex items-center gap-2 text-[#FF4500]">
                            <Clock size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Experience</span>
                        </div>
                        <div className="font-display font-bold text-3xl md:text-4xl text-white uppercase">
                            {experience_years ? `${experience_years} Years` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">Training Fighters</div>
                    </div>

                </div>
            </div>

            {/* STUDENTS GRID */}
            <div className="space-y-6">
                <h3 className="font-display font-bold text-2xl text-white uppercase flex items-center gap-3">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Time / Alunos
                </h3>

                {studentsList && studentsList.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {studentsList.map((student, idx) => (
                            <Link key={idx} href={`/${student.slug || student.id}`} className="block">
                                <div className="bg-[#121212] border border-[#333333] p-4 flex flex-col items-center text-center group hover:border-cyan-500/50 transition-colors cursor-pointer relative overflow-hidden h-full">
                                    {/* Record Badge */}
                                    {student.cartel && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <span className="text-[10px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded border border-gray-700">
                                                {student.cartel.wins}-{student.cartel.losses}
                                            </span>
                                        </div>
                                    )}

                                    {/* Avatar */}
                                    <div className="w-20 h-20 rounded-full bg-gray-800 mb-3 overflow-hidden border-2 border-gray-700 group-hover:border-cyan-500 transition-colors">
                                        <img
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                            src={student.foto_url || "https://placehold.co/100"}
                                            alt={student.nome}
                                        />
                                    </div>

                                    {/* Name & Info */}
                                    <div className="font-display font-bold text-lg text-white uppercase group-hover:text-cyan-400 transition-colors truncate w-full">
                                        {student.apelido || student.nome}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                        Atleta
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm italic">Nenhum aluno cadastrado.</div>
                )}
            </div>

            {/* SERVICES & METHODOLOGY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                {/* Services */}
                <div className="bg-[#1E1E1E] industrial-border p-6 md:p-8 flex flex-col">
                    <h3 className="font-display font-bold text-xl text-white uppercase mb-6 border-b border-[#333333] pb-4">
                        Serviços
                    </h3>
                    <ul className="space-y-4 flex-1">
                        {(services || []).map((svcId, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <CheckCircle className="text-green-500 shrink-0" size={20} />
                                <div>
                                    <span className="block text-white font-bold uppercase tracking-wide">
                                        {SERVICE_LABELS[svcId] || svcId}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Methodology */}
                <div className="bg-[#1E1E1E] industrial-border p-6 md:p-8 flex flex-col">
                    <h3 className="font-display font-bold text-xl text-white uppercase mb-6 border-b border-[#333333] pb-4">
                        Metodologia
                    </h3>

                    {/* Specialties Tags */}
                    {specialties && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {specialties.split(',').map((tag, i) => (
                                <span key={i} className="px-3 py-1 border border-[#FF4500]/50 text-[#FF4500] text-xs font-bold uppercase rounded-full bg-[#FF4500]/5">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-gray-400 text-sm leading-relaxed font-light">
                        {methodology || "Entre em contato para saber mais sobre as aulas."}
                    </p>
                </div>

            </div>

        </section>
    );
}