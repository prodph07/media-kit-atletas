'use client';

import { useState, useEffect } from 'react';
import DueloCard from './DueloCard'; 
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { UserPlus, X } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function VotacaoWrapper({ dueloId, p1, p2, initialVotes1, initialVotes2 }) {
    const [v1, setV1] = useState(initialVotes1 || 0);
    const [v2, setV2] = useState(initialVotes2 || 0);
    const [hasVoted, setHasVoted] = useState(false);
    const [showInvite, setShowInvite] = useState(false); // Estado para mostrar o convite

    // Verifica no carregamento se já votou neste duelo específico
    useEffect(() => {
        const localVote = localStorage.getItem(`voto_duelo_${dueloId}`);
        if (localVote) {
            setHasVoted(true);
        }
    }, [dueloId]);

    const handleVote = async (athleteNum) => {
        // Bloqueia se já votou (State ou LocalStorage)
        if(hasVoted || localStorage.getItem(`voto_duelo_${dueloId}`)) {
            alert("Você já votou neste duelo!");
            return;
        }
        
        // 1. Atualização Visual Imediata (Otimista)
        if(athleteNum === 1) setV1(prev => prev + 1);
        else setV2(prev => prev + 1);
        
        setHasVoted(true);
        localStorage.setItem(`voto_duelo_${dueloId}`, 'true'); // Salva no navegador

        // 2. Atualizar no Banco de Dados
        const field = athleteNum === 1 ? 'votos_1' : 'votos_2';
        const currentVal = athleteNum === 1 ? v1 : v2;
        
        const { error } = await supabase
            .from('duelos')
            .update({ [field]: currentVal + 1 })
            .eq('id', dueloId);

        if(error) console.error("Erro ao salvar voto:", error);

        // 3. Verificar se é anônimo para mostrar convite
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setShowInvite(true);
        }
    };

    return (
        <div className="relative">
            {/* O CARD DO DUELO */}
            <DueloCard 
                p1={p1} 
                p2={p2} 
                votes1={v1} 
                votes2={v2} 
                onVote={handleVote} 
                showVoting={!hasVoted} 
            />

            {/* MENSAGEM DE "JÁ VOTOU" (feedback visual simples) */}
            {hasVoted && !showInvite && (
                <div className="text-center mt-4 text-slate-500 text-sm animate-fadeIn">
                    ✓ Seu voto foi computado.
                </div>
            )}

            {/* MODAL / BANNER DE CONVITE PARA CADASTRO */}
            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#121214] border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
                        <button 
                            onClick={() => setShowInvite(false)} 
                            className="absolute top-3 right-3 text-slate-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase mb-2">Voto Confirmado!</h3>
                            <p className="text-slate-400 mb-6">
                                Você sabia que pode criar seu próprio <strong>Media Kit Profissional</strong> e desafiar outros atletas?
                            </p>
                            
                            <div className="space-y-3">
                                <Link href="/cadastro" className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-full transition transform hover:scale-105">
                                    CRIAR MEU PERFIL GRÁTIS
                                </Link>
                                <button onClick={() => setShowInvite(false)} className="text-slate-500 text-sm hover:text-white underline">
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