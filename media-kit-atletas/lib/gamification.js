// lib/gamification.js

// --- CONFIGURAÇÃO DA MATEMÁTICA ---
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

export function getXpToNextLevel(currentLevel) {
  const level = Number(currentLevel) || 1;
  return Math.floor(BASE_XP * (Math.pow(level, GROWTH_FACTOR)));
}

export function getLevelProgress(currentXp, currentLevel) {
  const xp = Number(currentXp) || 0;
  const level = Number(currentLevel) || 1;
  const target = getXpToNextLevel(level);
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (xp / target) * 100));
}

// --- FUNÇÃO RESTAURADA: INFORMAÇÕES DE RANQUE ---
export function getRankInfo(levelInput) {
  const level = Number(levelInput) || 1;
  
  // FERRO
  if (level <= 10) return { title: "Iron Amateur", tier: "iron", style: "from-zinc-500 to-zinc-700 border-zinc-500 shadow-zinc-500/20" };
  if (level <= 20) return { title: "Iron Debutant", tier: "iron", style: "from-zinc-400 to-zinc-600 border-zinc-400 shadow-zinc-400/30" };
  if (level <= 30) return { title: "Iron Prelim", tier: "iron", style: "from-zinc-300 to-zinc-500 border-zinc-300 shadow-zinc-300/40" };
  // BRONZE
  if (level <= 40) return { title: "Bronze Undercard", tier: "bronze", style: "from-orange-700 to-amber-800 border-amber-700 shadow-amber-700/30" };
  if (level <= 50) return { title: "Bronze Rising Star", tier: "bronze", style: "from-orange-600 to-amber-700 border-amber-600 shadow-amber-600/40" };
  if (level <= 60) return { title: "Bronze Prospect", tier: "bronze", style: "from-orange-500 to-amber-600 border-amber-500 shadow-amber-500/50" };
  // PRATA
  if (level <= 70) return { title: "Silver Professional", tier: "silver", style: "from-slate-300 to-slate-400 border-slate-300 shadow-slate-300/40" };
  if (level <= 80) return { title: "Silver Main Card", tier: "silver", style: "from-slate-200 to-slate-300 border-slate-200 shadow-slate-200/50" };
  if (level <= 90) return { title: "Silver Co-Main Event", tier: "silver", style: "from-slate-100 to-slate-200 border-white shadow-white/40" };
  // OURO
  if (level <= 100) return { title: "Gold Top 15", tier: "gold", style: "from-yellow-600 to-yellow-500 border-yellow-600 shadow-yellow-600/40" };
  if (level <= 110) return { title: "Gold Top 5", tier: "gold", style: "from-yellow-500 to-yellow-400 border-yellow-500 shadow-yellow-500/50" };
  if (level <= 120) return { title: "Gold Contender", tier: "gold", style: "from-yellow-400 to-yellow-300 border-yellow-400 shadow-yellow-400/50" };
  // PLATINA
  if (level <= 130) return { title: "Platinum Champion", tier: "platinum", style: "from-cyan-600 to-blue-600 border-cyan-500 shadow-cyan-500/40" };
  if (level <= 140) return { title: "Platinum Defender", tier: "platinum", style: "from-cyan-500 to-blue-500 border-cyan-400 shadow-cyan-400/50" };
  if (level <= 150) return { title: "Platinum Double-Champ", tier: "platinum", style: "from-cyan-400 to-blue-400 border-cyan-300 shadow-cyan-300/60" };
  // DIAMANTE
  if (level <= 165) return { title: "Diamond P4P King", tier: "diamond", style: "from-indigo-600 to-violet-600 border-indigo-500 shadow-indigo-500/40" };
  if (level <= 180) return { title: "Diamond Hall of Famer", tier: "diamond", style: "from-indigo-500 to-purple-500 border-indigo-400 shadow-indigo-400/50" };
  if (level <= 199) return { title: "Diamond World Icon", tier: "diamond", style: "from-indigo-400 to-purple-400 border-indigo-300 shadow-indigo-300/60" };
  // GOAT
  return { title: "G.O.A.T.", tier: "goat", style: "from-pink-500 via-purple-500 to-indigo-500 border-pink-400 shadow-pink-500/50" };
}

// --- ENGINE DE TAREFAS (Setup) ---
const REWARDS = {
  SETUP_BUNDLE_BASIC: 100,
  COMPLETE_PHYSICAL_STATS: 25,
  COMPLETE_FIGHT_RECORD: 50,
  ADD_AWARDS: 25,
  ADD_FIGHT_HISTORY: 25,
  GALLERY_TIER_1: 15,
  GALLERY_TIER_2: 50,
  VIDEO_TIER_1: 15,
  VIDEO_TIER_2: 50
};

export function processGamification(perfil, currentTasks = []) {
  let xpGained = 0;
  let newTasks = [...currentTasks];
  let notifications = [];

  const checkTask = (taskKey, condition, label) => {
    if (condition && !newTasks.includes(taskKey)) {
      xpGained += REWARDS[taskKey];
      newTasks.push(taskKey);
      notifications.push(`+${REWARDS[taskKey]} XP: ${label}`);
    }
  };

  const hasSocial = perfil.socials && Object.values(perfil.socials).some(s => s.active && s.user);
  checkTask('SETUP_BUNDLE_BASIC', (perfil.foto_url && perfil.about && hasSocial), 'Perfil Básico Configurado');

  const hasStats = perfil.stats && perfil.stats.height && perfil.stats.weight && perfil.stats.reach;
  checkTask('COMPLETE_PHYSICAL_STATS', hasStats, 'Atributos Físicos Completos');

  const hasRecord = perfil.record && (perfil.record.wins !== '' && perfil.record.wins !== null);
  checkTask('COMPLETE_FIGHT_RECORD', hasRecord, 'Cartel Registrado');

  checkTask('ADD_AWARDS', (perfil.premios && perfil.premios.length > 0), 'Primeira Conquista Adicionada');
  checkTask('ADD_FIGHT_HISTORY', (perfil.historico && perfil.historico.length > 0), 'Luta Adicionada ao Histórico');

  const galleryCount = perfil.galeria ? perfil.galeria.length : 0;
  checkTask('GALLERY_TIER_1', (galleryCount >= 1), 'Primeira Foto na Galeria');
  checkTask('GALLERY_TIER_2', (galleryCount >= 5), 'Galeria em Expansão (5 fotos)');

  const videoCount = perfil.video_lista ? perfil.video_lista.length : 0;
  checkTask('VIDEO_TIER_1', (videoCount >= 1), 'Primeiro Vídeo Adicionado');
  checkTask('VIDEO_TIER_2', (videoCount >= 5), 'Videoteca (5 vídeos)');

  return { xpGained, newTasks, notifications };
}

// --- FUNÇÕES DE RECORRÊNCIA ---

/**
 * LÓGICA DE DUELO (Cooldown GLOBAL de 7 dias)
 * Verifica a data 'last_duel_participation_date' nas estatísticas do usuário.
 */
export function processDuelParticipation(currentWeeklyStats) {
  const stats = currentWeeklyStats || {};
  
  // Verifica se existe data anterior
  const lastDate = stats.last_duel_participation_date ? new Date(stats.last_duel_participation_date) : null;
  const now = new Date();
  
  // 7 dias em milissegundos
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; 
  
  // Se nunca jogou OU (Agora - UltimaData) > 7 dias
  if (!lastDate || (now.getTime() - lastDate.getTime()) > SEVEN_DAYS_MS) {
    return {
      xpGained: 75, 
      updatedStats: {
        ...stats,
        last_duel_participation_date: now.toISOString() // Atualiza a data para AGORA (bloqueia pelos próximos 7 dias)
      },
      success: true,
      message: "XP Semanal de Duelo: +75 XP!"
    };
  }

  // Se cair aqui, é porque ainda está no cooldown
  const daysLeft = Math.ceil((SEVEN_DAYS_MS - (now.getTime() - lastDate.getTime())) / (1000 * 60 * 60 * 24));
  return { 
      xpGained: 0, 
      updatedStats: stats, 
      success: false, 
      message: `Você já ganhou XP de duelo essa semana. Volte em ${daysLeft} dias.` 
  };
}

/**
 * LÓGICA DE VISITAS (Milestone de 300 views)
 */
export function processVisitMilestone(currentViews, currentWeeklyStats) {
    // Garante que o objeto stats existe e tem valores padrão
    const stats = {
        visits_snapshot: 0,
        visits_xp_earned: 0,
        last_weekly_reset: new Date().toISOString(),
        ...(currentWeeklyStats || {})
    };
    
    // 1. Verifica Reset Semanal das Visitas (Zera apenas o ganho semanal, não o snapshot total)
    const lastReset = stats.last_weekly_reset ? new Date(stats.last_weekly_reset) : new Date();
    const now = new Date();
    const SEVEN_DAYS_MS = 604800000; 

    if ((now - lastReset) > SEVEN_DAYS_MS) {
        stats.visits_xp_earned = 0; // Zera o ganho da semana
        stats.last_weekly_reset = now.toISOString();
    }

    // 2. Verifica se já estourou o limite de 500 XP na semana
    if (stats.visits_xp_earned >= 500) {
        return { xpGained: 0, updatedStats: stats, success: false };
    }

    // 3. Calcula diferença (Delta)
    // Snapshot = Quantas views eu tinha na ultima vez que ganhei XP
    const currentSnapshot = stats.visits_snapshot || 0;
    const diff = currentViews - currentSnapshot;

    // Regra: A cada 300 visitas novas -> 50 XP
    if (diff >= 300) {
        const milestones = Math.floor(diff / 300); // Quantas vezes bateu 300?
        let xpToGrant = milestones * 50;

        // Aplica o CAP (não deixar passar de 500 na semana)
        if ((stats.visits_xp_earned + xpToGrant) > 500) {
            xpToGrant = 500 - stats.visits_xp_earned;
        }

        if (xpToGrant > 0) {
            return {
                xpGained: xpToGrant,
                updatedStats: {
                    ...stats,
                    // Atualiza o snapshot. Ex: tinha 0, agora tem 300.
                    visits_snapshot: currentSnapshot + (milestones * 300), 
                    visits_xp_earned: stats.visits_xp_earned + xpToGrant
                },
                success: true,
                message: `Viralizou! ${milestones * 300} novas visitas (+${xpToGrant} XP)`
            };
        }
    }

    return { xpGained: 0, updatedStats: stats, success: false };
}