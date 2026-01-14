export const runtime = 'edge'; // Necessário para Cloudflare Pages

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Swords } from 'lucide-react';
import ArenaList from '@/components/ArenaList'; // Importando o componente de filtro

export const revalidate = 60; // Revalidar a cada 60s

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function ListaDuelos() {
    // Busca apenas duelos ATIVOS e não expirados
    const { data: duelos } = await supabase
        .from('duelos')
        .select(`
            id, expires_at, votos_1, votos_2,
            p1:atletas!atleta_1_id(nome, apelido, foto_url, categoria),
            p2:atletas!atleta_2_id(nome, apelido, foto_url, categoria)
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER RESPONSIVO */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 mt-4 gap-6 border-b border-[#222] pb-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-xs mb-2 justify-center md:justify-start">
                            <Swords className="w-4 h-4" /> FightNexus Arena
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                            Arena de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Duelos</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-lg max-w-xl font-light">
                            Participe da comunidade votando nos combates mais aguardados da semana ou crie seu próprio desafio.
                        </p>
                    </div>

                    <Link
                        href="/duelos/criar"
                        className="group relative z-10 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wide px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-1"
                    >
                        <Swords size={20} className="text-white group-hover:rotate-12 transition-transform" />
                        <span>DESAFIAR ALGUÉM</span>
                    </Link>
                </div>

                {/* LISTA COM FILTROS (Componente Client-Side) */}
                <ArenaList initialDuelos={duelos || []} />

                {/* EMPTY STATE (Caso não tenha nada no banco) */}
                {(!duelos || duelos.length === 0) && (
                    <div className="text-center py-20 text-gray-500">
                        <Swords size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold mb-2">A Arena está vazia.</p>
                        <p className="text-sm">Seja o primeiro a inaugurar o octógono esta semana.</p>
                        <Link href="/duelos/criar" className="text-red-500 font-bold hover:underline mt-4 inline-block">Criar Duelo Agora &rarr;</Link>
                    </div>
                )}
            </div>
        </div>
    )
}