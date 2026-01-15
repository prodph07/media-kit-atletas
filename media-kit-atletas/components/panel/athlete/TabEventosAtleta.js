import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, Swords, Trophy, Medal, AlertCircle, Share2, ImageIcon, Loader2, DollarSign, Copy, X, AlertTriangle } from 'lucide-react';
import FightCardGenerator from '../event/FightCardGenerator';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabEventosAtleta({ atletaId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cardGeneratorData, setCardGeneratorData] = useState(null); // { eventName, date, category, athleteA, athleteB }





    useEffect(() => {
        if (atletaId) fetchMyEvents();
    }, [atletaId]);

    const fetchMyEvents = async () => {
        setLoading(true);
        // 1. Fetch Inscriptions
        const { data: inscricoes, error } = await supabase
            .from('eventos_inscricoes')
            .select(`
                *,
                evento:eventos ( * ),
                categoria:eventos_categorias ( * )
            `)
            .eq('atleta_id', atletaId);

        if (error) {
            console.error("Erro ao buscar eventos:", error);
            setLoading(false);
            return;
        }

        // 2. For each event, check if there are matches (fights)
        const enrichedEvents = await Promise.all(inscricoes.map(async (ins) => {
            const { data: matches } = await supabase
                .from('eventos_lutas')
                .select('*')
                .or(`atleta_a_id.eq.${atletaId},atleta_b_id.eq.${atletaId}`)
                .eq('evento_id', ins.evento_id);

            // Fetch opponent details if match exists
            let matchDetails = null;
            if (matches && matches.length > 0) {
                const match = matches[0]; // Assuming 1 match per event for simplicity for now, or take the latest
                const opponentId = match.atleta_a_id === atletaId ? match.atleta_b_id : match.atleta_a_id;

                if (opponentId) {
                    const { data: opponent } = await supabase.from('atletas').select('id, nome, apelido, foto_url, equipe').eq('id', opponentId).single();
                    matchDetails = { ...match, opponent };
                } else {
                    matchDetails = { ...match, opponent: null }; // Bye or waiting
                }
            }

            return {
                ...ins,
                match: matchDetails
            };
        }));

        setEvents(enrichedEvents);
        setLoading(false);
    };

    const handleOpenGenerator = (event, match) => {
        if (!match || !match.opponent) return alert("Você precisa ter uma luta casada para gerar o card.");

        supabase.from('atletas').select('*').eq('id', atletaId).single().then(({ data: myself }) => {
            if (!myself) return alert("Erro ao carregar dados do atleta.");

            setCardGeneratorData({
                eventName: event.evento?.nome || 'Evento',
                date: event.evento?.data_evento || new Date().toISOString(),
                category: event.categoria?.nome || 'Categoria',
                athleteA: myself, // You 
                athleteB: match.opponent, // Opponent
            });
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando eventos...</div>;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
            `}</style>
            {events.length === 0 ? (
                <div className="text-center py-12 bg-[#111] rounded-2xl border border-[#222]">
                    <Trophy className="mx-auto text-gray-700 w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-white">Nenhum evento encontrado</h3>
                    <p className="text-gray-500">Você ainda não se inscreveu em nenhum campeonato.</p>
                </div>
            ) : (
                events.map((item) => (
                    <div key={item.id} className="bg-[#161616] border border-slate-800 rounded-lg overflow-hidden group hover:border-slate-700 transition relative">
                        {/* Status Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg z-10 
                            ${item.status === 'pago' ? 'bg-green-600 text-white' :
                                item.status === 'aguardando_aprovacao' ? 'bg-yellow-600 text-white' :
                                    item.status === 'aprovado' ? 'bg-blue-600 text-white' : 'bg-red-600'}`}>
                            {item.status === 'aguardando_aprovacao' ? 'Aguardando Aprovação' :
                                item.status === 'pago' ? 'Inscrição Confirmada' : item.status}
                        </div>

                        {/* PENDING APPROVAL ACCORDION */}
                        {item.status === 'aguardando_aprovacao' && (
                            <div className="bg-yellow-600/10 border-b border-yellow-600/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                                <div className="flex items-center gap-3 text-yellow-500">
                                    <AlertCircle size={20} />
                                    <div>
                                        <p className="text-sm font-bold uppercase">Aprovação do Treinador Necessária</p>
                                        <p className="text-[10px] text-yellow-500/80">Seu treinador precisa aprovar sua incrição.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        const coachPhone = prompt("Digite o número do WhatsApp do seu treinador (ex: 5511999999999):");
                                        if (coachPhone) {
                                            const text = `Fala Mestre! Fiz minha inscrição no evento *${item.evento?.nome}* (Categoria: ${item.categoria?.nome}). Pode aprovar lá no painel?`;
                                            window.open(`https://wa.me/${coachPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                                        }
                                    }}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-bold uppercase flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                                >
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    Cobrar no WhatsApp
                                </button>
                            </div>
                        )}



                        <div className="flex flex-col md:flex-row">
                            {/* Event Image Cover */}
                            <div className="w-full md:w-48 h-32 md:h-auto bg-slate-800 relative">
                                {item.evento?.banner_url ? (
                                    <img src={item.evento.banner_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <Trophy size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent md:bg-gradient-to-r"></div>
                            </div>

                            {/* Info */}
                            <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-display font-bold text-white uppercase italic mb-1">{item.evento?.nome}</h3>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} className="text-[#FF4500]" /> {new Date(item.evento?.data_evento).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} className="text-[#FF4500]" /> {item.evento?.localizacao || 'Local a definir'}</span>
                                    <span className="flex items-center gap-1"><Medal size={12} className="text-[#FF4500]" /> {item.categoria?.nome}</span>
                                </div>

                                {/* MATCH INFO */}
                                {item.match ? (
                                    <div className="bg-black/40 border border-slate-800 rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                                                    {/* Self pic placeholder */}
                                                    <div className="w-full h-full bg-slate-800"></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-300">Você</span>
                                            </div>
                                            <span className="font-black text-[#FF4500] text-sm italic">VS</span>
                                            {item.match.opponent ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                                                        {item.match.opponent.foto_url && <img src={item.match.opponent.foto_url} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-white">{item.match.opponent.apelido || item.match.opponent.nome}</span>
                                                        <span className="text-[10px] text-gray-500">{item.match.opponent.equipe}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">Aguardando oponente...</span>
                                            )}
                                        </div>

                                        {item.match.opponent && (
                                            <button
                                                onClick={() => handleOpenGenerator(item, item.match)}
                                                className="bg-[#FF4500]/10 hover:bg-[#FF4500] text-[#FF4500] hover:text-white border border-[#FF4500]/50 px-3 py-1.5 rounded text-xs font-bold uppercase transition flex items-center gap-2"
                                            >
                                                <ImageIcon size={14} /> Gerar Card de Luta
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-black/20 border border-dashed border-slate-800 rounded p-3 text-center">
                                        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                            <AlertCircle size={14} /> Chaves ainda não divulgadas
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* CARD GENERATOR MODAL */}
            {cardGeneratorData && (
                <FightCardGenerator
                    eventName={cardGeneratorData.eventName}
                    date={cardGeneratorData.date}
                    category={cardGeneratorData.category}
                    athleteA={cardGeneratorData.athleteA}
                    athleteB={cardGeneratorData.athleteB}
                    onClose={() => setCardGeneratorData(null)}
                />
            )}

            {/* PAYMENT MODAL */}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md relative shadow-2xl">
                        <button
                            onClick={() => setPaymentModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Pagamento via PIX</h3>
                            <p className="text-purple-400 font-bold text-lg">R$ {paymentModal.price}</p>
                            <p className="text-xs text-slate-500 mt-2">Escaneie o QR Code ou copie a chave abaixo.</p>
                        </div>

                        {paymentModal.loading ? (
                            <div className="flex flex-col items-center py-8 gap-4">
                                <Loader2 className="animate-spin text-purple-500" size={40} />
                                <p className="text-sm text-slate-400">Gerando cobrança...</p>
                            </div>
                        ) : paymentModal.error ? (
                            <div className="text-center py-4">
                                <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
                                <p className="text-red-400 text-sm">{paymentModal.error}</p>
                                <button onClick={() => setPaymentModal(null)} className="mt-4 text-xs underline text-slate-500">Fechar</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* QR CODE IMAGE */}
                                <div className="bg-white p-4 rounded-lg flex justify-center">
                                    {paymentModal.qrCodeBase64 && (
                                        <img
                                            src={`data:image/png;base64,${paymentModal.qrCodeBase64}`}
                                            alt="QR Code PIX"
                                            className="w-48 h-48 object-contain"
                                        />
                                    )}
                                </div>

                                {/* COPY PASTE */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pix Copia e Cola</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={paymentModal.qrCodeCopyPaste}
                                            className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(paymentModal.qrCodeCopyPaste);
                                                alert("Código copiado!");
                                            }}
                                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* STATUS INDICATOR */}
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    Aguardando pagamento...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
