export const runtime = 'edge';

import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
import TemplateCyber from '../../components/TemplateCyber' 
import Link from 'next/link' 
import ViewTracker from '../../components/ViewTracker'

// Função para buscar dados
async function getAtleta(slug) {
  // 1. Tenta buscar pelo SLUG
  let { data: atleta, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  // 2. Fallback: Se não achou pelo slug e o parametro é um número, tenta pelo ID
  if (!atleta && !isNaN(slug)) {
    const { data: atletaPorId } = await supabase
       .from('atletas')
       .select('*')
       .eq('id', slug)
       .maybeSingle()
    
    if (atletaPorId) {
       atleta = atletaPorId
    }
  }

  return atleta
}

export default async function Page({ params }) {
  const { slug } = await params
  
  const atleta = await getAtleta(slug)

  if (!atleta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white gap-4 p-4 text-center">
        <h1 className="text-3xl font-bold text-yellow-500">Lutador não encontrado 😕</h1>
        <p className="text-slate-400">
          Não encontramos nenhum atleta com o link ou ID: <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">"{slug}"</span>
        </p>
        <Link href="/busca" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition">
             Voltar para a Busca
        </Link>
      </div>
    )
  }

  // --- AQUI ESTAVA FALTANDO O XP E O LEVEL ---
  const dadosCompletos = {
    ...atleta.dados, 
    id: atleta.id, 
    user_id: atleta.user_id,
    
    // ADICIONE ESTAS DUAS LINHAS:
    level: atleta.level, // Pega o nível do banco
    xp: atleta.xp,       // Pega o XP do banco
    
    name: atleta.nome,
    foto_url: atleta.foto_url,
    template_style: atleta.template_style, 
    nickname: atleta.apelido,    
    about: atleta.sobre, 
    record: atleta.cartel,
    fightingStyle: atleta.estilodeluta,
    category: atleta.categoria,
    stats: atleta.atributos,
    awards: atleta.premios,
    fightHistory: atleta.historico,
    videos: atleta.video_lista,
    gallery: atleta.galeria,
    contact: atleta.contato,
    socials: atleta.redes_sociais,
    nextFight: atleta.prox_luta,
    plano: atleta.plano
  }

  return (
    <div className="relative w-full min-h-screen">
        
        {/* Componente Rastreador */}
        <ViewTracker profileId={dadosCompletos.id} profileUserId={dadosCompletos.user_id} />

        {/* LÓGICA DE SELEÇÃO DE TEMPLATE */}
        {dadosCompletos.template_style === 'cyber' ? (
            <TemplateCyber data={dadosCompletos} />
        ) : (
            <TemplatePadrao data={dadosCompletos} />
        )}

    </div>
  )
}