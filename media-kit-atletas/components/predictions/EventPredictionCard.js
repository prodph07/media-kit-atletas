'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link'; // Not explicitly needed but good practice
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import ConsensusChart from './ConsensusChart';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function EventPredictionCard({ fight, event, user }) {
    // Fight contém dados dos atletas (atleta_a, atleta_b)
    // User ID serve para buscar o palpite existente

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locked, setLocked] = useState(false);
    const [mode, setMode] = useState('view'); // 'view' | 'edit'

    // Form State
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [method, setMethod] = useState('DEC'); // 'KO', 'SUB', 'DEC'
    const [round, setRound] = useState(1);

    // Time Logic
    useEffect(() => {
        // Bloqueia 10 minutos antes do evento (Exemplo simples, pode refinar por luta se tiver horario)
        // Usando data do evento como base
        const eventDate = new Date(event.data_evento);
        const lockDate = new Date(eventDate);
        lockDate.setDate(lockDate.getDate() - 1); // 1 day before

        const now = new Date();
        if (now >= lockDate) setLocked(true);
    }, [event]);

    useEffect(() => {
        if (user) fetchPrediction();
        else setLoading(false);
    }, [user, fight]);

    async function fetchPrediction() {
        // Buscar palpite da tabela 'event_predictions'
        const { data } = await supabase
            .from('event_predictions')
            .select('*')
            .eq('fight_id', fight.id)
            .eq('user_id', user.id)
            .single();

        if (data) {
            setPrediction(data);
            setSelectedWinner(data.selected_winner_id);
            setMethod(data.method);
            setRound(data.round);
        }
        setLoading(false);
    }

    async function handleSave() {
        if (!selectedWinner) return alert('Escolha um vencedor!');
        setSaving(true);

        const payload = {
            user_id: user.id,
            event_id: event.id,
            fight_id: fight.id,
            selected_winner_id: selectedWinner,
            method,
            round
        };

        // Upsert (Insert ou Update)
        // Precisamos saber se já existe para UPDATE ou INSERT, mas upsert resolve com constraint unique
        const { data, error } = await supabase
            .from('event_predictions')
            .upsert(payload, { onConflict: 'user_id, fight_id' })
            .select()
            .single();

        if (error) {
            console.error(error);
            alert('Erro ao salvar palpite.');
        } else {
            setPrediction(data);
            setMode('view');
        }
        setSaving(false);
    }

    if (loading) return <div className="animate-pulse h-12 bg-slate-800 rounded"></div>;

    // LAYOUT DE VISUALIZAÇÃO (Já palpitou)
    if (prediction && mode === 'view') {
        const winnerName = prediction.selected_winner_id === fight.atleta_a_id ? fight.atleta_a?.apelido || fight.atleta_a?.nome : fight.atleta_b?.apelido || fight.atleta_b?.nome || 'Atleta B';

        // Status (se a luta ja acabou)
        // fight.vencedor_id vem da tabela de lutas quando o admin finaliza
        let statusColor = "text-slate-400"; // Pendente
        let statusIcon = null;

        if (fight.vencedor_id) {
            // Luta acabou
            if (fight.vencedor_id === prediction.selected_winner_id) {
                statusColor = "text-green-500";
                statusIcon = <CheckCircle size={16} />;
            } else {
                statusColor = "text-red-500";
                statusIcon = <XCircle size={16} />;
            }
        }

        return (
            <>
                <div className="mt-3 bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Seu Palpite</span>
                        <span className={`font-bold text-sm ${statusColor} flex items-center gap-1`}>
                            {statusIcon} {winnerName} via {prediction.method} R{prediction.round}
                        </span>
                    </div>

                    {!locked && !fight.vencedor_id && (
                        <button onClick={() => setMode('edit')} className="text-xs text-purple-400 hover:text-white underline">
                            Alterar
                        </button>
                    )}

                    {(locked || fight.vencedor_id) && (
                        <Lock size={14} className="text-slate-600" />
                    )}
                </div>

                {/* Mostra consenso APÓS votar */}
                <ConsensusChart fight={fight} />
            </>
        );
    }

    // LAYOUT DE EDIÇÃO / CRIAÇÃO
    if (!user && !prediction) return null; // Não mostra nada se não estiver logado

    if (locked) return null; // Se bloqueado e não tem palpite, não mostra opção de criar (perdeu o timing)

    return (
        <div className="mt-3 bg-slate-800/50 border border-slate-700 p-4 rounded-xl animate-fadeIn">
            <h4 className="text-xs font-bold uppercase text-purple-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                Faça seu Palpite
            </h4>

            {/* 1. Escolher Vencedor */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setSelectedWinner(fight.atleta_a_id)}
                    className={`flex-1 p-2 rounded border flex flex-col items-center gap-2 transition ${selectedWinner === fight.atleta_a_id ? 'bg-red-900/40 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                        <img src={fight.atleta_a?.foto_url || ''} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase">{fight.atleta_a?.apelido || 'Atleta A'}</span>
                </button>

                <button
                    onClick={() => setSelectedWinner(fight.atleta_b_id)}
                    className={`flex-1 p-2 rounded border flex flex-col items-center gap-2 transition ${selectedWinner === fight.atleta_b_id ? 'bg-blue-900/40 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                        <img src={fight.atleta_b?.foto_url || ''} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase">{fight.atleta_b?.apelido || 'Atleta B'}</span>
                </button>
            </div>

            {/* 2. Método e Round (Só libera se escolher vencedor) */}
            {selectedWinner && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Decisão</label>
                        <div className="flex rounded overflow-hidden border border-slate-700">
                            {['KO', 'SUB', 'DEC'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`flex-1 py-1 text-[10px] font-bold ${method === m ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Round</label>
                        <div className="flex rounded overflow-hidden border border-slate-700">
                            {[1, 2, 3].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRound(r)}
                                    className={`flex-1 py-1 text-[10px] font-bold ${round === r ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2">
                {prediction && (
                    <button onClick={() => setMode('view')} className="text-xs text-slate-400 hover:text-white px-3">
                        Cancelar
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={!selectedWinner || saving}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase px-6 py-2 rounded shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? '...' : (prediction ? 'Atualizar Palpite' : 'Confirmar Palpite')}
                </button>
            </div>
        </div>
    );
}
