'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Search, Swords, Lock, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function CriarDuelo() {
  const router = useRouter();
  const [atletas, setAtletas] = useState([]);
  const [busca, setBusca] = useState('');
  
  // Estados de Seleção
  const [selecionado1, setSelecionado1] = useState(null);
  const [selecionado2, setSelecionado2] = useState(null);
  const [criando, setCriando] = useState(false);
  
  // Estados de Auth
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAnon, setIsAnon] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // 1. Verifica Auth e Carrega o Próprio Perfil
  useEffect(() => {
    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            setIsAnon(true);
            setCheckingAuth(false);
            return;
        }

        // Se logado, busca o perfil de atleta dele
        const { data: profile } = await supabase
            .from('atletas')
            .select('id, nome, apelido, foto_url, categoria')
            .eq('user_id', session.user.id)
            .single();
        
        if (profile) {
            setUserProfile(profile);
            setSelecionado1(profile); // Auto-seleciona ele mesmo
        }
        
        setCheckingAuth(false);
    }
    checkUser();
  }, []);

  // 2. Busca de Oponentes (Lógica para slot 2)
  useEffect(() => {
    const buscar = async () => {
        if(busca.length < 3) return;
        const { data } = await supabase
            .from('atletas')
            .select('id, nome, apelido, foto_url, categoria')
            .ilike('nome', `%${busca}%`)
            .limit(5);
            
        // Filtra para não mostrar ele mesmo na busca
        const filtrados = data?.filter(a => a.id !== userProfile?.id) || [];
        setAtletas(filtrados);
    }
    const delayDebounceFn = setTimeout(() => { buscar() }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [busca, userProfile]);

  // 3. Função de Criar
  const handleCriar = async () => {
    if(!selecionado1 || !selecionado2) return;
    setCriando(true);
    
    // Expira em 15 dias
    const expires = new Date();
    expires.setDate(expires.getDate() + 15);

    const { data, error } = await supabase.from('duelos').insert({
        atleta_1_id: selecionado1.id,
        atleta_2_id: selecionado2.id,
        expires_at: expires.toISOString(),
        status: 'pending' // Cria como pendente (regra de notificação)
    }).select().single();

    if(error) {
        alert("Erro ao criar duelo: " + error.message);
        setCriando(false);
    } else {
        // Redireciona para o duelo criado (que vai mostrar aviso de pendente)
        router.push(`/duelos/${data.id}`);
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (checkingAuth) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Carregando Arena...</div>;

  // TELA DE BLOQUEIO PARA ANÔNIMOS
  if (isAnon) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]"></div>

            <div className="max-w-md w-full bg-[#121214] border border-slate-800 p-8 rounded-2xl text-center relative z-10 shadow-2xl">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <Lock size={40} className="text-yellow-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase mb-2">Acesso Restrito</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Apenas atletas cadastrados podem criar Desafios Oficiais e gerar o Card de Batalha.
                </p>

                <div className="space-y-4">
                    <Link href="/cadastro" className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2">
                        <UserPlus size={20}/> CRIAR CONTA DE ATLETA
                    </Link>
                    <Link href="/login" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
                        <LogIn size={20}/> JÁ TENHO CONTA
                    </Link>
                </div>
                <p className="mt-6 text-xs text-slate-600">Junte-se a milhares de lutadores.</p>
            </div>
        </div>
      );
  }

  // TELA DE CRIAÇÃO (LOGADO)
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 flex flex-col items-center pb-20">
        <h1 className="text-2xl md:text-3xl font-black text-yellow-500 uppercase mb-8 mt-10 flex items-center gap-2 text-center">
            <Swords size={32}/> Configurar Faceoff
        </h1>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center w-full max-w-4xl">
            
            {/* CARD SELEÇÃO 1 (AUTO-SELECIONADO) */}
            <div className="flex-1 w-full p-6 border-2 border-blue-500 bg-blue-900/10 rounded-xl flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] relative">
                <div className="absolute top-3 right-3 bg-blue-500 text-xs font-bold px-2 py-1 rounded text-white uppercase">Você</div>
                {selecionado1 ? (
                    <>
                        <img src={selecionado1.foto_url || "https://placehold.co/150"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-4 border-4 border-blue-500"/>
                        <h3 className="font-bold text-lg md:text-xl text-center">{selecionado1.apelido || selecionado1.nome}</h3>
                        <p className="text-xs text-blue-400 uppercase font-bold mt-1">{selecionado1.categoria}</p>
                    </>
                ) : (
                    <span className="text-slate-500">Carregando perfil...</span>
                )}
            </div>

            <div className="text-4xl font-black text-white/20 italic">VS</div>

            {/* CARD SELEÇÃO 2 (ESCOLHA) */}
            <div className={`flex-1 w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] transition-colors ${selecionado2 ? 'border-red-500 bg-red-900/10' : 'border-slate-700 hover:border-slate-500'}`}>
                 {selecionado2 ? (
                    <>
                        <img src={selecionado2.foto_url || "https://placehold.co/150"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-4 border-4 border-red-500"/>
                        <h3 className="font-bold text-lg md:text-xl text-center">{selecionado2.apelido || selecionado2.nome}</h3>
                        <p className="text-xs text-red-400 uppercase font-bold mt-1">{selecionado2.categoria}</p>
                        <button onClick={() => setSelecionado2(null)} className="text-xs text-slate-400 mt-4 underline hover:text-white">Trocar Oponente</button>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="text-slate-500"/>
                        </div>
                        <span className="text-slate-400 font-bold block mb-2">Selecionar Oponente</span>
                        <span className="text-xs text-slate-600">Busque abaixo</span>
                    </div>
                )}
            </div>
        </div>

        {/* BUSCA (Só aparece se não escolheu o oponente ainda) */}
        {!selecionado2 && (
            <div className="w-full max-w-md mt-8 relative animate-fadeIn">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-full px-4 py-3 focus-within:border-yellow-500 transition-colors shadow-lg">
                    <Search className="text-slate-500 mr-2"/>
                    <input 
                        className="bg-transparent outline-none w-full text-white placeholder-slate-500"
                        placeholder="Digite o nome do adversário..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        autoFocus
                    />
                </div>
                {atletas.length > 0 && (
                    <div className="absolute top-16 left-0 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-2xl">
                        {atletas.map(atleta => (
                            <div key={atleta.id} className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-800/50 last:border-0" onClick={() => {
                                setSelecionado2(atleta);
                                setBusca('');
                                setAtletas([]);
                            }}>
                                <img src={atleta.foto_url || "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-sm text-white">{atleta.nome}</p>
                                    <p className="text-xs text-slate-500">{atleta.categoria} • {atleta.apelido}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        <button 
            disabled={!selecionado1 || !selecionado2 || criando}
            onClick={handleCriar}
            className="mt-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-12 rounded-full text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 shadow-lg shadow-yellow-500/20"
        >
            {criando ? 'GERANDO CARD...' : 'CRIAR DUELO'}
        </button>

        <p className="mt-6 text-xs text-slate-600 max-w-sm text-center">
            Ao criar este duelo, uma notificação será enviada ao oponente. O card só se tornará público após o aceite.
        </p>
    </div>
  )
}