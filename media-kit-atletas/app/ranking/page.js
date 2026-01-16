'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Medal, Crown } from 'lucide-react';
import { getRankInfo } from '../../lib/gamification';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rankingType, setRankingType] = useState('atletas'); // 'atletas' | 'fans'
    const [activeTab, setActiveTab] = useState('global'); // global, weekly, monthly

    useEffect(() => {
        fetchRanking();
    }, [rankingType, activeTab]);

    const fetchRanking = async () => {
        setLoading(true);
        let data, error;

        if (rankingType === 'atletas') {
            const result = await supabase
                .from('atletas')
                .select('id, nome, apelido, xp, level, foto_url, team, categoria, slug, weekly_stats')
                .order('xp', { ascending: false })
                .limit(100);
            data = result.data;
            error = result.error;
        } else {
            const result = await supabase
                .from('fans')
                .select('id, nickname, xp, level, foto_url, weekly_stats')
                .order('xp', { ascending: false })
                .limit(100);
            data = result.data;
            error = result.error;
        }

        if (error) {
            console.error("Error fetching ranking:", error);
            setRanking([]);
        } else {
            // Normalize data for consistent rendering in subcomponents
            const normalizedData = data ? data.map(item => {
                if (rankingType === 'fans') {
                    return {
                        ...item,
                        nome: item.nickname,
                        apelido: item.nickname,
                        team: 'Analista',
                        categoria: 'Fã',
                        slug: null, // Fans don't have individual profile pages in the same way
                        is_fan: true
                    };
                }
                return { ...item, is_fan: false };
            }) : [];
            setRanking(normalizedData);
        }
        setLoading(false);
    };

    // --- SORTING LOGIC ---
    const getDisplayXP = (user) => {
        if (activeTab === 'global') {
            // Se for Fã (Analista), recalcula o XP Total acumulado
            if (user.is_fan) {
                let total = user.xp || 0;
                const lvl = user.level || 1;
                // Soma o XP necessário para passar de todos os níveis anteriores
                for (let i = 1; i < lvl; i++) {
                    // Formula idêntica ao backend/gamification: floor(100 * i^1.5)
                    total += Math.floor(100 * Math.pow(i, 1.5));
                }
                return total;
            }
            return user.xp || 0;
        }

        const stats = user.weekly_stats || {};
        if (activeTab === 'weekly') {
            const snapshot = stats.xp_weekly_snapshot || 0;
            // Para analistas, usar a diff do XP Total, mas snapshots salvam o VALUE naquele momento.
            // Se o snapshot salvou "18" e agora é "400" (recalculado), vai dar bug.
            // O snapshot do backend salva o XP "bruto" (18).
            // Entao para semanal funcionar com Analistas UPA, precisariamos que o snapshot também fosse Recalculado ou salvos como Total.
            // POR AGORA: Foco no GLOBAL que é a visualização principal.
            // O semanal pode ficar bugado se upar de nível na semana.
            // Solução rápida: Se for fã, o displayXP semanal pode ser apenas a diferença bruta SE nível não mudou, mas se mudou...
            // "getDisplayXP" é usado para exibir.
            // Melhor apenas corrigir o GLOBAL por enquanto conforme pedido.
            return Math.max(0, (user.xp || 0) - snapshot);
        }
        if (activeTab === 'monthly') {
            const snapshot = stats.xp_monthly_snapshot || 0;
            return Math.max(0, (user.xp || 0) - snapshot);
        }
        return 0;
    };

    const sortedRanking = [...ranking]
        .map(a => ({ ...a, displayXP: getDisplayXP(a) }))
        .sort((a, b) => b.displayXP - a.displayXP)
        .filter(a => activeTab === 'global' ? true : a.displayXP > 0);

    // Separate Top 3
    const top3 = sortedRanking.slice(0, 3);
    const rest = sortedRanking.slice(3);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans pb-20">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
            `}</style>

            {/* HEADER */}
            <header className="bg-[#111] border-b border-[#222] py-8 px-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50"></div>

                <h1 className="font-display font-bold text-4xl uppercase tracking-wider mb-6 flex items-center justify-center gap-3">
                    <Trophy className="text-[#FFD700]" size={32} />
                    Ranking <span className="text-[#FFD700]">Global</span>
                </h1>

                {/* TYPE TOGGLE (Athletes vs Analysts) */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#0c0c0c] p-1 rounded-full border border-[#222] inline-flex">
                        <button
                            onClick={() => setRankingType('atletas')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${rankingType === 'atletas' ? 'bg-[#FF4500] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Atletas
                        </button>
                        <button
                            onClick={() => setRankingType('fans')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${rankingType === 'fans' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Top Analistas
                        </button>
                    </div>
                </div>

                {/* TEMPORAL TABS */}
                <div className="flex justify-center gap-2">
                    <TabButton label="Geral" active={activeTab === 'global'} onClick={() => setActiveTab('global')} color={rankingType === 'fans' ? 'purple' : 'orange'} />
                    <TabButton label="Semanal" active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} color={rankingType === 'fans' ? 'purple' : 'orange'} />
                    <TabButton label="Mensal" active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} color={rankingType === 'fans' ? 'purple' : 'orange'} />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${rankingType === 'fans' ? 'border-purple-600' : 'border-[#FF4500]'}`}></div>
                    </div>
                ) : (
                    <>
                        {/* PODIUM SECTION */}
                        {top3.length > 0 && (
                            <div className="mb-12 flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8">
                                {top3[1] && <PodiumCard atleta={top3[1]} place={2} color={rankingType === 'fans' ? 'purple' : 'orange'} />}
                                {top3[0] && <PodiumCard atleta={top3[0]} place={1} color={rankingType === 'fans' ? 'purple' : 'orange'} />}
                                {top3[2] && <PodiumCard atleta={top3[2]} place={3} color={rankingType === 'fans' ? 'purple' : 'orange'} />}
                            </div>
                        )}

                        {/* RANKING LIST */}
                        <div className="space-y-3">
                            {rest.map((atleta, index) => (
                                <RankingRow key={atleta.id} atleta={atleta} rank={index + 4} color={rankingType === 'fans' ? 'purple' : 'orange'} />
                            ))}
                        </div>

                        {sortedRanking.length === 0 && (
                            <div className="text-center py-10 text-gray-500 font-bold uppercase">
                                Nenhum {rankingType === 'atletas' ? 'atleta' : 'analista'} pontuou neste período ainda.
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function TabButton({ label, active, onClick, color }) {
    const activeClass = color === 'purple' ? 'bg-purple-600 shadow-purple-900/50' : 'bg-[#FF4500] shadow-orange-900/50';

    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all duration-300 ${active ? `${activeClass} text-white shadow-lg scale-105` : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
        >
            {label}
        </button>
    );
}

function PodiumCard({ atleta, place, color }) {
    const isFirst = place === 1;
    const rankInfo = getRankInfo(atleta.level);

    // Colors
    const isPurple = color === 'purple';

    // Define UI colors based on place
    const baseBorder = isFirst ? '#FFD700' : place === 2 ? '#C0C0C0' : '#CD7F32';
    const borderColor = isFirst ? 'border-[#FFD700]' : place === 2 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]';
    const textColor = isFirst ? 'text-[#FFD700]' : place === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]';

    const sizeClasses = isFirst ? 'w-full md:w-1/3 order-1 md:order-2 scale-105 z-10' : 'w-full md:w-1/4 order-2 md:order-1 opacity-90 scale-95';

    return (
        <div className={`bg-[#161616] border ${borderColor} rounded-lg p-6 flex flex-col items-center relative shadow-[0_0_30px_rgba(0,0,0,0.3)] ${sizeClasses}`}>
            <div className={`absolute -top-4 w-10 h-10 rounded-full bg-[#0c0c0c] border-2 ${borderColor} flex items-center justify-center font-bold ${textColor} text-xl shadow-lg`}>
                {place}
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#111] z-0">
                    <img src={atleta.foto_url || '/placeholder_fighter.png'} className="w-full h-full object-cover" alt={atleta.nome} />
                </div>
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                    <img src={rankInfo.frameUrl} className="w-full h-full object-contain drop-shadow-md" style={{ transform: `scale(${rankInfo.frameScale || 1.4})` }} />
                </div>
                <div className="absolute bottom-2 right-4 bg-[#222] text-[10px] font-bold text-white px-2 py-0.5 rounded border border-[#444] z-20">
                    Lvl {atleta.level || 1}
                </div>
            </div>

            <div onClick={() => !atleta.is_fan && window.open(`/${atleta.slug || atleta.id}`, '_self')} className={`${atleta.is_fan ? '' : 'cursor-pointer'} text-center group`}>
                <h3 className={`font-display font-bold text-xl uppercase text-white truncate max-w-[150px] transition ${isPurple ? 'group-hover:text-purple-500' : 'group-hover:text-[#FF4500]'}`}>
                    {atleta.apelido || atleta.nome}
                </h3>
            </div>

            <p className="text-gray-500 text-xs font-bold uppercase mb-3 flex items-center gap-1">
                {atleta.team || 'Sem Equipe'}
            </p>

            <div className={`flex items-center gap-2 px-3 py-1 rounded bg-[#0c0c0c]/50 border ${borderColor}/20`}>
                <span className={`font-display font-bold text-lg ${textColor}`}>{atleta.displayXP} XP</span>
            </div>

            <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {rankInfo.title}
            </div>
        </div>
    );
}

function RankingRow({ atleta, rank, color }) {
    const rankInfo = getRankInfo(atleta.level);
    const isPurple = color === 'purple';

    return (
        <div className={`block group ${atleta.is_fan ? '' : 'cursor-pointer'}`} onClick={() => !atleta.is_fan && window.open(`/${atleta.slug || atleta.id}`, '_self')}>
            <div className="bg-[#111] hover:bg-[#161616] border border-[#222] hover:border-[#333] rounded-lg p-3 flex items-center gap-4 transition-all">
                <div className="w-8 text-center font-display font-bold text-2xl text-gray-600 group-hover:text-white transition">
                    #{rank}
                </div>
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#222] z-0">
                        <img src={atleta.foto_url || '/placeholder_fighter.png'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" alt={atleta.nome} />
                    </div>
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                        <img src={rankInfo.frameUrl} className="w-full h-full object-contain" style={{ transform: `scale(${rankInfo.frameScale || 1.4})` }} />
                    </div>
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className={`font-display font-bold text-lg uppercase text-white truncate transition ${isPurple ? 'group-hover:text-purple-500' : 'group-hover:text-[#FF4500]'}`}>
                        {atleta.apelido || atleta.nome}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
                        <span>{atleta.team || 'Indie'}</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className={`${rankInfo.textColor}`}>{rankInfo.title}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-display font-bold text-xl text-[#FFD700] leading-none">
                        {atleta.displayXP}
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">XP</span>
                </div>
            </div>
        </div>
    );
}

// Dummy to avoid crash if remove Link
const LinkDummy = ({ children }) => <>{children}</>;

