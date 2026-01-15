'use client';
export const runtime = 'edge';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, Trophy, Users, Shield, CheckCircle, AlertTriangle, ArrowRight, Swords, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function EventPage() {
    const params = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [athleteProfile, setAthleteProfile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [myRegistration, setMyRegistration] = useState(null);
    const [confirmedAthletes, setConfirmedAthletes] = useState([]);
    const [matches, setMatches] = useState([]);
    const [debugError, setDebugError] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalToken, setApprovalToken] = useState('');

    useEffect(() => {
        if (params?.slug) {
            fetchEventData();
            checkUser();
        }
    }, [params?.slug]);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            // Fetch * to avoid missing column errors
            const { data, error } = await supabase.from('atletas').select('*').eq('user_id', user.id).single();

            if (data) {
                setAthleteProfile(data);
                // Checar se já está inscrito
                if (event) checkRegistration(event.id, data.id);
            } else if (error) {
                console.log("Erro ao buscar perfil:", error);
            }
        }
    }

    async function checkRegistration(eventoId, atletaId) {
        const { data } = await supabase.from('eventos_inscricoes').select('*').eq('evento_id', eventoId).eq('atleta_id', atletaId).single();
        if (data) setMyRegistration(data);
    }

    async function fetchEventData() {
        setLoading(true);
        // 1. Fetch Event
        const { data: eventData, error } = await supabase
            .from('eventos')
            .select(`
                *,
                eventos_categorias (*)
            `)
            .eq('slug', params.slug)
            .single();

        if (eventData) {
            setEvent(eventData);

            // 2. Fetch Inscriptions (Flat)
            const { data: rawInscricoes, error: inscError } = await supabase
                .from('eventos_inscricoes')
                .select('*')
                .eq('evento_id', eventData.id);

            if (rawInscricoes && rawInscricoes.length > 0) {
                // 3. Manual Fetch of Athletes
                const athleteIds = rawInscricoes.map(i => i.atleta_id).filter(Boolean);
                const { data: athletesData } = await supabase
                    .from('atletas')
                    .select('id, nome, apelido, foto_url, team, level') // Fetch necessary fields
                    .in('id', athleteIds);

                // 4. Merge Data (Create Enriched Inscriptions)
                const enrichedInscricoes = rawInscricoes.map(insc => ({
                    ...insc,
                    atletas: athletesData?.find(a => a.id == insc.atleta_id) || {},
                    eventos_categorias: eventData.eventos_categorias?.find(c => c.id == insc.categoria_id) || {}
                }));

                // Set Confirmed Athletes List
                const confirmed = enrichedInscricoes.filter(i => ['pago', 'confirmado', 'aprovado'].includes(i.status));
                setConfirmedAthletes(confirmed);


                // 5. Fetch Matches
                const { data: lutas } = await supabase
                    .from('eventos_lutas')
                    .select('*')
                    .eq('evento_id', eventData.id);

                if (lutas && lutas.length > 0) {
                    // Fetch Athletes specifically for matches (Safety Fallback)
                    const matchAthleteIds = [...new Set(lutas.flatMap(m => [m.atleta_a_id, m.atleta_b_id]))].filter(Boolean);
                    console.log("DEBUG Match IDs:", matchAthleteIds);

                    // Attempt Standard Fetch
                    const { data: matchAthletes, error: athError } = await supabase
                        .from('atletas')
                        .select('*') // Changed to * to avoid missing column errors
                        .in('id', matchAthleteIds);

                    if (athError) {
                        console.error("Error fetching match athletes:", athError);
                    }

                    const enrichedMatches = lutas.map(match => {
                        // Find athlete details directly
                        let athleteA = matchAthletes?.find(a => a.id == match.atleta_a_id);
                        let athleteB = matchAthletes?.find(a => a.id == match.atleta_b_id); // using == for loose string/int matching

                        if (!athleteA) console.warn("Missing Atleta A for match:", match.id, match.atleta_a_id);

                        // Find category via inscription via enrichedInscricoes (fallback)
                        const inscA = enrichedInscricoes.find(i => i.atleta_id == match.atleta_a_id);

                        return {
                            ...match,
                            atleta_a: athleteA,
                            atleta_b: athleteB,
                            categoria_nome: inscA?.eventos_categorias?.nome,
                            equipe_a: athleteA?.team,
                            equipe_b: athleteB?.team
                        };
                    });
                    setMatches(enrichedMatches);
                } else {
                    setMatches([]);
                }
            } else {
                setConfirmedAthletes([]);
                setMatches([]);
            }

            if (user && athleteProfile) checkRegistration(eventData.id, athleteProfile.id);
        }
        setLoading(false);
    }

    const handleRegister = async () => {
        if (!user) return window.location.href = '/login';
        if (!athleteProfile) return alert('Você precisa de um perfil de atleta para se inscrever.');
        if (!selectedCategory) return alert('Selecione uma categoria.');
        if (myRegistration) return alert('Você já está inscrito neste evento.');

        setRegistering(true);

        // Generate Token
        // Using Date.now + random for simple uniqueness without uuid lib dependency in client
        const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setApprovalToken(token);

        const { error } = await supabase
            .from('eventos_inscricoes')
            .insert([{
                evento_id: event.id,
                atleta_id: athleteProfile.id,
                categoria_id: selectedCategory,
                status: 'aguardando_aprovacao', // NEW STATUS
                dados_inscricao: {
                    equipe: athleteProfile.team,
                    level_no_momento: athleteProfile.level,
                    approval_token: token // SAVE TOKEN
                }
            }]);

        if (error) {
            alert('Erro ao inscrever: ' + error.message);
        } else {
            // Success! Show Modal
            setShowApprovalModal(true);
            checkRegistration(event.id, athleteProfile.id);
        }
        setRegistering(false);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando evento...</div>;
    if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Evento não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
            {/* HERO BANNER */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                {event.banner_url ? (
                    <img src={event.banner_url} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Trophy size={64} className="text-slate-800" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                    <div className="max-w-7xl mx-auto">
                        <span className="inline-block px-3 py-1 bg-purple-600/90 backdrop-blur text-white text-xs font-bold uppercase rounded mb-4 shadow-lg shadow-purple-600/20">
                            {event.modalidade}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight mb-4 text-white drop-shadow-xl">{event.nome}</h1>
                        <div className="flex flex-wrap gap-6 text-sm md:text-base font-bold text-slate-300">
                            <div className="flex items-center text-slate-300 mt-2">
                                <Calendar className="text-purple-500 mr-2" size={20} />
                                <span>{new Date(event.data_evento).toLocaleDateString()}</span>
                            </div>

                            {/* LOCATION */}
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center text-slate-300">
                                    <MapPin className="text-purple-500 mr-2" size={20} />
                                    <span>{event.localizacao?.split('•')[0].trim()}</span>
                                </div>
                                {event.localizacao?.includes('•') && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.localizacao.split('•')[1].trim() + ", " + event.localizacao.split('•')[0].trim())}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-purple-400 hover:text-purple-300 ml-7 flex items-center gap-1 uppercase font-bold"
                                    >
                                        <ArrowRight size={12} /> Ver no Mapa
                                    </a>
                                )}
                            </div>
                            <span className="flex items-center gap-2"><Users className="text-purple-500" size={18} /> {confirmedAthletes.length} Confirmados</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">

                {/* LEFT CONTENT (8) */}
                <div className="lg:col-span-8 space-y-12">

                    {/* INSCRIPTION CARD */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/20 transition duration-1000"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-display font-bold uppercase mb-6 flex items-center gap-2">
                                <Shield className="text-purple-500" /> Inscrição
                            </h2>

                            {myRegistration ? (
                                <div className={`p-6 rounded-xl border ${myRegistration.status === 'pago' ? 'bg-green-900/20 border-green-500/50' : 'bg-yellow-900/20 border-yellow-500/50'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        {myRegistration.status === 'pago' ? <CheckCircle className="text-green-500" size={32} /> : <AlertTriangle className="text-yellow-500" size={32} />}
                                        <div>
                                            <h3 className="font-bold text-lg uppercase">{myRegistration.status === 'pago' ? 'Inscrição Confirmada' : 'Aguardando Pagamento'}</h3>
                                            <p className="text-sm opacity-80">Você já está inscrito neste evento.</p>
                                        </div>
                                    </div>
                                    {/* STATUS BUTTONS (Existing logic or fallback) */}
                                    {event.link_pagamento && myRegistration.status !== 'pago' && myRegistration.status !== 'aguardando_aprovacao' && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <a href={event.link_pagamento} target="_blank" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold uppercase text-sm no-underline shadow-lg shadow-green-600/20 transition transform hover:scale-105">
                                                Pagar Agora <ArrowRight size={16} />
                                            </a>
                                        </div>
                                    )}
                                </div>

                            ) : (
                                <div className="space-y-6">
                                    {!user ? (
                                        <div className="text-center py-8">
                                            <p className="text-slate-400 mb-4">Você precisa estar logado para se inscrever.</p>
                                            <Link href="/login" className="inline-block bg-white text-black px-8 py-3 rounded font-bold uppercase hover:bg-slate-200 transition">
                                                Fazer Login
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Selecione sua Categoria</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                                    {event.eventos_categorias?.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setSelectedCategory(cat.id)}
                                                            className={`p-4 rounded border text-left transition-all ${selectedCategory === cat.id
                                                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/25'
                                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                                                                }`}
                                                        >
                                                            <span className="block font-bold text-sm uppercase">{cat.nome}</span>
                                                            <span className="text-[10px] opacity-70 uppercase">{cat.tipo}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                                <div className="hidden md:block">
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Atleta</p>
                                                    <p className="text-white font-bold">{athleteProfile?.apelido || athleteProfile?.nome}</p>
                                                </div>
                                                <button
                                                    onClick={handleRegister}
                                                    disabled={registering || !selectedCategory}
                                                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded font-display font-bold uppercase text-lg tracking-wide shadow-xl shadow-purple-600/20 hover:scale-105 transition-all"
                                                >
                                                    {registering ? 'Processando...' : 'Confirmar Inscrição'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* APPROVAL MODAL */}
                    {showApprovalModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-zoomIn">
                                <button onClick={() => setShowApprovalModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><Users size={20} /></button> // Using Users icon as generic close for now or just X if imported, I'll use text

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                                        <Shield size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white uppercase mb-2">Aprovação Necessária</h3>
                                    <p className="text-slate-400 text-sm">Para confirmar sua vaga, seu professor precisa autorizar sua luta.</p>
                                </div>

                                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 mb-6">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Link de Aprovação</p>
                                    <code className="block bg-slate-950 p-3 rounded text-purple-400 text-xs break-all border border-slate-800">
                                        {`${window.location.origin}/aprovar/${approvalToken}`}
                                    </code>
                                </div>

                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Professor, fiz minha inscrição no evento *${event.nome}*. Preciso que você aprove para eu lutar. Clica no link aí: ${window.location.origin}/aprovar/${approvalToken}`)}`}
                                    target="_blank"
                                    className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold uppercase text-center shadow-lg shadow-green-900/20 transition hover:scale-[1.02] flex items-center justify-center gap-2"
                                    onClick={() => setShowApprovalModal(false)}
                                >
                                    <MessageCircle size={20} /> Enviar para o Mestre
                                </a>
                                <button onClick={() => setShowApprovalModal(false)} className="w-full text-slate-500 text-xs font-bold uppercase mt-4 hover:text-white">Agora não</button>
                            </div>
                        </div>
                    )}

                    {/* FIGHT CARD */}
                    {matches.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-2 text-white">
                                <Swords className="text-purple-500" /> Card de Lutas
                            </h2>
                            <div className="grid gap-4">
                                {matches.map((fight, idx) => (
                                    <div key={fight.id} className="relative bg-black border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden group hover:border-slate-700 transition">
                                        <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-600 uppercase">Luta {idx + 1} • {fight.categoria_nome || 'Peso Combinado'}</div>

                                        {/* RED CORNER */}
                                        <div className={`flex items-center gap-3 w-full md:w-5/12 justify-start md:justify-end ${fight.vencedor_id === fight.atleta_a_id ? 'opacity-100' : fight.vencedor_id ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="text-right">
                                                <div className="text-white font-bold text-lg leading-none">{fight.atleta_a?.nome || 'Atleta A'}</div>
                                                {fight.atleta_a?.apelido && <div className="text-slate-400 text-sm font-medium">"{fight.atleta_a.apelido}"</div>}
                                                <div className="text-xs text-slate-500 mb-1">{fight.equipe_a || fight.atleta_a?.equipe || fight.atleta_a?.team || 'Sem Equipe'}</div>

                                                <div className="flex justify-end gap-2 items-center">
                                                    {fight.penalidade_a > 0 && <span className="text-[10px] bg-red-900/50 text-red-500 px-1 rounded border border-red-900 mx-1">-{fight.penalidade_a} pts</span>}
                                                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-950/30 px-2 rounded">Red Corner</div>
                                                </div>
                                            </div>
                                            {/* Highlight Winner Border */}
                                            <img
                                                src={fight.atleta_a?.foto_url || "https://placehold.co/100"}
                                                className={`w-16 h-16 rounded-full object-cover bg-slate-800 shadow-lg ${fight.vencedor_id === fight.atleta_a_id ? 'border-4 border-green-500 shadow-green-900/50' : 'border-4 border-red-600 shadow-red-900/20'}`}
                                            />
                                        </div>

                                        {/* CENTER VS */}
                                        <div className="text-center w-full md:w-2/12 relative z-10 pt-4 md:pt-0">
                                            {fight.status === 'finalizada' ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg shadow-green-600/20 mb-1">Vencedor</span>
                                                    {fight.vencedor_id === fight.atleta_a_id ? <span className="text-xs font-bold text-red-500">RED CORNER</span> : <span className="text-xs font-bold text-blue-500">BLUE CORNER</span>}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-display font-bold text-3xl text-slate-700 italic">VS</span>
                                                    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-1">NOCAUTE</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* BLUE CORNER */}
                                        <div className={`flex items-center gap-3 w-full md:w-5/12 justify-start ${fight.vencedor_id === fight.atleta_b_id ? 'opacity-100' : fight.vencedor_id ? 'opacity-40 grayscale' : ''}`}>
                                            <img
                                                src={fight.atleta_b?.foto_url || "https://placehold.co/100"}
                                                className={`w-16 h-16 rounded-full object-cover bg-slate-800 shadow-lg ${fight.vencedor_id === fight.atleta_b_id ? 'border-4 border-green-500 shadow-green-900/50' : 'border-4 border-blue-600 shadow-blue-900/20'}`}
                                            />
                                            <div>
                                                <div className="text-white font-bold text-lg leading-none">{fight.atleta_b?.nome || 'Atleta B'}</div>
                                                {fight.atleta_b?.apelido && <div className="text-slate-400 text-sm font-medium">"{fight.atleta_b.apelido}"</div>}
                                                <div className="text-xs text-slate-500 mb-1">{fight.equipe_b || fight.atleta_b?.equipe || fight.atleta_b?.team || 'Sem Equipe'}</div>

                                                <div className="flex justify-start gap-2 items-center">
                                                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider bg-blue-950/30 px-2 rounded">Blue Corner</div>
                                                    {fight.penalidade_b > 0 && <span className="text-[10px] bg-red-900/50 text-red-500 px-1 rounded border border-red-900 mx-1">-{fight.penalidade_b} pts</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT SIDEBAR (4) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* START LIST */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="font-display font-bold uppercase text-xl text-white mb-6 flex items-center gap-2">
                            <Trophy size={20} className="text-yellow-500" /> Start List
                        </h3>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {confirmedAthletes.length === 0 ? (
                                <p className="text-slate-500 text-sm italic">Nenhum atleta confirmado ainda.</p>
                            ) : (
                                confirmedAthletes.map(insc => (
                                    <div key={insc.id} className="flex items-center gap-3 p-3 bg-black/40 border border-slate-800 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
                                            <img src={insc.atletas?.foto_url || "https://placehold.co/100"} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{insc.atletas?.apelido || insc.atletas?.nome}</h4>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{insc.eventos_categorias?.nome}</p>
                                        </div>
                                        {/* Rank Display could go here */}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="font-display font-bold uppercase text-lg text-white mb-4">Cronograma</h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-slate-800">
                            <div className="relative pl-8">
                                <span className="absolute left-0 top-1 w-4 h-4 bg-purple-600 rounded-full border-4 border-[#0c0c0c]"></span>
                                <p className="text-white font-bold text-sm">Pesagem</p>
                                <p className="text-slate-500 text-xs">08:00 - 09:00</p>
                            </div>
                            <div className="relative pl-8">
                                <span className="absolute left-0 top-1 w-4 h-4 bg-slate-700 rounded-full border-4 border-[#0c0c0c]"></span>
                                <p className="text-white font-bold text-sm">Início das Lutas</p>
                                <p className="text-slate-500 text-xs">10:00</p>
                            </div>
                            <div className="relative pl-8">
                                <span className="absolute left-0 top-1 w-4 h-4 bg-slate-700 rounded-full border-4 border-[#0c0c0c]"></span>
                                <p className="text-white font-bold text-sm">Finais</p>
                                <p className="text-slate-500 text-xs">16:00 (Previsto)</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
