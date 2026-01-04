export const runtime = 'edge';

import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
import TemplateCyber from '../../components/TemplateCyber' 
import Link from 'next/link' 
import ViewTracker from '../../components/ViewTracker'

async function getAtleta(slug) {
  // 1. Busca dados do Atleta
  let { data: atleta } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!atleta && !isNaN(slug)) {
    const { data: atletaPorId } = await supabase.from('atletas').select('*').eq('id', slug).maybeSingle()
    if (atletaPorId) atleta = atletaPorId
  }

  if (!atleta) return null;

  const profileId = atleta.id;

  // 2. BUSCA RELAÇÕES (Conexões Reais do Banco)
  
  // A) Se ele é Treinador: Busque os Alunos ACEITOS
  const { data: alunosData } = await supabase
    .from('relacoes')
    .select(`student:atletas!student_id(id, nome, apelido, foto_url, slug, cartel, categoria)`)
    .eq('coach_id', profileId)
    .eq('status', 'accepted');

  // B) Se ele é Atleta (ou Aluno): Busque os Treinadores ACEITOS
  const { data: coachesData } = await supabase
    .from('relacoes')
    .select(`coach:atletas!coach_id(id, nome, apelido, foto_url, slug, coach_details)`)
    .eq('student_id', profileId)
    .eq('status', 'accepted');

  // Limpeza dos dados (Flattening)
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
        <h1 className="text-3xl font-bold text-yellow-500">Lutador não encontrado 😕</h1>
        <Link href="/busca" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition">Voltar para a Busca</Link>
      </div>
    )
  }

  const dadosCompletos = {
    ...atleta.dados, 
    id: atleta.id, 
    user_id: atleta.user_id,
    
    level: atleta.level, 
    xp: atleta.xp,
    
    is_athlete: atleta.is_athlete ?? true,
    is_coach: atleta.is_coach,
    coach_details: atleta.coach_details,

    // --- DADOS DAS CONEXÕES ---
    connected_students: atleta.myStudents, // Lista de alunos reais
    connected_coaches: atleta.myCoaches,   // Lista de treinadores reais
    
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
        <ViewTracker profileId={dadosCompletos.id} profileUserId={dadosCompletos.user_id} />
        {dadosCompletos.template_style === 'cyber' ? (
            <TemplateCyber data={dadosCompletos} />
        ) : (
            <TemplatePadrao data={dadosCompletos} />
        )}
    </div>
  )
}