'use client';

import { useState, useEffect } from 'react';
import DueloCard from './DueloCard';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { UserPlus, X } from 'lucide-react';

// --- IMPORTAÇÕES DE GAMIFICAÇÃO ---
import { processDuelVoting, calculateNewLevelState, getXpToNextLevel } from '../lib/gamification';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function VotacaoWrapper({ dueloId, p1, p2, initialVotes1, initialVotes2 }) {
    const [v1, setV1] = useState(initialVotes1 || 0);
    const [v2, setV2] = useState(initialVotes2 || 0);
    const [hasVoted, setHasVoted] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        const localVote = localStorage.getItem(`voto_duelo_${dueloId}`);
        if (localVote) {
            setHasVoted(true);
        }
    }, [dueloId]);

    const handleVote = async (athleteNum) => {
        if (hasVoted || localStorage.getItem(`voto_duelo_${dueloId}`)) {
            alert("Você já votou neste duelo!");
            return;
        }

        // 1. Atualização Visual
        if (athleteNum === 1) setV1(prev => prev + 1);
        else setV2(prev => prev + 1);

        setHasVoted(true);
        localStorage.setItem(`voto_duelo_${dueloId}`, 'true');

        // 2. Atualizar Voto no Banco
        const field = athleteNum === 1 ? 'votos_1' : 'votos_2';
        const currentVal = athleteNum === 1 ? v1 : v2;

        const { error } = await supabase
            .from('duelos')
            .update({ [field]: currentVal + 1 })
            .eq('id', dueloId);

        if (error) console.error("Erro ao salvar voto:", error);

        // 3. GAMIFICAÇÃO: Dar XP se estiver logado
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            const userId = session.user.id;

            // Busca dados atuais do usuário para calcular XP
            const { data: userData } = await supabase
                .from('atletas')
                .select('xp, level, weekly_stats')
                .eq('user_id', userId)
                .single();

            if (userData) {
                // Processa a regra do voto diário
                const voteResult = processDuelVoting(userData.weekly_stats);

                if (voteResult.success) {
                    // Calcula novo XP e Nível
                    const newState = calculateNewLevelState(userData.xp, userData.level, voteResult.xpGained);

                    // Salva no banco
                    await supabase.from('atletas').update({
                        xp: newState.newXp,
                        level: newState.newLevel,
                        weekly_stats: voteResult.updatedStats
                    }).eq('user_id', userId);

                    // Feedback Visual
                    alert(`🗳️ Voto confirmado!\n\n${voteResult.message}`);
                    if (newState.levelUp) alert(`🎉 LEVEL UP! Você subiu para o nível ${newState.newLevel}!`);
                }
            }
        } else {
            // Se não estiver logado, mostra convite
            setShowInvite(true);
        }
    };

    return (
        <div className="relative font-sans">
            <DueloCard
                p1={p1}
                p2={p2}
                votes1={v1}
                votes2={v2}
                onVote={handleVote}
                showVoting={!hasVoted}
            />

            {hasVoted && !showInvite && (
                <div className="text-center mt-4 text-green-500 text-sm animate-fadeIn font-bold uppercase tracking-wide">
                    ✓ Seu voto foi computado com sucesso.
                </div>
            )}

            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#111] border border-[#333] rounded-3xl p-8 max-w-md w-full relative shadow-2xl shadow-red-900/10">

                        {/* Detail FX */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-[50px]"></div>

                        <button
                            onClick={() => setShowInvite(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center relative z-10">
                            <div className="w-16 h-16 bg-[#1a1a1a] text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#333] shadow-inner">
                                <UserPlus size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Voto Confirmado!</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Você sabia que pode criar seu próprio <strong className="text-white">Media Kit Profissional</strong> e desafiar outros atletas na Arena?
                            </p>

                            <div className="space-y-3">
                                <Link href="/cadastro" className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition transform hover:scale-105 shadow-lg shadow-red-900/30 uppercase tracking-wide text-sm">
                                    CRIAR MEU PERFIL GRÁTIS
                                </Link>
                                <button onClick={() => setShowInvite(false)} className="text-xs text-gray-500 hover:text-white underline py-2">
                                    Apenas continuar vendo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}