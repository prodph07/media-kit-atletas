export const runtime = 'edge';
import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
import Link from 'next/link' // Importante para o botão de voltar no 404

// Função para buscar dados (COM A CORREÇÃO DE ID)
async function getAtleta(slug) {
  console.log("🔍 Buscando no Supabase pelo slug ou ID:", slug)

  // 1. Tenta buscar pelo SLUG
  // Usamos .maybeSingle() em vez de .single() para não dar erro se vier vazio
  let { data: atleta, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  // 2. Fallback: Se não achou pelo slug e o parametro é um número, tenta pelo ID
  if (!atleta && !isNaN(slug)) {
    console.log("⚠️ Não achou por slug. Tentando buscar pelo ID:", slug)
    const { data: atletaPorId } = await supabase
       .from('atletas')
       .select('*')
       .eq('id', slug)
       .maybeSingle()
    
    if (atletaPorId) {
       atleta = atletaPorId
    }
  }

  if (!atleta) {
    console.log("❌ Atleta não encontrado.")
  } else {
    console.log("✅ Atleta encontrado:", atleta?.nome)
  }

  return atleta
}

export default async function Page({ params }) {
  const { slug } = await params
  
  const atleta = await getAtleta(slug)

  // Se não achar o atleta, mostra erro na tela
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

  // Prepara os dados para o template (Mantendo seu mapeamento original)
  const dadosCompletos = {
    ...atleta.dados, // Caso você tenha campos soltos em jsonb
    id: atleta.id, // Importante passar o ID
    name: atleta.nome,
    foto_url: atleta.foto_url,
    template_tipo: atleta.template,
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
    plano: atleta.plano // Passando o plano caso o template precise saber se é premium
  }

  // Carrega o layout padrão que você já criou
  return <TemplatePadrao data={dadosCompletos} />
}