export const runtime = 'edge'; // <--- ADICIONE ISSO NA LINHA 1

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Swords } from 'lucide-react';
import VotacaoWrapper from '@/components/VotacaoWrapper';
import CopyButton from '@/components/CopyButton';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function DueloPage({ params }) {
    const { id } = await params;

    // 1. Buscar dados do duelo
    const { data: duelo, error } = await supabase.from('duelos').select('*').eq('id', id).single();

    if (!duelo || error) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-10 text-center gap-4">
                <h1 className="text-3xl font-bold text-red-500">Duelo Inválido 🥊</h1>
                <Link href="/duelos" className="bg-slate-800 px-6 py-2 rounded-full">Voltar para Arena</Link>
            </div>
        );
    }

    // 2. Buscar dados dos Atletas
    const { data: rawP1 } = await supabase.from('atletas').select('*').eq('id', duelo.atleta_1_id).single();
    const { data: rawP2 } = await supabase.from('atletas').select('*').eq('id', duelo.atleta_2_id).single();

    if (!rawP1 || !rawP2) return <div className="text-white text-center p-10">Erro ao carregar dados dos atletas.</div>;

    // Mapeamento de dados (Normalização)
    const normalizarAtleta = (atleta) => ({
        ...atleta,
        stats: atleta.atributos || {},
        record: atleta.cartel || {},
        socials: atleta.redes_sociais || {},
        apelido: atleta.apelido || atleta.nome.split(' ')[0]
    });

    const p1 = normalizarAtleta(rawP1);
    const p2 = normalizarAtleta(rawP2);

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white pb-20 font-sans">
            {/* Header */}
            <nav className="p-4 flex justify-between items-center bg-[#0c0c0c]/80 border-b border-[#222] backdrop-blur-md sticky top-0 z-50">
                <Link href="/duelos" className="text-xs md:text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                    ← VOLTAR PARA ARENA
                </Link>
                <div className="flex items-center gap-2 text-red-600 font-black italic tracking-tighter uppercase">
                    <Swords className="w-4 h-4" /> DUELO OFICIAL
                </div>
            </nav>

            {/* Aviso se pendente */}
            {duelo.status === 'pending' && (
                <div className="bg-yellow-900/10 border-b border-yellow-600/20 p-4 text-center animate-pulse">
                    <p className="text-yellow-500 font-bold uppercase text-sm">
                        ⚠️ Aguardando Confirmação
                    </p>
                    <p className="text-xs text-yellow-500/70 mt-1">Este duelo ainda não está público na arena.</p>
                </div>
            )}

            <div className="p-4 mt-8 md:mt-12 max-w-5xl mx-auto">
                {/* Wrapper de Votação (Lógica de voto + Modal Convite) */}
                <VotacaoWrapper
                    dueloId={id}
                    p1={p1}
                    p2={p2}
                    initialVotes1={duelo.votos_1}
                    initialVotes2={duelo.votos_2}
                />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col items-center mt-12 px-4 gap-6">

                {/* BOTÃO COPIAR LINK */}
                <div className="hover:scale-105 transition-transform duration-300">
                    <CopyButton />
                </div>

                <div className="text-center">
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-3 font-bold">
                        Válido até {new Date(duelo.expires_at).toLocaleDateString()}
                    </p>
                    <Link href="/duelos/criar" className="text-sm text-red-600 hover:text-red-500 transition-colors font-bold uppercase tracking-wide border-b border-red-600/30 hover:border-red-600 pb-0.5">
                        Criar meu próprio duelo
                    </Link>
                </div>
            </div>
        </div>
    )
}