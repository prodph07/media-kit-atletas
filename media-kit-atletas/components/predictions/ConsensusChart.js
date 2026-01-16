'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ConsensusChart({ fight }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [fight]);

    async function fetchStats() {
        // Busca todos os palpites dessa luta (somente colunas necessárias)
        const { data, error } = await supabase
            .from('event_predictions')
            .select('selected_winner_id, method')
            .eq('fight_id', fight.id);

        if (error || !data || data.length === 0) {
            setLoading(false);
            return;
        }

        const total = data.length;
        const votesA = data.filter(p => p.selected_winner_id === fight.atleta_a_id).length;
        const votesB = data.filter(p => p.selected_winner_id === fight.atleta_b_id).length;

        const methods = {
            KO: data.filter(p => p.method === 'KO').length,
            SUB: data.filter(p => p.method === 'SUB').length,
            DEC: data.filter(p => p.method === 'DEC').length,
        };

        setStats({
            votesA: Math.round((votesA / total) * 100),
            votesB: Math.round((votesB / total) * 100),
            total,
            methodTop: Object.keys(methods).reduce((a, b) => methods[a] > methods[b] ? a : b)
        });
        setLoading(false);
    }

    if (loading) return null;
    if (!stats) return <p className="text-[10px] text-slate-600 italic mt-2">Seja o primeiro a palpitar!</p>;

    return (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Consenso da Comunidade ({stats.total} votos)</span>
            </div>

            {/* BARRA DE PORCENTAGEM */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                    style={{ width: `${stats.votesA}%` }}
                    className="bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                ></div>
                <div
                    style={{ width: `${stats.votesB}%` }}
                    className="bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                ></div>
            </div>

            <div className="flex justify-between mt-1 text-[10px] font-bold">
                <span className="text-red-500">{stats.votesA}% {fight.atleta_a?.apelido || 'Atleta A'}</span>
                <span className="text-blue-500">{stats.votesB}% {fight.atleta_b?.apelido || 'Atleta B'}</span>
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-2">
                Maioria aposta em <span className="text-white bg-slate-800 px-1 rounded">{stats.methodTop}</span>
            </p>
        </div>
    );
}
