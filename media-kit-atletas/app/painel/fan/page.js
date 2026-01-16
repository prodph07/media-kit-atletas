'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { LogOut, Trophy, Save, Target, X } from 'lucide-react';
import { getRankInfo, getXpToNextLevel, REWARDS } from '@/lib/gamification';
import EventPredictionCard from '@/components/predictions/EventPredictionCard';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function FanPanel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/login');

        const { data } = await supabase.from('fans').select('*').eq('user_id', user.id).single();
        if (data) {
            setProfile(data);
            fetchStats(data.user_id);
        } else {
            router.push('/cadastro/fan');
        }
        setLoading(false);
    };

    const fetchStats = async (userId) => {
        // Fetch predictions
        const { data } = await supabase
            .from('event_predictions')
            .select(`
                *,
                fight:fight_id (
                    *,
                    atleta_a:atleta_a_id (nome, apelido, foto_url),
                    atleta_b:atleta_b_id (nome, apelido, foto_url),
                    evento:evento_id (*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) setPredictions(data);
        setStatsLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('fans')
            .update({
                nickname: profile.nickname,
                foto_url: profile.foto_url
            })
            .eq('id', profile.id);

        if (error) alert('Erro ao salvar: ' + error.message);
        else alert('Perfil atualizado!');
        setSaving(false);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `fans/${profile.id}-${Date.now()}`;
        const { error } = await supabase.storage.from('media-kit').upload(fileName, file);
        if (!error) {
            const url = supabase.storage.from('media-kit').getPublicUrl(fileName).data.publicUrl;
            setProfile({ ...profile, foto_url: url });
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white">Carregando...</div>;

    const rankInfo = getRankInfo(profile.level);
    const xpNext = getXpToNextLevel(profile.level);
    const totalPredictions = predictions.length;
    // Mocking wins for now as we don't have results logic fully set up
    const correctPredictions = predictions.filter(p => p.points > 0).length;

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white p-4 md:p-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h1 className="font-display font-bold text-2xl uppercase italic">Painel do FÃ</h1>
                    <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="text-red-500 hover:text-red-400">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* PROFILE CARD */}
                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative group">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* AVATAR CIRCLE */}
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-black z-0 border-2 border-[#333]">
                                <img src={profile.foto_url || 'https://placehold.co/150'} className="w-full h-full object-cover" />
                            </div>

                            {/* FRAME OVERLAY */}
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <img
                                    src={rankInfo.frameUrl}
                                    alt={rankInfo.title}
                                    className="w-full h-full object-contain drop-shadow-lg"
                                    style={{ transform: `scale(${rankInfo.frameScale || 1.4})` }}
                                />
                            </div>

                            {/* HOVER EDIT */}
                            <label className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer group">
                                <div className="w-24 h-24 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-[10px] font-bold uppercase text-white">Editar</span>
                                </div>
                                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nickname</label>
                                <input
                                    value={profile.nickname || ''}
                                    onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                                    className="w-full bg-[#0c0c0c] border border-[#333] p-3 rounded font-bold text-white focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nível {profile.level}</label>
                                <div className="w-full bg-[#0c0c0c] h-11 rounded border border-[#333] relative overflow-hidden flex items-center px-4">
                                    <div
                                        style={{ width: `${(profile.xp / xpNext) * 100}%` }}
                                        className="absolute left-0 top-0 h-full bg-purple-600/20"
                                    ></div>
                                    <span className="relative z-10 font-bold text-sm text-purple-400">{profile.xp} / {xpNext} XP ({rankInfo.title})</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={16} /> Salvar Perfil
                        </button>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col items-center justify-center h-32">
                        <Target className="text-purple-500 mb-2" size={24} />
                        <span className="text-3xl font-bold font-display">{totalPredictions}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">Palpites</span>
                    </div>
                    <div className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col items-center justify-center h-32">
                        <Trophy className="text-[#FFD700] mb-2" size={24} />
                        <span className="text-3xl font-bold font-display">{correctPredictions}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">Acertos</span>
                    </div>
                    <div className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col items-center justify-center h-32">
                        <span className="text-3xl font-bold font-display text-green-500">
                            {totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0}%
                        </span>
                        <span className="text-xs text-gray-500 uppercase font-bold">Acurácia</span>
                    </div>
                </div>

                {/* PREDICTION HISTORY */}
                <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                    <h2 className="font-display font-bold text-xl uppercase mb-6 flex items-center gap-2">
                        <Target className="text-purple-500" /> Histórico de Palpites
                    </h2>

                    <div className="space-y-3">
                        {predictions.length === 0 ? (
                            <p className="text-gray-500 italic">Nenhum palpite ainda.</p>
                        ) : (
                            predictions.map(pred => {
                                // Mock result check
                                const isWin = pred.points > 0;
                                const isPending = !pred.fight.vencedor_id;

                                return (
                                    <div key={pred.id} className="bg-black/40 border border-[#222] p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">{pred.fight.evento?.nome || 'Evento'}</p>
                                            <p className="font-bold text-sm">
                                                Apostou em <span className="text-purple-400">
                                                    {pred.selected_winner_id === pred.fight.atleta_a_id
                                                        ? (pred.fight.atleta_a?.apelido || pred.fight.atleta_a?.nome || 'Atleta A')
                                                        : (pred.fight.atleta_b?.apelido || pred.fight.atleta_b?.nome || 'Atleta B')
                                                    }
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-400">via {pred.method} - R{pred.round}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            {isPending ? (
                                                <span className="text-xs font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded">Pendente</span>
                                            ) : isWin ? (
                                                <span className="text-xs font-bold bg-green-900/30 text-green-500 px-2 py-1 rounded">+{pred.points} XP</span>
                                            ) : (
                                                <span className="text-xs font-bold bg-red-900/30 text-red-500 px-2 py-1 rounded">Errou</span>
                                            )}

                                            {isPending && (
                                                <button
                                                    onClick={() => setEditingItem(pred)}
                                                    className="text-xs text-purple-400 font-bold hover:text-white underline"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* EDIT MODAL */}
                {editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#111] border border-[#333] w-full max-w-md p-6 rounded-2xl relative">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                            <h3 className="font-bold uppercase text-lg mb-4">Editar Palpite</h3>

                            <EventPredictionCard
                                fight={editingItem.fight}
                                event={editingItem.fight.evento}
                                user={{ id: profile.user_id }}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
