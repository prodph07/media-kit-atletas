'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, LogOut, Eye, Bell, Swords, GraduationCap, Trophy } from 'lucide-react';

import {
    processGamification,
    getXpToNextLevel,
    processDuelParticipation,
    processVisitMilestone,
    calculateNewLevelState,
    processDailyLogin,
    processWeeklyShare,
    processWeightCheckIn,
    processDailyAction
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
import TabMissoes from '../../components/panel/athlete/TabMissoes';
import ReferralCard from '../../components/panel/athlete/ReferralCard';
import BannerPremium from '../../components/panel/BannerPremium'; // <--- IMPORTADO AQUI

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const safeVal = (val) => val === null || val === undefined ? '' : val;

export default function Painel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('geral');
    const [userId, setUserId] = useState(null);

    // Estados
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [genderSplit, setGenderSplit] = useState({ men: '', women: '' });
    const [cityList, setCityList] = useState([]);
    const [profileViews, setProfileViews] = useState([]);
    const [totalViews, setTotalViews] = useState(0);
    const [notificacoes, setNotificacoes] = useState([]);
    const [convitesEquipe, setConvitesEquipe] = useState([]);
    const [meusDuelos, setMeusDuelos] = useState([]);
    const [meusAlunos, setMeusAlunos] = useState([]);

    const [perfil, setPerfil] = useState({
        id: null, nome: '', apelido: '', categoria: '', foto_url: '', about: '', slug: '', fightingStyle: '',
        status_message: '',
        plano: 'free', tipo_conta: 'atleta', template_style: 'padrao',
        is_athlete: true, is_coach: false, coach_details: {},
        xp: 0, level: 1, completed_tasks: [], weekly_stats: {},
        stats: { height: '', weight: '', reach: '', age: '' },
        record: { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
        contact: { email: '', managerEmail: '', phone: '', phoneDisplay: '', city: '', trainingCenter: '' },
        nextFight: { date: '', event: '', opponent: '', location: '' },
        socials: {
            instagram: { active: true, user: '', followers: '', url: '', stats: { reach: '', impressions: '', engagement: '', shares: '' }, audience: { age: '', gender: '', cities: '' } },
            youtube: { active: false, user: '', followers: '', url: '' },
            tiktok: { active: false, user: '', followers: '', url: '' },
            x: { active: false, user: '', followers: '', url: '' },
            kwai: { active: false, user: '', followers: '', url: '' }
        },
        historico: [], video_lista: [], galeria: [], premios: []
    });

    const limparSlug = (texto) => texto.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const formatNumber = (value) => !value ? '' : value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    useEffect(() => {
        async function getData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            setUserId(user.id);

            const { data } = await supabase.from('atletas').select('*').eq('user_id', user.id).single();

            if (data) {
                const ATLETA_ID_NUMERICO = data.id;

                // --- GAMIFICAÇÃO AUTOMÁTICA ---
                const currentStats = data.weekly_stats || {};
                let finalWeeklyStats = currentStats;
                let finalXp = data.xp || 0;
                let finalLevel = data.level || 1;
                let autoAlerts = [];

                const loginResult = processDailyLogin(currentStats);
                if (loginResult.success) {
                    const state = calculateNewLevelState(finalXp, finalLevel, loginResult.xpGained);
                    finalXp = state.newXp; finalLevel = state.newLevel; finalWeeklyStats = loginResult.updatedStats;
                    autoAlerts.push(loginResult.message);
                    if (state.levelUp) autoAlerts.push(`🆙 LEVEL UP! Nível ${state.newLevel}!`);
                }

                const { count: viewCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', ATLETA_ID_NUMERICO);
                const totalV = viewCount || 0;

                const visitResult = processVisitMilestone(totalV, finalWeeklyStats);
                if (visitResult.success) {
                    const state = calculateNewLevelState(finalXp, finalLevel, visitResult.xpGained);
                    finalXp = state.newXp; finalLevel = state.newLevel; finalWeeklyStats = visitResult.updatedStats;
                    autoAlerts.push(visitResult.message);
                    if (state.levelUp) autoAlerts.push(`🆙 LEVEL UP! Nível ${state.newLevel}!`);
                }

                if (loginResult.success || visitResult.success) {
                    await supabase.from('atletas').update({ xp: finalXp, level: finalLevel, weekly_stats: finalWeeklyStats }).eq('user_id', user.id);
                    if (autoAlerts.length > 0) alert(autoAlerts.join('\n'));
                }

                // Popular Dados
                const instaData = data.redes_sociais?.instagram || {};
                const ageMatch = (instaData.audience?.age || '').match(/(\d+)-(\d+)/);
                if (ageMatch) setAgeRange({ min: ageMatch[1], max: ageMatch[2] });
                const genderStr = instaData.audience?.gender || '';
                const menMatch = genderStr.match(/(\d+)% Homens/);
                const womenMatch = genderStr.match(/(\d+)% Mulheres/);
                setGenderSplit({ men: menMatch ? menMatch[1] : '', women: womenMatch ? womenMatch[1] : '' });
                const citiesStr = instaData.audience?.cities || '';
                if (citiesStr) {
                    setCityList(citiesStr.split(',').map(item => {
                        const match = item.match(/(.+)\s\((\d+)%\)/);
                        return match ? { name: match[1].trim(), percent: match[2] } : null;
                    }).filter(Boolean));
                }

                setPerfil({
                    ...data,
                    nome: safeVal(data.nome), apelido: safeVal(data.apelido), categoria: safeVal(data.categoria), foto_url: safeVal(data.foto_url),
                    about: safeVal(data.sobre), plano: data.plano || 'free', tipo_conta: data.tipo_conta || 'atleta', template_style: data.template_style || 'padrao', slug: safeVal(data.slug),
                    status_message: safeVal(data.status_message),
                    is_athlete: data.is_athlete ?? true, is_coach: data.is_coach ?? false, coach_details: data.coach_details || {},
                    xp: finalXp, level: finalLevel, weekly_stats: finalWeeklyStats, completed_tasks: data.completed_tasks || [],
                    stats: { height: safeVal(data.atributos?.height), weight: safeVal(data.atributos?.weight), reach: safeVal(data.atributos?.reach), age: safeVal(data.atributos?.age) },
                    record: data.cartel || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
                    contact: { email: safeVal(data.contato?.email), managerEmail: safeVal(data.contato?.managerEmail), phone: safeVal(data.contato?.phone), phoneDisplay: safeVal(data.contato?.phoneDisplay), city: safeVal(data.contato?.city), trainingCenter: safeVal(data.contato?.trainingCenter) },
                    nextFight: { date: safeVal(data.prox_luta?.date), event: safeVal(data.prox_luta?.event), opponent: safeVal(data.prox_luta?.opponent), location: safeVal(data.prox_luta?.location) },
                    socials: {
                        instagram: { ...instaData, active: true, user: safeVal(instaData.user), followers: safeVal(instaData.followers), url: safeVal(instaData.url), stats: { ...instaData.stats }, audience: instaData.audience || {} },
                        youtube: { active: false, ...data.redes_sociais?.youtube }, tiktok: { active: false, ...data.redes_sociais?.tiktok },
                        x: { active: false, ...data.redes_sociais?.x }, kwai: { active: false, ...data.redes_sociais?.kwai }
                    },
                    historico: data.historico || [], video_lista: data.video_lista || [], galeria: data.galeria || [], premios: data.premios || []
                });

                const { data: duelosPendentes } = await supabase.from('duelos').select(`id, created_at, atleta_1_id, desafiante:atletas!atleta_1_id(nome, apelido, foto_url)`).eq('atleta_2_id', ATLETA_ID_NUMERICO).eq('status', 'pending');
                setNotificacoes(duelosPendentes || []);
                const { data: convitesCoach } = await supabase.from('relacoes').select(`id, created_at, coach_id, coach:atletas!coach_id(nome, apelido, foto_url, coach_details)`).eq('student_id', ATLETA_ID_NUMERICO).eq('status', 'pending');
                setConvitesEquipe(convitesCoach || []);
                const { data: historico } = await supabase.from('duelos').select(`id, created_at, status, expires_at, votos_1, votos_2, p1:atletas!atleta_1_id(id, nome, apelido, foto_url), p2:atletas!atleta_2_id(id, nome, apelido, foto_url)`).or(`atleta_1_id.eq.${ATLETA_ID_NUMERICO},atleta_2_id.eq.${ATLETA_ID_NUMERICO}`).order('created_at', { ascending: false });
                setMeusDuelos(historico || []);

                if (data.is_coach) {
                    const { data: studentsData } = await supabase.from('relacoes').select('id, created_at, status, student:atletas!student_id(nome, apelido, foto_url, xp, level, categoria)').eq('coach_id', ATLETA_ID_NUMERICO).eq('status', 'accepted');
                    setMeusAlunos(studentsData || []);
                }

                setTotalViews(totalV);
                const { data: viewsData } = await supabase.from('profile_views').select('created_at, visitante_tipo, visitante_id').eq('perfil_visitado_id', ATLETA_ID_NUMERICO).neq('visitante_tipo', 'anonimo').order('created_at', { ascending: false }).limit(data.plano === 'premium' ? 100 : 20);
                let viewsCompletas = [];
                if (data.plano === 'premium' && viewsData && viewsData.length > 0) {
                    const idsVisitantes = viewsData.map(v => v.visitante_id).filter(Boolean);
                    if (idsVisitantes.length > 0) {
                        const { data: perfisVisitantes } = await supabase.from('atletas').select('user_id, nome, apelido, foto_url, slug').in('user_id', idsVisitantes);
                        viewsCompletas = viewsData.map(view => {
                            const detalhes = perfisVisitantes?.find(p => p.user_id === view.visitante_id);
                            return { ...view, detalhes };
                        });
                    }
                }
                setProfileViews(viewsCompletas);
            }
            setLoading(false);
        }
        getData();
    }, []);

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

        let finalXp = (dadosParaSalvar.xp || 0);
        let finalLevel = (dadosParaSalvar.level || 1);

        if (xpGained > 0) {
            const state = calculateNewLevelState(finalXp, finalLevel, xpGained);
            finalXp = state.newXp;
            finalLevel = state.newLevel;
            if (state.levelUp) alert(`🎉 LEVEL UP! Você alcançou o Nível ${finalLevel}!`);
            alert(`🏆 Você ganhou +${xpGained} XP!\n\nConquistas:\n- ${notifications.join('\n- ')}`);
        }

        const payload = {
            nome: dadosParaSalvar.nome, apelido: dadosParaSalvar.apelido, categoria: dadosParaSalvar.categoria, foto_url: dadosParaSalvar.foto_url, slug: dadosParaSalvar.slug,
            sobre: dadosParaSalvar.about, estilodeluta: dadosParaSalvar.fightingStyle, atributos: dadosParaSalvar.stats, cartel: dadosParaSalvar.record,
            contato: dadosParaSalvar.contato, prox_luta: dadosParaSalvar.nextFight, redes_sociais: dadosParaSalvar.socials,
            historico: dadosParaSalvar.historico, video_lista: dadosParaSalvar.video_lista, galeria: dadosParaSalvar.galeria, premios: dadosParaSalvar.premios,
            tipo_conta: dadosParaSalvar.tipo_conta, template_style: dadosParaSalvar.template_style,
            status_message: dadosParaSalvar.status_message,
            is_athlete: dadosParaSalvar.is_athlete, is_coach: dadosParaSalvar.is_coach, coach_details: dadosParaSalvar.coach_details,
            xp: finalXp, level: finalLevel, completed_tasks: newTasks, weekly_stats: currentWeeklyStats
        };

        const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);

        if (error) { alert("Erro: " + error.message); }
        else {
            alert("Salvo com Sucesso!");
            setPerfil({ ...dadosParaSalvar, xp: finalXp, level: finalLevel, completed_tasks: newTasks, weekly_stats: currentWeeklyStats });
        }
        setSaving(false);
    }

    if (loading) return <div className="text-white p-10 text-center">Carregando...</div>;
    const isPremium = perfil.plano === 'premium';
    const isCompany = perfil.tipo_conta === 'empresa';
    const totalNotificacoes = notificacoes.length + convitesEquipe.length;

    return (
        <div className="bg-[#F3F4F6] dark:bg-[#0c0c0c] font-body text-gray-800 dark:text-gray-200 transition-colors duration-200 h-screen flex flex-col overflow-hidden">
            <style jsx global>{`
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #1a1a1a; }
                ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #FF4500; }
                .industrial-border { border: 1px solid; @apply border-gray-300 dark:border-[#333333]; }
                .checkbox-wrapper input:checked + div { background-color: #FF4500; border-color: #FF4500; }
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .material-symbols-outlined.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
            `}</style>

            {/* HEADER */}
            <header className="h-16 flex-none bg-[#111] border-b border-[#222] flex items-center justify-between px-4 lg:px-8 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <h1 className="font-display font-bold text-2xl tracking-tight text-white uppercase">Painel</h1>
                    {isPremium
                        ? <span className="bg-[#FFD700] text-black font-display font-bold text-xs px-2 py-0.5 rounded-sm shadow-lg shadow-yellow-500/20">PRO</span>
                        : <span className="bg-slate-700 text-slate-400 font-display font-bold text-xs px-2 py-0.5 rounded-sm">FREE</span>
                    }
                </div>
                <div className="flex items-center gap-4 lg:gap-6">
                    {activeTab !== 'treinador' && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="hidden sm:flex items-center gap-2 bg-green-900/20 text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all font-display font-bold uppercase text-xs tracking-wide border border-[#00E676]/50 px-4 py-1.5 rounded-sm shadow-[0_0_10px_rgba(0,230,118,0.1)]"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            <span>{saving ? '...' : 'Save'}</span>
                        </button>
                    )}
                    <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
                    <button onClick={handleOpenProfile} className="text-gray-400 hover:text-white transition-colors" title="Ver Perfil Público">
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="text-red-500 hover:text-red-400 transition-colors" title="Sair">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            {/* NAVIGATION */}
            <div className="flex-none bg-[#0c0c0c] border-b border-[#222] py-4 px-4 lg:px-8 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 min-w-max">
                    <button onClick={() => setActiveTab('geral')} className={`${activeTab === 'geral' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                        Geral
                    </button>
                    <button onClick={() => setActiveTab('missoes')} className={`${activeTab === 'missoes' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all flex items-center gap-2`}>
                        Missões
                    </button>
                    <div className="relative">
                        <button onClick={() => setActiveTab('notificacoes')} className={`${activeTab === 'notificacoes' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                            Solicitações
                        </button>
                        {totalNotificacoes > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF4500] text-[10px] text-white font-bold items-center justify-center">{totalNotificacoes}</span>
                            </span>
                        )}
                    </div>

                    {!isCompany && perfil.is_athlete && (
                        <>
                            <button onClick={() => setActiveTab('historico_duelos')} className={`${activeTab === 'historico_duelos' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                                Duelos
                            </button>
                            <button onClick={() => setActiveTab('cartel')} className={`${activeTab === 'cartel' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                                Cartel
                            </button>
                            <button onClick={() => setActiveTab('lutas')} className={`${activeTab === 'lutas' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                                Lutas
                            </button>
                        </>
                    )}

                    {!isCompany && perfil.is_coach && (
                        <button onClick={() => setActiveTab('treinador')} className={`${activeTab === 'treinador' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                            Área Treinador
                        </button>
                    )}

                    <button onClick={() => setActiveTab('midia')} className={`${activeTab === 'midia' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                        Mídia
                    </button>
                    <button onClick={() => setActiveTab('metricas')} className={`${activeTab === 'metricas' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                        Métricas
                    </button>
                    <button onClick={() => setActiveTab('contato')} className={`${activeTab === 'contato' ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:scale-105' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'} font-display font-bold uppercase text-sm px-6 py-2 rounded-full transition-all`}>
                        Contato
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative scroll-smooth pb-40 md:pb-32">
                <div className="max-w-7xl mx-auto space-y-6">
                    {activeTab === 'missoes' && <TabMissoes perfil={perfil} />}
                    {activeTab === 'geral' && (
                        <>
                            <div className="mb-6"><BannerPremium atleta={perfil} /></div>
                            {!isCompany && <div className="mb-6"><ReferralCard perfil={perfil} /></div>}
                            {isCompany
                                ? <TabGeralEmpresa perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleDeleteProfilePic={handleDeleteProfilePic} isPremium={isPremium} userId={userId} />
                                : <TabGeral perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleDeleteProfilePic={handleDeleteProfilePic} isPremium={isPremium} userId={userId} onUpdateStatus={handleUpdateStatus} />
                            }
                        </>
                    )}
                    {activeTab === 'cartel' && !isCompany && perfil.is_athlete && <TabCartel perfil={perfil} setPerfil={setPerfil} handleStatsChange={handleStatsChange} handleRecordChange={handleRecordChange} isPremium={isPremium} />}
                    {activeTab === 'lutas' && !isCompany && perfil.is_athlete && <TabLutas perfil={perfil} setPerfil={setPerfil} handleNextFightChange={handleNextFightChange} isPremium={isPremium} />}
                    {activeTab === 'historico_duelos' && !isCompany && <TabHistoricoDuelos meusDuelos={meusDuelos} perfilId={perfil.id} handleDueloAction={handleDueloAction} perfil={perfil} />}
                    {activeTab === 'treinador' && !isCompany && perfil.is_coach && <TabTreinador perfil={perfil} setPerfil={setPerfil} meusAlunos={meusAlunos} isPremium={isPremium} />}
                    {activeTab === 'notificacoes' && <TabNotificacoes notificacoes={notificacoes} convitesEquipe={convitesEquipe} handleDueloAction={handleDueloAction} handleEquipeAction={handleEquipeAction} perfil={perfil} />}
                    {activeTab === 'midia' && <TabMidia perfil={perfil} setPerfil={setPerfil} handleSocialChange={handleSocialChange} handleDeleteImage={handleDeleteImage} userId={userId} />}
                    {activeTab === 'metricas' && <TabMetricas perfil={perfil} setPerfil={setPerfil} handleInstaStats={handleInstaStats} handleSocialChange={handleSocialChange} totalViews={totalViews} profileViews={profileViews} isPremium={isPremium} formatNumber={formatNumber} ageRange={ageRange} setAgeRange={setAgeRange} genderSplit={genderSplit} setGenderSplit={setGenderSplit} />}
                    {activeTab === 'contato' && <TabContato perfil={perfil} handleContactChange={handleContactChange} />}
                </div>
            </main>

            {/* FLOATING ACTION BAR */}
            {activeTab !== 'treinador' && (
                <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur-sm border-t border-[#222] p-3 md:p-6 z-40">
                    <div className="max-w-7xl mx-auto">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-[#00E676] hover:bg-green-500 text-black font-display font-bold text-lg md:text-xl uppercase py-3 md:py-4 shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-all transform hover:scale-[1.005] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)]"
                        >
                            {saving ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}