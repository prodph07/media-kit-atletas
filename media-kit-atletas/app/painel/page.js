'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script'; 
import { Save, LogOut, Eye, Bell, Swords, GraduationCap } from 'lucide-react';

import { processGamification, getXpToNextLevel, processDuelParticipation, processVisitMilestone } from '../../lib/gamification';

// --- IMPORTAÇÕES MODULARES ---
import TabGeral from '../../components/panel/athlete/TabGeral';
import TabCartel from '../../components/panel/athlete/TabCartel';
import TabLutas from '../../components/panel/athlete/TabLutas';
import TabMidia from '../../components/panel/athlete/TabMidia';
import TabMetricas from '../../components/panel/athlete/TabMetricas';
import TabContato from '../../components/panel/athlete/TabContato';
import TabNotificacoes from '../../components/panel/athlete/TabNotificacoes';
import TabHistoricoDuelos from '../../components/panel/athlete/TabHistoricoDuelos';

// Novas importações
import TabGeralEmpresa from '../../components/panel/company/TabGeralEmpresa';
import TabTreinador from '../../components/panel/coach/TabTreinador';

const CLOUD_NAME = "dgn8bzilm"; 
const UPLOAD_PRESET = "atletas_upload"; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const safeVal = (val) => val === null || val === undefined ? '' : val;

export default function Painel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [userId, setUserId] = useState(null);

  // Estados de UI
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [genderSplit, setGenderSplit] = useState({ men: '', women: '' });
  const [cityList, setCityList] = useState([]); 
  
  // Estados de Dados
  const [profileViews, setProfileViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  
  // Estados de Notificações
  const [notificacoes, setNotificacoes] = useState([]); // Duelos
  const [convitesEquipe, setConvitesEquipe] = useState([]); // Convites de Treinador (NOVO)
  
  const [meusDuelos, setMeusDuelos] = useState([]);

  const [perfil, setPerfil] = useState({
    id: null, nome: '', apelido: '', categoria: '', foto_url: '', about: '', slug: '', fightingStyle: '', 
    plano: 'free', tipo_conta: 'atleta', template_style: 'padrao', 
    
    // CAMPOS HÍBRIDOS
    is_athlete: true, 
    is_coach: false,
    coach_details: {}, 

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
        
        // --- LÓGICA DE VISITAS (Mantida) ---
        const { count: viewCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', ATLETA_ID_NUMERICO);
        const totalV = viewCount || 0;
        
        const currentStats = data.weekly_stats || {};
        const visitResult = processVisitMilestone(totalV, currentStats);
        
        let newXp = data.xp || 0;
        let newLevel = data.level || 1;
        let finalWeeklyStats = currentStats;

        if (visitResult.success) {
            newXp += visitResult.xpGained;
            const target = getXpToNextLevel(newLevel);
            if (newXp >= target) { newLevel++; newXp -= target; }
            finalWeeklyStats = visitResult.updatedStats;
            await supabase.from('atletas').update({ xp: newXp, level: newLevel, weekly_stats: finalWeeklyStats }).eq('user_id', user.id);
            alert(`🎉 ${visitResult.message}`);
        }

        // Auxiliares de UI
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
            
            is_athlete: data.is_athlete ?? true, 
            is_coach: data.is_coach ?? false,
            coach_details: data.coach_details || {},

            xp: newXp, level: newLevel, completed_tasks: data.completed_tasks || [], weekly_stats: finalWeeklyStats,
            stats: { height: safeVal(data.atributos?.height), weight: safeVal(data.atributos?.weight), reach: safeVal(data.atributos?.reach), age: safeVal(data.atributos?.age) },
            record: data.cartel || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
            contact: { email: safeVal(data.contato?.email), managerEmail: safeVal(data.contato?.managerEmail), phone: safeVal(data.contato?.phone), phoneDisplay: safeVal(data.contato?.phoneDisplay), city: safeVal(data.contato?.city), trainingCenter: safeVal(data.contato?.trainingCenter) },
            nextFight: { date: safeVal(data.prox_luta?.date), event: safeVal(data.prox_luta?.event), opponent: safeVal(data.prox_luta?.opponent), location: safeVal(data.prox_luta?.location) }, 
            socials: { 
                instagram: { ...instaData, active: true, user: safeVal(instaData.user), followers: safeVal(instaData.followers), url: safeVal(instaData.url), stats: { reach: safeVal(instaData.stats?.reach), impressions: safeVal(instaData.stats?.impressions), engagement: safeVal(instaData.stats?.engagement), shares: safeVal(instaData.stats?.shares) }, audience: instaData.audience || { age: '', gender: '', cities: '' } },
                youtube: { active: false, ...data.redes_sociais?.youtube, user: safeVal(data.redes_sociais?.youtube?.user), followers: safeVal(data.redes_sociais?.youtube?.followers), url: safeVal(data.redes_sociais?.youtube?.url) }, 
                tiktok: { active: false, ...data.redes_sociais?.tiktok, user: safeVal(data.redes_sociais?.tiktok?.user), followers: safeVal(data.redes_sociais?.tiktok?.followers), url: safeVal(data.redes_sociais?.tiktok?.url) }, 
                x: { active: false, ...data.redes_sociais?.x, user: safeVal(data.redes_sociais?.x?.user), followers: safeVal(data.redes_sociais?.x?.followers), url: safeVal(data.redes_sociais?.x?.url) }, 
                kwai: { active: false, ...data.redes_sociais?.kwai, user: safeVal(data.redes_sociais?.kwai?.user), followers: safeVal(data.redes_sociais?.kwai?.followers), url: safeVal(data.redes_sociais?.kwai?.url) }
            },
            historico: data.historico || [], video_lista: data.video_lista || [], galeria: data.galeria || [], premios: data.premios || []
        });

        // 1. CARREGA DUELOS PENDENTES
        const { data: duelosPendentes } = await supabase.from('duelos').select(`id, created_at, atleta_1_id, desafiante:atletas!atleta_1_id(nome, apelido, foto_url)`).eq('atleta_2_id', ATLETA_ID_NUMERICO).eq('status', 'pending');
        setNotificacoes(duelosPendentes || []);

        // 2. CARREGA CONVITES DE EQUIPE (NOVO!)
        const { data: convitesCoach } = await supabase
            .from('relacoes')
            .select(`
                id, created_at, coach_id, 
                coach:atletas!coach_id(nome, apelido, foto_url, coach_details)
            `)
            .eq('student_id', ATLETA_ID_NUMERICO)
            .eq('status', 'pending');
        setConvitesEquipe(convitesCoach || []);

        // 3. CARREGA HISTÓRICO DE DUELOS
        const { data: historico } = await supabase.from('duelos').select(`id, created_at, status, expires_at, votos_1, votos_2, p1:atletas!atleta_1_id(id, nome, apelido, foto_url), p2:atletas!atleta_2_id(id, nome, apelido, foto_url)`).or(`atleta_1_id.eq.${ATLETA_ID_NUMERICO},atleta_2_id.eq.${ATLETA_ID_NUMERICO}`).order('created_at', { ascending: false });
        setMeusDuelos(historico || []);

        // 4. CARREGA VIEWS
        setTotalViews(totalV);
        const { data: viewsData } = await supabase.from('profile_views').select('created_at, visitante_tipo, visitante_id').eq('perfil_visitado_id', ATLETA_ID_NUMERICO).neq('visitante_tipo', 'anonimo').order('created_at', { ascending: false }).limit(data.plano === 'premium' ? 20 : 5);
        
        let viewsCompletas = viewsData || [];
        if (viewsData && viewsData.length > 0) {
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

  const handleDeleteImage = async (arrName, index, url) => { if(!confirm("Excluir?")) return; if(url && url.includes('cloudinary')) try { await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url }) }); } catch(e){} const n = [...perfil[arrName]]; n.splice(index, 1); setPerfil({...perfil, [arrName]: n}); };
  const handleDeleteProfilePic = async () => { if(!perfil.foto_url || !confirm("Remover foto?")) return; if(perfil.foto_url.includes('cloudinary')) await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url: perfil.foto_url }) }); setPerfil({...perfil, foto_url: ''}); };
  const openWidget = (onUpload, isSquare = true) => { if (!window.cloudinary) return; window.cloudinary.createUploadWidget({ cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, sources: ['local', 'instagram'], multiple: false, cropping: isSquare, croppingAspectRatio: isSquare ? 1 : null, folder: 'atletas_assets' }, (error, result) => { if (!error && result && result.event === "success") onUpload(result.info.secure_url); }).open(); };
  
  // HANDLERS GENÉRICOS
  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  const handleSlugChange = (e) => setPerfil({...perfil, slug: limparSlug(e.target.value)});
  const handleStatsChange = (e) => setPerfil({...perfil, stats: {...perfil.stats, [e.target.name]: e.target.value}});
  const handleRecordChange = (e) => setPerfil({...perfil, record: {...perfil.record, [e.target.name]: e.target.value}});
  const handleContactChange = (e) => setPerfil({...perfil, contact: {...perfil.contact, [e.target.name]: e.target.value}});
  const handleNextFightChange = (e) => setPerfil({...perfil, nextFight: {...perfil.nextFight, [e.target.name]: e.target.value}});
  const handleInstaStats = (c, f, v) => setPerfil(prev => ({ ...prev, socials: { ...prev.socials, instagram: { ...prev.socials.instagram, [c]: { ...prev.socials.instagram[c], [f]: v } } } }));
  const handleSocialChange = (network, field, value) => { setPerfil(prev => ({ ...prev, socials: { ...prev.socials, [network]: { ...prev.socials[network], [field]: value, active: !!value || prev.socials[network].active } } })); };
  
  // --- AÇÃO DE EQUIPE (ACEITAR/RECUSAR TREINADOR) ---
  const handleEquipeAction = async (inviteId, action) => {
    if (action === 'accept') {
        const { error } = await supabase
            .from('relacoes')
            .update({ status: 'accepted' })
            .eq('id', inviteId);
            
        if (!error) {
            alert("Convite aceito! Você agora faz parte da equipe.");
            setConvitesEquipe(prev => prev.filter(c => c.id !== inviteId));
        } else {
            alert("Erro ao aceitar: " + error.message);
        }
    } else {
        const { error } = await supabase.from('relacoes').delete().eq('id', inviteId);
        if (!error) {
            alert("Convite recusado.");
            setConvitesEquipe(prev => prev.filter(c => c.id !== inviteId));
        }
    }
  };

  // DUELO LOGIC
  const handleDueloAction = async (dueloId, action) => {
     if (action === 'accept') {
        try {
            const { data: duelData } = await supabase.from('duelos').select('atleta_1_id').eq('id', dueloId).single();
            if (duelData && duelData.atleta_1_id) {
                const { data: challenger } = await supabase.from('atletas').select('user_id, xp, level, weekly_stats').eq('id', duelData.atleta_1_id).single();
                if (challenger) {
                    const chalResult = processDuelParticipation(challenger.weekly_stats);
                    if (chalResult.success) {
                        let cXp = (challenger.xp || 0) + chalResult.xpGained;
                        let cLevel = (challenger.level || 1);
                        const cTarget = getXpToNextLevel(cLevel);
                        if (cXp >= cTarget) { cLevel++; cXp -= cTarget; }
                        await supabase.from('atletas').update({ xp: cXp, level: cLevel, weekly_stats: chalResult.updatedStats }).eq('user_id', challenger.user_id);
                    }
                }
            }
        } catch (error) { console.error(error); }
        const myResult = processDuelParticipation(perfil.weekly_stats);
        if (myResult.success) {
            let myNewXp = (perfil.xp || 0) + myResult.xpGained;
            let myNewLevel = (perfil.level || 1);
            const myTarget = getXpToNextLevel(myNewLevel);
            if (myNewXp >= myTarget) { myNewLevel++; myNewXp = myNewXp - myTarget; alert(`🎉 LEVEL UP! Nível ${myNewLevel}!`); }
            await supabase.from('atletas').update({ xp: myNewXp, level: myNewLevel, weekly_stats: myResult.updatedStats }).eq('user_id', userId);
            setPerfil(prev => ({ ...prev, xp: myNewXp, level: myNewLevel, weekly_stats: myResult.updatedStats }));
            alert(myResult.message);
        } else { alert(myResult.message); }
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
    if (perfil.slug) { 
        const slugLimpo = limparSlug(perfil.slug); 
        const { data: exists } = await supabase.from('atletas').select('id').eq('slug', slugLimpo).neq('user_id', userId).maybeSingle(); 
        if (exists) { alert("Link em uso."); setSaving(false); return; } 
        perfil.slug = slugLimpo; 
    }

    const currentCompletedTasks = perfil.completed_tasks || [];
    const { xpGained, newTasks, notifications } = processGamification(perfil, currentCompletedTasks);

    let finalXp = (perfil.xp || 0);
    let finalLevel = (perfil.level || 1);

    if (xpGained > 0) {
        finalXp += xpGained;
        const xpTarget = getXpToNextLevel(finalLevel);
        if (finalXp >= xpTarget) { finalLevel++; finalXp = finalXp - xpTarget; alert(`🎉 LEVEL UP! Você alcançou o Nível ${finalLevel}!`); }
        alert(`🏆 Você ganhou +${xpGained} XP!\n\nConquistas:\n- ${notifications.join('\n- ')}`);
    }

    const payload = { 
        nome: perfil.nome, apelido: perfil.apelido, categoria: perfil.categoria, foto_url: perfil.foto_url, slug: perfil.slug, 
        sobre: perfil.about, estilodeluta: perfil.fightingStyle, atributos: perfil.stats, cartel: perfil.record, 
        contato: perfil.contact, prox_luta: perfil.nextFight, redes_sociais: perfil.socials, 
        historico: perfil.historico, video_lista: perfil.video_lista, galeria: perfil.galeria, premios: perfil.premios, 
        tipo_conta: perfil.tipo_conta, template_style: perfil.template_style,
        
        is_athlete: perfil.is_athlete,
        is_coach: perfil.is_coach,
        coach_details: perfil.coach_details,

        xp: finalXp, level: finalLevel, completed_tasks: newTasks
    };

    const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);
    
    if (error) { alert("Erro: " + error.message); } 
    else { alert("Salvo com Sucesso!"); setPerfil({ ...perfil, xp: finalXp, level: finalLevel, completed_tasks: newTasks }); }
    setSaving(false);
  }

  if (loading) return <div className="text-white p-10 text-center">Carregando...</div>;
  const isPremium = perfil.plano === 'premium';
  const isCompany = perfil.tipo_conta === 'empresa';
  const totalNotificacoes = notificacoes.length + convitesEquipe.length; // Soma duelos + convites
  
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold">Painel</h1>{isPremium ? <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 font-bold uppercase">PREMIUM</span> : <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded font-bold uppercase">GRÁTIS</span>}</div>
            <div className="flex gap-3"><Link href={`/${perfil.slug || perfil.id}`} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Eye size={20}/></Link><button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded"><LogOut size={20}/></button></div>
        </div>

        {/* --- NAVEGAÇÃO INTELIGENTE --- */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            <button onClick={() => setActiveTab('geral')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'geral' ? (isCompany ? 'bg-purple-600' : 'bg-cyan-600') : 'bg-slate-800 text-slate-400'}`}>Geral</button>
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
            
            {activeTab === 'geral' && (
                isCompany ? (
                    <TabGeralEmpresa 
                        perfil={perfil} 
                        setPerfil={setPerfil} 
                        handleChange={handleChange} 
                        handleSlugChange={handleSlugChange}
                        openWidget={openWidget}
                        handleDeleteProfilePic={handleDeleteProfilePic}
                        isPremium={isPremium}
                    />
                ) : (
                    <TabGeral 
                        perfil={perfil} 
                        setPerfil={setPerfil} 
                        handleChange={handleChange} 
                        handleSlugChange={handleSlugChange}
                        openWidget={openWidget}
                        handleDeleteProfilePic={handleDeleteProfilePic}
                        isPremium={isPremium}
                    />
                )
            )}

            {activeTab === 'cartel' && !isCompany && perfil.is_athlete && (
                <TabCartel 
                    perfil={perfil}
                    setPerfil={setPerfil}
                    handleStatsChange={handleStatsChange}
                    handleRecordChange={handleRecordChange}
                />
            )}

            {activeTab === 'lutas' && !isCompany && perfil.is_athlete && (
                <TabLutas 
                    perfil={perfil}
                    setPerfil={setPerfil}
                    handleNextFightChange={handleNextFightChange}
                />
            )}

            {activeTab === 'historico_duelos' && !isCompany && (
                <TabHistoricoDuelos 
                    meusDuelos={meusDuelos}
                    perfilId={perfil.id}
                    handleDueloAction={handleDueloAction}
                />
            )}

            {activeTab === 'treinador' && !isCompany && perfil.is_coach && (
                <TabTreinador 
                    perfil={perfil}
                    setPerfil={setPerfil}
                />
            )}

            {activeTab === 'notificacoes' && (
                <TabNotificacoes 
                    notificacoes={notificacoes}
                    convitesEquipe={convitesEquipe}
                    handleDueloAction={handleDueloAction}
                    handleEquipeAction={handleEquipeAction}
                />
            )}
            
            {activeTab === 'midia' && (
                <TabMidia 
                    perfil={perfil}
                    setPerfil={setPerfil}
                    handleSocialChange={handleSocialChange}
                    openWidget={openWidget}
                    handleDeleteImage={handleDeleteImage}
                />
            )}
            
            {activeTab === 'metricas' && (
                <TabMetricas 
                    perfil={perfil}
                    setPerfil={setPerfil}
                    handleInstaStats={handleInstaStats}
                    totalViews={totalViews}
                    profileViews={profileViews}
                    isPremium={isPremium}
                    formatNumber={formatNumber}
                    ageRange={ageRange} setAgeRange={setAgeRange}
                    genderSplit={genderSplit} setGenderSplit={setGenderSplit}
                />
            )}
            
            {activeTab === 'contato' && (
                <TabContato 
                    perfil={perfil}
                    handleContactChange={handleContactChange}
                />
            )}
        </div>

        <div className="fixed bottom-6 right-6 z-50">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                <Save size={24} /> {saving ? '...' : 'Salvar'}
            </button>
        </div>
      </div>
    </div>
  );
}