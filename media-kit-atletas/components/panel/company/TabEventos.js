import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Trophy, ExternalLink, Loader2, DollarSign, ChevronRight, Save, ArrowLeft, Trash2, CheckCircle, Swords, AlertTriangle, X, Pencil, RotateCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import AdminFightControl from '../../admin/AdminFightControl';

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

export default function TabEventos({ perfil, setPerfil, userId, empresaId }) {
    // ID hierarchy: userId (direct prop) > empresaId (prop) > perfil.user_id
    const effectiveUserId = userId || empresaId || perfil?.user_id;

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
    }, [effectiveUserId]);

    useEffect(() => {
        if (selectedEvent && view === 'manage') {
            fetchInscricoes();
            fetchMatches();
        }
    }, [selectedEvent, view]);
    async function fetchInscricoes() {
        if (!selectedEvent) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('eventos_inscricoes')
            .select(`
                *,
                atletas:atleta_id ( id, nome, apelido, foto_url, team, level, historico ),
                eventos_categorias:categoria_id ( nome )
            `)
            .eq('evento_id', selectedEvent.id);

        if (error) console.error("Erro ao buscar inscritos:", error);
        else setInscritos(data || []);
        setLoading(false);
    }

    async function fetchMatches() {
        if (!selectedEvent) return;
        const { data, error } = await supabase
            .from('eventos_lutas')
            .select(`
                *,
                atleta_a:atleta_a_id ( id, nome, apelido, foto_url, team ),
                atleta_b:atleta_b_id ( id, nome, apelido, foto_url, team )
            `)
            .eq('evento_id', selectedEvent.id);

        if (error) {
            console.error("Erro ao buscar lutas:", error);
            alert("Erro ao carregar lista de lutas: " + error.message);
        } else {
            console.log("Lutas carregadas:", data);
            setMatches(data || []);
        }
    }

    const handleUpdateStatus = async (id, status) => {
        const { error } = await supabase.from('eventos_inscricoes').update({ status }).eq('id', id);
        if (error) alert("Erro ao atualizar status");
        else fetchInscricoes();
    };

    const handleDeleteInscription = async (id) => {
        if (!confirm("Tem certeza que deseja excluir esta inscrição?")) return;
        const { error } = await supabase.from('eventos_inscricoes').delete().eq('id', id);
        if (!error) fetchInscricoes();
    };

    const handleCreateMatch = async () => {
        if (!newMatch.atleta_a_id || !newMatch.atleta_b_id) return alert("Selecione os dois atletas");

        const payload = {
            evento_id: selectedEvent.id,
            atleta_a_id: newMatch.atleta_a_id,
            atleta_b_id: newMatch.atleta_b_id,
            penalidade_a: Number(newMatch.penalidade_a) || 0,
            penalidade_b: Number(newMatch.penalidade_b) || 0,
            status: 'agendada'
        };

        try {
            if (editingMatchId) {
                const { error } = await supabase.from('eventos_lutas').update(payload).eq('id', editingMatchId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('eventos_lutas').insert([payload]);
                if (error) throw error;
            }

            setEditingMatchId(null);
            setNewMatch({ atleta_a_id: '', atleta_b_id: '' });
            fetchMatches();
            alert("Luta salva com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar luta:", error);
            alert("Erro ao salvar luta: " + error.message);
        }
    };

    const handleEditMatch = (match) => {
        setEditingMatchId(match.id);
        setNewMatch({
            atleta_a_id: match.atleta_a_id,
            atleta_b_id: match.atleta_b_id,
            penalidade_a: match.penalidade_a,
            penalidade_b: match.penalidade_b
        });
    };

    const handleCancelEdit = () => {
        setEditingMatchId(null);
        setNewMatch({ atleta_a_id: '', atleta_b_id: '' });
    };

    const handleDeleteMatch = async (id) => {
        if (!confirm("Excluir esta luta?")) return;
        await supabase.from('eventos_lutas').delete().eq('id', id);
        fetchMatches();
    };

    const handleSetWinner = async (match, winnerId) => {
        const { error } = await supabase.from('eventos_lutas').update({
            vencedor_id: winnerId,
            status: 'finalizada'
        }).eq('id', match.id);

        if (!error) fetchMatches();
    };

    const handleUndoResult = async (match) => {
        const { error } = await supabase.from('eventos_lutas').update({
            vencedor_id: null,
            status: 'agendada'
        }).eq('id', match.id);

        if (!error) fetchMatches();
    };

    async function fetchEvents() {
        if (!effectiveUserId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('organizador_id', effectiveUserId)
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

        // Construct Location String: "City - State • Address"
        let fullLocation = newEvent.localizacao; // Fallback
        if (newEvent.cidade && newEvent.estado) {
            fullLocation = `${newEvent.cidade} - ${newEvent.estado}`;
            if (newEvent.endereco) {
                fullLocation += ` • ${newEvent.endereco}`;
            }
        }

        setSubmitting(true);

        // 1. Criar Evento
        const { data: eventData, error: eventError } = await supabase
            .from('eventos')
            .insert([{
                organizador_id: userId,
                nome: newEvent.nome,
                slug: newEvent.slug,
                data_evento: newEvent.data_evento || null,
                localizacao: fullLocation,
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
                tipo: c.tipo,
                preco: c.preco
            }));

            await supabase.from('eventos_categorias').insert(catsToInsert);
        }

        setSubmitting(false);
        setStep(1);
        setView('list');
        fetchEvents();
    };

    // --- MATCHMAKING LOGIC ---
    const getAthleteFightCount = (atleta) => {
        if (!atleta.historico) return 0;
        return Array.isArray(atleta.historico) ? atleta.historico.length : 0;
    };

    const handleDragStart = (e, atletaId) => {
        e.dataTransfer.setData("atletaId", atletaId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, slot) => {
        e.preventDefault();
        const atletaId = e.dataTransfer.getData("atletaId");
        if (!atletaId) return;

        // Validation: Cannot be same athlete in both slots
        if (slot === 'A' && newMatch.atleta_b_id === atletaId) return alert("O mesmo atleta não pode estar nos dois corners!");
        if (slot === 'B' && newMatch.atleta_a_id === atletaId) return alert("O mesmo atleta não pode estar nos dois corners!");

        setNewMatch(prev => ({
            ...prev,
            [slot === 'A' ? 'atleta_a_id' : 'atleta_b_id']: atletaId
        }));
    };

    const bookedIds = matches
        .filter(m => m.id !== editingMatchId)
        .flatMap(m => [m.atleta_a_id, m.atleta_b_id]);

    // Grouping Athletes Logic
    const groupedAthletes = React.useMemo(() => {
        const available = inscritos.filter(i =>
            // Only show approved/paid athletes? Or all? Usually confirmed ones.
            (i.status === 'aprovado' || i.status === 'pago') &&
            !bookedIds.includes(i.atletas.id) &&
            i.atletas.id != newMatch.atleta_a_id &&
            i.atletas.id != newMatch.atleta_b_id
        );

        const groups = {};
        available.forEach(insc => {
            const catName = insc.eventos_categorias?.nome || 'Sem Categoria';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(insc);
        });

        // Sort by experience within groups
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => getAthleteFightCount(b.atletas) - getAthleteFightCount(a.atletas));
        });

        return groups;
    }, [inscritos, bookedIds, newMatch]);



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
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Localização</label>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Cidade (ex: São Paulo)"
                                                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                                value={newEvent.cidade || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, cidade: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <select
                                                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                                value={newEvent.estado || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, estado: e.target.value })}
                                            >
                                                <option value="">Estado</option>
                                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                    <option key={uf} value={uf}>{uf}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-4 mt-2">
                                            <input
                                                type="text"
                                                placeholder="Endereço Completo (ex: Rua Augusta, 1500 - Cerqueira César)"
                                                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                                value={newEvent.endereco || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, endereco: e.target.value })}
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Este endereço será usado para gerar o botão "Ver no Mapa".</p>
                                        </div>
                                    </div>
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
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={tempCategory.nome}
                                            onChange={e => setTempCategory({ ...tempCategory, nome: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                            placeholder="Nome da Categoria (Ex: Peso Leve)"
                                            onKeyDown={e => e.key === 'Enter' && addCategory()}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            value={tempCategory.preco || ''}
                                            onChange={e => setTempCategory({ ...tempCategory, preco: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                            placeholder="R$ 0,00"
                                            onKeyDown={e => e.key === 'Enter' && addCategory()}
                                        />
                                    </div>
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
                                            <span className="text-white font-bold text-sm">
                                                {cat.nome}
                                                {cat.preco > 0 && <span className="text-green-500 ml-2">R$ {cat.preco}</span>}
                                            </span>
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
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">

                            {/* LEFT: ATHLETE POOL (4 COLS) */}
                            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
                                <div className="p-4 bg-slate-950 border-b border-slate-800">
                                    <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                                        <Users size={16} className="text-purple-500" /> Atletas Confirmados
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-1">Arraste os atletas para montar as lutas</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                                    {Object.keys(groupedAthletes).length === 0 && (
                                        <div className="text-center py-10 text-slate-500 text-xs">
                                            Nenhum atleta disponível.
                                        </div>
                                    )}

                                    {Object.entries(groupedAthletes).map(([category, athletes]) => (
                                        <div key={category} className="mb-4">
                                            <h4 className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/50 p-2 rounded mb-2 flex justify-between">
                                                {category} <span className="text-white">{athletes.length}</span>
                                            </h4>
                                            <div className="space-y-2">
                                                {athletes.map(insc => (
                                                    <div
                                                        key={insc.atletas.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, insc.atletas.id)}
                                                        className="bg-black border border-slate-800 p-2 rounded flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-purple-500 transition group"
                                                    >
                                                        <img src={insc.atletas.foto_url || "https://placehold.co/100"} className="w-8 h-8 rounded-full bg-slate-800 object-cover" draggable={false} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-white text-xs font-bold truncate">{insc.atletas.nome}</div>
                                                            <div className="text-[10px] text-slate-500 flex justify-between">
                                                                <span className="text-purple-400 font-bold">{getRankFromLevel(insc.atletas.level)}</span>
                                                                <span className="text-slate-600 font-mono">{getAthleteFightCount(insc.atletas)} Lutas</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-slate-600 group-hover:text-purple-500">
                                                            <Users size={14} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT: MATCH BUILDER (8 COLS) */}
                            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">

                                {/* ACTIVE BUILDER CARD */}
                                <div className={`shrink-0 p-6 rounded-xl border-2 transition-colors ${editingMatchId ? 'bg-purple-900/10 border-purple-500' : 'bg-slate-900 border-slate-800 border-dashed'}`}>
                                    <h3 className={`font-bold uppercase mb-6 flex items-center justify-center gap-2 ${editingMatchId ? 'text-purple-400' : 'text-slate-400'}`}>
                                        <Swords size={20} />
                                        {editingMatchId ? 'Editando Luta' : 'Novo Confronto'}
                                    </h3>

                                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center">

                                        {/* RED CORNER SLOT */}
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'A')}
                                            className={`flex-1 w-full relative min-h-[160px] rounded-xl border-2 flex flex-col items-center justify-center p-4 transition-all
                                                ${newMatch.atleta_a_id ? 'bg-red-900/20 border-red-600' : 'bg-slate-950 border-slate-800 border-dashed hover:border-red-500/50 hover:bg-red-900/5'}`}
                                        >
                                            <span className="absolute top-2 left-3 text-[10px] font-bold uppercase text-red-500 tracking-widest">Red Corner</span>

                                            {newMatch.atleta_a_id ? (() => {
                                                // Find athlete details (can be in inscritos or matches if editing)
                                                // If editing, matches already has full athlete object. If new, in inscritos.
                                                // We need a stable lookup.
                                                const atleta = inscritos.find(i => i.atletas.id == newMatch.atleta_a_id)?.atletas
                                                    // Fallback for when editing and athlete might not be in the 'filtered' list? No, should be in inscritos always.
                                                    || (editingMatchId && matches.find(m => m.id === editingMatchId)?.atleta_a);

                                                return atleta ? (
                                                    <div className="text-center animate-zoomIn">
                                                        <div className="relative inline-block">
                                                            <img src={atleta.foto_url} className="w-16 h-16 rounded-full border-2 border-red-500 object-cover mb-2" />
                                                            <button onClick={() => setNewMatch(prev => ({ ...prev, atleta_a_id: '' }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition"><X size={10} /></button>
                                                        </div>
                                                        <div className="font-bold text-white text-lg leading-none">{atleta.nome}</div>
                                                        <div className="text-xs text-red-400 font-bold uppercase mt-1">{atleta.team || 'Sem Equipe'}</div>
                                                    </div>
                                                ) : <Loader2 className="animate-spin text-red-500" />
                                            })() : (
                                                <div className="text-center text-slate-600 pointer-events-none">
                                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs font-bold uppercase">Arraste o Atleta A</p>
                                                </div>
                                            )}

                                            {editingMatchId && (
                                                <div className="absolute bottom-2 right-2">
                                                    <input type="number" placeholder="Penalidade" value={newMatch.penalidade_a || 0} onChange={e => setNewMatch({ ...newMatch, penalidade_a: e.target.value })} className="w-16 bg-black/50 border border-red-900/50 rounded text-center text-xs text-red-200 p-1" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-3xl font-black text-slate-700 italic">VS</div>

                                        {/* BLUE CORNER SLOT */}
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'B')}
                                            className={`flex-1 w-full relative min-h-[160px] rounded-xl border-2 flex flex-col items-center justify-center p-4 transition-all
                                                ${newMatch.atleta_b_id ? 'bg-blue-900/20 border-blue-600' : 'bg-slate-950 border-slate-800 border-dashed hover:border-blue-500/50 hover:bg-blue-900/5'}`}
                                        >
                                            <span className="absolute top-2 right-3 text-[10px] font-bold uppercase text-blue-500 tracking-widest">Blue Corner</span>

                                            {newMatch.atleta_b_id ? (() => {
                                                const atleta = inscritos.find(i => i.atletas.id == newMatch.atleta_b_id)?.atletas
                                                    || (editingMatchId && matches.find(m => m.id === editingMatchId)?.atleta_b);

                                                return atleta ? (
                                                    <div className="text-center animate-zoomIn">
                                                        <div className="relative inline-block">
                                                            <img src={atleta.foto_url} className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover mb-2" />
                                                            <button onClick={() => setNewMatch(prev => ({ ...prev, atleta_b_id: '' }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition"><X size={10} /></button>
                                                        </div>
                                                        <div className="font-bold text-white text-lg leading-none">{atleta.nome}</div>
                                                        <div className="text-xs text-blue-400 font-bold uppercase mt-1">{atleta.team || 'Sem Equipe'}</div>
                                                    </div>
                                                ) : <Loader2 className="animate-spin text-blue-500" />
                                            })() : (
                                                <div className="text-center text-slate-600 pointer-events-none">
                                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs font-bold uppercase">Arraste o Atleta B</p>
                                                </div>
                                            )}

                                            {editingMatchId && (
                                                <div className="absolute bottom-2 left-2">
                                                    <input type="number" placeholder="Penalidade" value={newMatch.penalidade_b || 0} onChange={e => setNewMatch({ ...newMatch, penalidade_b: e.target.value })} className="w-16 bg-black/50 border border-blue-900/50 rounded text-center text-xs text-blue-200 p-1" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4 mt-6">
                                        {editingMatchId && <button onClick={handleCancelEdit} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2">Cancelar</button>}
                                        <button
                                            onClick={handleCreateMatch}
                                            disabled={!newMatch.atleta_a_id || !newMatch.atleta_b_id}
                                            className={`${editingMatchId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-purple-600 hover:bg-purple-500'} text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all`}
                                        >
                                            {editingMatchId ? 'Salvar Edição' : 'Confirmar Luta'}
                                        </button>
                                    </div>
                                </div>

                                {/* MATCHES LIST */}
                                <h3 className="text-white font-bold uppercase text-sm border-b border-slate-800 pb-2">Card de Lutas ({matches.length})</h3>
                                <div className="space-y-3 pb-20">
                                    {matches.map((fight, idx) => {
                                        const inscA = inscritos.find(i => i.atleta_id == fight.atleta_a_id) || { atletas: fight.atleta_a, eventos_categorias: { nome: '?' } };
                                        const inscB = inscritos.find(i => i.atleta_id == fight.atleta_b_id) || { atletas: fight.atleta_b, eventos_categorias: { nome: '?' } };

                                        return (
                                            <div key={fight.id} className="relative bg-black border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-4 group hover:border-slate-600 transition">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
                                                    Luta {idx + 1} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {inscA.eventos_categorias?.nome || 'Peso Combinado'}
                                                </div>

                                                {(() => {
                                                    const winnerId = String(fight.vencedor_id); // Loose compare safety
                                                    const idA = String(fight.atleta_a_id);
                                                    const idB = String(fight.atleta_b_id);
                                                    const hasResult = !!fight.vencedor_id;
                                                    const isWinA = hasResult && winnerId === idA;
                                                    const isWinB = hasResult && winnerId === idB;

                                                    return (
                                                        <div className="flex items-center justify-between w-full px-4 md:px-10">
                                                            <div className={`text-center w-5/12 transition-all p-2 rounded ${isWinA ? 'bg-green-900/10 ring-1 ring-green-500/50' : hasResult ? 'opacity-40 grayscale' : ''}`}>
                                                                <div className={`font-bold truncate text-base ${isWinA ? 'text-green-400' : 'text-white'}`}>
                                                                    {fight.atleta_a?.nome}
                                                                </div>
                                                                {isWinA && <div className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded-full w-fit mx-auto mt-1 uppercase">Vencedor</div>}
                                                                <div className="text-red-500 text-[10px] font-bold uppercase mt-1">Red Corner</div>
                                                            </div>

                                                            <div className="text-slate-700 font-black text-xl italic">VS</div>

                                                            <div className={`text-center w-5/12 transition-all p-2 rounded ${isWinB ? 'bg-green-900/10 ring-1 ring-green-500/50' : hasResult ? 'opacity-40 grayscale' : ''}`}>
                                                                <div className={`font-bold truncate text-base ${isWinB ? 'text-green-400' : 'text-white'}`}>
                                                                    {fight.atleta_b?.nome}
                                                                </div>
                                                                {isWinB && <div className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded-full w-fit mx-auto mt-1 uppercase">Vencedor</div>}
                                                                <div className="text-blue-500 text-[10px] font-bold uppercase mt-1">Blue Corner</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                    <button onClick={() => handleEditMatch(fight)} className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded hover:bg-slate-700"><Pencil size={14} /></button>
                                                    <button onClick={() => handleDeleteMatch(fight.id)} className="p-2 bg-slate-800 text-red-500 hover:text-red-400 rounded hover:bg-slate-700"><Trash2 size={14} /></button>
                                                </div>

                                                <div className="w-full">
                                                    <AdminFightControl fight={fight} onUpdate={fetchMatches} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB: CONFIGURAÇÕES */}
                    {tabManager === 'config' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl mx-auto animate-fadeIn">
                            <h3 className="font-bold text-white text-lg uppercase mb-6 flex items-center gap-2">
                                <Pencil size={20} className="text-purple-500" /> Editar Evento
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Evento</label>
                                    <input
                                        type="text"
                                        value={selectedEvent.nome}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, nome: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data</label>
                                        <input
                                            type="date"
                                            value={selectedEvent.data_evento || ''}
                                            onChange={(e) => setSelectedEvent({ ...selectedEvent, data_evento: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Modalidade</label>
                                        <select
                                            value={selectedEvent.modalidade}
                                            onChange={(e) => setSelectedEvent({ ...selectedEvent, modalidade: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                        >
                                            {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Localização</label>
                                    <input
                                        type="text"
                                        value={selectedEvent.localizacao || ''}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, localizacao: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link de Pagamento</label>
                                    <div className="flex bg-slate-950 border border-slate-800 rounded p-3 items-center gap-2">
                                        <DollarSign size={16} className="text-green-500" />
                                        <input
                                            type="text"
                                            value={selectedEvent.link_pagamento || ''}
                                            onChange={(e) => setSelectedEvent({ ...selectedEvent, link_pagamento: e.target.value })}
                                            className="w-full bg-transparent border-none text-white focus:ring-0 p-0 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Banner URL</label>
                                    <input
                                        type="text"
                                        value={selectedEvent.banner_url || ''}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, banner_url: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
                                <button
                                    onClick={async () => {
                                        if (!confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) return;
                                        const { error } = await supabase.from('eventos').delete().eq('id', selectedEvent.id);
                                        if (error) {
                                            alert("Erro ao excluir: " + error.message);
                                        } else {
                                            alert("Evento excluído com sucesso.");
                                            setSelectedEvent(null);
                                            setView('list');
                                            fetchEvents();
                                        }
                                    }}
                                    className="text-red-500 hover:bg-red-900/20 px-4 py-2 rounded text-xs font-bold uppercase transition flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Excluir Evento
                                </button>
                                <button
                                    onClick={async () => {
                                        setSubmitting(true);
                                        const { error } = await supabase.from('eventos').update({
                                            nome: selectedEvent.nome,
                                            data_evento: selectedEvent.data_evento,
                                            localizacao: selectedEvent.localizacao,
                                            modalidade: selectedEvent.modalidade,
                                            link_pagamento: selectedEvent.link_pagamento,
                                            banner_url: selectedEvent.banner_url
                                        }).eq('id', selectedEvent.id);

                                        setSubmitting(false);
                                        if (error) alert("Erro ao salvar: " + error.message);
                                        else {
                                            alert("Evento atualizado!");
                                            fetchEvents(); // Refresh list in background
                                        }
                                    }}
                                    disabled={submitting}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold uppercase text-sm tracking-wide transition flex items-center gap-2"
                                >
                                    {/* {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />} Salvar Alterações */}
                                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />} Salvar Alterações
                                </button>
                            </div>
                        </div>
                    )}      </div >
            )
            }
        </div >
    );
}
