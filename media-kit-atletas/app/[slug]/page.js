export const runtime = 'edge';
import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
import TemplateCyber from '../../components/TemplateCyber' // Importando o novo template
import Link from 'next/link' 

// Função para buscar dados
async function getAtleta(slug) {
  console.log("🔍 Buscando no Supabase pelo slug ou ID:", slug)

  // 1. Tenta buscar pelo SLUG
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

  // Prepara os dados para o template
  const dadosCompletos = {
    ...atleta.dados, 
    id: atleta.id, 
    user_id: atleta.user_id, // Necessário para a lógica de não contar view do próprio dono
    name: atleta.nome,
    foto_url: atleta.foto_url,
    template_style: atleta.template_style, // O campo que define qual template usar
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

  // LÓGICA DE SELEÇÃO DE TEMPLATE
  // Se o usuário escolheu "cyber", carrega o novo visual
  if (dadosCompletos.template_style === 'cyber') {
      return <TemplateCyber data={dadosCompletos} />
  }

  // Caso contrário (ou se for null), carrega o Padrão
  return <TemplatePadrao data={dadosCompletos} />
}