'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, PlusCircle, Save, LogOut, Eye } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Painel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');

  // --- ESTADO INICIAL ---
  const [perfil, setPerfil] = useState({
    nome: '', apelido: '', categoria: '', foto_url: '', about: '', fightingStyle: '',
    stats: { height: '', weight: '', reach: '', age: '' },
    record: { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
    contact: { email: '', phone: '', city: '', trainingCenter: '' },
    nextFight: { date: '', event: '', opponent: '', location: '' }, // No estado chamo de nextFight, mas no banco será prox_luta
    socials: { instagram: { user: '', followers: '', url: '', active: true }, youtube: { user: '', followers: '', url: '', active: false } },
    historico: [],
    video_lista: [],
    galeria: [],
    premios: []
  });

  // --- MÁSCARAS ---
  const mascaraData = (valor) => {
    return valor
      .replace(/\D/g, '') 
      .replace(/(\d{2})(\d)/, '$1/$2') 
      .replace(/(\d{2})(\d)/, '$1/$2') 
      .replace(/(\d{4})\d+?$/, '$1'); 
  };

  const handleFocusMedida = (e, unidade) => {
    const valorLimpo = e.target.value.replace(unidade, '').trim();
    setPerfil(prev => ({
        ...prev,
        stats: { ...prev.stats, [e.target.name]: valorLimpo }
    }));
  };

  const handleBlurMedida = (e, unidade) => {
    let valor = e.target.value;
    if (valor && !valor.includes(unidade)) {
      setPerfil(prev => ({
          ...prev,
          stats: { ...prev.stats, [e.target.name]: `${valor}${unidade}` }
      }));
    }
  };

  // --- CARREGAR DADOS ---
  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('atletas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPerfil({
            ...data,
            stats: data.atributos || { height: '', weight: '', reach: '', age: '' },
            record: data.cartel || { wins: 0, losses: 0, draws: 0 },
            contact: data.contato || { email: '', phone: '', city: '' },
            // AQUI MUDOU: Agora busca de 'prox_luta'
            nextFight: data.prox_luta || { date: '', event: '', opponent: '' }, 
            socials: data.redes_sociais || { instagram: { active: true } },
            historico: data.historico || [],
            video_lista: data.video_lista || [],
            galeria: data.galeria || [],
            premios: data.premios || []
        });
      }
      setLoading(false);
    }
    getData();
  }, []);

  // --- SALVAR DADOS ---
  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
        nome: perfil.nome,
        apelido: perfil.apelido,
        categoria: perfil.categoria,
        foto_url: perfil.foto_url,
        sobre: perfil.about,
        estilodeluta: perfil.fightingStyle,
        atributos: perfil.stats,
        cartel: perfil.record,
        contato: perfil.contact,
        
        // AQUI MUDOU: Salva na coluna 'prox_luta'
        prox_luta: perfil.nextFight, 
        
        redes_sociais: perfil.socials,
        historico: perfil.historico,
        video_lista: perfil.video_lista,
        galeria: perfil.galeria,
        premios: perfil.premios
    };

    const { error } = await supabase.from('atletas').update(payload).eq('user_id', user.id);
    if (error) alert("Erro: " + error.message);
    else alert("Salvo com sucesso!");
    setSaving(false);
  }

  // --- HELPERS ---
  const handleChange = (e) => setPerfil({...perfil, [e.target.name]: e.target.value});
  
  const handleNested = (parent, field, value) => {
    setPerfil(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const handleDeepNested = (parent, key, field, value) => {
    setPerfil(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: { ...prev[parent][key], [field]: value } } }));
  };

  const handleArrayChange = (arr, idx, field, val) => {
    const n = [...perfil[arr]]; n[idx][field] = val; setPerfil({...perfil, [arr]: n});
  };
  const addItem = (arr, item) => setPerfil({...perfil, [arr]: [...perfil[arr], item]});
  const removeItem = (arr, idx) => {
    const n = [...perfil[arr]]; n.splice(idx, 1); setPerfil({...perfil, [arr]: n});
  };
  const handleAwardChange = (idx, val) => {
    const n = [...perfil.premios]; n[idx] = val; setPerfil({...perfil, premios: n});
  };

  if (loading) return <div className="text-white p-10 text-center">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 pb-32 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
                <h1 className="text-2xl font-bold">Painel do Atleta</h1>
                <p className="text-slate-400 text-sm">Edite seu Mídia Kit</p>
            </div>
            <div className="flex gap-3">
                <Link href={`/${perfil.slug || perfil.id}`} target="_blank" className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Eye size={20}/></Link>
                <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="p-2 bg-red-900/50 text-red-400 rounded"><LogOut size={20}/></button>
            </div>
        </div>

        {/* ABAS */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
            {['geral', 'cartel', 'lutas', 'midia', 'contato'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition ${activeTab === tab ? 'bg-cyan-600' : 'bg-slate-800 text-slate-400'}`}>{tab}</button>
            ))}
        </div>

        <div className="space-y-6">
            
            {/* 1. GERAL */}
            {activeTab === 'geral' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-4">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Informações Básicas</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-500">Nome</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Apelido</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Categoria</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="categoria" value={perfil.categoria} onChange={handleChange} /></div>
                        <div><label className="text-xs text-slate-500">Estilo de Luta</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="fightingStyle" value={perfil.fightingStyle} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-500">Foto URL</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="foto_url" value={perfil.foto_url} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-500">Bio</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={3} name="about" value={perfil.about} onChange={handleChange} /></div>
                    </div>
                </div>
            )}

            {/* 2. CARTEL & MEDIDAS */}
            {activeTab === 'cartel' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm">Cartel</h3>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            <div><label className="text-xs">V</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.wins} onChange={e => handleNested('record', 'wins', e.target.value)} /></div>
                            <div><label className="text-xs">D</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.losses} onChange={e => handleNested('record', 'losses', e.target.value)} /></div>
                            <div><label className="text-xs">E</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.draws} onChange={e => handleNested('record', 'draws', e.target.value)} /></div>
                            <div><label className="text-xs">KO</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.knockouts} onChange={e => handleNested('record', 'knockouts', e.target.value)} /></div>
                            <div><label className="text-xs">SUB</label><input type="number" className="w-full bg-black border border-slate-700 p-2 rounded text-white text-center" value={perfil.record.submissions} onChange={e => handleNested('record', 'submissions', e.target.value)} /></div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm">Físico</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-slate-500">Altura</label>
                                <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="height" value={perfil.stats.height} onFocus={e => handleFocusMedida(e, 'm')} onBlur={e => handleBlurMedida(e, 'm')} onChange={e => handleNested('stats', 'height', e.target.value)} placeholder="1.80m" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Peso</label>
                                <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="weight" value={perfil.stats.weight} onFocus={e => handleFocusMedida(e, 'kg')} onBlur={e => handleBlurMedida(e, 'kg')} onChange={e => handleNested('stats', 'weight', e.target.value)} placeholder="70kg" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Envergadura</label>
                                <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="reach" value={perfil.stats.reach} onFocus={e => handleFocusMedida(e, 'm')} onBlur={e => handleBlurMedida(e, 'm')} onChange={e => handleNested('stats', 'reach', e.target.value)} placeholder="1.90m" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Nascimento</label>
                                <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.stats.age} maxLength={10} onChange={e => handleNested('stats', 'age', mascaraData(e.target.value))} placeholder="DD/MM/AAAA" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Títulos</h3><button onClick={() => setPerfil({...perfil, premios: [...perfil.premios, ""]})} className="text-green-400 text-xs flex items-center gap-1"><PlusCircle size={14}/> Add</button></div>
                         {perfil.premios.map((p, i) => (
                            <div key={i} className="flex gap-2 mb-2"><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={p} onChange={e => handleAwardChange(i, e.target.value)} /><button onClick={() => {const n=[...perfil.premios];n.splice(i,1);setPerfil({...perfil,premios:n})}} className="text-red-500"><Trash2 size={18}/></button></div>
                         ))}
                    </div>
                </div>
            )}

            {/* 3. LUTAS */}
            {activeTab === 'lutas' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-red-500 font-bold mb-4 uppercase text-sm">Próxima Luta (prox_luta)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500">Data</label>
                                <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.date} maxLength={10} onChange={e => handleNested('nextFight', 'date', mascaraData(e.target.value))} placeholder="DD/MM/AAAA" />
                            </div>
                            <div><label className="text-xs text-slate-500">Evento</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.event} onChange={e => handleNested('nextFight', 'event', e.target.value)} /></div>
                            <div><label className="text-xs text-slate-500">Oponente</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.opponent} onChange={e => handleNested('nextFight', 'opponent', e.target.value)} /></div>
                            <div><label className="text-xs text-slate-500">Local</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.nextFight.location} onChange={e => handleNested('nextFight', 'location', e.target.value)} /></div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Histórico</h3><button onClick={() => addItem('historico', {result: 'W', event: '', date: ''})} className="text-green-400 text-xs flex gap-1"><PlusCircle size={14}/> Nova</button></div>
                        {perfil.historico.map((luta, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center bg-black/40 p-2 rounded border border-slate-800">
                                <div className="col-span-2"><select className="w-full bg-slate-800 text-white rounded p-1" value={luta.result} onChange={e => handleArrayChange('historico', i, 'result', e.target.value)}><option value="W">V</option><option value="L">D</option><option value="D">E</option></select></div>
                                <div className="col-span-5"><input className="w-full bg-transparent p-1 text-white text-sm" placeholder="Evento" value={luta.event} onChange={e => handleArrayChange('historico', i, 'event', e.target.value)} /></div>
                                {/* AQUI ESTÁ A CORREÇÃO: INPUT DE DATA DO HISTÓRICO COM MÁSCARA */}
                                <div className="col-span-4">
                                    <input 
                                        className="w-full bg-transparent p-1 text-white text-sm" 
                                        placeholder="DD/MM/AAAA" 
                                        value={luta.date} 
                                        maxLength={10}
                                        onChange={e => handleArrayChange('historico', i, 'date', mascaraData(e.target.value))} 
                                    />
                                </div>
                                <div className="col-span-1"><button onClick={() => removeItem('historico', i)} className="text-red-500"><Trash2 size={16}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. MÍDIA */}
            {activeTab === 'midia' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Vídeos</h3><button onClick={() => addItem('video_lista', {title: '', thumb: '', embedUrl: ''})} className="text-green-400 text-xs flex gap-1"><PlusCircle size={14}/> Add Vídeo</button></div>
                         {perfil.video_lista.map((v, i) => (
                            <div key={i} className="bg-black/40 p-3 rounded mb-2 border border-slate-800">
                                <div className="grid md:grid-cols-2 gap-2 mb-2">
                                    <input className="bg-transparent border-b border-slate-700 w-full" placeholder="Título" value={v.title} onChange={e => handleArrayChange('video_lista', i, 'title', e.target.value)} />
                                    <input className="bg-transparent border-b border-slate-700 w-full" placeholder="Embed URL" value={v.embedUrl} onChange={e => handleArrayChange('video_lista', i, 'embedUrl', e.target.value)} />
                                </div>
                                <div className="flex justify-between"><input className="bg-transparent text-xs w-2/3" placeholder="Thumb URL" value={v.thumb} onChange={e => handleArrayChange('video_lista', i, 'thumb', e.target.value)} /><button onClick={() => removeItem('video_lista', i)} className="text-red-500 text-xs"><Trash2 size={14}/></button></div>
                            </div>
                         ))}
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                         <div className="flex justify-between mb-4"><h3 className="text-cyan-400 font-bold uppercase text-sm">Galeria</h3><button onClick={() => addItem('galeria', {thumb: '', full: ''})} className="text-green-400 text-xs flex gap-1"><PlusCircle size={14}/> Add Foto</button></div>
                         {perfil.galeria.map((g, i) => (
                            <div key={i} className="flex gap-2 mb-2 items-center">
                                <div className="w-10 h-10 bg-black"><img src={g.thumb} className="w-full h-full object-cover"/></div>
                                <div className="flex-1 grid gap-1"><input className="bg-black border border-slate-700 p-1 text-xs" placeholder="Full URL" value={g.full} onChange={e => handleArrayChange('galeria', i, 'full', e.target.value)} /><input className="bg-black border border-slate-700 p-1 text-xs" placeholder="Thumb URL" value={g.thumb} onChange={e => handleArrayChange('galeria', i, 'thumb', e.target.value)} /></div>
                                <button onClick={() => removeItem('galeria', i)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                         ))}
                    </div>
                </div>
            )}

            {/* 5. CONTATO */}
            {activeTab === 'contato' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-4">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Contato & Social</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-500">Email</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.email} onChange={e => handleNested('contact', 'email', e.target.value)} /></div>
                        <div><label className="text-xs text-slate-500">Whatsapp</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.phone} onChange={e => handleNested('contact', 'phone', e.target.value)} /></div>
                        <div><label className="text-xs text-slate-500">Cidade</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.city} onChange={e => handleNested('contact', 'city', e.target.value)} /></div>
                        <div><label className="text-xs text-slate-500">Academia</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={perfil.contact.trainingCenter} onChange={e => handleNested('contact', 'trainingCenter', e.target.value)} /></div>
                    </div>
                    
                    <div className="border-t border-slate-800 pt-4 mt-2">
                        <label className="text-xs font-bold text-white block mb-2">Instagram</label>
                        <div className="grid grid-cols-3 gap-2">
                            <input placeholder="@user" className="bg-black border border-slate-700 p-2 rounded" value={perfil.socials?.instagram?.user} onChange={e => handleDeepNested('socials', 'instagram', 'user', e.target.value)} />
                            <input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded" value={perfil.socials?.instagram?.followers} onChange={e => handleDeepNested('socials', 'instagram', 'followers', e.target.value)} />
                            <input placeholder="URL" className="bg-black border border-slate-700 p-2 rounded" value={perfil.socials?.instagram?.url} onChange={e => handleDeepNested('socials', 'instagram', 'url', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* SALVAR BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                <Save size={24} /> {saving ? '...' : 'Salvar'}
            </button>
        </div>

      </div>
    </div>
  );
}