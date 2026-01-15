import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, DollarSign, Calendar, MapPin, Trash2, Loader2, ChevronDown, ChevronUp, Instagram, MessageCircle, Twitter, Youtube } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const RANKS = [
    'Ferro 1', 'Ferro 2', 'Ferro 3',
    'Bronze 1', 'Bronze 2', 'Bronze 3',
    'Prata 1', 'Prata 2', 'Prata 3',
    'Ouro 1', 'Ouro 2', 'Ouro 3',
    'Platina 1', 'Platina 2', 'Platina 3',
    'Diamante 1', 'Diamante 2', 'Diamante 3',
    'Lenda'
];

const getRankValue = (rank) => {
    if (!rank) return -1;
    return RANKS.indexOf(rank);
};

// Mapeamento de Nível para Rank (Lógica espelhada do gamification.js mas em PT-BR)
const getRankFromLevel = (level) => {
    const lvl = Number(level) || 1;
    if (lvl <= 10) return 'Ferro 1';
    if (lvl <= 20) return 'Ferro 2';
    if (lvl <= 30) return 'Ferro 3';
    if (lvl <= 40) return 'Bronze 1';
    if (lvl <= 50) return 'Bronze 2';
    if (lvl <= 60) return 'Bronze 3';
    if (lvl <= 70) return 'Prata 1';
    if (lvl <= 80) return 'Prata 2';
    if (lvl <= 90) return 'Prata 3';
    if (lvl <= 100) return 'Ouro 1';
    if (lvl <= 110) return 'Ouro 2';
    if (lvl <= 120) return 'Ouro 3';
    if (lvl <= 130) return 'Platina 1';
    if (lvl <= 140) return 'Platina 2';
    if (lvl <= 150) return 'Platina 3';
    if (lvl <= 165) return 'Diamante 1';
    if (lvl <= 180) return 'Diamante 2';
    if (lvl <= 199) return 'Diamante 3';
    return 'Lenda';
};

export default function TabOportunidades({ perfil, empresaId }) {
    // Fallback ID if passed via perfil object or direct prop
    const effectiveCompanyId = empresaId || perfil?.id;

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        budget: '',
        location: '',
        description: '',
        requirements: {
            minLevel: '',
            minRank: '',
            premiumOnly: false,
            social: { instagram: '', tiktok: '', youtube: '' }
        }
    });

    const [filters, setFilters] = useState({
        minLevel: '',
        minRank: '',
        premiumOnly: false,
        social: { instagram: '', tiktok: '', youtube: '' }
    });

    const [expandedCandidate, setExpandedCandidate] = useState(null);

    // 1. Fetch Jobs
    useEffect(() => {
        async function fetchJobs() {
            if (!effectiveCompanyId) {
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('oportunidades')
                .select(`
                    *,
                    candidaturas (
                        id, status, created_at,
                        atleta:atletas ( id, nome, apelido, foto_url, level, categoria, slug, redes_sociais, contato, atributos, plano )
                    )
                `)
                .eq('empresa_id', effectiveCompanyId)
                .order('created_at', { ascending: false });

            if (error) console.error("Erro ao buscar vagas:", error);
            else setJobs(data || []);
            setLoading(false);
        }
        fetchJobs();
    }, [effectiveCompanyId]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const { data, error } = await supabase
            .from('oportunidades')
            .insert([{
                empresa_id: effectiveCompanyId,
                titulo: newJob.title,
                orcamento: newJob.budget,
                localizacao: newJob.location,
                descricao: newJob.description,
                status: 'active',
                requisitos: newJob.requirements
            }])
            .select();

        if (error) {
            alert('Erro ao criar vaga');
        } else {
            setJobs([data[0], ...jobs]);
            setShowForm(false);
            setNewJob({
                title: '',
                budget: '',
                location: '',
                description: '',
                requirements: { minLevel: '', minRank: '', premiumOnly: false, social: { instagram: '', tiktok: '', youtube: '' } }
            });
        }
        setSubmitting(false);
    };

    const handleDeleteJob = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

        const { error } = await supabase
            .from('oportunidades')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir vaga');
        } else {
            setJobs(jobs.filter(job => job.id !== id));
        }
    };

    const handleDeleteCandidatura = async (candidaturaId, jobId) => {
        if (!confirm('Tem certeza que deseja rejeitar este candidato?')) return;

        const { error } = await supabase
            .from('candidaturas')
            .delete()
            .eq('id', candidaturaId);

        if (error) {
            console.error('Erro ao excluir candidatura:', error);
            alert('Erro ao excluir candidatura');
        } else {
            // Atualizar estado local
            setJobs(jobs.map(job => {
                if (job.id === jobId) {
                    return {
                        ...job,
                        candidaturas: job.candidaturas.filter(c => c.id !== candidaturaId)
                    };
                }
                return job;
            }));
        }
    };

    const toggleCandidate = (id) => {
        if (expandedCandidate === id) setExpandedCandidate(null);
        else setExpandedCandidate(id);
    };

    const getWhatsAppLink = (phone, name, jobTitle) => {
        if (!phone) return null;
        const text = `Olá ${name}, vi sua aplicação para a vaga ${jobTitle} e gostaria de conversar.`;
        return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-yellow-500" /></div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-display font-bold text-white uppercase italic">Minhas Vagas</h3>
                    <p className="text-sm text-slate-400">Gerencie suas oportunidades e veja candidatos.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded font-bold uppercase text-xs flex items-center gap-2 transition"
                >
                    <Plus size={16} />
                    {showForm ? 'Cancelar' : 'Nova Vaga'}
                </button>
            </div>

            {/* FORMULARIO */}
            {showForm && (
                <form onSubmit={handleCreateJob} className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-4 animate-slideDown">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Título da Vaga</label>
                            <input
                                type="text"
                                required
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                placeholder="Ex: Luta no Evento X"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Orçamento (R$)</label>
                            <input
                                type="text"
                                value={newJob.budget}
                                onChange={e => setNewJob({ ...newJob, budget: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                placeholder="A combinar"
                            />
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Localização</label>
                            <input
                                type="text"
                                value={newJob.location}
                                onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                placeholder="Ex: São Paulo, SP"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Descrição</label>
                            <input
                                type="text"
                                value={newJob.description}
                                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                placeholder="Detalhes da oportunidade..."
                            />
                        </div>
                    </div>


                    {/* REQUIREMENTS SECTION */}
                    <div className="border-t border-slate-800 pt-4 mt-2">
                        <label className="text-xs text-yellow-500 uppercase font-bold mb-3 block flex items-center gap-2">
                            <Briefcase size={14} /> Requisitos do Candidato
                        </label>

                        {/* LINHA 1: PERFIL */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Nível Mínimo (1-200)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={newJob.requirements.minLevel}
                                    onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, minLevel: e.target.value } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                    placeholder="Ex: 10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Rank Mínimo</label>
                                <select
                                    value={newJob.requirements.minRank}
                                    onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, minRank: e.target.value } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                                >
                                    <option value="">Qualquer Rank</option>
                                    <optgroup label="Ferro">
                                        <option value="Ferro 1">Ferro 1</option>
                                        <option value="Ferro 2">Ferro 2</option>
                                        <option value="Ferro 3">Ferro 3</option>
                                    </optgroup>
                                    <optgroup label="Bronze">
                                        <option value="Bronze 1">Bronze 1</option>
                                        <option value="Bronze 2">Bronze 2</option>
                                        <option value="Bronze 3">Bronze 3</option>
                                    </optgroup>
                                    <optgroup label="Prata">
                                        <option value="Prata 1">Prata 1</option>
                                        <option value="Prata 2">Prata 2</option>
                                        <option value="Prata 3">Prata 3</option>
                                    </optgroup>
                                    <optgroup label="Ouro">
                                        <option value="Ouro 1">Ouro 1</option>
                                        <option value="Ouro 2">Ouro 2</option>
                                        <option value="Ouro 3">Ouro 3</option>
                                    </optgroup>
                                    <optgroup label="Platina">
                                        <option value="Platina 1">Platina 1</option>
                                        <option value="Platina 2">Platina 2</option>
                                        <option value="Platina 3">Platina 3</option>
                                    </optgroup>
                                    <optgroup label="Diamante">
                                        <option value="Diamante 1">Diamante 1</option>
                                        <option value="Diamante 2">Diamante 2</option>
                                        <option value="Diamante 3">Diamante 3</option>
                                    </optgroup>
                                    <option value="Lenda">Lenda</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={newJob.requirements.premiumOnly}
                                        onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, premiumOnly: e.target.checked } })}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-slate-300 group-hover:text-yellow-500 transition font-bold">Apenas Premium 👑</span>
                                </label>
                            </div>
                        </div>

                        {/* LINHA 2: SOCIAIS */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block flex items-center gap-1"><Instagram size={10} /> Mín. Insta</label>
                                <input
                                    type="number"
                                    value={newJob.requirements.social.instagram}
                                    onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, social: { ...newJob.requirements.social, instagram: e.target.value } } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-pink-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block flex items-center gap-1"><Twitter size={10} /> Mín. TikTok</label>
                                <input
                                    type="number"
                                    value={newJob.requirements.social.tiktok}
                                    onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, social: { ...newJob.requirements.social, tiktok: e.target.value } } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-blue-400 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block flex items-center gap-1"><Youtube size={10} /> Mín. YouTube</label>
                                <input
                                    type="number"
                                    value={newJob.requirements.social.youtube}
                                    onChange={e => setNewJob({ ...newJob, requirements: { ...newJob.requirements, social: { ...newJob.requirements.social, youtube: e.target.value } } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-red-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold uppercase text-xs flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Publicar Vaga'}
                        </button>
                    </div>
                </form>
            )}

            {/* FILTER BAR */}
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-3 text-slate-400 font-bold uppercase text-xs">
                    <Briefcase size={14} /> Filtros de Visualização de Candidatos
                </div>
                <div className="grid sm:grid-cols-4 gap-4">
                    <input
                        type="number"
                        placeholder="Nível Mín."
                        value={filters.minLevel}
                        onChange={e => setFilters({ ...filters, minLevel: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                    />
                    <select
                        value={filters.minRank}
                        onChange={e => setFilters({ ...filters, minRank: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                    >
                        <option value="">Rank Mínimo</option>
                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Insta"
                            value={filters.social.instagram}
                            onChange={e => setFilters({ ...filters, social: { ...filters.social, instagram: e.target.value } })}
                            className="w-1/3 bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                        />
                        <input
                            type="number"
                            placeholder="TikTok"
                            value={filters.social.tiktok}
                            onChange={e => setFilters({ ...filters, social: { ...filters.social, tiktok: e.target.value } })}
                            className="w-1/3 bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                        />
                        <input
                            type="number"
                            placeholder="YT"
                            value={filters.social.youtube}
                            onChange={e => setFilters({ ...filters, social: { ...filters.social, youtube: e.target.value } })}
                            className="w-1/3 bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.premiumOnly}
                            onChange={e => setFilters({ ...filters, premiumOnly: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-900 text-yellow-500"
                        />
                        <span className="text-xs text-slate-400 font-bold">Apenas Premium</span>
                    </label>
                </div>
            </div>

            {/* LISTA DE VAGAS */}
            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                        <Briefcase size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500">Nenhuma vaga criada ainda.</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className="bg-slate-900 border border-slate-800 p-5 rounded-lg relative group">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">{job.titulo}</h4>
                                    <p className="text-slate-400 text-sm mb-3">{job.descricao}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                        {job.orcamento && (
                                            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                                <DollarSign size={12} className="text-green-500" />
                                                {job.orcamento}
                                            </span>
                                        )}
                                        {job.localizacao && (
                                            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                                <MapPin size={12} className="text-blue-500" />
                                                {job.localizacao}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            <Calendar size={12} className="text-purple-500" />
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                        {job.status === 'active' ? 'Ativa' : 'Encerrada'}
                                    </span>
                                    <div className="text-xs text-slate-400">
                                        <span className="text-white font-bold">{job.candidaturas?.length || 0}</span> Candidatos
                                    </div>
                                </div>
                            </div>

                            {/* LISTA DE CANDIDATOS */}
                            {job.candidaturas && job.candidaturas.length > 0 && (
                                <div className="mt-6 border-t border-slate-800 pt-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center sm:text-left">Atletas Candidatos</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {job.candidaturas
                                            .filter(cand => {
                                                const atleta = cand.atleta || cand.perfil || {};

                                                // 1. Filter Check: PREMIUM
                                                if (filters.premiumOnly && atleta.plano !== 'premium') return false;

                                                // 2. Filter Check: LEVEL
                                                if (filters.minLevel && (atleta.level || 0) < Number(filters.minLevel)) return false;

                                                // 3. Filter Check: RANK (Elo)
                                                // Calcula rank baseado no nível (igual Gamification)
                                                const elo = getRankFromLevel(atleta.level);
                                                if (filters.minRank && getRankValue(elo) < getRankValue(filters.minRank)) return false;

                                                // 4. Filter Check: SOCIALS
                                                if (filters.social.instagram) {
                                                    const insta = atleta.redes_sociais?.instagram?.followers || atleta.social_instagram_followers || 0;
                                                    if (insta < Number(filters.social.instagram)) return false;
                                                }
                                                if (filters.social.tiktok) {
                                                    const tiktok = atleta.redes_sociais?.tiktok?.followers || atleta.social_tiktok_followers || 0;
                                                    if (tiktok < Number(filters.social.tiktok)) return false;
                                                }
                                                if (filters.social.youtube) {
                                                    const yt = atleta.redes_sociais?.youtube?.subscribers || atleta.social_youtube_subscribers || 0;
                                                    if (yt < Number(filters.social.youtube)) return false;
                                                }

                                                return true;
                                            })
                                            .sort((a, b) => (b.perfil.premium ? 1 : 0) - (a.perfil.premium ? 1 : 0))
                                            .map(cand => {
                                                const atleta = cand.atleta || {};
                                                const isExpanded = expandedCandidate === cand.id;
                                                const isPremium = atleta.plano === 'premium';
                                                const whatsAppLink = getWhatsAppLink(atleta.contato?.whatsapp || atleta.contato?.phone, atleta.nome, job.titulo);

                                                return (
                                                    <div key={cand.id} className={`bg-black/40 border ${isPremium ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'border-slate-700/50'} ${isExpanded ? 'bg-slate-900' : ''} p-3 rounded-lg transition-all relative overflow-hidden`}>

                                                        {/* PREMIUM BADGE BACKGROUND */}
                                                        {isPremium && (
                                                            <div className="absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 blur-2xl opacity-10 rounded-full pointer-events-none"></div>
                                                        )}

                                                        {/* HEADER ATLETA */}
                                                        <div className="flex items-center justify-between cursor-pointer relative z-10" onClick={() => toggleCandidate(cand.id)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border ${isPremium ? 'border-yellow-500' : 'border-slate-700'}`}>
                                                                    {atleta.foto_url ? (
                                                                        <img src={atleta.foto_url} alt="Atleta" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="flex items-center justify-center h-full text-xs font-bold text-slate-500">
                                                                            {(atleta.nome || 'A').charAt(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-white text-sm font-bold flex items-center gap-2">
                                                                        {atleta.apelido || atleta.nome}
                                                                        {isPremium && (
                                                                            <span className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shadow-lg shadow-yellow-500/20">
                                                                                PRO
                                                                            </span>
                                                                        )}
                                                                    </h5>
                                                                    <p className="text-xs text-slate-500">Lvl {atleta.level} • {getRankFromLevel(atleta.level)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteCandidatura(cand.id, job.id);
                                                                    }}
                                                                    className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition"
                                                                    title="Rejeitar Candidato"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <span className="text-[10px] text-slate-500 uppercase font-bold hidden sm:block">Ver Detalhes</span>
                                                                {isExpanded ? <ChevronUp size={16} className="text-purple-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                                            </div>
                                                        </div>

                                                        {/* DETALHES EXPANDIDOS */}
                                                        {isExpanded && (
                                                            <div className="mt-4 pt-4 border-t border-slate-700/50 relative z-10 animate-fadeIn">
                                                                <div className="grid sm:grid-cols-2 gap-4">
                                                                    {/* COLUNA 1: METRICAS */}
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            {atleta.redes_sociais?.instagram?.active && (
                                                                                <a href={atleta.redes_sociais.instagram.url || '#'} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-pink-600 hover:text-white text-slate-400 transition">
                                                                                    <Instagram size={16} />
                                                                                </a>
                                                                            )}
                                                                            {atleta.redes_sociais?.x?.active && (
                                                                                <a href={atleta.redes_sociais.x.url || '#'} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-white hover:text-black text-slate-400 transition">
                                                                                    <Twitter size={16} />
                                                                                </a>
                                                                            )}
                                                                            {atleta.redes_sociais?.youtube?.active && (
                                                                                <a href={atleta.redes_sociais.youtube.url || '#'} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-red-600 hover:text-white text-slate-400 transition">
                                                                                    <Youtube size={16} />
                                                                                </a>
                                                                            )}
                                                                            <a href={`/${atleta.slug || atleta.id}`} target="_blank" className="px-3 py-2 bg-slate-800 rounded hover:bg-white hover:text-black text-slate-400 text-xs font-bold uppercase transition ml-1">
                                                                                Ver Media Kit Completo
                                                                            </a>
                                                                        </div>

                                                                        {/* METRICAS PRINCIPAIS */}
                                                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                                                            <div className="bg-slate-800 p-2 rounded">
                                                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Seguidores</span>
                                                                                <span className="text-white font-bold font-display text-lg">
                                                                                    {atleta.redes_sociais?.instagram?.followers || '-'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-slate-800 p-2 rounded">
                                                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Engajamento</span>
                                                                                <span className="text-yellow-500 font-bold font-display text-lg">
                                                                                    {atleta.redes_sociais?.instagram?.stats?.engagement || '-'}%
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-slate-800 p-2 rounded">
                                                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Alcance</span>
                                                                                <span className="text-blue-400 font-bold font-display text-lg">
                                                                                    {atleta.redes_sociais?.instagram?.stats?.reach || '-'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-slate-800 p-2 rounded">
                                                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Impressões</span>
                                                                                <span className="text-purple-400 font-bold font-display text-lg">
                                                                                    {atleta.redes_sociais?.instagram?.stats?.impressions || '-'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-slate-800 p-2 rounded col-span-2 sm:col-span-1">
                                                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Compartilhamentos</span>
                                                                                <span className="text-white font-bold font-display text-lg">
                                                                                    {atleta.redes_sociais?.instagram?.stats?.shares || '-'}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* DADOS DE AUDIENCIA */}
                                                                        {atleta.redes_sociais?.instagram?.audience && (
                                                                            <div className="mt-3">
                                                                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Público Principal</p>
                                                                                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                                                                                    {atleta.redes_sociais.instagram.audience.age && (
                                                                                        <span className="bg-slate-800 px-2 py-1 rounded">Idade: {atleta.redes_sociais.instagram.audience.age}</span>
                                                                                    )}
                                                                                    {atleta.redes_sociais.instagram.audience.gender && (
                                                                                        <span className="bg-slate-800 px-2 py-1 rounded">{atleta.redes_sociais.instagram.audience.gender}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* COLUNA 2: AÇÃO WHATSAPP */}
                                                                    <div className="sm:w-1/2 bg-green-500/5 border border-green-500/20 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                                                                        <MessageCircle size={24} className="text-green-500 mb-2" />
                                                                        <h6 className="text-white font-bold text-sm mb-1">Interessou?</h6>
                                                                        <p className="text-xs text-slate-400 mb-3">Chame o atleta direto no WhatsApp para negociar.</p>

                                                                        {whatsAppLink ? (
                                                                            <a
                                                                                href={whatsAppLink}
                                                                                target="_blank"
                                                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs w-full transition flex items-center justify-center gap-2"
                                                                            >
                                                                                Conversar Agora
                                                                            </a>
                                                                        ) : (
                                                                            <button disabled className="bg-slate-700 text-slate-500 px-4 py-2 rounded-lg font-bold uppercase text-xs w-full cursor-not-allowed">
                                                                                Sem WhatsApp Cadastrado
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-500/10 p-2 rounded"
                                title="Excluir Vaga"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
