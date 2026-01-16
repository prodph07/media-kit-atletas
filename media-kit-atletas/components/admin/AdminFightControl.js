'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, AlertTriangle, Check, X } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminFightControl({ fight, onUpdate }) {
    const [showModal, setShowModal] = useState(false);
    const [winnerId, setWinnerId] = useState('');
    const [method, setMethod] = useState('DEC');
    const [round, setRound] = useState(1);
    const [saving, setSaving] = useState(false);

    const handleOpen = () => {
        setWinnerId(fight.atleta_a_id); // Default to A
        setShowModal(true);
    };

    const handleConfirm = async () => {
        setSaving(true);

        // 1. Update Fight Status
        const { error } = await supabase
            .from('eventos_lutas')
            .update({
                vencedor_id: winnerId,
                metodo_vitoria: method,
                round_vitoria: round,
                status: 'finalizada'
            })
            .eq('id', fight.id);

        if (error) {
            alert('Erro ao salvar resultado: ' + error.message);
            setSaving(false);
            return;
        }

        // 2. Calculate Points via RPC (Secure)
        try {
            const { error: rpcError } = await supabase.rpc('distribute_fight_points', {
                p_fight_id: fight.id,
                p_winner_id: winnerId,
                p_method: method,
                p_round: round
            });

            if (rpcError) throw rpcError;

            alert('Resultado definido e pontos distribuídos!');
        } catch (err) {
            console.error("Erro calc pontos:", err);
            alert('Resultado salvo, mas erro ao calcular pontos: ' + err.message);
        }

        setShowModal(false);
        if (onUpdate) onUpdate();
        setSaving(false);
    };

    return (
        <div className="mt-4 border-t border-slate-800 pt-4">
            <button
                onClick={handleOpen}
                className="w-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 py-2 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-2"
            >
                <Shield size={14} /> Área de Decisão (Admin)
            </button>

            {/* CONFIRMATION MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase">Definir Resultado</h3>
                            <p className="text-xs text-slate-400 mt-1">Essa ação encerra a luta e computa os pontos.</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vencedor</label>
                                <select
                                    value={winnerId}
                                    onChange={e => setWinnerId(e.target.value)}
                                    className="w-full bg-black border border-slate-700 rounded p-2 text-sm text-white font-bold"
                                >
                                    <option value={fight.atleta_a_id}>{fight.atleta_a?.apelido || fight.atleta_a?.nome || 'Atleta A'}</option>
                                    <option value={fight.atleta_b_id}>{fight.atleta_b?.apelido || fight.atleta_b?.nome || 'Atleta B'}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Método</label>
                                    <select
                                        value={method}
                                        onChange={e => setMethod(e.target.value)}
                                        className="w-full bg-black border border-slate-700 rounded p-2 text-sm text-white font-bold"
                                    >
                                        <option value="DEC">Decisão</option>
                                        <option value="KO">Nocaute (KO/TKO)</option>
                                        <option value="SUB">Finalização</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Round</label>
                                    <select
                                        value={round}
                                        onChange={e => setRound(Number(e.target.value))}
                                        className="w-full bg-black border border-slate-700 rounded p-2 text-sm text-white font-bold"
                                    >
                                        <option value={1}>Round 1</option>
                                        <option value={2}>Round 2</option>
                                        <option value={3}>Round 3</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-slate-800 text-slate-300 py-3 rounded font-bold uppercase text-xs hover:bg-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={saving}
                                className="bg-green-600 text-white py-3 rounded font-bold uppercase text-xs hover:bg-green-500 flex items-center justify-center gap-2"
                            >
                                {saving ? 'Salvando...' : <><Check size={14} /> Confirmar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
