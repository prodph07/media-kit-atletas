'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Search, Swords, Lock, UserPlus, LogIn, User } from 'lucide-react';
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
            if (busca.length < 3) return;
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
        if (!selecionado1 || !selecionado2) return;
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

        if (error) {
            alert("Erro ao criar duelo: " + error.message);
            setCriando(false);
        } else {
            // Redireciona para o duelo criado (que vai mostrar aviso de pendente)
            router.push(`/duelos/${data.id}`);
        }
    };

    // --- RENDERIZAÇÃO CONDICIONAL ---

    if (checkingAuth) return <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

    // TELA DE BLOQUEIO PARA ANÔNIMOS
    if (isAnon) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
                {/* Background FX */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>

                <div className="max-w-md w-full bg-[#111] border border-[#222] p-10 rounded-3xl text-center relative z-10 shadow-2xl">
                    <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#333] shadow-inner">
                        <Lock size={32} className="text-red-600" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Acesso Restrito</h1>
                    <p className="text-gray-400 mb-10 leading-relaxed">
                        Apenas atletas cadastrados podem criar <strong className="text-white">Desafios Oficiais</strong> e gerar o Card de Batalha FightNexus.
                    </p>

                    <div className="space-y-4">
                        <Link href="/cadastro" className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg shadow-red-900/30">
                            <UserPlus size={20} /> CRIAR CONTA DE ATLETA
                        </Link>
                        <Link href="/login" className="block w-full bg-[#1a1a1a] hover:bg-[#222] text-white font-bold py-4 rounded-xl border border-[#333] hover:border-gray-500 transition flex items-center justify-center gap-3">
                            <LogIn size={20} /> JÁ TENHO CONTA
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#222]">
                        <div className="flex justify-center items-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold">
                            <Swords size={12} /> Junte-se a +15k Lutadores
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // TELA DE CRIAÇÃO (LOGADO)
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white p-4 flex flex-col items-center pb-20 font-sans">

            {/* Header Simples */}
            <div className="text-center mt-10 mb-12">
                <div className="inline-flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-xs mb-3 border border-red-900/30 bg-red-900/10 px-3 py-1 rounded-full">
                    <Swords size={12} /> FightNexus Matchmaker
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                    Configurar <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Faceoff</span>
                </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center w-full max-w-5xl">

                {/* CARD SELEÇÃO 1 (AUTO-SELECIONADO) */}
                <div className="flex-1 w-full p-8 border border-blue-900/30 bg-gradient-to-b from-blue-900/10 to-transparent rounded-3xl flex flex-col items-center justify-center min-h-[300px] relative transition-all hover:border-blue-800/50 group">
                    <div className="absolute top-4 right-4 bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-wider shadow-lg shadow-blue-900/40">Blue Corner</div>
                    {selecionado1 ? (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <img src={selecionado1.foto_url || "https://placehold.co/150"} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 border-4 border-blue-600 shadow-2xl shadow-blue-900/30" />
                            </div>
                            <h3 className="font-black text-2xl md:text-3xl text-center uppercase italic">{selecionado1.apelido || selecionado1.nome}</h3>
                            <p className="text-sm text-blue-400 uppercase font-bold mt-2 tracking-widest bg-blue-900/20 px-3 py-1 rounded border border-blue-900/30">{selecionado1.categoria}</p>
                        </>
                    ) : (
                        <span className="text-gray-500 animate-pulse">Carregando perfil...</span>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl font-black text-[#222] italic">VS</span>
                </div>

                {/* CARD SELEÇÃO 2 (ESCOLHA) */}
                <div className={`flex-1 w-full p-8 border rounded-3xl flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative group ${selecionado2 ? 'border-red-900/50 bg-gradient-to-b from-red-900/10 to-transparent' : 'border-dashed border-[#333] hover:border-gray-600 bg-[#111] hover:bg-[#161616]'}`}>
                    {selecionado2 && <div className="absolute top-4 right-4 bg-red-600 text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-wider shadow-lg shadow-red-900/40">Red Corner</div>}

                    {selecionado2 ? (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <img src={selecionado2.foto_url || "https://placehold.co/150"} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 border-4 border-red-600 shadow-2xl shadow-red-900/30" />
                            </div>
                            <h3 className="font-black text-2xl md:text-3xl text-center uppercase italic">{selecionado2.apelido || selecionado2.nome}</h3>
                            <p className="text-sm text-red-500 uppercase font-bold mt-2 tracking-widest bg-red-900/20 px-3 py-1 rounded border border-red-900/30">{selecionado2.categoria}</p>
                            <button onClick={() => setSelecionado2(null)} className="text-xs text-gray-500 mt-6 hover:text-white transition-colors border-b border-gray-700 hover:border-white pb-0.5">Trocar Oponente</button>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333] group-hover:scale-110 transition-transform duration-300">
                                <UserPlus size={32} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-gray-300 font-bold block mb-1 text-lg">Selecionar Oponente</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Busque pelo nome abaixo</span>
                        </div>
                    )}
                </div>
            </div>

            {/* BUSCA (Só aparece se não escolheu o oponente ainda) */}
            {!selecionado2 && (
                <div className="w-full max-w-lg mt-10 relative animate-fadeIn z-20">
                    <div className="flex items-center bg-[#111] border border-[#333] rounded-2xl px-5 py-4 focus-within:border-red-600 transition-colors shadow-2xl shadow-black/50">
                        <Search className="text-gray-500 mr-3" />
                        <input
                            className="bg-transparent outline-none w-full text-white placeholder-gray-600 text-lg"
                            placeholder="Digite o nome do adversário..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {atletas.length > 0 && (
                        <div className="absolute top-20 left-0 w-full bg-[#111] border border-[#333] rounded-2xl overflow-hidden z-50 shadow-2xl">
                            {atletas.map(atleta => (
                                <div key={atleta.id} className="p-4 hover:bg-[#1a1a1a] cursor-pointer flex items-center gap-4 border-b border-[#222] last:border-0 transition-colors" onClick={() => {
                                    setSelecionado2(atleta);
                                    setBusca('');
                                    setAtletas([]);
                                }}>
                                    <img src={atleta.foto_url || "https://placehold.co/50"} className="w-12 h-12 rounded-full object-cover border border-[#333]" />
                                    <div>
                                        <p className="font-bold text-white text-lg">{atleta.nome}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-[#222] px-2 py-0.5 rounded text-gray-400 uppercase font-bold">{atleta.categoria}</span>
                                            <span className="text-xs text-gray-500">{atleta.apelido}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-16 text-center">
                <button
                    disabled={!selecionado1 || !selecionado2 || criando}
                    onClick={handleCriar}
                    className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-16 rounded-2xl text-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-2xl shadow-red-900/30 flex items-center gap-3 mx-auto"
                >
                    {criando ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Swords size={24} />}
                    {criando ? 'GERANDO CARD...' : 'CRIAR DUELO AGORA'}
                </button>

                <p className="mt-6 text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                    Ao criar este duelo, uma notificação será enviada ao oponente. O card oficial só se tornará público na Arena após o aceite.
                </p>
            </div>
        </div>
    )
}