export const runtime = 'edge'; // Necessário para Cloudflare Pages

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Swords } from 'lucide-react';
import ArenaList from '@/components/ArenaList'; // Importando o componente de filtro

export const revalidate = 60; // Revalidar a cada 60s

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function ListaDuelos() {
    // Busca apenas duelos ATIVOS e não expirados
    // Adicionei 'categoria' no select para o filtro funcionar
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
        <div className="min-h-screen bg-[#0a0a0c] text-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
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

                {/* LISTA COM FILTROS (Componente Client-Side) */}
                {/* Passamos os dados carregados no servidor para o componente interativo */}
                <ArenaList initialDuelos={duelos || []} />

                {/* EMPTY STATE (Caso não tenha nada no banco) */}
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