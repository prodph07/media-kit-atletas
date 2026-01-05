export const runtime = 'edge';

import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
// import TemplateCyber from '../../components/TemplateCyber' (Removido temporariamente)
import Link from 'next/link' 
import ViewTracker from '../../components/ViewTracker'

async function getAtleta(slug) {
  // 1. Busca dados do Atleta pelo slug
  let { data: atleta } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  // Fallback: Se não achar por slug, tenta por ID
  if (!atleta && !isNaN(slug)) {
    const { data: atletaPorId } = await supabase.from('atletas').select('*').eq('id', slug).maybeSingle()
    if (atletaPorId) atleta = atletaPorId
  }

  if (!atleta) return null;

  const profileId = atleta.id;

  // 2. BUSCA RELAÇÕES (Conexões Reais do Banco)
  const { data: alunosData } = await supabase
    .from('relacoes')
    .select(`student:atletas!student_id(id, nome, apelido, foto_url, slug, cartel, categoria, coach_details)`)
    .eq('coach_id', profileId)
    .eq('status', 'accepted');

  const { data: coachesData } = await supabase
    .from('relacoes')
    .select(`coach:atletas!coach_id(id, nome, apelido, foto_url, slug, coach_details)`)
    .eq('student_id', profileId)
    .eq('status', 'accepted');

  const myStudents = alunosData ? alunosData.map(r => r.student) : [];
  const myCoaches = coachesData ? coachesData.map(r => r.coach) : [];

  return { ...atleta, myStudents, myCoaches };
}

export default async function Page({ params }) {
  const { slug } = await params
  
  const atleta = await getAtleta(slug)

  if (!atleta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white gap-4 p-4 text-center">
        <h1 className="text-3xl font-bold text-yellow-500">Perfil não encontrado 😕</h1>
        <Link href="/" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition">Voltar para a Home</Link>
      </div>
    )
  }

  const dadosCompletos = {
    ...atleta.dados, 
    id: atleta.id, 
    user_id: atleta.user_id,
    
    // Dados Principais
    name: atleta.nome,
    nickname: atleta.apelido,
    foto_url: atleta.foto_url,
    about: atleta.sobre,
    slug: atleta.slug,
    status_message: atleta.status_message,
    
    // Gamificação
    level: atleta.level, 
    xp: atleta.xp,
    
    // Tipos de Perfil
    is_athlete: atleta.is_athlete ?? true,
    is_coach: atleta.is_coach,
    coach_details: atleta.coach_details,
    
    // Mapeamento de Dados
    stats: atleta.atributos || {},
    premios: atleta.premios || [],
    historico: atleta.historico || [],
    socials: atleta.redes_sociais || {},
    record: atleta.cartel || {},
    video_lista: atleta.video_lista || [],
    galeria: atleta.galeria || [],
    contact: atleta.contato || {},
    nextFight: atleta.prox_luta || {}, // Dados da próxima luta

    fightingStyle: atleta.estilodeluta,
    category: atleta.categoria,
    template_style: atleta.template_style,
    plano: atleta.plano,

    connected_students: atleta.myStudents,
    connected_coaches: atleta.myCoaches,
  }

  return (
    <div className="relative w-full min-h-screen">
        <ViewTracker profileId={dadosCompletos.id} profileUserId={dadosCompletos.user_id} />
        {/* Renderiza apenas o Padrão por enquanto */}
        <TemplatePadrao data={dadosCompletos} />
    </div>
  )
}