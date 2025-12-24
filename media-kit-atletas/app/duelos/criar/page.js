'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Search, Swords } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function CriarDuelo() {
  const router = useRouter();
  const [atletas, setAtletas] = useState([]);
  const [busca, setBusca] = useState('');
  const [selecionado1, setSelecionado1] = useState(null);
  const [selecionado2, setSelecionado2] = useState(null);
  const [criando, setCriando] = useState(false);

  // Busca atletas conforme digita
  useEffect(() => {
    const buscar = async () => {
        if(busca.length < 3) return;
        const { data } = await supabase.from('atletas').select('id, nome, apelido, foto_url, categoria').ilike('nome', `%${busca}%`).limit(5);
        setAtletas(data || []);
    }
    const delayDebounceFn = setTimeout(() => { buscar() }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [busca]);

  const handleCriar = async () => {
    if(!selecionado1 || !selecionado2) return;
    setCriando(true);
    
    // Data de expiração: Hoje + 15 dias
    const expires = new Date();
    expires.setDate(expires.getDate() + 15);

    const { data, error } = await supabase.from('duelos').insert({
        atleta_1_id: selecionado1.id,
        atleta_2_id: selecionado2.id,
        expires_at: expires.toISOString()
    }).select().single();

    if(error) {
        alert("Erro ao criar");
        setCriando(false);
    } else {
        router.push(`/duelos/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 flex flex-col items-center">
        <h1 className="text-3xl font-black text-yellow-500 uppercase mb-8 mt-10 flex items-center gap-2">
            <Swords size={32}/> Criar Faceoff
        </h1>

        <div className="flex flex-col md:flex-row gap-8 items-center w-full max-w-4xl">
            {/* CARD SELEÇÃO 1 */}
            <div className={`flex-1 w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[300px] ${selecionado1 ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                {selecionado1 ? (
                    <>
                        <img src={selecionado1.foto_url} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-500"/>
                        <h3 className="font-bold text-xl">{selecionado1.apelido || selecionado1.nome}</h3>
                        <button onClick={() => setSelecionado1(null)} className="text-xs text-red-400 mt-2 underline">Alterar</button>
                    </>
                ) : (
                    <span className="text-slate-500 font-bold">Selecionar Lutador 1</span>
                )}
            </div>

            <div className="text-2xl font-black text-yellow-500">VS</div>

            {/* CARD SELEÇÃO 2 */}
            <div className={`flex-1 w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[300px] ${selecionado2 ? 'border-red-500 bg-red-900/20' : 'border-slate-700'}`}>
                 {selecionado2 ? (
                    <>
                        <img src={selecionado2.foto_url} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-red-500"/>
                        <h3 className="font-bold text-xl">{selecionado2.apelido || selecionado2.nome}</h3>
                        <button onClick={() => setSelecionado2(null)} className="text-xs text-red-400 mt-2 underline">Alterar</button>
                    </>
                ) : (
                    <span className="text-slate-500 font-bold">Selecionar Lutador 2</span>
                )}
            </div>
        </div>

        {/* BUSCA */}
        <div className="w-full max-w-md mt-8 relative">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-full px-4 py-3">
                <Search className="text-slate-500 mr-2"/>
                <input 
                    className="bg-transparent outline-none w-full text-white placeholder-slate-500"
                    placeholder="Buscar atleta por nome..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>
            {atletas.length > 0 && (
                <div className="absolute top-14 left-0 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-xl">
                    {atletas.map(atleta => (
                        <div key={atleta.id} className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3" onClick={() => {
                            if(!selecionado1) setSelecionado1(atleta);
                            else if(!selecionado2) setSelecionado2(atleta);
                            setBusca('');
                            setAtletas([]);
                        }}>
                            <img src={atleta.foto_url} className="w-8 h-8 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-sm">{atleta.nome}</p>
                                <p className="text-xs text-slate-500">{atleta.categoria}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <button 
            disabled={!selecionado1 || !selecionado2 || criando}
            onClick={handleCriar}
            className="mt-8 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-12 rounded-full text-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
        >
            {criando ? 'CRIANDO...' : 'GERAR DUELO OFICIAL'}
        </button>
    </div>
  )
}