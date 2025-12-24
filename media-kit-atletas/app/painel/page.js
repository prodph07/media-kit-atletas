'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script'; 
import { Trash2, PlusCircle, Save, LogOut, Eye, Lock, Instagram, Youtube, Twitter, Camera, Upload, Link as LinkIcon, Check, X, Image as ImageIcon, BarChart3, Users, PieChart, AlertCircle } from 'lucide-react';

// --- CONFIGURAÇÃO CLOUDINARY ---
const CLOUD_NAME = "dgn8bzilm"; 
const UPLOAD_PRESET = "atletas_upload";   
// ------------------------------

const TikTokIcon = ({size=24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ESTILOS_LUTA = ["MMA", "Muay Thai", "Boxe", "Kickboxing", "Jiu-Jitsu Brasileiro (BJJ)", "Wrestling (Luta Olímpica)", "Judô", "Sambo", "Krav Maga", "Capoeira", "Karatê"];
const ESTADOS_BR = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function Painel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [userId, setUserId] = useState(null);

  // Estados locais para inputs controlados (Métricas)
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [genderSplit, setGenderSplit] = useState({ men: '', women: '' });
  const [cityInput, setCityInput] = useState({ name: '', percent: '' });
  const [cityList, setCityList] = useState([]); // [{name: 'SP', percent: 40}]

  const [perfil, setPerfil] = useState({
    nome: '', apelido: '', categoria: '', foto_url: '', about: '', slug: '',
    fightingStyle: '', plano: 'free', 
    stats: { height: '', weight: '', reach: '', age: '' },
    record: { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
    contact: { email: '', phone: '', state: '', trainingCenter: '' },
    nextFight: { date: '', event: '', opponent: '', location: '' },
    socials: { 
        instagram: { user: '', followers: '', url: '', stats: { reach: '', impressions: '', engagement: '', shares: '' }, audience: { age: '', gender: '', cities: '' } }, 
        youtube: { user: '', followers: '', url: '' }, 
        tiktok: { user: '', followers: '', url: '' }, 
        x: { user: '', followers: '', url: '' } 
    },
    historico: [], video_lista: [], galeria: [], premios: []
  });

  const mascaraData = (valor) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1'); 
  
  // Mascara para números com ponto (Ex: 100.000)
  const formatNumber = (value) => {
      if (!value) return '';
      return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const limparSlug = (texto) => {
    return texto.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleFocusMedida = (e, unidade) => {
    const valorLimpo = e.target.value.replace(unidade, '').trim();
    setPerfil(prev => ({ ...prev, stats: { ...prev.stats, [e.target.name]: valorLimpo } }));
  };
  const handleBlurMedida = (e, unidade) => {
    let valor = e.target.value;
    if (valor && !valor.includes(unidade)) {
      setPerfil(prev => ({ ...prev, stats: { ...prev.stats, [e.target.name]: `${valor}${unidade}` } }));
    }
  };

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data } = await supabase.from('atletas').select('*').eq('user_id', user.id).single();
      if (data) {
        const instaData = data.redes_sociais?.instagram || {};
        
        // Parsing inicial dos dados salvos para os estados locais
        // Idade
        const ageStr = instaData.audience?.age || '';
        const ageMatch = ageStr.match(/(\d+)-(\d+)/);
        if (ageMatch) setAgeRange({ min: ageMatch[1], max: ageMatch[2] });

        // Gênero
        const genderStr = instaData.audience?.gender || '';
        const menMatch = genderStr.match(/(\d+)% Homens/);
        const womenMatch = genderStr.match(/(\d+)% Mulheres/);
        setGenderSplit({ 
            men: menMatch ? menMatch[1] : '', 
            women: womenMatch ? womenMatch[1] : '' 
        });

        // Cidades (Parser manual simples)
        // Ex: "São Paulo (40%), Rio (20%)"
        const citiesStr = instaData.audience?.cities || '';
        if (citiesStr) {
            const list = citiesStr.split(',').map(item => {
                const match = item.match(/(.+)\s\((\d+)%\)/);
                if (match) return { name: match[1].trim(), percent: match[2] };
                return null;
            }).filter(Boolean);
            setCityList(list);
        }

        setPerfil({
            ...data,
            plano: data.plano || 'free',
            slug: data.slug || '',
            stats: data.atributos || { height: '', weight: '', reach: '', age: '' },
            record: data.cartel || { wins: 0, losses: 0, draws: 0 },
            contact: data.contato || { email: '', phone: '', state: '' },
            nextFight: data.prox_luta || { date: '', event: '', opponent: '' }, 
            socials: { 
                instagram: { 
                    ...instaData,
                    stats: instaData.stats || { reach: '', impressions: '', engagement: '', shares: '' },
                    audience: instaData.audience || { age: '', gender: '', cities: '' }
                },
                youtube: { ...data.redes_sociais?.youtube },
                tiktok: { ...data.redes_sociais?.tiktok },
                x: { ...data.redes_sociais?.x }
            },
            historico: data.historico || [], video_lista: data.video_lista || [], galeria: data.galeria || [], premios: data.premios || []
        });
      }
      setLoading(false);
    }
    getData();
  }, []);

  // --- LOGICA DE ATUALIZAÇÃO AUTOMÁTICA DOS CAMPOS STRINGS ---
  
  // Atualiza string de Idade quando inputs mudam
  useEffect(() => {
    if (ageRange.min && ageRange.max) {
        handleInstaStats('audience', 'age', `${ageRange.min}-${ageRange.max} anos`);
    }
  }, [ageRange]);

  // Atualiza string de Genero quando inputs mudam
  useEffect(() => {
    if (genderSplit.men || genderSplit.women) {
        const m = genderSplit.men || 0;
        const w = genderSplit.women || 0;
        handleInstaStats('audience', 'gender', `${m}% Homens / ${w}% Mulheres`);
    }
  }, [genderSplit]);

  // Atualiza string de Cidades quando a lista muda
  useEffect(() => {
    if (cityList.length > 0) {
        const str = cityList.map(c => `${c.name} (${c.percent}%)`).join(', ');
        handleInstaStats('audience', 'cities', str);
    } else {
        handleInstaStats('audience', 'cities', '');
    }
  }, [cityList]);

  // Lógica Cidades
  const addCity = () => {
      if (!cityInput.name || !cityInput.percent) return;
      if (cityList.length >= 5) { alert("Máximo de 5 cidades."); return; }
      const totalPercent = cityList.reduce((acc, curr) => acc + parseInt(curr.percent), 0);
      if (totalPercent + parseInt(cityInput.percent) > 100) { alert("A soma das porcentagens não pode passar de 100%."); return; }
      
      setCityList([...cityList, { name: cityInput.name, percent: cityInput.percent }]);
      setCityInput({ name: '', percent: '' });
  };
  
  const removeCity = (idx) => {
      const newList = [...cityList];
      newList.splice(idx, 1);
      setCityList(newList);
  };

  const handleDeleteImage = async (arrName, index, urlParaDeletar) => {
     if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;
     if (urlParaDeletar && urlParaDeletar.includes('cloudinary')) {
         try { await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url: urlParaDeletar }) }); } catch (err) { console.error(err); }
     }
     const novaLista = [...perfil[arrName]];
     novaLista.splice(index, 1);
     setPerfil({ ...perfil, [arrName]: novaLista });
  };

  const handleDeleteProfilePic = async () => {
      if (!perfil.foto_url) return;
      if (!confirm("Remover foto de perfil?")) return;
      if (perfil.foto_url.includes('cloudinary')) { await fetch('/api/delete-image', { method: 'POST', body: JSON.stringify({ url: perfil.foto_url }) }); }
      setPerfil({ ...perfil, foto_url: '' });
  };

  async function handleSave() {
    setSaving(true);
    if (perfil.slug) {
        const slugLimpo = limparSlug(perfil.slug);
        const { data: existeSlug } = await supabase.from('atletas').select('id').eq('slug', slugLimpo).neq('user_id', userId).maybeSingle();
        if (existeSlug) { alert(`O link "${slugLimpo}" já está em uso.`); setSaving(false); return; }
        perfil.slug = slugLimpo; 
    }
    const payload = {
        nome: perfil.nome, apelido: perfil.apelido, categoria: perfil.categoria, foto_url: perfil.foto_url,
        slug: perfil.slug, sobre: perfil.about, estilodeluta: perfil.fightingStyle, atributos: perfil.stats, cartel: perfil.record,
        contato: perfil.contact, prox_luta: perfil.nextFight, redes_sociais: perfil.socials,
        historico: perfil.historico, video_lista: perfil.video_lista, galeria: perfil.galeria, premios: perfil.premios
    };
    const { error } = await supabase.from('atletas').update(payload).eq('user_id', userId);
    if (error) alert("Erro: " + error.message);
    else alert("Salvo com sucesso!");
    setSaving(false);
  }

  const openWidget = (onUpload, isSquare = true) => {
    if (!window.cloudinary) { alert("Erro ao carregar sistema de upload."); return; }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, sources: ['local', 'instagram', 'camera'], multiple: false, cropping: isSquare, croppingAspectRatio: isSquare ? 1 : null, showSkipCropButton: false, folder: 'atletas_assets', clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'], maxImageFileSize: 5000000, language: "pt", 
        styles: { palette: { window: "#0f172a", sourceBg: "#1e293b", windowBorder: "#1e293b", tabIcon: "#eab308", inactiveTabIcon: "#94a3b8", menuIcons: "#eab308", link: "#eab308", action: "#eab308", inProgress: "#3b82f6", complete: "#22c55e", error: "#ef4444", textDark: "#0f172a", textLight: "#ffffff" } }
      },
      (error, result) => { if (!error && result && result.event === "success") { onUpload(result.info.secure_url); } }
    );
    widget.open();
  };

  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  const handleSlugChange = (e) => setPerfil({...perfil, slug: limparSlug(e.target.value)});
  const handleNested = (parent, field, value) => setPerfil(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  const handleDeepNested = (parent, key, field, value) => setPerfil(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: { ...prev[parent][key], [field]: value } } }));
  const handleArrayChange = (arr, idx, field, val) => { const n = [...perfil[arr]]; n[idx][field] = val; setPerfil({...perfil, [arr]: n}); };
  const addItem = (arr, item) => setPerfil({...perfil, [arr]: [...perfil[arr], item]});
  const removeItem = (arr, idx) => { const n = [...perfil[arr]]; n.splice(idx, 1); setPerfil({...perfil, [arr]: n}); };
  const handleAwardChange = (idx, val) => { const n = [...perfil.premios]; n[idx] = val; setPerfil({...perfil, premios: n}); };
  
  const handleInstaStats = (category, field, value) => {
      setPerfil(prev => ({
          ...prev,
          socials: {
              ...prev.socials,
              instagram: {
                  ...prev.socials.instagram,
                  [category]: {
                      ...prev.socials.instagram[category],
                      [field]: value
                  }
              }
          }
      }));
  };

  const PremiumLock = ({ text }) => (
      <div className="bg-slate-900/50 border border-yellow-500/20 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 opacity-80">
          <Lock className="text-yellow-500 mb-2" size={32} />
          <h3 className="text-white font-bold">Funcionalidade Premium</h3>
          <p className="text-slate-400 text-sm mb-4">{text}</p>
          <a href={`https://pay.kirvano.com/AQUI_VAI_SEU_LINK_KIRVANO?email=${perfil.contact?.email || ''}`} target="_blank" className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold py-2 px-4 rounded transition">LIBERAR AGORA</a>
      </div>
  );

  if (loading) return <div className="text-white p-10 text-center">Carregando painel...</div>;
  const isPremium = perfil.plano === 'premium';

  // Cálculos de validação para renderização
  const totalGender = (parseInt(genderSplit.men) || 0) + (parseInt(genderSplit.women) || 0);
  const totalCityPercent = cityList.reduce((acc, curr) => acc + parseInt(curr.percent), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Painel do Atleta</h1>
                    {isPremium ? <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 font-bold uppercase">PREMIUM</span> : <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded font-bold uppercase">GRÁTIS</span>}
                </div>
            </div>
            <div className="flex gap-3">
                <Link href={`/${perfil.slug || perfil.id}`} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Eye size={20}/></Link>
                <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded"><LogOut size={20}/></button>
            </div>
        </div>

        {!isPremium && (
            <div className="mb-8 bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-xl border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">🚀 Libere seu Media Kit</h3>
                    <p className="text-blue-200 text-sm mt-1">Desbloqueie estatísticas do Instagram, alcance e demografia.</p>
                </div>
                <a href={`https://pay.kirvano.com/AQUI_VAI_SEU_LINK_KIRVANO?email=${perfil.contact?.email || ''}`} target="_blank" className="bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:scale-105 transition">Virar Premium</a>
            </div>
        )}

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
            {['geral', 'cartel', 'lutas', 'midia', 'metricas', 'contato'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition whitespace-nowrap ${activeTab === tab ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>{tab}</button>
            ))}
        </div>

        <div className="space-y-6">
            
            {/* 1. GERAL (MANTIDO) */}
            {activeTab === 'geral' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Informações Básicas</h3>
                    {/* FOTO DE PERFIL */}
                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-slate-700 border-dashed">
                        <div onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="relative w-32 h-32 mb-4 group cursor-pointer">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-700 group-hover:border-yellow-500 transition relative">
                                {perfil.foto_url ? <img src={perfil.foto_url} alt="Perfil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500"><Camera size={32} /></div>}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"><Upload size={24} className="text-white" /></div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                             <button onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="text-yellow-500 hover:underline">Alterar foto</button>
                             {perfil.foto_url && <button onClick={handleDeleteProfilePic} className="text-red-500 hover:underline">Remover</button>}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-500">Nome</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Apelido</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-500 flex items-center gap-1">Link Personalizado {isPremium && <span className="text-green-500 text-[10px] ml-1 flex items-center gap-0.5"><Check size={10}/> Disponível</span>}</label>
                            <div className={`flex items-center border p-2 rounded ${isPremium ? 'bg-black border-slate-700' : 'bg-slate-800/50 border-slate-800 opacity-60'}`}>
                                <LinkIcon size={16} className="text-slate-500 mr-2"/>
                                <span className="text-slate-500 text-sm mr-1 hidden sm:inline">nocautepages.com/</span>
                                <input className="bg-transparent text-white w-full outline-none font-bold placeholder-slate-600" name="slug" value={perfil.slug} onChange={handleSlugChange} placeholder="seu-nome" disabled={!isPremium} />
                                {!isPremium && <Lock size={16} className="text-yellow-500 ml-2" />}
                            </div>
                        </div>
                        <div><label className="text-xs text-slate-500">Categoria</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="categoria" value={perfil.categoria} onChange={handleChange} /></div>
                        <div>
                            <label className="text-xs text-slate-500">Estilo de Luta</label>
                            <select className="w-full bg-black border border-slate-700 p-2 rounded text-white outline-none" name="fightingStyle" value={perfil.fightingStyle} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                {ESTILOS_LUTA.map(estilo => <option key={estilo} value={estilo}>{estilo}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-500">Bio</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={3} name="about" value={perfil.about} onChange={handleChange} /></div>
                    </div>
                </div>
            )}

            {/* 2. CARTEL e 3. LUTAS e 4. MIDIA (MANTIDOS - OCULTADOS PARA BREVIDADE NA RESPOSTA, MAS DEVEM ESTAR NO CÓDIGO FINAL COMO ANTES) */}
            {activeTab === 'cartel' && (
                <div className="space-y-6">
                    {/* ... (Mesmo código de antes) ... */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm">Cartel</h3>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            <div><label className="text-xs">V</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.wins} onChange={e => handleNested('record', 'wins', e.target.value)} /></div>
                            <div><label className="text-xs">D</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.losses} onChange={e => handleNested('record', 'losses', e.target.value)} /></div>
                            <div><label className="text-xs">E</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.draws} onChange={e => handleNested('record', 'draws', e.target.value)} /></div>
                            <div><label className="text-xs">KO</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.knockouts} onChange={e => handleNested('record', 'knockouts', e.target.value)} /></div>
                            <div><label className="text-xs">Sub</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.submissions} onChange={e => handleNested('record', 'submissions', e.target.value)} /></div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm">Físico</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="text-xs text-slate-500">Altura</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="height" value={perfil.stats.height} onFocus={e => handleFocusMedida(e, 'm')} onBlur={e => handleBlurMedida(e, 'm')} onChange={e => handleNested('stats', 'height', e.target.value)} placeholder="1.80m" /></div>
                            <div><label className="text-xs text-slate-500">Peso</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="weight" value={perfil.stats.weight} onFocus={e => handleFocusMedida(e, 'kg')} onBlur={e => handleBlurMedida(e, 'kg')} onChange={e => handleNested('stats', 'weight', e.target.value)} placeholder="70kg" /></div>
                            <div><label className="text-xs text-slate-500">Alcance</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="reach" value={perfil.stats.reach} onFocus={e => handleFocusMedida(e, 'm')} onBlur={e => handleBlurMedida(e, 'm')} onChange={e => handleNested('stats', 'reach', e.target.value)} placeholder="1.90m" /></div>
                            <div><label className="text-xs text-slate-500">Nascimento</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.stats.age} maxLength={10} onChange={e => handleNested('stats', 'age', mascaraData(e.target.value))} placeholder="DD/MM/AAAA" /></div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'lutas' && (
                <div className="space-y-6">
                    {/* ... (Mesmo código de antes) ... */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-red-500 font-bold mb-4 uppercase text-sm">Próxima Luta</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div><label className="text-xs text-slate-500">Data</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.date} maxLength={10} onChange={e => handleNested('nextFight', 'date', mascaraData(e.target.value))} /></div>
                            <div><label className="text-xs text-slate-500">Evento</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.event} onChange={e => handleNested('nextFight', 'event', e.target.value)} /></div>
                            <div><label className="text-xs text-slate-500">Oponente</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.opponent} onChange={e => handleNested('nextFight', 'opponent', e.target.value)} /></div>
                            <div><label className="text-xs text-slate-500">Local</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.location} onChange={e => handleNested('nextFight', 'location', e.target.value)} /></div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Histórico de Lutas</h3>{isPremium && <button onClick={() => addItem('historico', {result: 'W', event: '', date: ''})} className="text-green-400 text-xs flex gap-1"><PlusCircle size={14}/> Nova</button>}</div>
                        {!isPremium && perfil.historico.length === 0 ? <PremiumLock text="Tenha seu histórico de lutas completo." /> : perfil.historico.map((luta, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center bg-black/40 p-2 rounded border border-slate-800">
                                <div className="col-span-2"><select disabled={!isPremium} className="w-full bg-slate-800 text-white rounded p-1" value={luta.result} onChange={e => handleArrayChange('historico', i, 'result', e.target.value)}><option value="W">V</option><option value="L">D</option><option value="D">E</option></select></div>
                                <div className="col-span-5"><input disabled={!isPremium} className="w-full bg-transparent p-1 text-white text-sm" placeholder="Evento" value={luta.event} onChange={e => handleArrayChange('historico', i, 'event', e.target.value)} /></div>
                                <div className="col-span-4"><input disabled={!isPremium} className="w-full bg-transparent p-1 text-white text-sm" placeholder="Data" value={luta.date} onChange={e => handleArrayChange('historico', i, 'date', mascaraData(e.target.value))} /></div>
                                <div className="col-span-1">{isPremium && <button onClick={() => removeItem('historico', i)} className="text-red-500"><Trash2 size={16}/></button>}</div>
                            </div>
                        ))}
                    </div>
                     <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Títulos e Prêmios</h3>{isPremium && <button onClick={() => setPerfil({...perfil, premios: [...perfil.premios, ""]})} className="text-green-400 text-xs flex items-center gap-1"><PlusCircle size={14}/> Add</button>}</div>
                         {!isPremium && perfil.premios.length === 0 ? <PremiumLock text="Exiba suas conquistas e cinturões." /> : perfil.premios.map((p, i) => (
                            <div key={i} className="flex gap-2 mb-2"><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={p} onChange={e => handleAwardChange(i, e.target.value)} />{isPremium && <button onClick={() => {const n=[...perfil.premios];n.splice(i,1);setPerfil({...perfil,premios:n})}} className="text-red-500"><Trash2 size={18}/></button>}</div>
                         ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'midia' && (
                <div className="space-y-6">
                    {/* ... (Mesmo código de antes) ... */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Vídeos</h3>{isPremium || perfil.video_lista.length < 1 ? <button onClick={() => addItem('video_lista', {title: '', thumb: '', embedUrl: ''})} className="text-green-400 text-xs flex gap-1"><PlusCircle size={14}/> Add Vídeo</button> : <span className="text-xs text-yellow-500 flex items-center gap-1 border border-yellow-500/30 px-2 rounded"><Lock size={12}/> Limite Grátis Atingido</span>}</div>
                         {perfil.video_lista.map((v, i) => (
                            <div key={i} className="bg-black/40 p-3 rounded mb-2 border border-slate-800">
                                <div className="grid md:grid-cols-2 gap-2 mb-2"><input className="bg-transparent border-b border-slate-700 w-full" placeholder="Título" value={v.title} onChange={e => handleArrayChange('video_lista', i, 'title', e.target.value)} /><input className="bg-transparent border-b border-slate-700 w-full" placeholder="Link do YouTube (Embed)" value={v.embedUrl} onChange={e => handleArrayChange('video_lista', i, 'embedUrl', e.target.value)} /></div>
                                <div className="flex justify-between items-center gap-2">
                                    <input className="bg-transparent text-xs w-full" placeholder="Capa (Thumb URL) - Use o botão ao lado ->" value={v.thumb} onChange={e => handleArrayChange('video_lista', i, 'thumb', e.target.value)} />
                                    <button onClick={() => openWidget((url) => handleArrayChange('video_lista', i, 'thumb', url))} className="bg-slate-700 p-1 rounded text-white hover:bg-slate-600" title="Upload Capa"><Upload size={14}/></button>
                                    <button onClick={() => handleDeleteImage('video_lista', i, v.thumb)} className="text-red-500 text-xs"><Trash2 size={14}/></button>
                                </div>
                            </div>
                         ))}
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4">
                             <h3 className="text-cyan-400 font-bold uppercase text-sm">Galeria</h3>
                             {isPremium || perfil.galeria.length < 1 ? (
                                <button onClick={() => openWidget((url) => addItem('galeria', {thumb: url, full: url}), false)} className="text-green-400 text-xs flex gap-1 border border-green-500/30 px-2 py-1 rounded hover:bg-green-500/10"><ImageIcon size={14}/> Add Foto (Upload)</button>
                             ) : (
                                <span className="text-xs text-yellow-500 flex items-center gap-1 border border-yellow-500/30 px-2 rounded"><Lock size={12}/> Limite Grátis Atingido</span>
                             )}
                         </div>
                         {perfil.galeria.map((g, i) => (
                            <div key={i} className="flex gap-2 mb-2 items-center">
                                <div className="w-10 h-10 bg-black"><img src={g.thumb} className="w-full h-full object-cover"/></div>
                                <div className="flex-1 grid gap-1"><input className="bg-black border border-slate-700 p-1 text-xs" placeholder="Full URL" value={g.full} onChange={e => handleArrayChange('galeria', i, 'full', e.target.value)} /><input className="bg-black border border-slate-700 p-1 text-xs" placeholder="Thumb URL" value={g.thumb} onChange={e => handleArrayChange('galeria', i, 'thumb', e.target.value)} /></div>
                                <button onClick={() => handleDeleteImage('galeria', i, g.full)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                         ))}
                    </div>
                </div>
            )}

            {/* 5. MÉTRICAS (PADRONIZADO) */}
            {activeTab === 'metricas' && (
                <div className="space-y-6">
                    {/* PERFORMANCE */}
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="text-pink-500 font-bold uppercase text-sm flex items-center gap-2"><BarChart3 size={18}/> Performance Instagram</h3>
                            {!isPremium && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> PREMIUM</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Alcance (Contas)</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isPremium} 
                                        className="w-full bg-black border border-slate-700 p-3 rounded text-white font-mono" 
                                        placeholder="Ex: 15.400" 
                                        value={perfil.socials?.instagram?.stats?.reach || ''} 
                                        onChange={(e) => handleInstaStats('stats', 'reach', formatNumber(e.target.value))} 
                                    />
                                    {!isPremium && <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"/>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Impressões</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isPremium} 
                                        className="w-full bg-black border border-slate-700 p-3 rounded text-white font-mono" 
                                        placeholder="Ex: 50.000" 
                                        value={perfil.socials?.instagram?.stats?.impressions || ''} 
                                        onChange={(e) => handleInstaStats('stats', 'impressions', formatNumber(e.target.value))} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Engajamento (%)</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isPremium} 
                                        className="w-full bg-black border border-slate-700 p-3 rounded text-white font-mono" 
                                        placeholder="Ex: 8.5%" 
                                        value={perfil.socials?.instagram?.stats?.engagement || ''} 
                                        onChange={(e) => handleInstaStats('stats', 'engagement', e.target.value.replace(/[^0-9.,%]/g, ''))} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Compartilhamentos</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isPremium} 
                                        className="w-full bg-black border border-slate-700 p-3 rounded text-white font-mono" 
                                        placeholder="Ex: 1.200" 
                                        value={perfil.socials?.instagram?.stats?.shares || ''} 
                                        onChange={(e) => handleInstaStats('stats', 'shares', formatNumber(e.target.value))} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PÚBLICO E DEMOGRAFIA (PADRONIZADO) */}
                    <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2"><Users size={18}/> Público e Demografia</h3>
                        </div>

                        <div className="grid gap-6">
                            {/* FAIXA ETÁRIA */}
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Faixa Etária (Min - Máx)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" disabled={!isPremium} placeholder="25" className="w-full bg-black border border-slate-700 p-2 rounded text-center text-white" value={ageRange.min} onChange={e => setAgeRange({...ageRange, min: e.target.value})} />
                                    <span className="text-slate-500">-</span>
                                    <input type="number" disabled={!isPremium} placeholder="35" className="w-full bg-black border border-slate-700 p-2 rounded text-center text-white" value={ageRange.max} onChange={e => setAgeRange({...ageRange, max: e.target.value})} />
                                    <span className="text-slate-500 text-sm">anos</span>
                                </div>
                            </div>

                            {/* GÊNERO */}
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block flex justify-between">
                                    <span>Distribuição de Gênero (%)</span>
                                    {totalGender > 100 && <span className="text-red-500 text-[10px] flex items-center gap-1"><AlertCircle size={10}/> Soma ultrapassou 100%</span>}
                                </label>
                                <div className="flex gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="text-[10px] text-cyan-400 mb-1 uppercase text-center">Homens</div>
                                        <input type="number" disabled={!isPremium} placeholder="70" className="w-full bg-black border border-cyan-500/30 focus:border-cyan-500 p-2 rounded text-center text-white" value={genderSplit.men} onChange={e => setGenderSplit({...genderSplit, men: e.target.value})} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] text-pink-500 mb-1 uppercase text-center">Mulheres</div>
                                        <input type="number" disabled={!isPremium} placeholder="30" className="w-full bg-black border border-pink-500/30 focus:border-pink-500 p-2 rounded text-center text-white" value={genderSplit.women} onChange={e => setGenderSplit({...genderSplit, women: e.target.value})} />
                                    </div>
                                </div>
                                {/* Barra Visual */}
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                    <div style={{width: `${Math.min(genderSplit.men || 0, 100)}%`}} className="h-full bg-cyan-500 transition-all"></div>
                                    <div style={{width: `${Math.min(genderSplit.women || 0, 100)}%`}} className="h-full bg-pink-500 transition-all"></div>
                                </div>
                            </div>

                            {/* CIDADES PRINCIPAIS */}
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block flex justify-between">
                                    <span>Principais Cidades (Máx 5)</span>
                                    <span className={totalCityPercent > 100 ? 'text-red-500' : 'text-slate-500'}>Total: {totalCityPercent}%</span>
                                </label>
                                
                                <div className="flex gap-2 mb-3">
                                    <input disabled={!isPremium} placeholder="Nome da Cidade" className="flex-grow bg-black border border-slate-700 p-2 rounded text-white text-sm" value={cityInput.name} onChange={e => setCityInput({...cityInput, name: e.target.value})} />
                                    <input disabled={!isPremium} type="number" placeholder="%" className="w-16 bg-black border border-slate-700 p-2 rounded text-white text-center text-sm" value={cityInput.percent} onChange={e => setCityInput({...cityInput, percent: e.target.value})} />
                                    <button disabled={!isPremium} onClick={addCity} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-green-400"><PlusCircle size={20}/></button>
                                </div>

                                <div className="space-y-1">
                                    {cityList.map((city, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded text-sm border border-slate-800">
                                            <span>{city.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-cyan-400">{city.percent}%</span>
                                                <button onClick={() => removeCity(idx)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {cityList.length === 0 && <p className="text-xs text-slate-600 italic text-center py-2">Nenhuma cidade adicionada</p>}
                                </div>
                            </div>
                        </div>

                        {!isPremium && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <PremiumLock text="Libere métricas detalhadas para atrair patrocinadores." />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 6. CONTATO (MANTIDO) */}
            {activeTab === 'contato' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-4">
                    {/* ... Código de contato igual ao anterior ... */}
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Contato</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-500">Email</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.email} onChange={e => handleNested('contact', 'email', e.target.value)} /></div>
                        <div><label className="text-xs text-slate-500">Whatsapp</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.phone} onChange={e => handleNested('contact', 'phone', e.target.value)} /></div>
                        <div><label className="text-xs text-slate-500">Estado (UF)</label><select className="w-full bg-black border border-slate-700 p-2 rounded text-white outline-none" value={perfil.contact.state} onChange={e => handleNested('contact', 'state', e.target.value)}><option value="">Selecione...</option>{ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}</select></div>
                        <div><label className="text-xs text-slate-500">Academia</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.trainingCenter} onChange={e => handleNested('contact', 'trainingCenter', e.target.value)} /></div>
                    </div>
                    <div className="border-t border-slate-800 pt-6 mt-2">
                        <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Redes Sociais</h3>
                        <div className="mb-4"><label className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Instagram size={14}/> Instagram</label><div className="grid grid-cols-3 gap-2"><input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.instagram?.user} onChange={e => handleDeepNested('socials', 'instagram', 'user', e.target.value)} /><input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.instagram?.followers} onChange={e => handleDeepNested('socials', 'instagram', 'followers', e.target.value)} /><input placeholder="Link" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.instagram?.url} onChange={e => handleDeepNested('socials', 'instagram', 'url', e.target.value)} /></div></div>
                        <div className="space-y-4">
                            <div className={!isPremium ? 'opacity-40 grayscale pointer-events-none select-none relative' : ''}><label className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Youtube size={14}/> Youtube {!isPremium && <Lock size={12} className="text-yellow-500"/>}</label><div className="grid grid-cols-3 gap-2"><input placeholder="Canal" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.youtube?.user || ''} onChange={e => handleDeepNested('socials', 'youtube', 'user', e.target.value)} /><input placeholder="Inscritos" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.youtube?.followers || ''} onChange={e => handleDeepNested('socials', 'youtube', 'followers', e.target.value)} /><input placeholder="URL" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.youtube?.url || ''} onChange={e => handleDeepNested('socials', 'youtube', 'url', e.target.value)} /></div></div>
                            <div className={!isPremium ? 'opacity-40 grayscale pointer-events-none select-none relative' : ''}><label className="text-xs font-bold text-white mb-2 flex items-center gap-2"><TikTokIcon size={14}/> TikTok {!isPremium && <Lock size={12} className="text-yellow-500"/>}</label><div className="grid grid-cols-3 gap-2"><input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.tiktok?.user || ''} onChange={e => handleDeepNested('socials', 'tiktok', 'user', e.target.value)} /><input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.tiktok?.followers || ''} onChange={e => handleDeepNested('socials', 'tiktok', 'followers', e.target.value)} /><input placeholder="URL" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.tiktok?.url || ''} onChange={e => handleDeepNested('socials', 'tiktok', 'url', e.target.value)} /></div></div>
                            <div className={!isPremium ? 'opacity-40 grayscale pointer-events-none select-none relative' : ''}><label className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Twitter size={14}/> X (Twitter) {!isPremium && <Lock size={12} className="text-yellow-500"/>}</label><div className="grid grid-cols-3 gap-2"><input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.x?.user || ''} onChange={e => handleDeepNested('socials', 'x', 'user', e.target.value)} /><input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.x?.followers || ''} onChange={e => handleDeepNested('socials', 'x', 'followers', e.target.value)} /><input placeholder="URL" className="bg-black border border-slate-700 p-2 rounded text-white" value={perfil.socials?.x?.url || ''} onChange={e => handleDeepNested('socials', 'x', 'url', e.target.value)} /></div></div>
                        </div>
                    </div>
                </div>
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