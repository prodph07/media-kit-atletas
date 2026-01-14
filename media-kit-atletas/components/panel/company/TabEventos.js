import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Trophy, ExternalLink, Loader2, DollarSign, ChevronRight, Save, ArrowLeft, Trash2, CheckCircle, Swords, AlertTriangle, X, Pencil, RotateCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const MODALITIES = [
    { id: 'jiu-jitsu', label: 'Jiu-Jitsu', type: 'grappling' },
    { id: 'mma', label: 'MMA', type: 'combat' },
    { id: 'muay-thai', label: 'Muay Thai', type: 'striking' },
    { id: 'submission', label: 'Submission', type: 'grappling' },
    { id: 'boxe', label: 'Boxe', type: 'striking' },
    { id: 'judo', label: 'Judô', type: 'grappling' }
];

// Helper duplicado de TabOportunidades (Ideal seria mover para lib/utils)
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

export default function TabEventos({ perfil, setPerfil, userId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'create', 'manage'
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newEvent, setNewEvent] = useState({
        nome: '',
        slug: '',
        data_evento: '',
        localizacao: '',
        modalidade: 'jiu-jitsu',
        link_pagamento: '',
        banner_url: '',
        categorias: [] // { nome, tipo, regras }
    });

    const [tempCategory, setTempCategory] = useState({ nome: '', tipo: 'peso' });

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [matches, setMatches] = useState([]);
    const [tabManager, setTabManager] = useState('inscricoes'); // 'dashboard', 'inscricoes', 'chaves'
    const [newMatch, setNewMatch] = useState({ atleta_a_id: '', atleta_b_id: '' });
    const [editingMatchId, setEditingMatchId] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [userId]);

    useEffect(() => {
        if (selectedEvent && view === 'manage') {
            fetchInscricoes();
            fetchMatches();
        }
    }, [selectedEvent, view]);

    async function fetchMatches() {
        if (!selectedEvent) return;
        try {
            const { data: matchesData, error } = await supabase
                .from('eventos_lutas')
                .select('*')
                .eq('evento_id', selectedEvent.id);

            if (error) throw error;
            if (!matchesData || matchesData.length === 0) {
                setMatches([]);
                return;
            }

            const athleteIds = [...matchesData.map(m => m.atleta_a_id), ...matchesData.map(m => m.atleta_b_id)].filter(Boolean);
            const { data: athletes } = await supabase.from('atletas').select('*').in('id', athleteIds);

            setMatches(matchesData.map(m => ({
                ...m,
                atleta_a: athletes?.find(a => a.id == m.atleta_a_id) || {},
                atleta_b: athletes?.find(a => a.id == m.atleta_b_id) || {}
            })));

        } catch (err) {
            console.error("Erro ao buscar lutas (Detalhes):", err, err.message, err.hint);
            alert("Erro ao carregar lutas: " + (err.message || "Erro desconhecido"));
        }
    }

    const handleCreateMatch = async () => {
        if (!newMatch.atleta_a_id || !newMatch.atleta_b_id) return;

        let error;

        if (editingMatchId) {
            // Update existing
            const { error: err } = await supabase.from('eventos_lutas').update({
                atleta_a_id: newMatch.atleta_a_id,
                atleta_b_id: newMatch.atleta_b_id,
                penalidade_a: newMatch.penalidade_a || 0,
                penalidade_b: newMatch.penalidade_b || 0
            }).eq('id', editingMatchId);
            error = err;
        } else {
            // Create new
            const { error: err } = await supabase.from('eventos_lutas').insert([{
                evento_id: selectedEvent.id,
                atleta_a_id: newMatch.atleta_a_id,
                atleta_b_id: newMatch.atleta_b_id,
                status: 'agendada'
            }]);
            error = err;
        }

        if (!error) {
            setNewMatch({ atleta_a_id: '', atleta_b_id: '' });
            setEditingMatchId(null);
            fetchMatches();
        } else {
            console.error(error);
            alert("Erro ao salvar luta: " + error.message);
        }
    };

    const handleEditMatch = (match) => {
        setNewMatch({
            atleta_a_id: match.atleta_a_id,
            atleta_b_id: match.atleta_b_id,
            penalidade_a: match.penalidade_a || 0,
            penalidade_b: match.penalidade_b || 0
        });
        setEditingMatchId(match.id);
    };

    const handleCancelEdit = () => {
        setNewMatch({ atleta_a_id: '', atleta_b_id: '', penalidade_a: 0, penalidade_b: 0 });
        setEditingMatchId(null);
    };

    const handleSetWinner = async (match, winnerId) => {
        const { error } = await supabase.from('eventos_lutas').update({
            vencedor_id: winnerId,
            status: 'finalizada'
        }).eq('id', match.id);

        if (!error) fetchMatches();
    };

    const handleUndoResult = async (match) => {
        if (!confirm('Deseja desfazer o resultado desta luta?')) return;
        const { error } = await supabase.from('eventos_lutas').update({
            vencedor_id: null,
            status: 'agendada'
        }).eq('id', match.id);

        if (!error) fetchMatches();
    };

    const handleDeleteMatch = async (id) => {
        const { error } = await supabase.from('eventos_lutas').delete().eq('id', id);
        if (!error) fetchMatches();
    };

    async function fetchInscricoes() {
        if (!selectedEvent) return;
        setLoading(true);

        try {
            // 1. Fetch Inscriptions (Raw)
            const { data: inscricoesData, error: inscError } = await supabase
                .from('eventos_inscricoes')
                .select('*')
                .eq('evento_id', selectedEvent.id);

            if (inscError) throw inscError;

            if (!inscricoesData || inscricoesData.length === 0) {
                setInscritos([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Athletes Manual Join
            const atletaIds = inscricoesData.map(i => i.atleta_id).filter(Boolean);
            console.log("DEBUG IDs:", atletaIds);

            const { data: atletasData, error: atletasError } = await supabase
                .from('atletas')
                .select('*')
                .in('id', atletaIds);

            if (atletasError) console.error("DEBUG Error:", atletasError);
            console.log("DEBUG Atletas Data:", atletasData);

            // 3. Fetch Categories Manual Join
            const catIds = inscricoesData.map(i => i.categoria_id).filter(Boolean);
            const { data: catsData } = await supabase
                .from('eventos_categorias')
                .select('id, nome')
                .in('id', catIds);

            // 4. Merge Data
            const enrichedInscricoes = inscricoesData.map(insc => ({
                ...insc,
                atletas: atletasData?.find(a => a.id == insc.atleta_id) || {},
                eventos_categorias: catsData?.find(c => c.id == insc.categoria_id) || {}
            }));

            setInscritos(enrichedInscricoes);
        } catch (err) {
            console.error("Erro ao buscar inscrições:", err);
            alert("Erro ao carregar lista. Verifique o console.");
        } finally {
            setLoading(false);
        }
    }



    const handleUpdateStatus = async (inscricaoId, newStatus) => {
        const { error } = await supabase
            .from('eventos_inscricoes')
            .update({ status: newStatus })
            .eq('id', inscricaoId);

        if (!error) {
            setInscritos(prev => prev.map(i => i.id === inscricaoId ? { ...i, status: newStatus } : i));
        }
    };

    const handleDeleteInscription = async (id) => {
        if (!confirm('Tem certeza que deseja remover este atleta da inscrição?')) return;
        const { error } = await supabase.from('eventos_inscricoes').delete().eq('id', id);
        if (!error) {
            setInscritos(prev => prev.filter(i => i.id !== id));
        } else {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    async function fetchEvents() {
        if (!userId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('organizador_id', userId)
            .order('created_at', { ascending: false });

        if (data) setEvents(data);
        setLoading(false);
    }

    const handleSlugGen = (name) => {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        setNewEvent(prev => ({ ...prev, nome: name, slug }));
    };

    const addCategory = () => {
        if (!tempCategory.nome) return;
        setNewEvent(prev => ({
            ...prev,
            categorias: [...prev.categorias, { ...tempCategory, id: Date.now() }]
        }));
        setTempCategory({ nome: '', tipo: 'peso' });
    };

    const removeCategory = (id) => {
        setNewEvent(prev => ({
            ...prev,
            categorias: prev.categorias.filter(c => c.id !== id)
        }));
    };

    const handleCreateEvent = async () => {
        if (!newEvent.nome || !newEvent.slug) return alert('Preencha os campos obrigatórios');
        setSubmitting(true);

        // 1. Criar Evento
        const { data: eventData, error: eventError } = await supabase
            .from('eventos')
            .insert([{
                organizador_id: userId,
                nome: newEvent.nome,
                slug: newEvent.slug,
                data_evento: newEvent.data_evento || null,
                localizacao: newEvent.localizacao,
                modalidade: newEvent.modalidade,
                link_pagamento: newEvent.link_pagamento,
                banner_url: newEvent.banner_url,
                status: 'publicado' // Publica direto por enquanto
            }])
            .select()
            .single();

        if (eventError) {
            alert('Erro ao criar evento: ' + eventError.message);
            setSubmitting(false);
            return;
        }

        // 2. Criar Categorias
        if (newEvent.categorias.length > 0) {
            const catsToInsert = newEvent.categorias.map(c => ({
                evento_id: eventData.id,
                nome: c.nome,
                tipo: c.tipo
            }));

            await supabase.from('eventos_categorias').insert(catsToInsert);
        }

        setSubmitting(false);
        setStep(1);
        setView('list');
        fetchEvents();
    };

    const bookedIds = matches
        .filter(m => m.id !== editingMatchId)
        .flatMap(m => [m.atleta_a_id, m.atleta_b_id]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* HEADER */}
            {view === 'list' ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-lg">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                            <Trophy className="text-purple-500" />
                            MEUS EVENTOS
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Gerencie suas competições, inscrições e chaves.</p>
                    </div>
                    <button
                        onClick={() => {
                            setNewEvent({ nome: '', slug: '', data_evento: '', localizacao: '', modalidade: 'jiu-jitsu', link_pagamento: '', banner_url: '', categorias: [] });
                            setView('create');
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold uppercase text-sm tracking-wide transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Novo Evento
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-white transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-display font-bold text-white uppercase">Novo Evento</h2>
                </div>
            )}

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
                    ) : events.length === 0 ? (
                        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-lg p-12 text-center text-slate-500">
                            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Nenhum evento criado. Comece agora!</p>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="bg-slate-900 border border-slate-800 p-6 rounded-lg hover:border-purple-500/30 transition group flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-white font-bold text-lg">{event.nome}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.status === 'publicado' ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {event.data_evento ? new Date(event.data_evento).toLocaleDateString() : 'Data indefinida'}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.localizacao || 'Local não definido'}</span>
                                        <span className="flex items-center gap-1 font-mono text-purple-400 uppercase">{event.modalidade}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start md:self-center">
                                    <button
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setView('manage');
                                        }}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition"
                                    >
                                        Gerenciar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* CREATE WIZARD */}
            {view === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* SIDEBAR STEPS */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className={`p-4 rounded border ${step === 1 ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                            <h4 className="font-bold uppercase text-sm mb-1">Passo 1</h4>
                            <p className="text-xs">Configuração Básica</p>
                        </div>
                        <div className={`p-4 rounded border ${step === 2 ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                            <h4 className="font-bold uppercase text-sm mb-1">Passo 2</h4>
                            <p className="text-xs">Categorias</p>
                        </div>
                        <div className={`p-4 rounded border ${step === 3 ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                            <h4 className="font-bold uppercase text-sm mb-1">Passo 3</h4>
                            <p className="text-xs">Pagamento & Check-in</p>
                        </div>
                    </div>

                    {/* FORM AREA */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-lg">

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Evento</label>
                                    <input
                                        type="text"
                                        value={newEvent.nome}
                                        onChange={e => handleSlugGen(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        placeholder="Ex: Copa Duel de Jiu-Jitsu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">URL Amigável (Slug)</label>
                                    <input
                                        type="text"
                                        value={newEvent.slug}
                                        onChange={e => setNewEvent({ ...newEvent, slug: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-400 text-sm focus:border-purple-500 outline-none font-mono"
                                    />
                                    <p className="text-[10px] text-slate-600 mt-1">Seu link será: duel.com/eventos/{newEvent.slug || '...'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data</label>
                                        <input
                                            type="date"
                                            value={newEvent.data_evento}
                                            onChange={e => setNewEvent({ ...newEvent, data_evento: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Modalidade</label>
                                        <select
                                            value={newEvent.modalidade}
                                            onChange={e => setNewEvent({ ...newEvent, modalidade: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        >
                                            {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Local</label>
                                    <input
                                        type="text"
                                        value={newEvent.localizacao}
                                        onChange={e => setNewEvent({ ...newEvent, localizacao: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        placeholder="Ex: Ginásio do Ibirapuera, SP"
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        disabled={!newEvent.nome}
                                        onClick={() => setStep(2)}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold uppercase text-sm tracking-wide transition disabled:opacity-50"
                                    >
                                        Próximo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CATEGORIES */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded text-sm text-purple-200">
                                    💡 Crie as categorias onde os atletas irão se inscrever. Ex: "77kg - Adulto", "Absoluto".
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tempCategory.nome}
                                        onChange={e => setTempCategory({ ...tempCategory, nome: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        placeholder="Nome da Categoria (Ex: Peso Leve - Faixa Branca)"
                                        onKeyDown={e => e.key === 'Enter' && addCategory()}
                                    />
                                    <button
                                        onClick={addCategory}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded border border-slate-700"
                                    >
                                        <Plus />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {newEvent.categorias.map(cat => (
                                        <div key={cat.id} className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                                            <span className="text-white font-bold text-sm">{cat.nome}</span>
                                            <button onClick={() => removeCategory(cat.id)} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {newEvent.categorias.length === 0 && (
                                        <p className="text-slate-500 text-center text-sm py-4">Nenhuma categoria adicionada.</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white text-sm uppercase font-bold">Voltar</button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold uppercase text-sm tracking-wide transition"
                                    >
                                        Próximo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT & FINISH */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link de Pagamento (Opcional)</label>
                                    <div className="flex bg-slate-950 border border-slate-800 rounded p-3 items-center gap-2">
                                        <DollarSign size={16} className="text-green-500" />
                                        <input
                                            type="text"
                                            value={newEvent.link_pagamento}
                                            onChange={e => setNewEvent({ ...newEvent, link_pagamento: e.target.value })}
                                            className="w-full bg-transparent border-none text-white focus:ring-0 p-0 outline-none"
                                            placeholder="https://sympla.com.br/..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2">O atleta verá um botão "Pagar Inscrição" com este link.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Banner URL (Opcional)</label>
                                    <input
                                        type="text"
                                        value={newEvent.banner_url}
                                        onChange={e => setNewEvent({ ...newEvent, banner_url: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex justify-between pt-4 border-t border-slate-800 mt-6">
                                    <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm uppercase font-bold">Voltar</button>
                                    <button
                                        onClick={handleCreateEvent}
                                        disabled={submitting}
                                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-wide transition flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                                        Publicar Evento
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* MANAGE DASHBOARD */}
            {view === 'manage' && selectedEvent && (
                <div className="space-y-6">
                    {/* MANAGER HEADER */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase">{selectedEvent.nome}</h2>
                                <p className="text-slate-400 text-xs flex items-center gap-2 mt-1">
                                    <Calendar size={12} /> {selectedEvent.data_evento ? new Date(selectedEvent.data_evento).toLocaleDateString() : 'data não setada'}
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span className="text-purple-400 uppercase font-bold">{selectedEvent.modalidade}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`/eventos/${selectedEvent.slug}`}
                                    target="_blank"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded flex items-center gap-2 transition"
                                >
                                    <ExternalLink size={14} /> Ver Página
                                </a>
                            </div>
                        </div>

                        {/* MANAGER TABS */}
                        <div className="flex gap-4 mt-8 border-b border-slate-800">
                            {['inscricoes', 'chaves', 'config'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTabManager(t)}
                                    className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition ${tabManager === t ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {t === 'inscricoes' ? `Inscritos (${inscritos.length})` :
                                        t === 'chaves' ? 'Chaves & Lutas' : 'Configurações'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TAB: INSCRICOES */}
                    {tabManager === 'inscricoes' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-white text-sm uppercase">Lista de Atletas</h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-slate-500">
                                        Total: <span className="text-white font-bold">{inscritos.length}</span>
                                    </div>
                                    <button onClick={fetchInscricoes} className="text-slate-500 hover:text-white transition" title="Atualizar Lista">
                                        <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>

                            {/* PENDING REQUESTS SECTION */}
                            {inscritos.some(i => i.status === 'pendente') && (
                                <div className="p-6 bg-slate-900 border-b border-slate-800 animate-fadeIn">
                                    <h3 className="font-bold text-yellow-500 uppercase text-sm mb-4 flex items-center gap-2">
                                        <AlertTriangle size={16} /> Solicitações Pendentes ({inscritos.filter(i => i.status === 'pendente').length})
                                    </h3>
                                    <div className="grid gap-3">
                                        {inscritos.filter(i => i.status === 'pendente').map(insc => (
                                            <div key={insc.id} className="bg-slate-950 border border-yellow-500/20 p-4 rounded-lg flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={insc.atletas?.foto_url || "https://placehold.co/100"} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                                                    <div>
                                                        <div className="text-white font-bold flex items-center gap-2">
                                                            {insc.atletas?.nome || 'Atleta'}
                                                            {insc.atletas?.apelido && <span className="text-slate-400 font-normal">"{insc.atletas.apelido}"</span>}
                                                            <span className="text-[10px] text-red-500">#{insc.atleta_id}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500">{insc.eventos_categorias?.nome} • {getRankFromLevel(insc.atletas?.level)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(insc.id, 'rejeitado')}
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded transition" title="Rejeitar"
                                                    >
                                                        <X Circle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(insc.id, 'aprovado')}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase rounded transition flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Aprovar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
                            ) : inscritos.filter(i => i.status !== 'pendente').length === 0 ? (
                                <div className="p-12 text-center text-slate-500 italic">Nenhum inscrito confirmado ainda.</div>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500">
                                        <tr>
                                            <th className="p-4">Atleta</th>
                                            <th className="p-4">Categoria</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {inscritos.filter(i => i.status !== 'pendente').map(insc => (
                                            <tr key={insc.id} className="hover:bg-slate-800/50 transition">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={insc.atletas?.foto_url || "https://placehold.co/100"} className="w-8 h-8 rounded-full bg-slate-800 object-cover" />
                                                        <div>
                                                            <div className="text-white font-bold flex items-center gap-2">
                                                                {insc.atletas?.nome || 'Atleta'}
                                                                {insc.atletas?.apelido && <span className="text-slate-400 font-normal">"{insc.atletas.apelido}"</span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{insc.atletas?.team || 'Sem Equipe'} • <span className="text-purple-400 font-bold">{getRankFromLevel(insc.atletas?.level)}</span></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs">{insc.eventos_categorias?.nome || '-'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${insc.status === 'pago' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        insc.status === 'aprovado' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                            insc.status === 'rejeitado' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                        }`}>
                                                        {insc.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                                    <select
                                                        value={insc.status}
                                                        onChange={(e) => handleUpdateStatus(insc.id, e.target.value)}
                                                        className="bg-slate-900 border border-slate-700 text-xs rounded p-1 text-white outline-none focus:border-purple-500"
                                                    >
                                                        <option value="aprovado">Aprovado</option>
                                                        <option value="pago">Pago (Confirmado)</option>
                                                        <option value="rejeitado">Rejeitado</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleDeleteInscription(insc.id)}
                                                        className="p-2 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-500 rounded transition"
                                                        title="Excluir Inscrição"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* TAB: CHAVES (MATCHMAKING) */}
                    {tabManager === 'chaves' && (
                        <div className="space-y-6">

                            {/* CREATE/EDIT MATCH AREA */}
                            <div className={`p-6 border rounded-lg transition-colors ${editingMatchId ? 'bg-purple-900/10 border-purple-500/50' : 'bg-slate-900 border-slate-800'}`}>
                                <h3 className={`font-bold uppercase mb-4 flex items-center gap-2 ${editingMatchId ? 'text-purple-400' : 'text-white'}`}>
                                    <Swords size={20} className={editingMatchId ? "text-purple-400" : "text-purple-500"} />
                                    {editingMatchId ? 'Editar Luta' : 'Matchmaker'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label className="text-xs font-bold text-red-500 uppercase block mb-1">Red Corner</label>
                                        <select
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                                            onChange={e => setNewMatch({ ...newMatch, atleta_a_id: e.target.value })}
                                            value={newMatch.atleta_a_id || ''}
                                        >
                                            <option value="">Selecione Atleta A</option>
                                            {inscritos.filter(i => !bookedIds.includes(i.atletas.id)).map(i => <option key={i.atletas.id} value={i.atletas.id}>{i.atletas.nome} ({i.eventos_categorias?.nome})</option>)}
                                        </select>
                                        {editingMatchId && (
                                            <div className="mt-2">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Penalidade (Pontos)</label>
                                                <input
                                                    type="number"
                                                    value={newMatch.penalidade_a || 0}
                                                    onChange={e => setNewMatch({ ...newMatch, penalidade_a: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center font-display font-bold text-2xl text-slate-600 hidden md:block">VS</div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-500 uppercase block mb-1">Blue Corner</label>
                                        <select
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                                            onChange={e => setNewMatch({ ...newMatch, atleta_b_id: e.target.value })}
                                            value={newMatch.atleta_b_id || ''}
                                        >
                                            <option value="">Selecione Atleta B</option>
                                            {inscritos.filter(i => i.atletas.id != newMatch.atleta_a_id && !bookedIds.includes(i.atletas.id)).map(i => <option key={i.atletas.id} value={i.atletas.id}>{i.atletas.nome} ({i.eventos_categorias?.nome})</option>)}
                                        </select>
                                        {editingMatchId && (
                                            <div className="mt-2">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Penalidade (Pontos)</label>
                                                <input
                                                    type="number"
                                                    value={newMatch.penalidade_b || 0}
                                                    onChange={e => setNewMatch({ ...newMatch, penalidade_b: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    {editingMatchId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-slate-400 hover:text-white px-4 py-2 rounded font-bold uppercase text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCreateMatch}
                                        disabled={!newMatch.atleta_a_id || !newMatch.atleta_b_id}
                                        className={`${editingMatchId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-purple-600 hover:bg-purple-500'} disabled:opacity-50 text-white px-6 py-2 rounded font-bold uppercase text-sm transition`}
                                    >
                                        {editingMatchId ? 'Salvar Alteração' : 'Criar Luta'}
                                    </button>
                                </div>
                            </div>

                            {/* FIGHT LIST */}
                            <div className="space-y-3">
                                {matches.map((fight, idx) => {
                                    // Helper to get inscription data for current fight athletes
                                    const inscA = inscritos.find(i => i.atleta_id == fight.atleta_a_id);
                                    const inscB = inscritos.find(i => i.atleta_id == fight.atleta_b_id);

                                    return (
                                        <div key={fight.id} className="relative bg-black border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden group">
                                            <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-600 uppercase">Luta {idx + 1} • {inscA?.eventos_categorias?.nome || 'Peso Combinado'}</div>

                                            {/* EDIT/DELETE ACTIONS - Always visible or on hover, kept visible for clarity */}
                                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                                                <button
                                                    onClick={() => handleEditMatch(fight)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-yellow-500 rounded transition"
                                                    title="Editar"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMatch(fight.id)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-500 rounded transition"
                                                    title="Deletar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* RED CORNER */}
                                            <div className={`flex items-center gap-3 w-full md:w-5/12 justify-start md:justify-end ${fight.vencedor_id === fight.atleta_a_id ? 'opacity-100' : fight.vencedor_id ? 'opacity-30 grayscale' : ''}`}>
                                                <div className="text-right">
                                                    <div className="text-white font-bold text-lg leading-none">{fight.atleta_a?.nome || 'Atleta A'}</div>
                                                    {fight.atleta_a?.apelido && <div className="text-slate-400 text-sm font-medium">"{fight.atleta_a.apelido}"</div>}
                                                    <div className="text-xs text-slate-500 mb-1">{fight.atleta_a?.team || inscA?.dados_inscricao?.equipe || 'Sem Equipe'}</div>

                                                    <div className="flex justify-end gap-2 items-center">
                                                        {fight.penalidade_a > 0 && <span className="text-[10px] bg-red-900/50 text-red-500 px-1 rounded border border-red-900 mx-1">-{fight.penalidade_a} pts</span>}
                                                        <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-950/30 px-2 rounded">Red Corner</div>
                                                    </div>
                                                </div>
                                                <img src={fight.atleta_a?.foto_url || "https://placehold.co/100"} className="w-12 h-12 rounded-full border-2 border-red-500 object-cover bg-slate-800" />
                                            </div>

                                            {/* CENTER VS */}
                                            <div className="text-center w-full md:w-2/12 relative z-10 pt-4 md:pt-0">
                                                {fight.status === 'finalizada' ? (
                                                    <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Finalizada</span>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-display font-bold text-xl text-slate-700">VS</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* BLUE CORNER */}
                                            <div className={`flex items-center gap-3 w-full md:w-5/12 justify-start ${fight.vencedor_id === fight.atleta_b_id ? 'opacity-100' : fight.vencedor_id ? 'opacity-30 grayscale' : ''}`}>
                                                <img src={fight.atleta_b?.foto_url || "https://placehold.co/100"} className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover bg-slate-800" />
                                                <div>
                                                    <div className="text-white font-bold text-lg leading-none">{fight.atleta_b?.nome || 'Atleta B'}</div>
                                                    {fight.atleta_b?.apelido && <div className="text-slate-400 text-sm font-medium">"{fight.atleta_b.apelido}"</div>}
                                                    <div className="text-xs text-slate-500 mb-1">{fight.atleta_b?.team || inscB?.dados_inscricao?.equipe || 'Sem Equipe'}</div>

                                                    <div className="flex justify-start gap-2 items-center">
                                                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider bg-blue-950/30 px-2 rounded">Blue Corner</div>
                                                        {fight.penalidade_b > 0 && <span className="text-[10px] bg-red-900/50 text-red-500 px-1 rounded border border-red-900 mx-1">-{fight.penalidade_b} pts</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WINNER ACTIONS OVERLAY */}
                                            {/* WINNER ACTIONS OVERLAY */}
                                            {fight.status !== 'finalizada' ? (
                                                <div className="absolute inset-0 top-8 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm gap-2 z-10">
                                                    <button onClick={() => handleSetWinner(fight, fight.atleta_a_id)} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded uppercase">Red Win</button>
                                                    <div className="text-white text-[10px] font-bold">DEFINIR VENCEDOR</div>
                                                    <button onClick={() => handleSetWinner(fight, fight.atleta_b_id)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded uppercase">Blue Win</button>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 top-8 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm gap-2 z-10">
                                                    <button onClick={() => handleUndoResult(fight)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded uppercase flex items-center gap-2">
                                                        <RotateCcw size={14} /> Desfazer Resultado
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {matches.length === 0 && <p className="text-slate-500 text-center text-sm py-8">Nenhuma luta casada.</p>}
                            </div>

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
