import React from 'react';
import { MapPin, Trophy, Users, Briefcase, ExternalLink, Mail, ArrowRight, Instagram } from 'lucide-react';
import { AvatarLevel } from './AvatarLevel';
import { ApplyJobButton } from './ApplyJobButton';

export function TemplateEmpresa({ data }) {
    const {
        name, nickname, foto_url, about,
        contact = {}, socials = {},
        myTeam = [], // Active partnerships
        opportunities = [] // Active jobs
    } = data;



    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans pb-20">
            {/* HERO SECTION */}
            <div className="relative bg-gradient-to-b from-slate-900 to-[#0a0a0c] pt-20 pb-12 border-b border-slate-800">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 right-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Logo/Avatar */}
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-black border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center shrink-0">
                        {foto_url ? (
                            <img src={foto_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-slate-700">{(name || 'E').charAt(0)}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <div className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3">
                            Perfil Oficial de Empresa
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{nickname || name}</h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto md:mx-0">{about || "Empresa focada em apoiar o esporte e revelar novos talentos."}</p>

                        {/* Stats / Badges */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
                                <Users size={18} className="text-blue-500" />
                                <span className="font-bold text-white">{myTeam?.length || 0}</span>
                                <span className="text-slate-500 text-sm">No Time</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
                                <Briefcase size={18} className="text-green-500" />
                                <span className="font-bold text-white">{opportunities?.length || 0}</span>
                                <span className="text-slate-500 text-sm">Vagas Abertas</span>
                            </div>
                        </div>

                        {/* Social / Contact */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                            {contact.city && (
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <MapPin size={16} /> {contact.city}
                                </div>
                            )}
                            {socials.instagram?.url && (
                                <a href={socials.instagram.url} target="_blank" className="bg-[#1a1a1c] hover:bg-slate-800 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition">
                                    <Instagram size={16} className="text-pink-500" /> Instagram
                                </a>
                            )}
                            {socials.website && (
                                <a href={socials.website} target="_blank" className="bg-[#1a1a1c] hover:bg-slate-800 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition">
                                    <ExternalLink size={16} className="text-blue-500" /> Website
                                </a>
                            )}
                            <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold uppercase text-sm transition shadow-lg shadow-purple-900/20">
                                Entrar em Contato
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* LEFT COL: OPPORTUNITIES (2/3) */}
                <div className="lg:col-span-2 space-y-12">
                    {/* SECTION: OPPORTUNITIES */}
                    <section>
                        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3 mb-8">
                            <Briefcase className="text-green-500" /> Oportunidades & Vagas
                        </h2>

                        {(!opportunities || opportunities.length === 0) ? (
                            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-10 text-center">
                                <p className="text-slate-500">Nenhuma oportunidade aberta no momento.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {opportunities.map(job => (
                                    <div key={job.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-green-500/30 transition group flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition">{job.titulo}</h3>
                                                <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded uppercase">{job.tipo || 'Patrocínio'}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{job.descricao}</p>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {job.localizacao || 'Remoto/Brasil'}</span>
                                                <span className="flex items-center gap-1 text-green-400"><span className="text-slate-600">Valor:</span> {job.orcamento || 'A combinar'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <ApplyJobButton jobId={job.id} jobTitle={job.titulo} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COL: TEAM (1/3) */}
                <div className="space-y-12">
                    {/* SECTION: OUR TEAM */}
                    <section>
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3 mb-6">
                            <Users className="text-blue-500" /> Nosso Time
                        </h2>

                        {(!myTeam || myTeam.length === 0) ? (
                            <p className="text-slate-500 text-sm">Ainda não há atletas listados publicamente.</p>
                        ) : (
                            <div className="grid gap-3">
                                {myTeam.map(member => (
                                    <a key={member.id} href={`/${member.slug || member.id}`} target="_blank" className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-blue-500/50 transition group">
                                        <AvatarLevel foto={member.foto_url} level={member.level} size="small" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition">{member.apelido || member.nome}</h4>
                                            <p className="text-xs text-slate-500 uppercase font-bold">{member.categoria || 'Atleta'}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-600 group-hover:text-white transition" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SECTION: CONTACT CARD */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-500/20 p-6 rounded-2xl">
                        <h3 className="font-bold text-white text-lg mb-2">Quer falar conosco?</h3>
                        <p className="text-slate-400 text-sm mb-6">Entre em contato para parcerias, imprensa ou dúvidas gerais.</p>
                        <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-bold uppercase transition flex items-center justify-center gap-2">
                            <Mail size={18} /> Enviar Mensagem
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
