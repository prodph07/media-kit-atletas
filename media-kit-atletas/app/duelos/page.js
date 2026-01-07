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
        <div className="min-h-screen bg-[#0a0a0c] text-white p-4">
            <div className="max-w-6xl mx-auto">
                
                {/* HEADER RESPONSIVO */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-6 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase flex justify-center md:justify-start items-center gap-2">
                            <span className="text-red-600">ARENA</span> DE DUELOS
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base">Vote nos combates ativos da semana.</p>
                    </div>
                    
                    {/* BOTÃO ATUALIZADO:
                        - !bg-yellow-600 (Dourado mais escuro para contraste)
                        - !text-white (Texto Branco)
                        - Ícone Branco
                    */}
                    <Link 
                        href="/duelos/criar" 
                        className="relative z-10 w-full md:w-auto !bg-yellow-600 hover:!bg-yellow-500 !text-white font-black uppercase tracking-wide px-8 py-3 rounded-full flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-[0_0_20px_rgba(202,138,4,0.4)] border border-yellow-500"
                    >
                        <Swords size={20} className="text-white"/> 
                        <span className="text-white">CRIAR NOVO</span>
                    </Link>
                </div>

                {/* LISTA COM FILTROS (Componente Client-Side) */}
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