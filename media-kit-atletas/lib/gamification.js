// lib/gamification.js

// --- CONFIGURAÇÃO DA MATEMÁTICA ---
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

export function getXpToNextLevel(currentLevel) {
  const level = Number(currentLevel) || 1;
  return Math.floor(BASE_XP * (Math.pow(level, GROWTH_FACTOR)));
}

export function getLevelProgress(currentXp, currentLevel) {
  const xp = Number(currentXp);
  const level = Number(currentLevel) || 1;
  
  if (isNaN(xp) || xp < 0) return 0;
  const target = getXpToNextLevel(level);
  if (!target || target <= 0) return 0;
  
  const percentage = (xp / target) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// --- LÓGICA DE MOLDURAS (FRAMES) ---
export function getRankInfo(levelInput) {
  const level = Number(levelInput) || 1;
  const basePath = "/frames"; 

  if (level <= 10) return { title: "Iron I", tier: "iron", frameUrl: `${basePath}/iron_1.png`, textColor: "text-zinc-500", frameScale: 1.4 };
  if (level <= 20) return { title: "Iron II", tier: "iron", frameUrl: `${basePath}/iron_2.png`, textColor: "text-zinc-400", frameScale: 2 };
  if (level <= 30) return { title: "Iron III", tier: "iron", frameUrl: `${basePath}/iron_3.png`, textColor: "text-zinc-300", frameScale: 1.9 };
  
  if (level <= 40) return { title: "Bronze I", tier: "bronze", frameUrl: `${basePath}/bronze_1.png`, textColor: "text-amber-700", frameScale: 1.5 };
  if (level <= 50) return { title: "Bronze II", tier: "bronze", frameUrl: `${basePath}/bronze_2.png`, textColor: "text-amber-600", frameScale: 1.85 };
  if (level <= 60) return { title: "Bronze III", tier: "bronze", frameUrl: `${basePath}/bronze_3.png`, textColor: "text-amber-500", frameScale: 2 };
  
  if (level <= 70) return { title: "Silver I", tier: "silver", frameUrl: `${basePath}/silver_1.png`, textColor: "text-slate-400", frameScale: 1.9 };
  if (level <= 80) return { title: "Silver II", tier: "silver", frameUrl: `${basePath}/silver_2.png`, textColor: "text-slate-300", frameScale: 1.95 };
  if (level <= 90) return { title: "Silver III", tier: "silver", frameUrl: `${basePath}/silver_3.png`, textColor: "text-slate-200", frameScale: 1.73 };
  
  if (level <= 100) return { title: "Gold I", tier: "gold", frameUrl: `${basePath}/gold_1.png`, textColor: "text-yellow-600", frameScale: 2.2 };
  if (level <= 110) return { title: "Gold II", tier: "gold", frameUrl: `${basePath}/gold_2.png`, textColor: "text-yellow-500", frameScale: 2.3};
  if (level <= 120) return { title: "Gold III", tier: "gold", frameUrl: `${basePath}/gold_3.png`, textColor: "text-yellow-400", frameScale: 1.73 };
  
  if (level <= 130) return { title: "Platinum I", tier: "platinum", frameUrl: `${basePath}/platinum_1.png`, textColor: "text-cyan-600", frameScale: 1.35 };
  if (level <= 140) return { title: "Platinum II", tier: "platinum", frameUrl: `${basePath}/platinum_2.png`, textColor: "text-cyan-500", frameScale: 1.35 };
  if (level <= 150) return { title: "Platinum III", tier: "platinum", frameUrl: `${basePath}/platinum_3.png`, textColor: "text-cyan-400", frameScale: 1.73 };
  
  if (level <= 165) return { title: "Diamond I", tier: "diamond", frameUrl: `${basePath}/diamond_1.png`, textColor: "text-indigo-500", frameScale: 1.40 };
  if (level <= 180) return { title: "Diamond II", tier: "diamond", frameUrl: `${basePath}/diamond_2.png`, textColor: "text-indigo-400", frameScale: 1.40 };
  if (level <= 199) return { title: "Diamond III", tier: "diamond", frameUrl: `${basePath}/diamond_3.png`, textColor: "text-indigo-300", frameScale: 1.73 };
  
  return { title: "G.O.A.T.", tier: "goat", frameUrl: `${basePath}/goat.png`, textColor: "text-pink-500", frameScale: 1.50 };
}

// --- ENGINE DE TAREFAS (XP e Recompensas) ---
const REWARDS = {
  SETUP_BUNDLE_BASIC: 100,
  COMPLETE_PHYSICAL_STATS: 25,
  COMPLETE_FIGHT_RECORD: 50,
  ADD_AWARDS: 25,
  ADD_FIGHT_HISTORY: 25,
  GALLERY_TIER_1: 15,
  GALLERY_TIER_2: 50,
  VIDEO_TIER_1: 15,
  VIDEO_TIER_2: 50,
  
  // Novas Tarefas
  JOIN_TEAM: 200,      
  SOCIAL_PRO: 50,       
  STORYTELLER: 30,      
  FIGHT_VETERAN: 40,
  
  // Eventos Dinâmicos (Valores de referência)
  CONNECTION_BONUS: 150, 
  WEIGHT_CHECKIN: 50,
  DAILY_LOGIN: 10,
  SHARE_BONUS: 30,
  VOTE_BONUS: 15
};

// Função auxiliar para calcular novo nível
export function calculateNewLevelState(currentXp, currentLevel, xpGained) {
    let newXp = (currentXp || 0) + xpGained;
    let newLevel = (currentLevel || 1);
    let levelUp = false;

    while (true) {
        const target = getXpToNextLevel(newLevel);
        if (newXp >= target) {
            newLevel++;
            newXp -= target;
            levelUp = true;
        } else {
            break;
        }
    }
    return { newXp, newLevel, levelUp };
}

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

  // 1. TAREFAS BÁSICAS
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

  // 2. TAREFAS DE EQUIPE
  const hasCoach = perfil.connected_coaches && perfil.connected_coaches.length > 0;
  checkTask('JOIN_TEAM', hasCoach, 'Entrou para uma Equipe');
  
  // 3. TAREFAS EXTRAS
  const activeSocialsCount = perfil.socials ? Object.values(perfil.socials).filter(s => s.active && s.user && s.user.length > 0).length : 0;
  checkTask('SOCIAL_PRO', (activeSocialsCount >= 3), 'Influenciador (3+ Redes Conectadas)');

  const bioLength = perfil.about ? perfil.about.length : 0;
  checkTask('STORYTELLER', (bioLength >= 100), 'Biografia Detalhada');

  const historyCount = perfil.historico ? perfil.historico.length : 0;
  checkTask('FIGHT_VETERAN', (historyCount >= 5), 'Veterano (5+ Lutas no Histórico)');

  return { xpGained, newTasks, notifications };
}

// --- FUNÇÕES DE RECORRÊNCIA (DIÁRIAS E SEMANAIS) ---

// 1. Duelo (Semanal)
export function processDuelParticipation(currentWeeklyStats) {
  const stats = currentWeeklyStats || {};
  const lastDate = stats.last_duel_participation_date ? new Date(stats.last_duel_participation_date) : null;
  const now = new Date();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; 
  
  if (!lastDate || (now.getTime() - lastDate.getTime()) > SEVEN_DAYS_MS) {
    return {
      xpGained: 75, 
      updatedStats: { ...stats, last_duel_participation_date: now.toISOString() },
      success: true,
      message: "XP Semanal de Duelo: +75 XP!"
    };
  }
  return { xpGained: 0, updatedStats: stats, success: false };
}

// 2. Viralizou (Visitas)
export function processVisitMilestone(currentViews, currentWeeklyStats) {
    const stats = { visits_snapshot: 0, visits_xp_earned: 0, last_weekly_reset: new Date().toISOString(), ...(currentWeeklyStats || {}) };
    const lastReset = stats.last_weekly_reset ? new Date(stats.last_weekly_reset) : new Date();
    const now = new Date();
    const SEVEN_DAYS_MS = 604800000; 

    if ((now - lastReset) > SEVEN_DAYS_MS) {
        stats.visits_xp_earned = 0; 
        stats.last_weekly_reset = now.toISOString();
    }
    if (stats.visits_xp_earned >= 500) return { xpGained: 0, updatedStats: stats, success: false };

    const currentSnapshot = stats.visits_snapshot || 0;
    const diff = currentViews - currentSnapshot;

    if (diff >= 300) {
        const milestones = Math.floor(diff / 300);
        let xpToGrant = milestones * 50;
        if ((stats.visits_xp_earned + xpToGrant) > 500) xpToGrant = 500 - stats.visits_xp_earned;

        if (xpToGrant > 0) {
            return {
                xpGained: xpToGrant,
                updatedStats: { ...stats, visits_snapshot: currentSnapshot + (milestones * 300), visits_xp_earned: stats.visits_xp_earned + xpToGrant },
                success: true,
                message: `Viralizou! ${milestones * 300} novas visitas (+${xpToGrant} XP)`
            };
        }
    }
    return { xpGained: 0, updatedStats: stats, success: false };
}

// 3. Login Diário com Streak
export function processDailyLogin(currentStats) {
    const stats = currentStats || {};
    const lastLogin = stats.last_login_date ? new Date(stats.last_login_date) : null;
    const now = new Date();
    
    // Compara dia/mês/ano para garantir que é um novo dia
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastDate = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime() : 0;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Se já logou hoje, retorna falso
    if (lastDate === today) {
        return { success: false, xpGained: 0, updatedStats: stats };
    }

    let streak = stats.login_streak || 0;
    let message = "";
    let xp = REWARDS.DAILY_LOGIN;

    // Lógica de Streak: Se a diferença for ~1 dia, mantém a chama acesa
    if (today - lastDate === ONE_DAY_MS) {
        streak++;
        message = `🔥 ${streak} Dias Seguidos! (+${xp} XP)`;
        // Bônus semanal
        if (streak % 7 === 0) {
            xp += 100;
            message = `🔥 ${streak} Dias! Bônus de Disciplina (+${xp} XP)`;
        }
    } else {
        streak = 1; // Reseta se quebrou a corrente
        message = `Login Diário (+${xp} XP)`;
    }

    return {
        success: true,
        xpGained: xp,
        streak: streak,
        message: message,
        updatedStats: { ...stats, last_login_date: now.toISOString(), login_streak: streak }
    };
}

// 4. Compartilhar Perfil (Semanal)
export function processWeeklyShare(currentStats) {
    const stats = currentStats || {};
    const lastShare = stats.last_share_date ? new Date(stats.last_share_date) : null;
    const now = new Date();
    const COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 dias

    if (!lastShare || (now - lastShare) > COOLDOWN) {
        return {
            success: true,
            xpGained: REWARDS.SHARE_BONUS,
            message: `Hype da Semana: Link compartilhado (+${REWARDS.SHARE_BONUS} XP)`,
            updatedStats: { ...stats, last_share_date: now.toISOString() }
        };
    }
    return { success: false };
}

// 5. Atualizar Peso (Semanal)
export function processWeightCheckIn(currentStats) {
    const stats = currentStats || {};
    const lastUpdate = stats.last_weight_update ? new Date(stats.last_weight_update) : null;
    const now = new Date();
    const COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 dias

    if (!lastUpdate || (now - lastUpdate) > COOLDOWN) {
        return {
            success: true,
            xpGained: REWARDS.WEIGHT_CHECKIN,
            message: `Disciplina: Peso atualizado (+${REWARDS.WEIGHT_CHECKIN} XP)`,
            updatedStats: { ...stats, last_weight_update: now.toISOString() }
        };
    }
    return { success: false };
}

// 6. Voto em Duelo (Diário)
export function processDuelVoting(currentStats) {
    const stats = currentStats || {};
    const lastVote = stats.last_vote_date ? new Date(stats.last_vote_date) : null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastDate = lastVote ? new Date(lastVote.getFullYear(), lastVote.getMonth(), lastVote.getDate()).getTime() : 0;

    if (lastDate !== today) {
        return {
            success: true,
            xpGained: REWARDS.VOTE_BONUS,
            message: `Juri Ativo: Você votou em um duelo (+${REWARDS.VOTE_BONUS} XP)`,
            updatedStats: { ...stats, last_vote_date: now.toISOString() }
        };
    }
    return { success: false };
}