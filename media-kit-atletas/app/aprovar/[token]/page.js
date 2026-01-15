'use client';
export const runtime = 'edge';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, XCircle, Trophy, User, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ApprovalPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [inscription, setInscription] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (params?.token) {
            fetchInscription();
        }
    }, [params?.token]);

    async function fetchInscription() {
        setLoading(true);
        // Search inscription by token in JSONB column
        // Note: Supabase filtering on JSONB text value
        const { data, error } = await supabase
            .from('eventos_inscricoes')
            .select(`
                *,
                atleta:atletas ( *, dados_perfil:dados_inscricao ( * ) ),
                evento:eventos ( * ),
                categoria:eventos_categorias ( * )
            `)
            // This syntax filters inside the JSONB column
            .eq('dados_inscricao->>approval_token', params.token)
            .single();

        if (data) {
            setInscription(data);
        } else {
            console.error("Inscription not found or error", error);
        }
        setLoading(false);
    }

    const handleAction = async (newStatus) => {
        if (!inscription) return;
        setActionLoading(true);

        const { error } = await supabase
            .from('eventos_inscricoes')
            .update({ status: newStatus })
            .eq('id', inscription.id);

        if (error) {
            alert('Erro ao processar: ' + error.message);
        } else {
            setInscription(prev => ({ ...prev, status: newStatus }));
            setProcessed(true);
        }
        setActionLoading(false);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-purple-500" /></div>;

    if (!inscription) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
            <XCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-xl font-bold">Link Inválido ou Expirado</h1>
            <p className="text-slate-500 mt-2">Não encontramos nenhuma inscrição com este código de aprovação.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">

                {/* HEADER */}
                <div className="bg-purple-900/20 p-6 border-b border-slate-800 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
                    <Trophy className="mx-auto text-purple-500 mb-3 relative z-10" size={32} />
                    <h1 className="text-lg font-bold uppercase tracking-wide relative z-10">{inscription.evento?.nome}</h1>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-slate-400 relative z-10 font-bold">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(inscription.evento?.data_evento).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {inscription.evento?.localizacao}</span>
                    </div>
                </div>

                {/* ATHLETE */}
                <div className="p-8 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-900/30">
                        <img
                            src={inscription.atleta?.foto_url || "https://placehold.co/150"}
                            className="w-full h-full rounded-full object-cover bg-slate-800"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{inscription.atleta?.nome}</h2>
                    <p className="text-purple-400 font-bold uppercase text-sm mt-1">{inscription.dados_inscricao?.equipe || inscription.atleta?.team}</p>

                    <div className="mt-6 bg-slate-900 rounded-xl p-4 w-full flex justify-between items-center border border-slate-800">
                        <div className="text-left">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Categoria</p>
                            <p className="text-white font-bold">{inscription.categoria?.nome}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Nível</p>
                            <p className="text-white font-bold">{inscription.atleta?.level}</p>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="p-6 pt-0 space-y-3">
                    {processed || (inscription.status !== 'aguardando_aprovacao' && inscription.status !== 'pendente') ? (
                        <div className={`p-4 rounded-xl text-center border ${inscription.status === 'aprovado' || inscription.status === 'pago' ? 'bg-green-900/20 border-green-500/50 text-green-500' : 'bg-red-900/20 border-red-500/50 text-red-500'
                            }`}>
                            {inscription.status === 'aprovado' || inscription.status === 'pago' ? (
                                <>
                                    <CheckCircle className="mx-auto mb-2" size={32} />
                                    <p className="font-bold uppercase">Aprovado com Sucesso!</p>
                                    <p className="text-xs opacity-70 mt-1">O atleta já foi notificado.</p>
                                </>
                            ) : (
                                <>
                                    <XCircle className="mx-auto mb-2" size={32} />
                                    <p className="font-bold uppercase">Inscrição Recusada</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => handleAction('aprovado')}
                                disabled={actionLoading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold uppercase py-4 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                Autorizar Participação
                            </button>
                            <button
                                onClick={() => handleAction('rejeitado')}
                                disabled={actionLoading}
                                className="w-full bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-500 font-bold uppercase py-3 rounded-xl transition disabled:opacity-50"
                            >
                                Negar Pedido
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-slate-950 p-3 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-600">Plataforma Nocaute • Sistema de Aprovação Seguro</p>
                </div>
            </div>
        </div>
    );
}
