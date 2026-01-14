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
    const [activeTab, setActiveTab] = useState('global'); // global, weekly, monthly

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        setLoading(true);
        // Fetch athletes + weekly_stats for temporal calc
        const { data, error } = await supabase
            .from('atletas')
            .select('id, nome, apelido, xp, level, foto_url, team, categoria, slug, weekly_stats')
            .order('xp', { ascending: false }) // Initial fetch order
            .limit(100);

        if (error) {
            console.error("Error fetching ranking:", error);
        } else {
            setRanking(data || []);
        }
        setLoading(false);
    };

    // --- SORTING LOGIC ---
    const getDisplayXP = (atleta) => {
        if (activeTab === 'global') return atleta.xp || 0;

        const stats = atleta.weekly_stats || {};
        if (activeTab === 'weekly') {
            const snapshot = stats.xp_weekly_snapshot || 0;
            return Math.max(0, (atleta.xp || 0) - snapshot);
        }
        if (activeTab === 'monthly') {
            const snapshot = stats.xp_monthly_snapshot || 0;
            return Math.max(0, (atleta.xp || 0) - snapshot);
        }
        return 0;
    };

    const sortedRanking = [...ranking]
        .map(a => ({ ...a, displayXP: getDisplayXP(a) }))
        .sort((a, b) => b.displayXP - a.displayXP)
        .filter(a => activeTab === 'global' ? true : a.displayXP > 0); // Hide 0 XP users in temporal lists

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

                <h1 className="font-display font-bold text-4xl uppercase tracking-wider mb-2 flex items-center justify-center gap-3">
                    <Trophy className="text-[#FFD700]" size={32} />
                    Ranking <span className="text-[#FFD700]">Global</span>
                </h1>

                {/* TABS */}
                <div className="flex justify-center gap-2 mt-6">
                    <TabButton label="Global" active={activeTab === 'global'} onClick={() => setActiveTab('global')} />
                    <TabButton label="Semanal" active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} />
                    <TabButton label="Mensal" active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* PODIUM SECTION */}
                        {top3.length > 0 && (
                            <div className="mb-12 flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8">
                                {top3[1] && <PodiumCard atleta={top3[1]} place={2} />}
                                {top3[0] && <PodiumCard atleta={top3[0]} place={1} />}
                                {top3[2] && <PodiumCard atleta={top3[2]} place={3} />}
                            </div>
                        )}

                        {/* RANKING LIST */}
                        <div className="space-y-3">
                            {rest.map((atleta, index) => (
                                <RankingRow key={atleta.id} atleta={atleta} rank={index + 4} />
                            ))}
                        </div>

                        {sortedRanking.length === 0 && (
                            <div className="text-center py-10 text-gray-500 font-bold uppercase">
                                Nenhum guerreiro pontuou neste período ainda.
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// --- SUBAMONENTS ---

function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all duration-300 ${active ? 'bg-[#FF4500] text-white shadow-lg scale-105' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
        >
            {label}
        </button>
    );
}

function PodiumCard({ atleta, place }) {
    const isFirst = place === 1;
    const rankInfo = getRankInfo(atleta.level);

    // Colors based on place
    const borderColor = isFirst ? 'border-[#FFD700]' : place === 2 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]';
    const textColor = isFirst ? 'text-[#FFD700]' : place === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]';
    const sizeClasses = isFirst ? 'w-full md:w-1/3 order-1 md:order-2 scale-105 z-10' : 'w-full md:w-1/4 order-2 md:order-1 opacity-90 scale-95';

    return (
        <div className={`bg-[#161616] border ${borderColor} rounded-lg p-6 flex flex-col items-center relative shadow-[0_0_30px_rgba(0,0,0,0.3)] ${sizeClasses}`}>
            <div className={`absolute -top-4 w-10 h-10 rounded-full bg-[#0c0c0c] border-2 ${borderColor} flex items-center justify-center font-bold ${textColor} text-xl shadow-lg`}>
                {place}
            </div>

            <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${borderColor}`}>
                    <img src={atleta.foto_url || '/placeholder_fighter.png'} className="w-full h-full object-cover" alt={atleta.nome} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#222] text-xs font-bold text-white px-2 py-0.5 rounded border border-[#444]">
                    Lvl {atleta.level || 1}
                </div>
            </div>

            <Link href={`/${atleta.slug || atleta.id}`} className="text-center group">
                <h3 className="font-display font-bold text-xl uppercase text-white truncate max-w-[150px] group-hover:text-[#FF4500] transition">
                    {atleta.apelido || atleta.nome}
                </h3>
            </Link>

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

function RankingRow({ atleta, rank }) {
    const rankInfo = getRankInfo(atleta.level);

    return (
        <Link href={`/${atleta.slug || atleta.id}`} className="block group">
            <div className="bg-[#111] hover:bg-[#161616] border border-[#222] hover:border-[#333] rounded-lg p-3 flex items-center gap-4 transition-all">
                <div className="w-8 text-center font-display font-bold text-2xl text-gray-600 group-hover:text-white transition">
                    #{rank}
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#222]">
                    <img src={atleta.foto_url || '/placeholder_fighter.png'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" alt={atleta.nome} />
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className="font-display font-bold text-lg uppercase text-white truncate group-hover:text-[#FF4500] transition">
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
        </Link>
    );
}
