export const runtime = 'edge';

import { supabase } from '../../lib/supabase'
import { TemplatePadrao } from '../../components/TemplatePadrao'
import { TemplateEmpresa } from '../../components/TemplateEmpresa' // [NEW]
// import TemplateCyber from '../../components/TemplateCyber' (Removido temporariamente)
import Link from 'next/link'
import ViewTracker from '../../components/ViewTracker'

async function getAtleta(slug) {
  // 1. Busca dados do Atleta pelo slug
  let { data: perfil } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  // Fallback: Se não achar por slug, tenta por ID
  if (!perfil && !isNaN(slug)) {
    const { data: perfilPorId } = await supabase.from('atletas').select('*').eq('id', slug).maybeSingle()
    if (perfilPorId) perfil = perfilPorId
  }

  if (!perfil) return null;

  const profileId = perfil.id;

  // 2. BUSCA DADOS ADICIONAIS
  let myStudents = [];
  let myCoaches = [];
  let myTeam = []; // [NEW] Para Empresas
  let opportunities = []; // [NEW] Para Empresas

  // --- SE FOR ATLETA/TREINADOR (Busca Relações) ---
  if (perfil.tipo_conta !== 'empresa') {
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

    myStudents = alunosData ? alunosData.map(r => r.student) : [];
    myCoaches = coachesData ? coachesData.map(r => r.coach) : [];
  }

  // --- SE FOR EMPRESA (Busca Time e Vagas) ---
  if (perfil.tipo_conta === 'empresa') {
    // Time (Parcerias Ativas)
    const { data: teamData } = await supabase
      .from('parcerias')
      .select(`atleta:atletas!atleta_id(id, nome, apelido, foto_url, slug, level, categoria)`)
      .eq('empresa_id', profileId)
      .eq('status', 'ativo');

    myTeam = teamData ? teamData.map(p => p.atleta) : [];

    // Vagas (Oportunidades)
    const { data: jobsData } = await supabase
      .from('oportunidades')
      .select('*')
      .eq('empresa_id', profileId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    opportunities = jobsData || [];
  }

  return { ...perfil, myStudents, myCoaches, myTeam, opportunities };
}

export default async function Page({ params }) {
  const { slug } = await params

  const perfil = await getAtleta(slug)

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white gap-4 p-4 text-center">
        <h1 className="text-3xl font-bold text-yellow-500">Perfil não encontrado 😕</h1>
        <Link href="/" className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition">Voltar para a Home</Link>
      </div>
    )
  }

  const dadosCompletos = {
    ...perfil.dados,
    id: perfil.id,
    user_id: perfil.user_id,

    // Dados Principais
    name: perfil.nome,
    nickname: perfil.apelido,
    foto_url: perfil.foto_url,
    about: perfil.sobre,
    slug: perfil.slug,
    status_message: perfil.status_message,
    tipo_conta: perfil.tipo_conta || 'atleta', // [NEW]

    // Gamificação
    level: perfil.level,
    xp: perfil.xp,

    // Tipos de Perfil
    is_athlete: perfil.is_athlete ?? true,
    is_coach: perfil.is_coach,
    coach_details: perfil.coach_details,

    // Mapeamento de Dados
    stats: perfil.atributos || {},
    premios: perfil.premios || [],
    historico: perfil.historico || [],
    socials: perfil.redes_sociais || {},
    record: perfil.cartel || {},
    video_lista: perfil.video_lista || [],
    galeria: perfil.galeria || [],
    contact: perfil.contato || {},
    nextFight: perfil.prox_luta || {}, // Dados da próxima luta

    fightingStyle: perfil.estilodeluta,
    category: perfil.categoria,
    template_style: perfil.template_style,
    plano: perfil.plano,

    connected_students: perfil.myStudents,
    connected_coaches: perfil.myCoaches,

    // [NEW] Dados Empresa
    myTeam: perfil.myTeam,
    opportunities: perfil.opportunities
  }

  return (
    <div className="relative w-full min-h-screen">
      <ViewTracker profileId={dadosCompletos.id} profileUserId={dadosCompletos.user_id} />
      {/* CONDICIONAL DE TEMPLATE */}
      {dadosCompletos.tipo_conta === 'empresa' ? (
        <TemplateEmpresa data={dadosCompletos} />
      ) : (
        <TemplatePadrao data={dadosCompletos} />
      )}
    </div>
  )
}