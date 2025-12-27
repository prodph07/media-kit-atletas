'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script'; 
import { Trash2, PlusCircle, Save, LogOut, Eye, Lock, Instagram, Youtube, Camera, Upload, Link as LinkIcon, Check, Building2, Calendar, Medal, Bell, Swords, ExternalLink, Clock, TrendingUp } from 'lucide-react';

// --- IMPORTAÇÃO DA GAMIFICAÇÃO ---
// Certifique-se que o lib/gamification.js está com o getRankInfo, getXpToNextLevel, etc.
import { processGamification, getXpToNextLevel, processDuelParticipation, processVisitMilestone } from '../../lib/gamification';

const CLOUD_NAME = "dgn8bzilm"; 
const UPLOAD_PRESET = "atletas_upload"; 
const TikTokIcon = ({size=24, className}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ESTILOS_LUTA = ["MMA", "Muay Thai", "Boxe", "Kickboxing", "Jiu-Jitsu Brasileiro (BJJ)", "Wrestling (Luta Olímpica)", "Judô", "Sambo", "Krav Maga", "Capoeira", "Karatê"];
const RESULTADOS = ["W", "L", "D", "NC"];
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
  const [cityInput, setCityInput] = useState({ name: '', percent: '' });
  const [cityList, setCityList] = useState([]); 
  const [novoPremio, setNovoPremio] = useState('');
  const [videoInput, setVideoInput] = useState('');

  // Estados de Dados
  const [profileViews, setProfileViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]); 
  const [meusDuelos, setMeusDuelos] = useState([]);

  const [perfil, setPerfil] = useState({
    id: null, nome: '', apelido: '', categoria: '', foto_url: '', about: '', slug: '', fightingStyle: '', 
    plano: 'free', tipo_conta: 'atleta', template_style: 'padrao', 
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
        
        // --- LÓGICA DE VISITAS ---
        // 1. Pega total de views real
        const { count: viewCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', ATLETA_ID_NUMERICO);
        const totalV = viewCount || 0;
        
        // 2. Processa Gamificação de Visitas
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
            
            // Salva no banco imediatamente
            await supabase.from('atletas').update({ 
                xp: newXp, 
                level: newLevel, 
                weekly_stats: finalWeeklyStats 
            }).eq('user_id', user.id);

            alert(`🎉 ${visitResult.message}`);
        }

        // Preenche estado Local
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

        // Carrega Duelos e Views
        const { data: duelosPendentes } = await supabase.from('duelos').select(`id, created_at, atleta_1_id, desafiante:atletas!atleta_1_id(nome, apelido, foto_url)`).eq('atleta_2_id', ATLETA_ID_NUMERICO).eq('status', 'pending');
        setNotificacoes(duelosPendentes || []);

        const { data: historico } = await supabase.from('duelos').select(`id, created_at, status, expires_at, votos_1, votos_2, p1:atletas!atleta_1_id(id, nome, apelido, foto_url), p2:atletas!atleta_2_id(id, nome, apelido, foto_url)`).or(`atleta_1_id.eq.${ATLETA_ID_NUMERICO},atleta_2_id.eq.${ATLETA_ID_NUMERICO}`).order('created_at', { ascending: false });
        setMeusDuelos(historico || []);

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

  const handleAddVideo = () => { if (!videoInput) return; let embedUrl = videoInput; if (videoInput.includes('watch?v=')) embedUrl = videoInput.replace('watch?v=', 'embed/'); else if (videoInput.includes('youtu.be/')) embedUrl = videoInput.replace('youtu.be/', 'youtube.com/embed/'); setPerfil({...perfil, video_lista: [...perfil.video_lista, { title: 'Novo Vídeo', date: '2025', thumb: '', embedUrl }]}); setVideoInput(''); };
  const handleAddPremio = () => { if(!novoPremio) return; setPerfil({...perfil, premios: [...perfil.premios, novoPremio]}); setNovoPremio(''); };
  const handleAddLuta = () => { setPerfil({...perfil, historico: [{ result: 'W', event: 'Evento', opponent: 'Oponente', date: '2025' }, ...perfil.historico]}); };
  const handleDeleteImage = async (arrName, index, url) => { if(!confirm("Excluir?")) return; if(url && url.includes('cloudinary')) try { await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url }) }); } catch(e){} const n = [...perfil[arrName]]; n.splice(index, 1); setPerfil({...perfil, [arrName]: n}); };
  const handleDeleteProfilePic = async () => { if(!perfil.foto_url || !confirm("Remover foto?")) return; if(perfil.foto_url.includes('cloudinary')) await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url: perfil.foto_url }) }); setPerfil({...perfil, foto_url: ''}); };
  const openWidget = (onUpload, isSquare = true) => { if (!window.cloudinary) return; window.cloudinary.createUploadWidget({ cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, sources: ['local', 'instagram'], multiple: false, cropping: isSquare, croppingAspectRatio: isSquare ? 1 : null, folder: 'atletas_assets' }, (error, result) => { if (!error && result && result.event === "success") onUpload(result.info.secure_url); }).open(); };
  
  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  const handleSlugChange = (e) => setPerfil({...perfil, slug: limparSlug(e.target.value)});
  const handleStatsChange = (e) => setPerfil({...perfil, stats: {...perfil.stats, [e.target.name]: e.target.value}});
  const handleRecordChange = (e) => setPerfil({...perfil, record: {...perfil.record, [e.target.name]: e.target.value}});
  const handleContactChange = (e) => setPerfil({...perfil, contact: {...perfil.contact, [e.target.name]: e.target.value}});
  const handleNextFightChange = (e) => setPerfil({...perfil, nextFight: {...perfil.nextFight, [e.target.name]: e.target.value}});
  const handleFightChange = (index, field, value) => { const n = [...perfil.historico]; n[index][field] = value; setPerfil({...perfil, historico: n}); };
  const handleInstaStats = (c, f, v) => setPerfil(prev => ({ ...prev, socials: { ...prev.socials, instagram: { ...prev.socials.instagram, [c]: { ...prev.socials.instagram[c], [f]: v } } } }));
  const handleSocialChange = (network, field, value) => { setPerfil(prev => ({ ...prev, socials: { ...prev.socials, [network]: { ...prev.socials[network], [field]: value, active: !!value || prev.socials[network].active } } })); };
  const addCity = () => { if (!cityInput.name || !cityInput.percent) return; setCityList([...cityList, { name: cityInput.name, percent: cityInput.percent }]); setCityInput({ name: '', percent: '' }); };

  // --- LÓGICA DE DUELO GLOBAL (FIX PARA AMBOS GANHAREM XP) ---
  const handleDueloAction = async (dueloId, action) => {
    if (action === 'accept') {
        
        // 1. TENTA DAR XP AO DESAFIANTE
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

                        // Tenta atualizar o banco (precisa da Policy SQL liberada)
                        const { error: errChal } = await supabase.from('atletas').update({
                            xp: cXp, level: cLevel, weekly_stats: chalResult.updatedStats
                        }).eq('user_id', challenger.user_id);
                        
                        if(errChal) console.error("Erro ao dar XP para o desafiante:", errChal);
                        else console.log("XP entregue ao desafiante!");
                    }
                }
            }
        } catch (error) {
            console.error("Erro no fluxo do desafiante:", error);
        }

        // 2. PROCESSAR XP PARA MIM (Desafiado)
        const myResult = processDuelParticipation(perfil.weekly_stats);
        
        if (myResult.success) {
            let myNewXp = (perfil.xp || 0) + myResult.xpGained;
            let myNewLevel = (perfil.level || 1);
            const myTarget = getXpToNextLevel(myNewLevel);
            if (myNewXp >= myTarget) { 
                myNewLevel++; 
                myNewXp = myNewXp - myTarget; 
                alert(`🎉 LEVEL UP! Nível ${myNewLevel}!`);
            }
            
            await supabase.from('atletas').update({
                xp: myNewXp, level: myNewLevel, weekly_stats: myResult.updatedStats
            }).eq('user_id', userId);

            setPerfil(prev => ({ ...prev, xp: myNewXp, level: myNewLevel, weekly_stats: myResult.updatedStats }));
            alert(myResult.message);
        } else {
             // Mostra aviso que está em cooldown
             alert(myResult.message);
        }

        // 3. ATIVA O DUELO
        const { error } = await supabase.from('duelos').update({ status: 'active' }).eq('id', dueloId);
        if(!error) { 
            window.location.reload(); 
        }

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
        if (finalXp >= xpTarget) {
            finalLevel++;
            finalXp = finalXp - xpTarget; 
            alert(`🎉 LEVEL UP! Você alcançou o Nível ${finalLevel}!`);
        }
        alert(`🏆 Você ganhou +${xpGained} XP!\n\nConquistas:\n- ${notifications.join('\n- ')}`);
    }

    const payload = { 
        nome: perfil.nome, apelido: perfil.apelido, categoria: perfil.categoria, foto_url: perfil.foto_url, slug: perfil.slug, 
        sobre: perfil.about, estilodeluta: perfil.fightingStyle, atributos: perfil.stats, cartel: perfil.record, 
        contato: perfil.contact, prox_luta: perfil.nextFight, redes_sociais: perfil.socials, 
        historico: perfil.historico, video_lista: perfil.video_lista, galeria: perfil.galeria, premios: perfil.premios, 
        tipo_conta: perfil.tipo_conta, template_style: perfil.template_style,
        xp: finalXp, level: finalLevel, completed_tasks: newTasks
    };

    const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);
    
    if (error) { alert("Erro: " + error.message); } 
    else { alert("Salvo com Sucesso!"); setPerfil({ ...perfil, xp: finalXp, level: finalLevel, completed_tasks: newTasks }); }
    setSaving(false);
  }

  const PremiumLock = ({ text }) => ( <div className="bg-slate-900/50 border border-yellow-500/20 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 opacity-80"> <Lock className="text-yellow-500 mb-2" size={32} /> <h3 className="text-white font-bold">Funcionalidade Premium</h3> <p className="text-slate-400 text-sm mb-4">{text}</p> <a href="#" target="_blank" className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold py-2 px-4 rounded transition">LIBERAR AGORA</a> </div> );
  if (loading) return <div className="text-white p-10 text-center">Carregando...</div>;
  const isPremium = perfil.plano === 'premium';
  
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold">Painel</h1>{isPremium ? <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 font-bold uppercase">PREMIUM</span> : <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded font-bold uppercase">GRÁTIS</span>}</div>
            <div className="flex gap-3"><Link href={`/${perfil.slug || perfil.id}`} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Eye size={20}/></Link><button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded"><LogOut size={20}/></button></div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            <button onClick={() => setActiveTab('geral')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'geral' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Geral</button>
            <button onClick={() => setActiveTab('notificacoes')} className={`relative px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'notificacoes' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Bell size={16}/> {notificacoes.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white animate-pulse">{notificacoes.length}</span>} Solicitações</button>
            <button onClick={() => setActiveTab('historico_duelos')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'historico_duelos' ? 'bg-purple-600' : 'bg-slate-800 text-slate-400'}`}><Swords size={16}/> Meus Duelos</button>
            <button onClick={() => setActiveTab('cartel')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'cartel' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Cartel</button>
            <button onClick={() => setActiveTab('lutas')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'lutas' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Lutas</button>
            <button onClick={() => setActiveTab('midia')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'midia' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Mídia</button>
            <button onClick={() => setActiveTab('metricas')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'metricas' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Métricas</button>
            <button onClick={() => setActiveTab('contato')} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${activeTab === 'contato' ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>Contato</button>
        </div>

        <div className="space-y-6">
            {activeTab === 'notificacoes' && (
                <div className="space-y-4">
                    <h3 className="text-yellow-500 font-bold uppercase text-sm mb-4 flex items-center gap-2"><Swords size={18}/> Desafios Recebidos</h3>
                    {notificacoes.length === 0 ? <div className="text-center p-10 bg-slate-900 rounded-xl border border-slate-800 text-slate-500">Nenhuma solicitação de duelo pendente.</div> : notificacoes.map(duelo => (
                        <div key={duelo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4"><img src={duelo.desafiante.foto_url} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" /><div><p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Desafiante</p><h4 className="text-xl font-bold text-white">{duelo.desafiante.apelido || duelo.desafiante.nome}</h4><p className="text-slate-500 text-xs">Criado em {new Date(duelo.created_at).toLocaleDateString()}</p></div></div>
                            <div className="flex gap-3 w-full sm:w-auto"><button onClick={() => handleDueloAction(duelo.id, 'reject')} className="flex-1 sm:flex-none px-6 py-3 bg-red-900/30 text-red-500 font-bold rounded hover:bg-red-900/50 transition">Recusar</button><button onClick={() => handleDueloAction(duelo.id, 'accept')} className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition">ACEITAR DESAFIO</button></div>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'historico_duelos' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-purple-400 font-bold uppercase text-sm">Todos os Duelos</h3><Link href="/duelos/criar" className="text-xs bg-yellow-500 text-black px-3 py-1 rounded font-bold flex items-center gap-1"><Swords size={12}/> Criar Novo</Link></div>
                    {meusDuelos.length === 0 ? <div className="text-center py-10 bg-slate-900 rounded-xl border border-slate-800"><Swords size={40} className="mx-auto text-slate-600 mb-2"/><p className="text-slate-500">Você ainda não participou de nenhum duelo.</p></div> : meusDuelos.map(duelo => {
                        const souP1 = duelo.p1.id === perfil.id; const oponente = souP1 ? duelo.p2 : duelo.p1; const total = duelo.votos_1 + duelo.votos_2; let statusColor = 'bg-slate-700 text-slate-300'; let statusText = 'Desconhecido'; if(duelo.status === 'active') { statusColor = 'bg-green-500/20 text-green-400 border border-green-500/30'; statusText = 'Ativo'; } if(duelo.status === 'pending') { statusColor = 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'; statusText = 'Pendente'; } const isExpired = new Date(duelo.expires_at) < new Date(); if(isExpired) { statusColor = 'bg-red-500/20 text-red-400 border border-red-500/30'; statusText = 'Expirado'; }
                        return (<div key={duelo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-4 w-full sm:w-auto"><div className="relative"><img src={oponente.foto_url || "https://placehold.co/100"} className="w-14 h-14 rounded-full object-cover border-2 border-slate-600" /><div className="absolute -bottom-1 -right-1 bg-black text-[10px] px-1 rounded border border-slate-700">VS</div></div><div><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Contra</p><h4 className="font-bold text-white text-lg leading-none">{oponente.apelido || oponente.nome}</h4><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={10}/> {new Date(duelo.created_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"><div className={`px-3 py-1 rounded text-xs font-bold uppercase ${statusColor}`}>{statusText}</div><div className="text-right"><p className="text-xs text-slate-400 font-bold">{total} Votos</p><p className="text-[10px] text-slate-600">Total</p></div><Link href={`/duelos/${duelo.id}`} target="_blank" className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 border border-slate-700"><ExternalLink size={18}/></Link><button onClick={() => { if(confirm("Excluir duelo?")) handleDueloAction(duelo.id, 'delete') }} className="p-2 bg-red-900/20 hover:bg-red-900/40 rounded text-red-500 border border-red-900/30"><Trash2 size={18}/></button></div></div>)
                    })}
                </div>
            )}
            
            {/* ABAS GERAIS, CARTEL, LUTAS, MIDIA... (Mantido Igual) */}
            {activeTab === 'geral' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Informações Básicas</h3>
                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-slate-700 border-dashed"><div onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="relative w-32 h-32 mb-4 group cursor-pointer"><div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-700 group-hover:border-yellow-500 transition relative">{perfil.foto_url ? <img src={perfil.foto_url} alt="Perfil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500"><Camera size={32} /></div>}</div></div><div className="flex gap-4 text-xs"><button onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="text-yellow-500 hover:underline">Alterar</button>{perfil.foto_url && <button onClick={handleDeleteProfilePic} className="text-red-500 hover:underline">Remover</button>}</div></div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 bg-blue-900/20 p-4 rounded-lg border border-blue-500/30"><label className="text-xs text-blue-300 font-bold mb-2 block uppercase">Tipo de Conta</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="tipo_conta" value="atleta" checked={perfil.tipo_conta === 'atleta'} onChange={handleChange} className="accent-cyan-400"/> Atleta</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="tipo_conta" value="empresa" checked={perfil.tipo_conta === 'empresa'} onChange={handleChange} className="accent-cyan-400"/> Empresa</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="tipo_conta" value="evento" checked={perfil.tipo_conta === 'evento'} onChange={handleChange} className="accent-cyan-400"/> Evento</label></div></div>
                        <div className="md:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700 mt-2"><label className="text-xs text-slate-400 font-bold mb-3 block uppercase">Layout do Media Kit</label><div className="grid grid-cols-2 gap-4"><div onClick={() => setPerfil({...perfil, template_style: 'padrao'})} className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${perfil.template_style === 'padrao' ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}><div className="h-10 bg-slate-700 mb-2 rounded flex items-center justify-center text-xs text-slate-400">Padrão</div><div className="flex justify-between items-center"><span className="font-bold text-white text-sm">Dark Pro</span>{perfil.template_style === 'padrao' && <Check size={16} className="text-cyan-500"/>}</div></div><div onClick={() => { if(isPremium) setPerfil({...perfil, template_style: 'cyber'}); else alert("Este template é exclusivo para assinantes Premium!"); }} className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${perfil.template_style === 'cyber' ? 'border-lime-400 bg-lime-900/20' : 'border-slate-700 hover:border-lime-500/50'}`}><div className="h-10 bg-zinc-900 mb-2 rounded flex items-center justify-center text-xs text-lime-400 font-mono border border-zinc-700">CYBER</div><div className="flex justify-between items-center"><span className="font-bold text-white text-sm">Cyber</span>{perfil.template_style === 'cyber' && <Check size={16} className="text-lime-400"/>}{!isPremium && <Lock size={16} className="text-yellow-500"/>}</div></div></div></div>
                        <div><label className="text-xs text-slate-500">Nome</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div><div><label className="text-xs text-slate-500">Apelido</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div><div className="md:col-span-2"><label className="text-xs text-slate-500 flex items-center gap-1">Link Personalizado {isPremium && <Check size={10} className="text-green-500"/>}</label><div className={`flex items-center border p-2 rounded ${isPremium ? 'bg-black border-slate-700' : 'bg-slate-800/50 border-slate-800 opacity-60'}`}><LinkIcon size={16} className="text-slate-500 mr-2"/><span className="text-slate-500 text-sm mr-1 hidden sm:inline">nocautepages.com/</span><input className="bg-transparent text-white w-full outline-none font-bold" name="slug" value={perfil.slug} onChange={handleSlugChange} disabled={!isPremium} />{!isPremium && <Lock size={16} className="text-yellow-500 ml-2" />}</div></div>
                        <div><label className="text-xs text-slate-500">Categoria</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="categoria" value={perfil.categoria} onChange={handleChange} /></div><div><label className="text-xs text-slate-500">Estilo</label><select className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="fightingStyle" value={perfil.fightingStyle} onChange={handleChange}><option value="">Selecione...</option>{ESTILOS_LUTA.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-500">Bio</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={3} name="about" value={perfil.about} onChange={handleChange} /></div>
                    </div>
                </div>
            )}
            
            {activeTab === 'cartel' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Atributos Físicos</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label className="text-xs text-slate-500">Altura</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="height" value={perfil.stats.height} onChange={handleStatsChange} /></div><div><label className="text-xs text-slate-500">Peso</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="weight" value={perfil.stats.weight} onChange={handleStatsChange} /></div><div><label className="text-xs text-slate-500">Envergadura</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="reach" value={perfil.stats.reach} onChange={handleStatsChange} /></div><div><label className="text-xs text-slate-500">Idade</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="age" value={perfil.stats.age} onChange={handleStatsChange} /></div></div></div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Cartel Profissional</h3><div className="grid grid-cols-2 md:grid-cols-5 gap-4"><div><label className="text-xs text-green-500">Vitórias</label><input className="w-full bg-black border border-green-900/50 p-2 rounded text-white" name="wins" value={perfil.record.wins} onChange={handleRecordChange} /></div><div><label className="text-xs text-red-500">Derrotas</label><input className="w-full bg-black border border-red-900/50 p-2 rounded text-white" name="losses" value={perfil.record.losses} onChange={handleRecordChange} /></div><div><label className="text-xs text-yellow-500">Empates</label><input className="w-full bg-black border border-yellow-900/50 p-2 rounded text-white" name="draws" value={perfil.record.draws} onChange={handleRecordChange} /></div><div><label className="text-xs text-slate-400">K.O.s</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="knockouts" value={perfil.record.knockouts} onChange={handleRecordChange} /></div><div><label className="text-xs text-slate-400">Subs</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="submissions" value={perfil.record.submissions} onChange={handleRecordChange} /></div></div></div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Prêmios</h3><div className="flex gap-2 mb-4"><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: Campeão 2024" value={novoPremio} onChange={(e) => setNovoPremio(e.target.value)} /><button onClick={handleAddPremio} className="bg-cyan-600 p-2 rounded"><PlusCircle size={20}/></button></div><ul className="space-y-2">{perfil.premios.map((p, i) => (<li key={i} className="flex justify-between bg-black/50 p-2 rounded border border-slate-800"><span>{p}</span><button onClick={() => {const n = [...perfil.premios]; n.splice(i, 1); setPerfil({...perfil, premios: n})}} className="text-red-500"><Trash2 size={16}/></button></li>))}</ul></div>
                </div>
            )}
            
            {activeTab === 'lutas' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Próxima Luta</h3><div className="grid md:grid-cols-2 gap-4"><div><label className="text-xs text-slate-500">Data</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="date" value={perfil.nextFight.date} onChange={handleNextFightChange} /></div><div><label className="text-xs text-slate-500">Evento</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="event" value={perfil.nextFight.event} onChange={handleNextFightChange} /></div><div><label className="text-xs text-slate-500">Oponente</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="opponent" value={perfil.nextFight.opponent} onChange={handleNextFightChange} /></div><div><label className="text-xs text-slate-500">Local</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="location" value={perfil.nextFight.location} onChange={handleNextFightChange} /></div></div></div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Histórico de Lutas</h3><button onClick={handleAddLuta} className="text-xs bg-cyan-600 px-3 py-1 rounded flex items-center gap-1"><PlusCircle size={14}/> Adicionar</button></div><div className="space-y-2">{perfil.historico.map((luta, i) => (<div key={i} className="grid grid-cols-12 gap-2 bg-black/50 p-2 rounded border border-slate-800 items-center"><div className="col-span-2"><select value={luta.result} onChange={(e) => handleFightChange(i, 'result', e.target.value)} className={`w-full p-1 rounded font-bold ${luta.result === 'W' ? 'bg-green-900 text-green-400' : luta.result === 'L' ? 'bg-red-900 text-red-400' : 'bg-slate-700'}`}>{RESULTADOS.map(r=><option key={r} value={r}>{r}</option>)}</select></div><div className="col-span-4"><input value={luta.event} onChange={(e) => handleFightChange(i, 'event', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs" placeholder="Evento"/></div><div className="col-span-3"><input value={luta.opponent} onChange={(e) => handleFightChange(i, 'opponent', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs" placeholder="Oponente"/></div><div className="col-span-2"><input value={luta.date} onChange={(e) => handleFightChange(i, 'date', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs text-right" placeholder="Data"/></div><div className="col-span-1 text-center"><button onClick={() => {const n = [...perfil.historico]; n.splice(i, 1); setPerfil({...perfil, historico: n})}} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button></div></div>))}</div></div>
                </div>
            )}
            
            {activeTab === 'midia' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Redes Sociais</h3><div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-3 bg-black/20 rounded border border-slate-700"><div className="flex items-center gap-2 text-pink-500 font-bold text-sm col-span-1 md:col-span-3"><Instagram size={16}/> Instagram</div><input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.user} onChange={(e) => handleSocialChange('instagram', 'user', e.target.value)} /><input placeholder="Seguidores (Ex: 10k)" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.followers} onChange={(e) => handleSocialChange('instagram', 'followers', e.target.value)} /><input placeholder="Link" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.url} onChange={(e) => handleSocialChange('instagram', 'url', e.target.value)} /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-3 bg-black/20 rounded border border-slate-700"><div className="flex items-center gap-2 text-cyan-400 font-bold text-sm col-span-1 md:col-span-3"><TikTokIcon size={16}/> TikTok</div><input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.user} onChange={(e) => handleSocialChange('tiktok', 'user', e.target.value)} /><input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.followers} onChange={(e) => handleSocialChange('tiktok', 'followers', e.target.value)} /><input placeholder="Link" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.url} onChange={(e) => handleSocialChange('tiktok', 'url', e.target.value)} /></div></div></div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Vídeos (YouTube)</h3><div className="flex gap-2 mb-4"><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Cole o link do YouTube..." value={videoInput} onChange={(e) => setVideoInput(e.target.value)} /><button onClick={handleAddVideo} className="bg-red-600 px-4 rounded text-white font-bold">Adicionar</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{perfil.video_lista.map((v, i) => (<div key={i} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative group"><iframe src={v.embedUrl} className="w-full aspect-video" frameBorder="0"></iframe><div className="p-2 flex justify-between items-center bg-slate-900"><input className="bg-transparent text-xs w-full" value={v.title} onChange={(e) => {const n = [...perfil.video_lista]; n[i].title = e.target.value; setPerfil({...perfil, video_lista: n})}} /><button onClick={() => {const n = [...perfil.video_lista]; n.splice(i, 1); setPerfil({...perfil, video_lista: n})}} className="text-red-500"><Trash2 size={16}/></button></div></div>))}</div></div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><div className="flex justify-between items-center mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Galeria de Fotos</h3><button onClick={() => openWidget((url) => setPerfil({...perfil, galeria: [...perfil.galeria, { full: url, thumb: url }]}), false)} className="bg-cyan-600 px-3 py-1 rounded text-xs flex items-center gap-2"><Upload size={14}/> Upload</button></div><div className="grid grid-cols-3 md:grid-cols-5 gap-4">{perfil.galeria.map((img, i) => (<div key={i} className="aspect-square bg-black rounded border border-slate-700 relative group overflow-hidden"><img src={img.thumb} className="w-full h-full object-cover" /><button onClick={() => handleDeleteImage('galeria', i, img.full)} className="absolute top-1 right-1 bg-red-600 p-1 rounded text-white opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button></div>))}</div></div>
                </div>
            )}
            
            {activeTab === 'metricas' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-2 mb-6"><h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2"><Eye size={18}/> Visitas no Perfil</h3><div className="ml-auto bg-black px-3 py-1 rounded-full border border-slate-700 text-sm font-mono text-white">Total: {totalViews}</div></div>
                         
                         {/* DEBUG VISUAL DA GAMIFICAÇÃO DE VISITAS */}
                         <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                            <h4 className="text-purple-400 font-bold text-xs uppercase mb-2 flex items-center gap-2"><TrendingUp size={14}/> Gamificação de Visitas</h4>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>XP Ganho esta semana: <b className="text-white">{perfil.weekly_stats?.visits_xp_earned || 0}</b> / 500</span>
                                <span>Próximo marco: <b className="text-white">{(perfil.weekly_stats?.visits_snapshot || 0) + 300}</b> views</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, ((perfil.weekly_stats?.visits_xp_earned || 0) / 500) * 100)}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Você ganha +50 XP a cada 300 novas visitas (Max 500 XP/semana).</p>
                         </div>

                         <div className="space-y-2">{profileViews.length === 0 ? <p className="text-sm text-slate-500 text-center italic">Nenhuma visita de empresa/evento identificada ainda.</p> : profileViews.map((view, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded border border-slate-800"><div className="flex items-center gap-3">{view.detalhes?.foto_url && isPremium ? <img src={view.detalhes.foto_url} alt="Visitante" className="w-10 h-10 rounded-full object-cover border border-slate-700" /> : <div className={`p-2 rounded-full ${view.visitante_tipo === 'empresa' ? 'bg-purple-900/20 text-purple-400' : view.visitante_tipo === 'evento' ? 'bg-orange-900/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>{view.visitante_tipo === 'empresa' ? <Building2 size={16}/> : view.visitante_tipo === 'evento' ? <Calendar size={16}/> : <Medal size={16}/>}</div>}<div>{isPremium ? (view.detalhes ? <Link href={`/${view.detalhes.slug}`} target="_blank" className="font-bold text-sm text-white hover:text-cyan-400 hover:underline">{view.detalhes.apelido || view.detalhes.nome}</Link> : <p className="font-bold text-sm text-white">Visitante não identificado</p>) : (<div className="flex flex-col"><span className="font-bold text-sm blur-sm select-none text-slate-400">Usuário Oculto</span><span className="text-[10px] text-yellow-500 font-bold">PREMIUM</span></div>)}<p className="text-xs text-slate-500 capitalize">{view.visitante_tipo}</p></div></div><div className="text-xs text-slate-600">{new Date(view.created_at).toLocaleDateString()}</div></div>))}</div>
                         {!isPremium && profileViews.length > 0 && <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-center"><p className="text-yellow-500 text-xs font-bold mb-2">Empresas estão vendo você!</p><p className="text-slate-400 text-xs mb-3">Vire Premium para saber exatamente quem são.</p><a href="#" target="_blank" className="text-xs bg-yellow-500 text-black font-bold px-3 py-1 rounded">Desbloquear Lista</a></div>}
                    </div>
                    {/* (Blocos de Instagram e Público mantidos igual) */}
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}><h3 className="text-pink-500 font-bold uppercase text-sm mb-4">Performance Instagram</h3><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-slate-500">Alcance</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 15.000" value={perfil.socials?.instagram?.stats?.reach} onChange={e => handleInstaStats('stats', 'reach', formatNumber(e.target.value))} /></div><div><label className="text-xs text-slate-500">Impressões</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 50.000" value={perfil.socials?.instagram?.stats?.impressions} onChange={e => handleInstaStats('stats', 'impressions', formatNumber(e.target.value))} /></div><div><label className="text-xs text-slate-500">Compartilhamentos</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 25.000" value={perfil.socials?.instagram?.stats?.shares} onChange={e => handleInstaStats('stats', 'shares', formatNumber(e.target.value))} /></div><div><label className="text-xs text-slate-500">Engajamento (%)</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 8.5%" value={perfil.socials?.instagram?.stats?.engagement} onChange={e => handleInstaStats('stats', 'engagement', e.target.value)} /></div></div>{!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere métricas" /></div>}</div>
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}><h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Público</h3><div className="grid gap-4"><div><label className="text-xs text-slate-500">Idade</label><div className="flex gap-2"><input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.min} onChange={e => setAgeRange({...ageRange, min: e.target.value})} /><span className="text-slate-500">-</span><input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.max} onChange={e => setAgeRange({...ageRange, max: e.target.value})} /></div></div><div><label className="text-xs text-slate-500">Gênero</label><div className="flex gap-2"><input disabled={!isPremium} placeholder="% H" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.men} onChange={e => setGenderSplit({...genderSplit, men: e.target.value})} /><input disabled={!isPremium} placeholder="% M" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.women} onChange={e => setGenderSplit({...genderSplit, women: e.target.value})} /></div></div></div>{!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere demografia" /></div>}</div>
                </div>
            )}
            
            {activeTab === 'contato' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid md:grid-cols-2 gap-6"><div><label className="text-xs text-slate-500">Email Comercial</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="email" value={perfil.contact.email} onChange={handleContactChange} /></div><div><label className="text-xs text-slate-500">Email Empresário</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="managerEmail" value={perfil.contact.managerEmail} onChange={handleContactChange} /></div><div><label className="text-xs text-slate-500">Telefone / Whatsapp</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="phone" value={perfil.contact.phone} onChange={handleContactChange} /></div><div><label className="text-xs text-slate-500">Celular Visível (Formatado)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="phoneDisplay" placeholder="+55 11 99999-9999" value={perfil.contact.phoneDisplay} onChange={handleContactChange} /></div><div><label className="text-xs text-slate-500">Cidade/Estado</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="city" value={perfil.contact.city} onChange={handleContactChange} /></div><div><label className="text-xs text-slate-500">CT (Centro de Treinamento)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="trainingCenter" value={perfil.contact.trainingCenter} onChange={handleContactChange} /></div></div>
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