import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Clock, Swords } from 'lucide-react';

export const revalidate = 60; // Revalidar a cada 60s para atualizar expirados

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function ListaDuelos() {
    // Busca apenas duelos ATIVOS (status = active) e que não expiraram
    const { data: duelos } = await supabase
        .from('duelos')
        .select(`
            id, expires_at, votos_1, votos_2,
            p1:atletas!atleta_1_id(nome, apelido, foto_url),
            p2:atletas!atleta_2_id(nome, apelido, foto_url)
        `)
        .eq('status', 'active') // <--- FILTRO IMPORTANTE ADICIONADO
        .gt('expires_at', new Date().toISOString()) 
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10 mt-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase flex items-center gap-2">
                            <span className="text-red-600">ARENA</span> DE DUELOS
                        </h1>
                        <p className="text-slate-400">Vote nos combates ativos da semana.</p>
                    </div>
                    <Link href="/duelos/criar" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 transition">
                        <Swords size={20}/> CRIAR NOVO
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {duelos?.map(duelo => {
                         const total = duelo.votos_1 + duelo.votos_2;
                         return (
                            <Link href={`/duelos/${duelo.id}`} key={duelo.id} className="block group">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all relative">
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1 backdrop-blur-md">
                                        <Clock size={12}/> Expira em {new Date(duelo.expires_at).getDate()}/{new Date(duelo.expires_at).getMonth()+1}
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-6 pb-2">
                                        <img src={duelo.p1.foto_url} className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"/>
                                        <span className="text-2xl font-black text-slate-700 group-hover:text-yellow-500 italic">VS</span>
                                        <img src={duelo.p2.foto_url} className="w-16 h-16 rounded-full border-2 border-red-500 object-cover"/>
                                    </div>
                                    
                                    <div className="text-center px-4 pb-4">
                                        <div className="flex justify-between text-sm font-bold text-white mb-2">
                                            <span className="truncate w-1/2 text-left pr-2">{duelo.p1.apelido || duelo.p1.nome}</span>
                                            <span className="truncate w-1/2 text-right pl-2">{duelo.p2.apelido || duelo.p2.nome}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full flex overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{width: `${total ? (duelo.votos_1/total)*100 : 50}%`}}></div>
                                            <div className="h-full bg-red-500" style={{width: `${total ? (duelo.votos_2/total)*100 : 50}%`}}></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">{total} Votos computados</p>
                                    </div>
                                </div>
                            </Link>
                         )
                    })}
                </div>

                {(!duelos || duelos.length === 0) && (
                    <div className="text-center py-20 text-slate-500">
                        <Swords size={48} className="mx-auto mb-4 opacity-50"/>
                        <p>Nenhum duelo ativo no momento.</p>
                        <Link href="/duelos/criar" className="text-yellow-500 underline mt-2 inline-block">Crie o primeiro agora</Link>
                    </div>
                )}
            </div>
        </div>
    )
}