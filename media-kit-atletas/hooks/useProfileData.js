import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    processDailyLogin,
    processVisitMilestone,
    calculateNewLevelState,
    processTemporalXPResets
} from '../lib/gamification';
import { safeVal, parseAgeStats, parseGenderStats, parseCityStats } from '../lib/utils';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function useProfileData() {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [perfil, setPerfil] = useState(null);

    // Auxiliary Data
    const [notificacoes, setNotificacoes] = useState([]);
    const [convitesEquipe, setConvitesEquipe] = useState([]);
    const [convitesParceria, setConvitesParceria] = useState([]);
    const [meusDuelos, setMeusDuelos] = useState([]);
    const [meusAlunos, setMeusAlunos] = useState([]);
    const [profileViews, setProfileViews] = useState([]);
    const [totalViews, setTotalViews] = useState(0);

    const [pendingRegistrations, setPendingRegistrations] = useState([]); // NEW

    // Form Stats (derived from profile)
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [genderSplit, setGenderSplit] = useState({ men: '', women: '' });
    const [cityList, setCityList] = useState([]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return; // Caller should handle redirect
            }
            setUserId(user.id);

            const { data, error } = await supabase
                .from('atletas')
                .select('*, tipo_conta, is_athlete')
                .eq('user_id', user.id)
                .single();

            if (data) {
                const ATLETA_ID = data.id;

                // --- GAMIFICATION PROCESS ---
                let finalXp = data.xp || 0;
                let finalLevel = data.level || 1;
                let finalWeeklyStats = data.weekly_stats || {};
                let autoAlerts = [];

                // 1. Daily Login
                const loginResult = processDailyLogin(finalWeeklyStats);
                if (loginResult.success) {
                    const state = calculateNewLevelState(finalXp, finalLevel, loginResult.xpGained);
                    finalXp = state.newXp; finalLevel = state.newLevel; finalWeeklyStats = loginResult.updatedStats;
                    autoAlerts.push(loginResult.message);
                    if (state.levelUp) autoAlerts.push(`🆙 LEVEL UP! Nível ${state.newLevel}!`);
                }

                // 2. Profile Views
                const { count: viewCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('perfil_visitado_id', ATLETA_ID);
                const totalV = viewCount || 0;
                setTotalViews(totalV);

                const visitResult = processVisitMilestone(totalV, finalWeeklyStats);
                if (visitResult.success) {
                    const state = calculateNewLevelState(finalXp, finalLevel, visitResult.xpGained);
                    finalXp = state.newXp; finalLevel = state.newLevel; finalWeeklyStats = visitResult.updatedStats;
                    autoAlerts.push(visitResult.message);
                    if (state.levelUp) autoAlerts.push(`🆙 LEVEL UP! Nível ${state.newLevel}!`);
                }

                if (loginResult.success || visitResult.success) {
                    await supabase.from('atletas').update({ xp: finalXp, level: finalLevel, weekly_stats: finalWeeklyStats }).eq('user_id', user.id);
                    if (autoAlerts.length > 0) alert(autoAlerts.join('\n'));
                }

                // --- PARSE SOCIAL STATS ---
                const instaData = data.redes_sociais?.instagram || {};
                setAgeRange(parseAgeStats(instaData.audience?.age));
                setGenderSplit(parseGenderStats(instaData.audience?.gender));
                setCityList(parseCityStats(instaData.audience?.cities));

                // --- BUILD PROFILE OBJECT ---
                const safeProfile = {
                    ...data,
                    nome: safeVal(data.nome), apelido: safeVal(data.apelido), categoria: safeVal(data.categoria), foto_url: safeVal(data.foto_url),
                    about: safeVal(data.sobre), plano: data.plano || 'free', template_style: data.template_style || 'padrao', slug: safeVal(data.slug),
                    tipo_conta: data.tipo_conta && data.tipo_conta !== '' ? data.tipo_conta : 'atleta',
                    status_message: safeVal(data.status_message),
                    is_athlete: data.is_athlete ?? true, is_coach: data.is_coach ?? false, coach_details: data.coach_details || {},
                    xp: finalXp, level: finalLevel, weekly_stats: finalWeeklyStats, completed_tasks: data.completed_tasks || [],
                    stats: { height: safeVal(data.atributos?.height), weight: safeVal(data.atributos?.weight), reach: safeVal(data.atributos?.reach), age: safeVal(data.atributos?.age) },
                    record: data.cartel || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
                    contact: { email: safeVal(data.contato?.email), managerEmail: safeVal(data.contato?.managerEmail), phone: safeVal(data.contato?.phone), phoneDisplay: safeVal(data.contato?.phoneDisplay), city: safeVal(data.contato?.city), trainingCenter: safeVal(data.contato?.trainingCenter) },
                    nextFight: { date: safeVal(data.prox_luta?.date), event: safeVal(data.prox_luta?.event), opponent: safeVal(data.prox_luta?.opponent), location: safeVal(data.prox_luta?.location) },
                    socials: {
                        instagram: { ...instaData, active: true, user: safeVal(instaData.user), followers: safeVal(instaData.followers), url: safeVal(instaData.url), stats: { ...instaData.stats }, audience: instaData.audience || {} },
                        youtube: { active: false, ...data.redes_sociais?.youtube }, tiktok: { active: false, ...data.redes_sociais?.tiktok },
                        x: { active: false, ...data.redes_sociais?.x }, kwai: { active: false, ...data.redes_sociais?.kwai }
                    },
                    historico: data.historico || [], video_lista: data.video_lista || [], galeria: data.galeria || [], premios: data.premios || []
                };

                // --- TEMPORAL RESET ---
                const { hasUpdates, updatedStats } = processTemporalXPResets(safeProfile);
                if (hasUpdates) {
                    await supabase.from('atletas').update({ weekly_stats: updatedStats }).eq('user_id', user.id);
                    safeProfile.weekly_stats = updatedStats;
                }
                setPerfil(safeProfile);

                // --- PARALLEL FETCHES ---
                const p1 = supabase.from('duelos').select(`id, created_at, atleta_1_id, desafiante:atletas!atleta_1_id(nome, apelido, foto_url)`).eq('atleta_2_id', ATLETA_ID).eq('status', 'pending');
                const p2 = supabase.from('relacoes').select(`id, created_at, coach_id, coach:atletas!coach_id(nome, apelido, foto_url, coach_details)`).eq('student_id', ATLETA_ID).eq('status', 'pending');
                const p3 = supabase.from('parcerias').select(`id, created_at, empresa_id, empresa:atletas!empresa_id(nome, apelido, foto_url, slug)`).eq('atleta_id', ATLETA_ID).eq('status', 'pendente');
                const p4 = supabase.from('duelos').select(`id, created_at, status, expires_at, votos_1, votos_2, p1:atletas!atleta_1_id(id, nome, apelido, foto_url), p2:atletas!atleta_2_id(id, nome, apelido, foto_url)`).or(`atleta_1_id.eq.${ATLETA_ID},atleta_2_id.eq.${ATLETA_ID}`).order('created_at', { ascending: false });

                const [duelosRes, coachRes, parceriasRes, histRes] = await Promise.all([p1, p2, p3, p4]);

                setNotificacoes(duelosRes.data || []);
                setConvitesEquipe(coachRes.data || []);
                setConvitesParceria(parceriasRes.data || []);
                setMeusDuelos(histRes.data || []);

                if (data.is_coach || data.tipo_conta === 'treinador') {
                    // Fetch Students
                    const { data: studentsData } = await supabase
                        .from('relacoes')
                        .select('student_id, student:atletas!student_id(id, nome, apelido, foto_url, xp, level, categoria)')
                        .eq('coach_id', ATLETA_ID)
                        .eq('status', 'accepted');

                    setMeusAlunos(studentsData || []);

                    // Fetch Pending Event Registrations for these students
                    console.log("DEBUG: Meus Alunos IDs", studentsData?.map(s => s.student_id));
                    const studentIds = studentsData?.map(s => s.student_id).filter(Boolean) || [];

                    if (studentIds.length > 0) {
                        // 1. Fetch RAW inscriptions first to avoid Join 400 Error
                        const { data: rawRegs, error: fetchErr } = await supabase
                            .from('eventos_inscricoes')
                            .select('*')
                            .in('atleta_id', studentIds)
                            .eq('status', 'aguardando_aprovacao');

                        if (rawRegs && rawRegs.length > 0) {
                            // 2. Manual Fetch for details
                            const eventIds = [...new Set(rawRegs.map(r => r.evento_id))];
                            const athleteIds = [...new Set(rawRegs.map(r => r.atleta_id))];
                            const catIds = [...new Set(rawRegs.map(r => r.categoria_id))];

                            const { data: events } = await supabase.from('eventos').select('id, nome, data_evento').in('id', eventIds);
                            const { data: athletes } = await supabase.from('atletas').select('id, nome, apelido, foto_url').in('id', athleteIds);
                            const { data: cats } = await supabase.from('eventos_categorias').select('id, nome').in('id', catIds);

                            // 3. Merge
                            const enrichedRegs = rawRegs.map(r => ({
                                ...r,
                                evento: events?.find(e => e.id === r.evento_id),
                                atleta: athletes?.find(a => a.id === r.atleta_id),
                                categoria: cats?.find(c => c.id === r.categoria_id)
                            }));

                            setPendingRegistrations(enrichedRegs);
                        } else {
                            if (fetchErr) console.error("DEBUG FETCH ERROR:", fetchErr);
                            setPendingRegistrations([]);
                        }
                    }
                }

                // Fetch Views
                const { data: viewsData } = await supabase.from('profile_views').select('created_at, visitante_tipo, visitante_id').eq('perfil_visitado_id', ATLETA_ID).neq('visitante_tipo', 'anonimo').order('created_at', { ascending: false }).limit(data.plano === 'premium' ? 100 : 20);

                if (viewsData?.length > 0) {
                    const idsVisitantes = viewsData.map(v => v.visitante_id).filter(Boolean);
                    if (idsVisitantes.length > 0) {
                        const { data: perfisVisitantes } = await supabase.from('atletas').select('user_id, nome, apelido, foto_url, slug').in('user_id', idsVisitantes);
                        const viewsCompletas = viewsData.map(view => ({ ...view, detalhes: perfisVisitantes?.find(p => p.user_id === view.visitante_id) }));
                        setProfileViews(viewsCompletas);
                    }
                }
            } else {
                // Tenta buscar em FANS
                const { data: fanData } = await supabase.from('fans').select('*').eq('user_id', user.id).single();
                if (fanData) {
                    setPerfil({
                        ...fanData,
                        id: fanData.id,
                        nome: fanData.nickname,
                        apelido: fanData.nickname,
                        foto_url: fanData.avatar_url || '',
                        tipo_conta: 'fan',
                        level: fanData.level || 1,
                        xp: fanData.xp || 0,
                        weekly_stats: fanData.weekly_stats || {},
                        // Mock fields to prevent crashes in generic components/hooks
                        socials: { instagram: { active: false }, youtube: { active: false }, tiktok: { active: false }, x: { active: false }, kwai: { active: false } },
                        stats: {}, record: {}, contact: {}, nextFight: {},
                        galeria: [], historico: [], video_lista: [], premios: [], completed_tasks: []
                    });
                }
            }
            setLoading(false);
        }
        loadData();
    }, []);

    return {
        loading, userId, perfil, setPerfil,
        notificacoes, setNotificacoes,
        convitesEquipe, setConvitesEquipe,
        convitesParceria, setConvitesParceria,
        meusDuelos, setMeusDuelos,
        meusAlunos, setMeusAlunos,
        pendingRegistrations, setPendingRegistrations, // EXPORTED
        profileViews, totalViews,
        ageRange, setAgeRange,
        genderSplit, setGenderSplit,
        cityList, setCityList
    };
}
