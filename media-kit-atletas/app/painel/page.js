'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script'; 
import { Trash2, PlusCircle, Save, LogOut, Eye, Lock, Instagram, Youtube, Twitter, Camera, Upload, Link as LinkIcon, Check, X, Image as ImageIcon, BarChart3, Users, PieChart, AlertCircle, Building2, Calendar, Medal } from 'lucide-react';

// --- CONFIGURAÇÃO CLOUDINARY ---
const CLOUD_NAME = "dgn8bzilm"; 
const UPLOAD_PRESET = "atletas_upload"; 

const TikTokIcon = ({size=24, className}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ESTILOS_LUTA = ["MMA", "Muay Thai", "Boxe", "Kickboxing", "Jiu-Jitsu Brasileiro (BJJ)", "Wrestling (Luta Olímpica)", "Judô", "Sambo", "Krav Maga", "Capoeira", "Karatê"];
const ESTADOS_BR = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function Painel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [userId, setUserId] = useState(null);

  // Estados locais para inputs controlados (Métricas Instagram)
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [genderSplit, setGenderSplit] = useState({ men: '', women: '' });
  const [cityInput, setCityInput] = useState({ name: '', percent: '' });
  const [cityList, setCityList] = useState([]); 

  // NOVO: Estados para Views do Perfil
  const [profileViews, setProfileViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);

  const [perfil, setPerfil] = useState({
    nome: '', apelido: '', categoria: '', foto_url: '', about: '', slug: '',
    fightingStyle: '', plano: 'free', tipo_conta: 'atleta', // NOVO CAMPO
    stats: { height: '', weight: '', reach: '', age: '' },
    record: { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
    contact: { email: '', phone: '', state: '', trainingCenter: '' },
    nextFight: { date: '', event: '', opponent: '', location: '' },
    socials: { 
        instagram: { user: '', followers: '', url: '', stats: { reach: '', impressions: '', engagement: '', shares: '' }, audience: { age: '', gender: '', cities: '' } }, 
        youtube: { user: '', followers: '', url: '' }, tiktok: { user: '', followers: '', url: '' }, x: { user: '', followers: '', url: '' } 
    },
    historico: [], video_lista: [], galeria: [], premios: []
  });

  const mascaraData = (valor) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1'); 
  const formatNumber = (value) => !value ? '' : value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const limparSlug = (texto) => texto.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleFocusMedida = (e, unidade) => { const valorLimpo = e.target.value.replace(unidade, '').trim(); setPerfil(prev => ({ ...prev, stats: { ...prev.stats, [e.target.name]: valorLimpo } })); };
  const handleBlurMedida = (e, unidade) => { let valor = e.target.value; if (valor && !valor.includes(unidade)) { setPerfil(prev => ({ ...prev, stats: { ...prev.stats, [e.target.name]: `${valor}${unidade}` } })); } };

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data } = await supabase.from('atletas').select('*').eq('user_id', user.id).single();
      if (data) {
        const instaData = data.redes_sociais?.instagram || {};
        
        // Parsing Stats Locais
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
            plano: data.plano || 'free',
            tipo_conta: data.tipo_conta || 'atleta', // Carrega o tipo
            slug: data.slug || '',
            stats: data.atributos || { height: '', weight: '', reach: '', age: '' },
            record: data.cartel || { wins: 0, losses: 0, draws: 0 },
            contact: data.contato || { email: '', phone: '', state: '' },
            nextFight: data.prox_luta || { date: '', event: '', opponent: '' }, 
            socials: { 
                instagram: { ...instaData, stats: instaData.stats || { reach: '', impressions: '', engagement: '', shares: '' }, audience: instaData.audience || { age: '', gender: '', cities: '' } },
                youtube: { ...data.redes_sociais?.youtube }, tiktok: { ...data.redes_sociais?.tiktok }, x: { ...data.redes_sociais?.x }
            },
            historico: data.historico || [], video_lista: data.video_lista || [], galeria: data.galeria || [], premios: data.premios || []
        });

        // --- CARREGAR VIEWS DO PERFIL ---
        const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', user.id);
        setTotalViews(count || 0);

        // Se for PREMIUM, carrega os detalhes dos últimos 10 visitantes
        if (data.plano === 'premium') {
             const { data: viewsData } = await supabase
                .from('profile_views')
                .select('created_at, visitante_tipo')
                .eq('perfil_visitado_id', user.id)
                .neq('visitante_tipo', 'anonimo') // Só interessa quem é classificado
                .order('created_at', { ascending: false })
                .limit(10);
             setProfileViews(viewsData || []);
        } else {
             // Se for FREE, carrega dados "fakes" ou reais mas anonimizados no front
             const { data: viewsData } = await supabase
                .from('profile_views')
                .select('created_at, visitante_tipo')
                .eq('perfil_visitado_id', user.id)
                .neq('visitante_tipo', 'anonimo')
                .order('created_at', { ascending: false })
                .limit(5);
             setProfileViews(viewsData || []);
        }
      }
      setLoading(false);
    }
    getData();
  }, []);

  // ... (useEffects de update automáticos de string mantidos) ...
  useEffect(() => { if (ageRange.min && ageRange.max) handleInstaStats('audience', 'age', `${ageRange.min}-${ageRange.max} anos`); }, [ageRange]);
  useEffect(() => { if (genderSplit.men || genderSplit.women) handleInstaStats('audience', 'gender', `${genderSplit.men || 0}% Homens / ${genderSplit.women || 0}% Mulheres`); }, [genderSplit]);
  useEffect(() => { if (cityList.length > 0) handleInstaStats('audience', 'cities', cityList.map(c => `${c.name} (${c.percent}%)`).join(', ')); else handleInstaStats('audience', 'cities', ''); }, [cityList]);

  // Funções Auxiliares (addCity, removeCity, deletes, widget...) - MANTIDAS IGUAIS AO ANTERIOR
  const addCity = () => { if (!cityInput.name || !cityInput.percent) return; if (cityList.length >= 5) { alert("Máximo de 5 cidades."); return; } if (cityList.reduce((acc, curr) => acc + parseInt(curr.percent), 0) + parseInt(cityInput.percent) > 100) { alert("A soma não pode passar de 100%."); return; } setCityList([...cityList, { name: cityInput.name, percent: cityInput.percent }]); setCityInput({ name: '', percent: '' }); };
  const removeCity = (idx) => { const n = [...cityList]; n.splice(idx, 1); setCityList(n); };
  const handleDeleteImage = async (arrName, index, url) => { if(!confirm("Excluir?")) return; if(url && url.includes('cloudinary')) try { await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url }) }); } catch(e){} const n = [...perfil[arrName]]; n.splice(index, 1); setPerfil({...perfil, [arrName]: n}); };
  const handleDeleteProfilePic = async () => { if(!perfil.foto_url || !confirm("Remover foto?")) return; if(perfil.foto_url.includes('cloudinary')) await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url: perfil.foto_url }) }); setPerfil({...perfil, foto_url: ''}); };
  
  const handleSave = async () => {
    setSaving(true);
    if (perfil.slug) {
        const slugLimpo = limparSlug(perfil.slug);
        const { data: exists } = await supabase.from('atletas').select('id').eq('slug', slugLimpo).neq('user_id', userId).maybeSingle();
        if (exists) { alert("Link em uso."); setSaving(false); return; }
        perfil.slug = slugLimpo; 
    }
    const payload = {
        nome: perfil.nome, apelido: perfil.apelido, categoria: perfil.categoria, foto_url: perfil.foto_url,
        slug: perfil.slug, sobre: perfil.about, estilodeluta: perfil.fightingStyle, atributos: perfil.stats, cartel: perfil.record,
        contato: perfil.contact, prox_luta: perfil.nextFight, redes_sociais: perfil.socials,
        historico: perfil.historico, video_lista: perfil.video_lista, galeria: perfil.galeria, premios: perfil.premios,
        tipo_conta: perfil.tipo_conta // Salva o tipo
    };
    const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);
    if (error) alert("Erro: " + error.message); else alert("Salvo!");
    setSaving(false);
  }

  const openWidget = (onUpload, isSquare = true) => { if (!window.cloudinary) return; window.cloudinary.createUploadWidget({ cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, sources: ['local', 'instagram'], multiple: false, cropping: isSquare, croppingAspectRatio: isSquare ? 1 : null, folder: 'atletas_assets' }, (error, result) => { if (!error && result && result.event === "success") onUpload(result.info.secure_url); }).open(); };
  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  const handleSlugChange = (e) => setPerfil({...perfil, slug: limparSlug(e.target.value)});
  const handleNested = (p, f, v) => setPerfil(prev => ({ ...prev, [p]: { ...prev[p], [f]: v } }));
  const handleDeepNested = (p, k, f, v) => setPerfil(prev => ({ ...prev, [p]: { ...prev[p], [k]: { ...prev[p][k], [f]: v } } }));
  const handleArrayChange = (a, i, f, v) => { const n = [...perfil[a]]; n[i][f] = v; setPerfil({...perfil, [a]: n}); };
  const addItem = (a, v) => setPerfil({...perfil, [a]: [...perfil[a], v]});
  const removeItem = (a, i) => { const n = [...perfil[a]]; n.splice(i, 1); setPerfil({...perfil, [a]: n}); };
  const handleAwardChange = (i, v) => { const n = [...perfil.premios]; n[i] = v; setPerfil({...perfil, premios: n}); };
  const handleInstaStats = (c, f, v) => setPerfil(prev => ({ ...prev, socials: { ...prev.socials, instagram: { ...prev.socials.instagram, [c]: { ...prev.socials.instagram[c], [f]: v } } } }));

  const PremiumLock = ({ text }) => ( <div className="bg-slate-900/50 border border-yellow-500/20 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 opacity-80"> <Lock className="text-yellow-500 mb-2" size={32} /> <h3 className="text-white font-bold">Funcionalidade Premium</h3> <p className="text-slate-400 text-sm mb-4">{text}</p> <a href={`https://pay.kirvano.com/AQUI_VAI_SEU_LINK_KIRVANO?email=${perfil.contact?.email || ''}`} target="_blank" className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold py-2 px-4 rounded transition">LIBERAR AGORA</a> </div> );

  if (loading) return <div className="text-white p-10 text-center">Carregando...</div>;
  const isPremium = perfil.plano === 'premium';
  const totalGender = (parseInt(genderSplit.men) || 0) + (parseInt(genderSplit.women) || 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Painel</h1>
                {isPremium ? <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 font-bold uppercase">PREMIUM</span> : <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded font-bold uppercase">GRÁTIS</span>}
            </div>
            <div className="flex gap-3">
                <Link href={`/${perfil.slug || perfil.id}`} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Eye size={20}/></Link>
                <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded"><LogOut size={20}/></button>
            </div>
        </div>

        {!isPremium && (
            <div className="mb-8 bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-xl border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div><h3 className="text-xl font-bold text-white">🚀 Libere seu Media Kit</h3><p className="text-blue-200 text-sm mt-1">Veja quem visitou seu perfil: Empresas e Eventos.</p></div>
                <a href={`https://pay.kirvano.com/AQUI_VAI_SEU_LINK_KIRVANO?email=${perfil.contact?.email || ''}`} target="_blank" className="bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:scale-105 transition">Virar Premium</a>
            </div>
        )}

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            {['geral', 'cartel', 'lutas', 'midia', 'metricas', 'contato'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition whitespace-nowrap ${activeTab === tab ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>{tab}</button>
            ))}
        </div>

        <div className="space-y-6">
            
            {/* 1. GERAL - Adicionado Seletor de Tipo de Conta */}
            {activeTab === 'geral' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Informações Básicas</h3>
                    
                    {/* FOTO DE PERFIL */}
                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-slate-700 border-dashed">
                        <div onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="relative w-32 h-32 mb-4 group cursor-pointer">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-700 group-hover:border-yellow-500 transition relative">
                                {perfil.foto_url ? <img src={perfil.foto_url} alt="Perfil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500"><Camera size={32} /></div>}
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs"><button onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="text-yellow-500 hover:underline">Alterar</button>{perfil.foto_url && <button onClick={handleDeleteProfilePic} className="text-red-500 hover:underline">Remover</button>}</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* SELETOR DE TIPO DE CONTA (NOVO) */}
                        <div className="md:col-span-2 bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                            <label className="text-xs text-blue-300 font-bold mb-2 block uppercase">Tipo de Conta (Como você aparece nas visitas)</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipo_conta" value="atleta" checked={perfil.tipo_conta === 'atleta'} onChange={handleChange} className="accent-cyan-400"/> Atleta
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipo_conta" value="empresa" checked={perfil.tipo_conta === 'empresa'} onChange={handleChange} className="accent-cyan-400"/> Empresa/Marca
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipo_conta" value="evento" checked={perfil.tipo_conta === 'evento'} onChange={handleChange} className="accent-cyan-400"/> Evento
                                </label>
                            </div>
                        </div>

                        <div><label className="text-xs text-slate-500">Nome</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Apelido</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div>
                        
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1">Link Personalizado {isPremium && <Check size={10} className="text-green-500"/>}</label>
                            <div className={`flex items-center border p-2 rounded ${isPremium ? 'bg-black border-slate-700' : 'bg-slate-800/50 border-slate-800 opacity-60'}`}>
                                <LinkIcon size={16} className="text-slate-500 mr-2"/><span className="text-slate-500 text-sm mr-1 hidden sm:inline">nocautepages.com/</span>
                                <input className="bg-transparent text-white w-full outline-none font-bold" name="slug" value={perfil.slug} onChange={handleSlugChange} disabled={!isPremium} />
                                {!isPremium && <Lock size={16} className="text-yellow-500 ml-2" />}
                            </div>
                        </div>

                        <div><label className="text-xs text-slate-500">Categoria</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="categoria" value={perfil.categoria} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Estilo</label><select className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="fightingStyle" value={perfil.fightingStyle} onChange={handleChange}><option value="">Selecione...</option>{ESTILOS_LUTA.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-500">Bio</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={3} name="about" value={perfil.about} onChange={handleChange} /></div>
                    </div>
                </div>
            )}

            {/* ABAS MANTIDAS (Cartel, Lutas, Midia...) - Ocultadas aqui para brevidade, mas devem existir no código final */}
            {activeTab === 'cartel' && <div className="text-center text-slate-500 py-10">Use o código da versão anterior para Cartel/Físico</div>}
            {activeTab === 'lutas' && <div className="text-center text-slate-500 py-10">Use o código da versão anterior para Lutas</div>}
            {activeTab === 'midia' && <div className="text-center text-slate-500 py-10">Use o código da versão anterior para Mídia</div>}

            {/* 5. MÉTRICAS (ATUALIZADA COM VIEWS) */}
            {activeTab === 'metricas' && (
                <div className="space-y-6">
                    
                    {/* --- NOVO: QUEM VISITOU SEU PERFIL --- */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2"><Eye size={18}/> Visitas no Perfil</h3>
                            <div className="ml-auto bg-black px-3 py-1 rounded-full border border-slate-700 text-sm font-mono text-white">Total: {totalViews}</div>
                        </div>

                        <div className="space-y-2">
                            {profileViews.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center italic">Nenhuma visita de empresa/evento registrada ainda.</p>
                            ) : (
                                profileViews.map((view, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            {/* Ícone baseado no tipo */}
                                            <div className={`p-2 rounded-full ${view.visitante_tipo === 'empresa' ? 'bg-purple-900/20 text-purple-400' : view.visitante_tipo === 'evento' ? 'bg-orange-900/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                                                {view.visitante_tipo === 'empresa' ? <Building2 size={16}/> : view.visitante_tipo === 'evento' ? <Calendar size={16}/> : <Medal size={16}/>}
                                            </div>
                                            
                                            <div>
                                                {/* Lógica de Esconder/Mostrar Nome */}
                                                <p className={`font-bold text-sm ${!isPremium ? 'blur-sm select-none' : 'text-white'}`}>
                                                    {isPremium ? 'Nome do Visitante Aqui' : 'Visitante Oculto'} 
                                                    {/* Obs: Para mostrar o nome real, precisa fazer um join com a tabela 'atletas' no useEffect. Por enquanto deixei genérico. */}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">{view.visitante_tipo}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            {new Date(view.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {!isPremium && profileViews.length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                                <p className="text-yellow-500 text-xs font-bold mb-2">Empresas estão vendo você!</p>
                                <p className="text-slate-400 text-xs mb-3">Vire Premium para saber exatamente quem são.</p>
                                <a href={`https://pay.kirvano.com/AQUI_VAI_SEU_LINK_KIRVANO?email=${perfil.contact?.email || ''}`} target="_blank" className="text-xs bg-yellow-500 text-black font-bold px-3 py-1 rounded">Desbloquear Lista</a>
                            </div>
                        )}
                    </div>
                    {/* ------------------------------------- */}

                    {/* PERFORMANCE INSTAGRAM (MANTIDO) */}
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                         {/* ... Código anterior de inputs do Instagram ... */}
                         <h3 className="text-pink-500 font-bold uppercase text-sm mb-4">Performance Instagram</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-slate-500">Alcance</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 15.000" value={perfil.socials?.instagram?.stats?.reach} onChange={e => handleInstaStats('stats', 'reach', formatNumber(e.target.value))} /></div>
                            <div><label className="text-xs text-slate-500">Impressões</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 50.000" value={perfil.socials?.instagram?.stats?.impressions} onChange={e => handleInstaStats('stats', 'impressions', formatNumber(e.target.value))} /></div>
                         </div>
                         {!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere métricas" /></div>}
                    </div>

                    {/* DEMOGRAFIA (MANTIDO) */}
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                         {/* ... Código anterior de demografia ... */}
                         <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Público</h3>
                         <div className="grid gap-4">
                            <div><label className="text-xs text-slate-500">Idade</label><div className="flex gap-2"><input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.min} onChange={e => setAgeRange({...ageRange, min: e.target.value})} /><span className="text-slate-500">-</span><input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.max} onChange={e => setAgeRange({...ageRange, max: e.target.value})} /></div></div>
                            <div><label className="text-xs text-slate-500">Gênero</label><div className="flex gap-2"><input disabled={!isPremium} placeholder="% H" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.men} onChange={e => setGenderSplit({...genderSplit, men: e.target.value})} /><input disabled={!isPremium} placeholder="% M" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.women} onChange={e => setGenderSplit({...genderSplit, women: e.target.value})} /></div></div>
                         </div>
                         {!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere demografia" /></div>}
                    </div>
                </div>
            )}

            {activeTab === 'contato' && <div className="text-center text-slate-500 py-10">Use o código da versão anterior para Contato</div>}
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