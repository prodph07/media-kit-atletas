export const runtime = 'edge';
import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'

// Função para buscar dados
async function getAtleta(slug) {
  console.log("🔍 Buscando no Supabase pelo slug:", slug)

  // O erro 'supabase is not defined' acontecia porque o import lá em cima estava falhando ou sendo ignorado.
  // Agora garantimos que ele está importado na linha 1.
  const { data: atleta, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.log("❌ Erro do Supabase:", error.message)
  } else {
    console.log("✅ Atleta encontrado:", atleta?.nome)
  }

  return atleta
}

export default async function Page({ params }) {
  // --- A CORREÇÃO PRINCIPAL ESTÁ AQUI EMBAIXO ---
  // Nas versões novas do Next.js, 'params' é uma Promessa.
  // Precisamos colocar 'await' antes de ler o slug.
  const { slug } = await params
  
  const atleta = await getAtleta(slug)

  // Se não achar o atleta, mostra erro na tela
  if (!atleta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <h1 className="text-2xl font-bold">Atleta não encontrado 😕</h1>
        <p className="text-slate-400">Verifique se o slug "{slug}" está correto no Banco de Dados.</p>
        <p className="text-xs text-slate-600">Dica: O campo 'slug' na tabela 'atletas' deve ser idêntico.</p>
      </div>
    )
  }

  // Prepara os dados para o template
  const dadosCompletos = {
    ...atleta.dados,
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

  }

  // Carrega o layout
  return <TemplatePadrao data={dadosCompletos} />
}