'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Search, MoreVertical, Check, ExternalLink } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SERVICOS_COMUNS = [
    { id: 'personal', label: 'Personal Fight', desc: 'Aulas particulares 1x1' },
    { id: 'group', label: 'Aulas em Grupo', desc: 'Turmas regulares na academia' },
    { id: 'seminar', label: 'Seminários', desc: 'Disponível para viagens' },
    { id: 'sparring', label: 'Sparring Supervisionado', desc: 'Treino prático de luta' },
    { id: 'corner', label: 'Corner / Eventos', desc: 'Acompanhamento em lutas' }
];

export default function TabTreinador({ perfil, setPerfil, isPremium }) {

    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [meusAlunos, setMeusAlunos] = useState([]);

    const details = perfil.coach_details || {};

    // --- EFEITOS ---
    useEffect(() => {
        fetchStudents();
    }, [perfil.id]);

    // --- FUNÇÕES ---
    const fetchStudents = async () => {
        if (!perfil.id) return;
        const { data, error } = await supabase
            .from('relacoes')
            .select(`
                id, status, initiated_by,
                student:atletas!student_id(id, nome, apelido, foto_url, slug)
            `)
            .eq('coach_id', perfil.id);

        if (!error && data) {
            setMeusAlunos(data);
        }
    };

    const updateCoachDetail = (field, value) => {
        setPerfil(prev => ({ ...prev, coach_details: { ...prev.coach_details, [field]: value } }));
    };

    const toggleService = (serviceId) => {
        const currentServices = details.services || [];
        let newServices;
        if (currentServices.includes(serviceId)) newServices = currentServices.filter(s => s !== serviceId);
        else newServices = [...currentServices, serviceId];
        updateCoachDetail('services', newServices);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm || searchTerm.length < 3) return;
        setIsSearching(true);
        const { data, error } = await supabase
            .from('atletas')
            .select('id, nome, apelido, foto_url, slug')
            .or(`nome.ilike.%${searchTerm}%,apelido.ilike.%${searchTerm}%`)
            .eq('is_athlete', true)
            .neq('id', perfil.id)
            .limit(5);

        if (!error) setSearchResults(data || []);
        setIsSearching(false);
    };

    const sendInvite = async (student) => {
        const studentId = student.id;
        const coachId = perfil.id;
        const activeStudentsCount = meusAlunos.filter(a => a.status === 'accepted' || a.status === 'pending').length;

        if (!isPremium && activeStudentsCount >= 2) {
            alert("🔒 Limite do Plano Grátis Atingido (2 Alunos).\n\nFaça o upgrade para Premium.");
            return;
        }

        const { data: existingReverse } = await supabase
            .from('relacoes')
            .select('*')
            .eq('coach_id', coachId)
            .eq('student_id', studentId)
            .single();

        if (existingReverse) {
            if (existingReverse.status === 'accepted') return alert("Já conectados!");
            if (existingReverse.initiated_by === coachId) return alert("Convite já enviado.");

            await supabase.from('relacoes').update({ status: 'accepted' }).eq('id', existingReverse.id);
            alert(`Vínculo confirmado com ${student.apelido || student.nome}!`);
            fetchStudents();
            setSearchResults([]);
            setSearchTerm('');
            return;
        }

        const { error: insertError } = await supabase
            .from('relacoes')
            .insert({ coach_id: coachId, student_id: studentId, initiated_by: coachId, status: 'pending' });

        if (insertError) alert("Erro: " + insertError.message);
        else {
            alert("Convite enviado!");
            fetchStudents();
            setSearchResults([]);
            setSearchTerm('');
        }
    };

    const removeRelation = async (relationId) => {
        if (!confirm("Remover vínculo?")) return;
        const { error } = await supabase.from('relacoes').delete().eq('id', relationId);
        if (!error) fetchStudents();
    };

    // --- RENDER ---
    return (
        <div className="bg-[#f3f4f6] dark:bg-[#0c0c0c] text-gray-800 dark:text-gray-200 font-body min-h-screen">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .industrial-border {
                    border: 1px solid;
                    border-color: #333333;
                }
                
                .checkbox-wrapper input:checked + div {
                    background-color: #FF4500;
                    border-color: #FF4500;
                    color: white;
                }
                .checkbox-wrapper input:checked + div .text-check-white {
                    color: white !important;
                }
                
                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                }
            `}</style>

            <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                    {/* COLUNA ESQUERDA (4 COL) */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                        {/* CREDENCIAIS */}
                        <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-4 sm:p-6">
                            <h3 className="font-display font-bold uppercase text-lg sm:text-xl text-gray-900 dark:text-white mb-4 sm:mb-6 border-l-4 border-[#FF4500] pl-3">Credenciais</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Graduação</label>
                                    <input
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] text-xs sm:text-sm"
                                        placeholder="Ex: Mestre / Kru"
                                        type="text"
                                        value={details.graduation || ''}
                                        onChange={(e) => updateCoachDetail('graduation', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Tempo (Anos)</label>
                                    <select
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] text-xs sm:text-sm appearance-none"
                                        value={details.experience_years || ''}
                                        onChange={(e) => updateCoachDetail('experience_years', e.target.value)}
                                    >
                                        <option value="">SELECIONE</option>
                                        {[...Array(51)].map((_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? 'ANO' : 'ANOS'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Equipe</label>
                                    <input
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] text-xs sm:text-sm"
                                        placeholder="NOME DA EQUIPE"
                                        type="text"
                                        value={details.team || ''}
                                        onChange={(e) => updateCoachDetail('team', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Linhagem</label>
                                    <input
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] text-xs sm:text-sm"
                                        placeholder="MESTRE ANTERIOR"
                                        type="text"
                                        value={details.lineage || ''}
                                        onChange={(e) => updateCoachDetail('lineage', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SERVIÇOS */}
                        <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-4 sm:p-6">
                            <h3 className="font-display font-bold uppercase text-lg sm:text-xl text-gray-900 dark:text-white mb-4 sm:mb-6 border-l-4 border-[#FF4500] pl-3">Serviços</h3>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {SERVICOS_COMUNS.map(servico => (
                                    <label key={servico.id} className="checkbox-wrapper cursor-pointer group block relative">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={(details.services || []).includes(servico.id)}
                                            onChange={() => toggleService(servico.id)}
                                        />
                                        <div className="bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 p-2 sm:p-2.5 flex items-center justify-between transition-all h-full">
                                            <span className="font-display font-bold uppercase text-gray-900 dark:text-white text-[10px] sm:text-xs text-check-white leading-tight">{servico.label}</span>
                                            <span className="material-symbols-outlined text-white text-xs opacity-0 peer-checked:opacity-100 flex-shrink-0 ml-1">check</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA (8 COL) */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">

                        {/* GERENCIAR ALUNOS */}
                        <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                                <h3 className="font-display font-bold uppercase text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white border-l-4 border-[#FF4500] pl-3">Gerenciar Alunos</h3>
                                {!isPremium && (
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase text-gray-500 dark:text-gray-400 bg-black/20 px-2 py-1 sm:px-3 sm:py-1 rounded border border-white/10">
                                        <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                                        <span>Limite Grátis: {meusAlunos.length}/2</span>
                                    </div>
                                )}
                            </div>

                            {/* SEARCH BAR */}
                            <div className="relative mb-4 sm:mb-6">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="text-gray-500" size={18} />
                                </div>
                                <input
                                    className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 sm:py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] text-xs sm:text-sm transition-colors"
                                    placeholder="BUSCAR NOVO ATLETA..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                />

                                {/* DROPDOWN RESULTADOS */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-[#161616] border border-[#333] z-50 mt-1 max-h-60 overflow-y-auto shadow-2xl">
                                        {searchResults.map(atleta => (
                                            <div key={atleta.id} className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-[#333]">
                                                <div className="flex items-center gap-3">
                                                    <img src={atleta.foto_url || "https://placehold.co/100"} className="w-10 h-10 object-cover bg-gray-800" />
                                                    <span className="font-display font-bold uppercase text-white">{atleta.apelido || atleta.nome}</span>
                                                </div>
                                                <button
                                                    onClick={() => sendInvite(atleta)}
                                                    className="bg-[#FF4500] text-white text-xs font-bold uppercase px-3 py-1 hover:bg-orange-600 transition"
                                                >
                                                    Convidar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* STUDENT LIST */}
                            <div className="space-y-2 sm:space-y-3 min-h-[100px]">
                                {meusAlunos.length === 0 ? (
                                    <p className="text-gray-500 text-xs sm:text-sm italic text-center py-6 sm:py-8">Nenhum aluno vinculado.</p>
                                ) : (
                                    meusAlunos.map(rel => (
                                        <div key={rel.id} className="bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 p-2 sm:p-3 flex flex-row items-center gap-3 sm:gap-4 hover:border-[#FF4500] transition-colors cursor-pointer group relative">
                                            {/* Avatar Box */}
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-300 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-600">
                                                {rel.student?.foto_url ? (
                                                    <img src={rel.student.foto_url} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-bold text-gray-500 text-xs">{(rel.student?.nome || 'A').charAt(0)}</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 text-left">
                                                <h4 className="font-display font-bold uppercase text-gray-900 dark:text-white text-sm sm:text-lg leading-tight">
                                                    {rel.student?.apelido || rel.student?.nome}
                                                </h4>
                                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Aluno</p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center">
                                                {rel.status === 'pending' ? (
                                                    <span className="bg-[#FFD700] text-black text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 sm:px-3 sm:py-1 border border-yellow-600 shadow-sm whitespace-nowrap">
                                                        Pendente
                                                    </span>
                                                ) : (
                                                    <span className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 sm:px-3 sm:py-1 shadow-sm whitespace-nowrap">
                                                        Ativo
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1 sm:gap-2">
                                                {rel.status !== 'pending' && (
                                                    <a href={`/${rel.student?.slug}`} target="_blank" className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white" title="Ver Perfil">
                                                        <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                                                    </a>
                                                )}
                                                <button onClick={() => removeRelation(rel.id)} className="p-1.5 sm:p-2 hover:bg-red-900/20 rounded-full transition-colors text-gray-400 hover:text-red-500" title="Remover">
                                                    <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                                                    {/* Using MoreVertical as a placeholder for 'Actions' menu, but triggering delete directly for now or could implement dropdown if complex */}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* METODOLOGIA */}
                        <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-4 sm:p-6 lg:p-8">
                            <h3 className="font-display font-bold uppercase text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-4 sm:mb-6 border-l-4 border-[#FF4500] pl-3">Metodologia</h3>
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Especialidades</label>
                                    <textarea
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] resize-none"
                                        placeholder="EX: CLINCH, COTOVELADAS, PREPARAÇÃO FÍSICA..."
                                        rows="2"
                                        value={details.specialties || ''}
                                        onChange={(e) => updateCoachDetail('specialties', e.target.value)}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 sm:mb-2">Sobre</label>
                                    <textarea
                                        className="w-full bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] resize-none h-32 sm:h-40"
                                        placeholder="Descreva sua filosofia de ensino, experiência..."
                                        rows="6"
                                        value={details.methodology || ''}
                                        onChange={(e) => updateCoachDetail('methodology', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}