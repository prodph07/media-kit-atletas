'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Save, LogOut, Eye, Bell, Swords, GraduationCap, Trophy } from 'lucide-react';
import { useProfileData } from '../../hooks/useProfileData';
import { safeVal, formatNumber, limparSlug } from '../../lib/utils';
import {
    processGamification,
    getXpToNextLevel,
    processDuelParticipation,
    processVisitMilestone,
    calculateNewLevelState,
    processDailyLogin,
    processWeeklyShare,
    processWeightCheckIn,
    processDailyAction,
    processTemporalXPResets
} from '../../lib/gamification';

import TabGeral from '../../components/panel/athlete/TabGeral';
import TabCartel from '../../components/panel/athlete/TabCartel';
import TabLutas from '../../components/panel/athlete/TabLutas';
import TabMidia from '../../components/panel/athlete/TabMidia';
import TabMetricas from '../../components/panel/athlete/TabMetricas';
import TabContato from '../../components/panel/athlete/TabContato';
import TabNotificacoes from '../../components/panel/athlete/TabNotificacoes';
import TabHistoricoDuelos from '../../components/panel/athlete/TabHistoricoDuelos';
import TabGeralEmpresa from '../../components/panel/company/TabGeralEmpresa';
import TabTreinador from '../../components/panel/coach/TabTreinador';
import TabPatrocinios from '../../components/panel/athlete/TabPatrocinios';
import TabMissoes from '../../components/panel/athlete/TabMissoes';
import ReferralCard from '../../components/panel/athlete/ReferralCard';
import BannerPremium from '../../components/panel/BannerPremium';
import TabOportunidades from '../../components/panel/company/TabOportunidades';
import TabScout from '../../components/panel/company/TabScout';
import TabMeuTime from '../../components/panel/company/TabMeuTime';
import TabEventos from '../../components/panel/company/TabEventos';
import TabEventosAtleta from '../../components/panel/athlete/TabEventosAtleta';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { 'Accept': 'application/json' } },
});

export default function Painel() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('geral');
    const [selectedType, setSelectedType] = useState(null); // 'atleta', 'fan', 'empresa'

    const {
        loading, userId, perfil, setPerfil,
        notificacoes, setNotificacoes,
        convitesEquipe, setConvitesEquipe,
        convitesParceria, setConvitesParceria,
        meusDuelos, setMeusDuelos,
        meusAlunos, setMeusAlunos,
        profileViews, totalViews,
        ageRange, setAgeRange,
        genderSplit, setGenderSplit,
        cityList, setCityList,
        pendingRegistrations, setPendingRegistrations
    } = useProfileData();

    useEffect(() => {
        if (perfil?.tipo_conta === 'fan') {
            router.push('/painel/fan');
        }
    }, [perfil, router]);

    // --- SELEÇÃO DE PERFIL (Se logado mas sem perfil) ---
    if (!loading && !perfil) {
        const handleConfirmSelection = async () => {
            if (!selectedType) return;

            if (selectedType === 'fan') {
                router.push('/cadastro/fan');
                return;
            }

            setSaving(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado");

                const { error } = await supabase.from('atletas').insert([{
                    user_id: user.id,
                    nome: user.user_metadata.full_name || 'Novo Usuário',
                    apelido: user.user_metadata.full_name?.split(' ')[0] || 'Novo',
                    foto_url: user.user_metadata.avatar_url || '',
                    tipo_conta: selectedType,
                    plano: 'free',
                    is_athlete: selectedType === 'atleta',
                    is_coach: false
                }]);

                if (error) throw error;
                window.location.reload();
            } catch (err) {
                alert("Erro ao criar perfil: " + err.message);
                setSaving(false);
            }
        };

        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
                <div className="max-w-4xl w-full flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-2 italic tracking-tighter uppercase">
                        Nocaute <span className="text-red-600">Pages</span>
                    </h1>
                    <p className="text-gray-400 text-center mb-8 text-lg">Escolha como você quer participar do nosso ecossistema.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                        {/* ATLETA */}
                        <div
                            onClick={() => setSelectedType('atleta')}
                            className={`group cursor-pointer bg-[#111] border p-8 rounded-2xl transition-all relative overflow-hidden ${selectedType === 'atleta' ? 'border-red-600 shadow-2xl shadow-red-900/20 scale-105 z-10' : 'border-[#222] hover:border-gray-700 hover:-translate-y-1 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition">
                                <Swords size={120} className={selectedType === 'atleta' ? 'text-red-600' : 'text-white'} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${selectedType === 'atleta' ? 'bg-red-600 text-white border-red-500' : 'bg-[#222] text-gray-500 border-[#333]'}`}>
                                    <Swords size={32} />
                                </div>
                                <h3 className={`text-2xl font-bold mb-2 uppercase ${selectedType === 'atleta' ? 'text-white' : 'text-gray-400'}`}>Atleta / Treinador</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Crie seu Media Kit profissional, gerencie sua carreira, busque patrocínios e conecte-se com eventos.
                                </p>
                            </div>
                        </div>

                        {/* FAN */}
                        <div
                            onClick={() => setSelectedType('fan')}
                            className={`group cursor-pointer bg-[#111] border p-8 rounded-2xl transition-all relative overflow-hidden ${selectedType === 'fan' ? 'border-green-600 shadow-2xl shadow-green-900/20 scale-105 z-10' : 'border-[#222] hover:border-gray-700 hover:-translate-y-1 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition">
                                <Trophy size={120} className={selectedType === 'fan' ? 'text-green-600' : 'text-white'} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${selectedType === 'fan' ? 'bg-green-600 text-white border-green-500' : 'bg-[#222] text-gray-500 border-[#333]'}`}>
                                    <Trophy size={32} />
                                </div>
                                <h3 className={`text-2xl font-bold mb-2 uppercase ${selectedType === 'fan' ? 'text-white' : 'text-gray-400'}`}>Fã / Analista</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Faça palpites nos eventos, suba no ranking global, ganhe recompensas e acompanhe seus ídolos.
                                </p>
                            </div>
                        </div>

                        {/* EMPRESA */}
                        <div
                            onClick={() => setSelectedType('empresa')}
                            className={`group cursor-pointer bg-[#111] border p-8 rounded-2xl transition-all relative overflow-hidden ${selectedType === 'empresa' ? 'border-purple-600 shadow-2xl shadow-purple-900/20 scale-105 z-10' : 'border-[#222] hover:border-gray-700 hover:-translate-y-1 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition">
                                <GraduationCap size={120} className={selectedType === 'empresa' ? 'text-purple-600' : 'text-white'} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${selectedType === 'empresa' ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#222] text-gray-500 border-[#333]'}`}>
                                    <GraduationCap size={32} />
                                </div>
                                <h3 className={`text-2xl font-bold mb-2 uppercase ${selectedType === 'empresa' ? 'text-white' : 'text-gray-400'}`}>Empresa / Evento</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Organize eventos, contrate atletas, divulgue sua marca e encontre novos talentos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmSelection}
                        disabled={!selectedType || saving}
                        className={`px-12 py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all transform ${selectedType ? 'bg-white text-black hover:scale-105 hover:shadow-xl shadow-white/20' : 'bg-[#222] text-gray-600 cursor-not-allowed'}`}
                    >
                        {saving ? 'Criando Perfil...' : 'Confirmar e Continuar'}
                    </button>

                    {!selectedType && <p className="mt-4 text-gray-600 text-sm animate-pulse">Selecione uma opção acima para continuar</p>}
                </div>
            </div>
        );
    }

    // Redireciona se não houver user (tratado no hook mas safety check aqui)
    if (!loading && !userId) {
        router.push('/login');
    }

    const handleOpenProfile = async () => {
        window.open(`/${perfil.slug || perfil.id}`, '_blank');
        const shareResult = processWeeklyShare(perfil.weekly_stats);
        if (shareResult.success) {
            const newState = calculateNewLevelState(perfil.xp, perfil.level, shareResult.xpGained);
            await supabase.from('atletas').update({ xp: newState.newXp, level: newState.newLevel, weekly_stats: shareResult.updatedStats }).eq('user_id', userId);
            setPerfil(prev => ({ ...prev, xp: newState.newXp, level: newState.newLevel, weekly_stats: shareResult.updatedStats }));
            alert(shareResult.message);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        const result = processDailyAction(perfil.weekly_stats, 'DAILY_STATUS');
        let finalXp = perfil.xp;
        let finalLevel = perfil.level;
        let finalStats = perfil.weekly_stats;

        if (result.success) {
            const state = calculateNewLevelState(perfil.xp, perfil.level, result.xpGained);
            finalXp = state.newXp;
            finalLevel = state.newLevel;
            finalStats = result.updatedStats;
            alert(`💬 Status atualizado! (+${result.xpGained} XP na missão diária)`);
        } else {
            alert("💬 Status atualizado!");
        }

        const { error } = await supabase.from('atletas').update({
            status_message: newStatus,
            xp: finalXp,
            level: finalLevel,
            weekly_stats: finalStats
        }).eq('user_id', userId);

        if (!error) {
            setPerfil(prev => ({
                ...prev,
                status_message: newStatus,
                xp: finalXp,
                level: finalLevel,
                weekly_stats: finalStats
            }));
        }
    };

    const deleteImageFromBucket = async (url) => {
        if (!url || typeof url !== 'string' || !url.includes('/media-kit/')) return;
        const path = url.split('/media-kit/')[1];
        if (path) await supabase.storage.from('media-kit').remove([path]);
    };
    const handleDeleteImage = async (arrName, index, url) => {
        if (!confirm("Excluir imagem?")) return;
        await deleteImageFromBucket(url);
        const n = [...perfil[arrName]]; n.splice(index, 1); setPerfil({ ...perfil, [arrName]: n });
    };
    const handleDeleteProfilePic = async () => {
        if (!perfil.foto_url || !confirm("Remover foto?")) return;
        await deleteImageFromBucket(perfil.foto_url);
        setPerfil({ ...perfil, foto_url: '' });
    };

    const handleChange = (e) => setPerfil({ ...perfil, [e.target.name]: e.target.value });
    const handleSlugChange = (e) => setPerfil({ ...perfil, slug: limparSlug(e.target.value) });
    const handleStatsChange = (e) => setPerfil({ ...perfil, stats: { ...perfil.stats, [e.target.name]: e.target.value } });
    const handleRecordChange = (e) => setPerfil({ ...perfil, record: { ...perfil.record, [e.target.name]: e.target.value } });
    const handleContactChange = (e) => setPerfil({ ...perfil, contact: { ...perfil.contact, [e.target.name]: e.target.value } });
    const handleNextFightChange = (e) => setPerfil({ ...perfil, nextFight: { ...perfil.nextFight, [e.target.name]: e.target.value } });
    const handleInstaStats = (c, f, v) => setPerfil(prev => ({ ...prev, socials: { ...prev.socials, instagram: { ...prev.socials.instagram, [c]: { ...prev.socials.instagram[c], [f]: v } } } }));
    const handleSocialChange = (network, field, value) => { setPerfil(prev => ({ ...prev, socials: { ...prev.socials, [network]: { ...prev.socials[network], [field]: value, active: !!value || prev.socials[network].active } } })); };

    // ---------- ACTIONS ------------

    const handleParceriaAction = async (inviteId, action) => {
        const newStatus = action === 'accept' ? 'ativo' : 'recusado';
        const { error } = await supabase.from('parcerias').update({ status: newStatus }).eq('id', inviteId);
        if (error) {
            alert("Erro ao processar: " + error.message);
        } else {
            alert(action === 'accept' ? "Parceria aceita! Agora vocês fazem parte do mesmo time." : "Convite recusado.");
            setConvitesParceria(prev => prev.filter(c => c.id !== inviteId));
        }
    };

    const handleEquipeAction = async (inviteId, action) => {
        const isPremium = perfil.plano === 'premium';
        if (!isPremium && action === 'accept') {
            alert("🔒 RECURSO PREMIUM\n\nApenas usuários Premium podem se conectar a Treinadores/Equipes.\nFaça o upgrade para desbloquear.");
            return;
        }

        if (action === 'accept') {
            try {
                const { error } = await supabase.from('relacoes').update({ status: 'accepted' }).eq('id', inviteId);
                if (error) throw error;

                const inviteData = convitesEquipe.find(c => c.id === inviteId);
                const coachName = inviteData?.coach?.nome || "Treinador";
                const coachId = inviteData?.coach_id;
                const studentTag = `xp_connect_coach_${coachId}`; const coachTag = `xp_connect_student_${perfil.id}`;
                let alertMsg = `Convite aceito! Agora você faz parte da equipe de ${coachName}.`;

                const myTasks = perfil.completed_tasks || [];
                if (!myTasks.includes(studentTag)) {
                    const connState = calculateNewLevelState(perfil.xp, perfil.level, 150);
                    const newTasks = [...myTasks, studentTag];
                    await supabase.from('atletas').update({ xp: connState.newXp, level: connState.newLevel, completed_tasks: newTasks }).eq('user_id', userId);
                    setPerfil(prev => ({ ...prev, xp: connState.newXp, level: connState.newLevel, completed_tasks: newTasks }));
                    alertMsg += `\n🎉 +150 XP Conexão!`;
                    if (connState.levelUp) alertMsg += `\n🆙 LEVEL UP! Nível ${connState.newLevel}!`;
                } else { alertMsg += `\n(Você já recebeu XP por esta conexão anteriormente).`; }

                if (coachId) {
                    const { data: coachData } = await supabase.from('atletas').select('user_id, xp, level, completed_tasks').eq('id', coachId).single();
                    if (coachData && !coachData.completed_tasks?.includes(coachTag)) {
                        const cState = calculateNewLevelState(coachData.xp, coachData.level, 150);
                        const cTasks = [...(coachData.completed_tasks || []), coachTag];
                        await supabase.from('atletas').update({ xp: cState.newXp, level: cState.newLevel, completed_tasks: cTasks }).eq('user_id', coachData.user_id);
                    }
                }
                alert(alertMsg);
                setConvitesEquipe(prev => prev.filter(c => c.id !== inviteId));
            } catch (err) { alert("Erro: " + err.message); }
        } else {
            await supabase.from('relacoes').delete().eq('id', inviteId);
            alert("Convite recusado."); setConvitesEquipe(prev => prev.filter(c => c.id !== inviteId));
        }
    };

    const handleDueloAction = async (dueloId, action) => {
        if (action === 'accept') {
            try {
                const { data: duelData } = await supabase.from('duelos').select('atleta_1_id').eq('id', dueloId).single();
                if (duelData && duelData.atleta_1_id) {
                    const { data: challenger } = await supabase.from('atletas').select('user_id, xp, level, weekly_stats').eq('id', duelData.atleta_1_id).single();
                    if (challenger) {
                        const chalResult = processDuelParticipation(challenger.weekly_stats);
                        if (chalResult.success) {
                            const s = calculateNewLevelState(challenger.xp, challenger.level, chalResult.xpGained);
                            await supabase.from('atletas').update({ xp: s.newXp, level: s.newLevel, weekly_stats: chalResult.updatedStats }).eq('user_id', challenger.user_id);
                        }
                    }
                }
            } catch (error) { console.error(error); }
            const myResult = processDuelParticipation(perfil.weekly_stats);
            if (myResult.success) {
                const s = calculateNewLevelState(perfil.xp, perfil.level, myResult.xpGained);
                await supabase.from('atletas').update({ xp: s.newXp, level: s.newLevel, weekly_stats: myResult.updatedStats }).eq('user_id', userId);
                setPerfil(prev => ({ ...prev, xp: s.newXp, level: s.newLevel, weekly_stats: myResult.updatedStats }));
                alert(myResult.message);
            }
            const { error } = await supabase.from('duelos').update({ status: 'active' }).eq('id', dueloId);
            if (!error) { window.location.reload(); }
        } else if (action === 'delete') {
            const { error } = await supabase.from('duelos').delete().eq('id', dueloId);
            if (!error) { alert("Duelo excluído."); setMeusDuelos(prev => prev.filter(d => d.id !== dueloId)); }
        } else {
            const { error } = await supabase.from('duelos').delete().eq('id', dueloId);
            if (!error) { alert("Duelo Recusado."); setNotificacoes(prev => prev.filter(d => d.id !== dueloId)); }
        }
    };

    const handleEventApprovalAction = async (registrationId, action) => {
        const newStatus = action === 'approve' ? 'aprovado' : 'recusado';
        try {
            const { error } = await supabase.from('eventos_inscricoes').update({ status: newStatus }).eq('id', registrationId);
            if (error) throw error;

            alert(action === 'approve' ? "Inscrição aprovada com sucesso!" : "Inscrição recusada.");
            setPendingRegistrations(prev => prev.filter(r => r.id !== registrationId));
        } catch (err) {
            alert("Erro ao processar: " + err.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const isPremium = perfil.plano === 'premium';

        let dadosParaSalvar = { ...perfil };

        if (!isPremium) {
            if (dadosParaSalvar.galeria.length > 2) dadosParaSalvar.galeria = dadosParaSalvar.galeria.slice(0, 2);
            if (dadosParaSalvar.video_lista.length > 1) dadosParaSalvar.video_lista = dadosParaSalvar.video_lista.slice(0, 1);
            if (dadosParaSalvar.premios.length > 1) dadosParaSalvar.premios = dadosParaSalvar.premios.slice(0, 1);
            if (dadosParaSalvar.historico.length > 1) dadosParaSalvar.historico = dadosParaSalvar.historico.slice(0, 1);
            dadosParaSalvar.nextFight = { date: '', event: '', opponent: '', location: '' };
            dadosParaSalvar.socials = {
                instagram: dadosParaSalvar.socials.instagram,
                youtube: { active: false, user: '', url: '', followers: '' },
                tiktok: { active: false, user: '', url: '', followers: '' },
                x: { active: false, user: '', url: '', followers: '' },
                kwai: { active: false, user: '', url: '', followers: '' }
            };
        } else {
            if (dadosParaSalvar.galeria.length > 5) dadosParaSalvar.galeria = dadosParaSalvar.galeria.slice(0, 5);
            if (dadosParaSalvar.video_lista.length > 5) dadosParaSalvar.video_lista = dadosParaSalvar.video_lista.slice(0, 5);
        }

        if (dadosParaSalvar.slug) {
            const slugLimpo = limparSlug(dadosParaSalvar.slug);
            const { data: exists } = await supabase.from('atletas').select('id').eq('slug', slugLimpo).neq('user_id', userId).maybeSingle();
            if (exists) { alert("Link em uso."); setSaving(false); return; }
            dadosParaSalvar.slug = slugLimpo;
        }

        const currentCompletedTasks = dadosParaSalvar.completed_tasks || [];
        let { xpGained, newTasks, notifications } = processGamification(dadosParaSalvar, currentCompletedTasks);

        let currentWeeklyStats = dadosParaSalvar.weekly_stats || {};
        if (dadosParaSalvar.stats && dadosParaSalvar.stats.weight) {
            const weightResult = processWeightCheckIn(currentWeeklyStats);
            if (weightResult.success) {
                xpGained += weightResult.xpGained;
                currentWeeklyStats = weightResult.updatedStats;
                notifications.push(weightResult.message);
            }
        }

        // FIX: Map local 'about' back to DB 'sobre'
        if (dadosParaSalvar.about !== undefined) {
            dadosParaSalvar.sobre = dadosParaSalvar.about;
            delete dadosParaSalvar.about;
        }

        // Clean up flat fields
        delete dadosParaSalvar.stats;
        delete dadosParaSalvar.contact;
        delete dadosParaSalvar.nextFight;
        delete dadosParaSalvar.socials;
        delete dadosParaSalvar.record;
        delete dadosParaSalvar.coach_details; // STORAGE FOR METADATA (Payment Config) - Actually let's keep it if we can
        // Wait, I commented out previous delete, but now I need to make sure I don't delete it if I want to save it!
        // But `coach_details` IS a column (jsonb/json), so that's fine.
        // The problem is `mp_access_token` which is NOT a column.

        delete dadosParaSalvar.mp_access_token; // Remove if leaked to root

        // Only update `team` if user is athlete
        const payload = { ...dadosParaSalvar, xp: (dadosParaSalvar.xp || 0) + xpGained, completed_tasks: newTasks, weekly_stats: currentWeeklyStats };
        if (dadosParaSalvar.tipo_conta === 'atleta') {
            payload.team = dadosParaSalvar.team;
        }

        const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);

        if (error) {
            alert("Erro ao salvar: " + error.message);
        } else {
            if (xpGained > 0) {
                const state = calculateNewLevelState(dadosParaSalvar.xp, dadosParaSalvar.level, xpGained);
                if (state.levelUp) notifications.push(`🆙 LEVEL UP! Nível ${state.newLevel}!`);
                await supabase.from('atletas').update({ xp: state.newXp, level: state.newLevel }).eq('user_id', userId);
                setPerfil({ ...dadosParaSalvar, xp: state.newXp, level: state.newLevel, completed_tasks: newTasks });
            } else {
                setPerfil(dadosParaSalvar);
            }
            if (notifications.length > 0) alert(notifications.join('\n'));
            else alert("Perfil salvo com sucesso!");
        }
        setSaving(false);
    };

    if (loading) return <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;


    // --- NORMAL PANEL RENDER (se perfil existe) ---
    if (!perfil) return null; // Should be handled by top if, but safe check

    const isCompany = perfil.tipo_conta === 'empresa';
    const isCoach = perfil.is_coach || perfil.tipo_conta === 'treinador';
    const numNotificacoes = notificacoes.length + convitesEquipe.length + convitesParceria.length;

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-gray-200 font-sans md:pb-0">
            {/* Header Mobile */}
            <div className="md:hidden bg-[#111] p-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#222]">
                <div className="flex items-center gap-3">
                    <div onClick={() => router.push('/')} className="font-bold tracking-tighter text-lg flex items-center gap-2 text-gray-100 cursor-pointer">
                        <Swords className="text-red-600 w-5 h-5" /> FIGHTNEXUS
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('notificacoes')} className="relative p-2 text-gray-400 hover:text-white">
                        <Bell className="w-6 h-6" />
                        {numNotificacoes > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#111]"></span>}
                    </button>
                    <button onClick={handleOpenProfile} className="p-2 text-gray-400 hover:text-white">
                        <Eye className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Tab Navigation (Scrollable Top) */}
            <div className="md:hidden bg-[#111] border-b border-[#222] overflow-x-auto whitespace-nowrap sticky top-[60px] z-40 custom-scrollbar">
                <div className="flex px-4 py-2 gap-2">
                    {/* ATHLETE TABS */}
                    {!isCompany && (
                        <>
                            <button onClick={() => setActiveTab('geral')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'geral' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Geral</button>
                            <button onClick={() => setActiveTab('cartel')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'cartel' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Cartel</button>
                            <button onClick={() => setActiveTab('lutas')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'lutas' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Lutas</button>
                            <button onClick={() => setActiveTab('midia')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'midia' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Mídia</button>
                            <button onClick={() => setActiveTab('eventos_atleta')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'eventos_atleta' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Eventos</button>
                            <button onClick={() => setActiveTab('missoes')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'missoes' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Missões</button>
                            <button onClick={() => setActiveTab('metricas')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'metricas' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Métricas</button>
                            <button onClick={() => setActiveTab('patrocinios')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'patrocinios' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Patrocínios</button>
                            {isCoach && <button onClick={() => setActiveTab('treinador')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'treinador' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Treinador</button>}
                            <button onClick={() => setActiveTab('duelos')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'duelos' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Duelos</button>
                        </>
                    )}

                    {/* COMPANY TABS */}
                    {isCompany && (
                        <>
                            <button onClick={() => setActiveTab('geral')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'geral' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Geral</button>
                            <button onClick={() => setActiveTab('oportunidades')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'oportunidades' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Vagas</button>
                            <button onClick={() => setActiveTab('scout')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'scout' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Scout</button>
                            <button onClick={() => setActiveTab('meu_time')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'meu_time' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Time</button>
                            <button onClick={() => setActiveTab('eventos_company')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'eventos_company' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Eventos</button>
                        </>
                    )}

                    <button onClick={() => setActiveTab('contato')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'contato' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'}`}>Contato</button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row max-w-7xl mx-auto md:p-6 gap-6">

                {/* Sidebar Desktop */}
                <div className="hidden md:flex w-64 flex-col gap-2 sticky top-6 h-fit">
                    <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] mb-3 overflow-hidden border-2 border-[#333]">
                                {perfil.foto_url ? <img src={perfil.foto_url} className="w-full h-full object-cover" /> : null}
                            </div>
                            <h2 className="font-bold text-lg text-white text-center">{perfil.apelido || perfil.nome}</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{perfil.tipo_conta}</p>
                        </div>

                        <nav className="space-y-1">
                            {['geral', 'midia'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}

                            {/* Company Specific Only */}
                            {isCompany && (
                                <>
                                    <button onClick={() => setActiveTab('oportunidades')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'oportunidades' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Oportunidades</button>
                                    <button onClick={() => setActiveTab('scout')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'scout' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Scout</button>
                                    <button onClick={() => setActiveTab('meu_time')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'meu_time' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Meu Time</button>
                                    <button onClick={() => setActiveTab('eventos_company')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'eventos_company' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Meus Eventos</button>
                                </>
                            )}

                            {/* Athlete Specific */}
                            {!isCompany && (
                                <>
                                    <button onClick={() => setActiveTab('cartel')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'cartel' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Cartel & Atributos</button>
                                    <button onClick={() => setActiveTab('lutas')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'lutas' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Próxima Luta / Histórico</button>
                                    <button onClick={() => setActiveTab('eventos_atleta')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'eventos_atleta' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Meus Eventos</button>
                                    <button onClick={() => setActiveTab('missoes')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'missoes' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Missões</button>
                                    <button onClick={() => setActiveTab('metricas')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'metricas' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Métricas</button>
                                    <button onClick={() => setActiveTab('patrocinios')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'patrocinios' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Patrocínios</button>
                                    {isCoach && <button onClick={() => setActiveTab('treinador')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'treinador' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Área do Treinador</button>}
                                    <button onClick={() => setActiveTab('duelos')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'duelos' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Duelos</button>
                                </>
                            )}

                            <button onClick={() => setActiveTab('contato')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'contato' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>Contato</button>
                            <button onClick={() => setActiveTab('notificacoes')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notificacoes' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}>
                                Notificações {numNotificacoes > 0 && `(${numNotificacoes})`}
                            </button>
                        </nav>

                        <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="mt-6 w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold py-3 transition-colors">
                            <LogOut className="w-4 h-4" /> Sair
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-6 px-4 md:px-0">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                            {isCompany ? `Empresa: ${activeTab.replace('_', ' ')}` : `Painel: ${activeTab}`}
                        </h1>
                        <div className="hidden md:flex gap-3">
                            {!isCompany && <div className="relative">
                                <button onClick={handleOpenProfile} className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-[#333] transition-colors"> <Eye className="w-4 h-4" /> Ver Perfil </button>
                            </div>}
                            <button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all disabled:opacity-50">
                                {saving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#111] md:rounded-3xl md:p-8 md:border border-[#222] min-h-[500px] mb-20 md:mb-0">
                        {/* Banner Premium */}
                        {!isCompany && <BannerPremium atleta={perfil} />}

                        {activeTab === 'geral' && !isCompany && <TabGeral perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleUpdateStatus={handleUpdateStatus} handleDeleteProfilePic={handleDeleteProfilePic} userId={userId} isPremium={perfil.plano === 'premium'} />}
                        {activeTab === 'geral' && isCompany && <TabGeralEmpresa perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleDeleteProfilePic={handleDeleteProfilePic} isPremium={perfil.plano === 'premium'} userId={userId} />}

                        {activeTab === 'cartel' && !isCompany && <TabCartel perfil={perfil} handleStatsChange={handleStatsChange} handleRecordChange={handleRecordChange} isPremium={perfil.plano === 'premium'} />}
                        {activeTab === 'lutas' && !isCompany && <TabLutas perfil={perfil} handleNextFightChange={handleNextFightChange} handleDeleteFight={(index) => { const h = [...perfil.historico]; h.splice(index, 1); setPerfil({ ...perfil, historico: h }); }} handleAddFight={() => setPerfil({ ...perfil, historico: [...perfil.historico, { event: '', date: '', result: 'Vitória', method: '', opponent: '' }] })} handleFightChange={(index, e) => { const h = [...perfil.historico]; h[index][e.target.name] = e.target.value; setPerfil({ ...perfil, historico: h }); }} isPremium={perfil.plano === 'premium'} />}
                        {activeTab === 'midia' && <TabMidia perfil={perfil} handleDeleteImage={handleDeleteImage} handleAddVideo={() => setPerfil({ ...perfil, video_lista: [...perfil.video_lista, { title: '', url: '', type: 'youtube' }] })} handleDeleteVideo={(index) => { const v = [...perfil.video_lista]; v.splice(index, 1); setPerfil({ ...perfil, video_lista: v }); }} handleVideoChange={(index, field, value) => { const v = [...perfil.video_lista]; v[index][field] = value; setPerfil({ ...perfil, video_lista: v }); }}
                            handleUploadGallery={async (e) => {
                                if (!e.target.files || e.target.files.length === 0) return;
                                setSaving(true);
                                const file = e.target.files[0];
                                const fileExt = file.name.split('.').pop();
                                const fileName = `gallery/${userId}-${Math.random()}.${fileExt}`;
                                const { error } = await supabase.storage.from('media-kit').upload(fileName, file);
                                if (error) { alert("Erro: " + error.message); setSaving(false); return; }
                                const publicUrl = supabase.storage.from('media-kit').getPublicUrl(fileName).data.publicUrl;
                                setPerfil({ ...perfil, galeria: [...perfil.galeria, publicUrl] });
                                setSaving(false);
                            }}
                        />}
                        {activeTab === 'metricas' && !isCompany && <TabMetricas perfil={perfil} isPremium={perfil.plano === 'premium'} handleInstaStats={handleInstaStats} handleSocialChange={handleSocialChange} ageRange={ageRange} setAgeRange={setAgeRange} genderSplit={genderSplit} setGenderSplit={setGenderSplit} cityList={cityList} setCityList={setCityList} profileViews={profileViews} totalViews={totalViews} />}
                        {activeTab === 'contato' && <TabContato perfil={perfil} handleContactChange={handleContactChange} />}
                        {activeTab === 'contato' && <TabContato perfil={perfil} handleContactChange={handleContactChange} />}
                        {activeTab === 'notificacoes' && <TabNotificacoes notificacoes={notificacoes} convitesEquipe={convitesEquipe} convitesParceria={convitesParceria} pendingRegistrations={pendingRegistrations} handleDueloAction={handleDueloAction} handleEquipeAction={handleEquipeAction} handleParceriaAction={handleParceriaAction} handleEventApprovalAction={handleEventApprovalAction} />}
                        {activeTab === 'duelos' && !isCompany && <TabHistoricoDuelos meusDuelos={meusDuelos} handleDueloAction={handleDueloAction} />}
                        {activeTab === 'duelos' && !isCompany && <TabHistoricoDuelos meusDuelos={meusDuelos} handleDueloAction={handleDueloAction} />}
                        {activeTab === 'treinador' && isCoach && <TabTreinador perfil={perfil} setPerfil={setPerfil} isPremium={perfil.plano === 'premium'} />}
                        {activeTab === 'patrocinios' && !isCompany && <TabPatrocinios perfil={perfil} />}
                        {activeTab === 'missoes' && !isCompany && <TabMissoes perfil={perfil} />}

                        {/* COMPANY TABS */}
                        {activeTab === 'oportunidades' && <TabOportunidades empresaId={perfil.id} />}
                        {activeTab === 'scout' && <TabScout />}
                        {activeTab === 'meu_time' && <TabMeuTime empresaId={perfil.id} />}
                        {activeTab === 'eventos_company' && <TabEventos empresaId={perfil.id} userId={perfil.user_id} />}
                        {activeTab === 'eventos_atleta' && !isCompany && <TabEventosAtleta atletaId={perfil.id} />}

                    </div>
                </div>
            </div>


        </div>
    );
}