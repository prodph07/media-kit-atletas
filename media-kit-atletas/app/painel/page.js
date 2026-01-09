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
import ReferralCard from '../../components/panel/athlete/ReferralCard'; // <--- IMPORTADO

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
      if(!confirm("Excluir imagem?")) return; 
      await deleteImageFromBucket(url);
      const n = [...perfil[arrName]]; n.splice(index, 1); setPerfil({...perfil, [arrName]: n}); 
  };
  const handleDeleteProfilePic = async () => { 
      if(!perfil.foto_url || !confirm("Remover foto?")) return; 
      await deleteImageFromBucket(perfil.foto_url);
      setPerfil({...perfil, foto_url: ''}); 
  };
  
  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  const handleSlugChange = (e) => setPerfil({...perfil, slug: limparSlug(e.target.value)});
  const handleStatsChange = (e) => setPerfil({...perfil, stats: {...perfil.stats, [e.target.name]: e.target.value}});
  const handleRecordChange = (e) => setPerfil({...perfil, record: {...perfil.record, [e.target.name]: e.target.value}});
  const handleContactChange = (e) => setPerfil({...perfil, contact: {...perfil.contact, [e.target.name]: e.target.value}});
  const handleNextFightChange = (e) => setPerfil({...perfil, nextFight: {...perfil.nextFight, [e.target.name]: e.target.value}});
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
        if(!error) { window.location.reload(); }
    } else if (action === 'delete') {
        const { error } = await supabase.from('duelos').delete().eq('id', dueloId);
        if(!error) { alert("Duelo excluído."); setMeusDuelos(prev => prev.filter(d => d.id !== dueloId)); }
    } else {
        const { error } = await supabase.from('duelos').delete().eq('id', dueloId);
        if(!error) { alert("Duelo Recusado."); setNotificacoes(prev => prev.filter(d => d.id !== dueloId)); }
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
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">Painel</h1>
                {isPremium 
                    ? <span className="bg-yellow-500/20 text-yellow-500 text-[10px] md:text-xs px-2 py-1 rounded border border-yellow-500/50 font-bold uppercase">PRO</span> 
                    : <span className="bg-slate-700 text-slate-400 text-[10px] md:text-xs px-2 py-1 rounded font-bold uppercase">FREE</span>
                }
            </div>
            
            <div className="flex gap-2 md:gap-3">
                <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition"
                    title="Salvar Alterações"
                >
                    <Save size={18} /> 
                    <span className="hidden md:inline">{saving ? '...' : 'Salvar'}</span>
                </button>

                <button onClick={handleOpenProfile} className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-white border border-slate-700" title="Ver Perfil Público">
                    <Eye size={20}/>
                </button>
                <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded" title="Sair">
                    <LogOut size={20}/>
                </button>
            </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            <button onClick={() => setActiveTab('geral')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'geral' ? (isCompany ? 'bg-purple-600' : 'bg-cyan-600') : 'bg-slate-800 text-slate-400'}`}>Geral</button>
            <button onClick={() => setActiveTab('missoes')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'missoes' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Trophy size={16}/> Missões</button> 
            <button onClick={() => setActiveTab('notificacoes')} className={`relative px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'notificacoes' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Bell size={16}/> {totalNotificacoes > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white animate-pulse">{totalNotificacoes}</span>} Solicitações</button>
            {!isCompany && perfil.is_athlete && (
                <>
                    <button onClick={() => setActiveTab('historico_duelos')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'historico_duelos' ? 'bg-purple-600' : 'bg-slate-800 text-slate-400'}`}><Swords size={16}/> Duelos</button>
                    <button onClick={() => setActiveTab('cartel')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'cartel' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Cartel</button>
                    <button onClick={() => setActiveTab('lutas')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'lutas' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Lutas</button>
                </>
            )}
            {!isCompany && perfil.is_coach && (
                <button onClick={() => setActiveTab('treinador')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'treinador' ? 'bg-orange-600' : 'bg-slate-800 text-slate-400'}`}><GraduationCap size={16}/> Área Treinador</button>
            )}
            <button onClick={() => setActiveTab('midia')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'midia' ? (isCompany ? 'bg-purple-600' : 'bg-cyan-600') : 'bg-slate-800 text-slate-400'}`}>Mídia</button>
            <button onClick={() => setActiveTab('metricas')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'metricas' ? (isCompany ? 'bg-purple-600' : 'bg-cyan-600') : 'bg-slate-800 text-slate-400'}`}>Métricas</button>
            <button onClick={() => setActiveTab('contato')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'contato' ? (isCompany ? 'bg-purple-600' : 'bg-cyan-600') : 'bg-slate-800 text-slate-400'}`}>Contato</button>
        </div>

        <div className="space-y-6">
            {activeTab === 'missoes' && <TabMissoes perfil={perfil} />}
            {activeTab === 'geral' && (
                <>
                    {/* --- REFERRAL CARD (SÓ PARA ATLETAS) --- */}
                    {!isCompany && <div className="mb-6"><ReferralCard perfil={perfil} /></div>}
                    
                    {isCompany 
                        ? <TabGeralEmpresa perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleDeleteProfilePic={handleDeleteProfilePic} isPremium={isPremium} userId={userId} /> 
                        : <TabGeral perfil={perfil} setPerfil={setPerfil} handleChange={handleChange} handleSlugChange={handleSlugChange} handleDeleteProfilePic={handleDeleteProfilePic} isPremium={isPremium} userId={userId} onUpdateStatus={handleUpdateStatus} />
                    }
                </>
            )}
            {activeTab === 'cartel' && !isCompany && perfil.is_athlete && <TabCartel perfil={perfil} setPerfil={setPerfil} handleStatsChange={handleStatsChange} handleRecordChange={handleRecordChange} isPremium={isPremium} />}
            {activeTab === 'lutas' && !isCompany && perfil.is_athlete && <TabLutas perfil={perfil} setPerfil={setPerfil} handleNextFightChange={handleNextFightChange} isPremium={isPremium} />}
            {activeTab === 'historico_duelos' && !isCompany && <TabHistoricoDuelos meusDuelos={meusDuelos} perfilId={perfil.id} handleDueloAction={handleDueloAction} />}
            {activeTab === 'treinador' && !isCompany && perfil.is_coach && <TabTreinador perfil={perfil} setPerfil={setPerfil} meusAlunos={meusAlunos} isPremium={isPremium} />}
            {activeTab === 'notificacoes' && <TabNotificacoes notificacoes={notificacoes} convitesEquipe={convitesEquipe} handleDueloAction={handleDueloAction} handleEquipeAction={handleEquipeAction} />}
            {activeTab === 'midia' && <TabMidia perfil={perfil} setPerfil={setPerfil} handleSocialChange={handleSocialChange} handleDeleteImage={handleDeleteImage} userId={userId} />}
            {activeTab === 'metricas' && <TabMetricas perfil={perfil} setPerfil={setPerfil} handleInstaStats={handleInstaStats} handleSocialChange={handleSocialChange} totalViews={totalViews} profileViews={profileViews} isPremium={isPremium} formatNumber={formatNumber} ageRange={ageRange} setAgeRange={setAgeRange} genderSplit={genderSplit} setGenderSplit={setGenderSplit} />}
            {activeTab === 'contato' && <TabContato perfil={perfil} handleContactChange={handleContactChange} />}
        </div>

        <div className="mt-8 mb-4">
            <button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95"
            >
                <Save size={24} /> 
                {saving ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}
            </button>
        </div>

      </div>
    </div>
  );
}