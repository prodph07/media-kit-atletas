import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, Trophy, Swords, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabEventosAtleta({ athleteId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (athleteId) fetchMyEvents();
    }, [athleteId]);

    const fetchMyEvents = async () => {
        setLoading(true);
        try {
            // 1. Fetch Inscriptions
            const { data: inscricoes, error: inscError } = await supabase
                .from('eventos_inscricoes')
                .select(`
                    *,
                    eventos (*),
                    eventos_categorias (*)
                `)
                .eq('atleta_id', athleteId);

            if (inscError) throw inscError;

            // 2. Fetch My Matches (Lutas)
            // Filter matches where I am A or B
            const { data: lutas, error: lutasError } = await supabase
                .from('eventos_lutas')
                .select('*')
                .or(`atleta_a_id.eq.${athleteId},atleta_b_id.eq.${athleteId}`);

            if (lutasError) throw lutasError;

            // 3. Enrich Matches with Opponent Data
            const opponentIds = lutas.flatMap(l => {
                const oppId = l.atleta_a_id == athleteId ? l.atleta_b_id : l.atleta_a_id;
                return oppId ? [oppId] : [];
            });

            let opponentMap = {};
            if (opponentIds.length > 0) {
                const { data: opponents } = await supabase
                    .from('atletas')
                    .select('id, nome, apelido, foto_url, team')
                    .in('id', opponentIds);

                if (opponents) {
                    opponents.forEach(o => opponentMap[o.id] = o);
                }
            }

            // 4. Merge Data
            const enrichedEvents = inscricoes.map(insc => {
                const myMatches = lutas.filter(l => l.evento_id === insc.evento_id).map(l => {
                    const isA = l.atleta_a_id == athleteId;
                    const opponentId = isA ? l.atleta_b_id : l.atleta_a_id;
                    const opponent = opponentMap[opponentId];
                    return { ...l, opponent, isA, isB: !isA };
                });

                return {
                    ...insc,
                    matches: myMatches
                };
            });

            setEvents(enrichedEvents);

        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pago': return <span className="bg-green-900/30 text-green-500 border border-green-900/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle size={10} /> Confirmado</span>;
            case 'aprovado': return <span className="bg-blue-900/30 text-blue-500 border border-blue-900/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle size={10} /> Aprovado</span>;
            case 'pendente': return <span className="bg-yellow-900/30 text-yellow-500 border border-yellow-900/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1"><Clock size={10} /> Pendente</span>;
            default: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{status}</span>;
        }
    };

    if (loading) return <div className="text-white text-center p-10 animate-pulse">Carregando eventos...</div>;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-3xl text-white uppercase">Meus Eventos</h2>
                <div className="text-sm text-slate-500 font-bold uppercase">{events.length} Inscrições</div>
            </div>

            {events.length === 0 ? (
                <div className="bg-[#161616] border border-slate-800 rounded-lg p-10 text-center">
                    <Trophy className="mx-auto text-slate-700 mb-4" size={48} />
                    <h3 className="text-white font-bold text-lg mb-2">Nenhum evento encontrado</h3>
                    <p className="text-slate-500 text-sm">Você ainda não se inscreveu em nenhum evento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map((item) => (
                        <div key={item.id} className="bg-[#161616] border border-slate-800 rounded-lg overflow-hidden group hover:border-slate-700 transition">
                            {/* EVENT HEADER */}
                            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                        {item.eventos?.banner_url ? (
                                            <img src={item.eventos.banner_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-display font-bold text-2xl">EV</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-display font-bold text-xl uppercase mb-1">{item.eventos?.nome}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase">
                                            <div className="flex items-center gap-1"><Calendar size={12} /> {item.eventos?.data_evento || 'Data a definir'}</div>
                                            <div className="flex items-center gap-1"><MapPin size={12} /> {item.eventos?.local || 'Local a definir'}</div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            {getStatusBadge(item.status)}
                                            <span className="text-slate-500 text-[10px] font-bold uppercase border border-slate-800 px-2 py-0.5 rounded">Categoria: {item.eventos_categorias?.nome || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={`/eventos/${item.eventos?.slug}`} target="_blank" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">
                                        Ver Página Pública
                                    </a>
                                </div>
                            </div>

                            {/* MY KEY / MATCHES */}
                            <div className="p-4 bg-black/50">
                                <h4 className="text-slate-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <Swords size={12} className="text-[#FF4500]" /> Minha Chave / Confrontos
                                </h4>

                                {item.matches && item.matches.length > 0 ? (
                                    <div className="space-y-3">
                                        {item.matches.map(match => (
                                            <div key={match.id} className="bg-slate-900/50 border border-slate-800 rounded p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-500 font-display font-bold italic text-lg">VS</span>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={match.opponent?.foto_url || 'https://placehold.co/100'}
                                                            className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-slate-700"
                                                        />
                                                        <div>
                                                            <div className="text-white font-bold text-sm leading-none">{match.opponent?.nome || 'A definir'}</div>
                                                            <div className="text-slate-500 text-[10px] uppercase font-bold mt-1">{match.opponent?.team || 'Sem Equipe'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {match.vencedor_id ? (
                                                        match.vencedor_id == athleteId ? (
                                                            <span className="text-green-500 font-bold text-xs uppercase border border-green-900 bg-green-900/20 px-2 py-1 rounded">Vitória</span>
                                                        ) : (
                                                            <span className="text-red-500 font-bold text-xs uppercase border border-red-900 bg-red-900/20 px-2 py-1 rounded">Derrota</span>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-400 font-bold text-xs uppercase border border-slate-800 bg-slate-800/50 px-2 py-1 rounded">Agendada</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-600 text-xs font-bold uppercase bg-slate-900/30 p-3 rounded border border-slate-800 border-dashed text-center">
                                        Nenhuma luta casada ainda. Aguarde a definição das chaves.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
