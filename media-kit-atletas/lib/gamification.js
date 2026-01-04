// lib/gamification.js

// --- CONFIGURAÇÃO DA MATEMÁTICA ---
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

export function getXpToNextLevel(currentLevel) {
  const level = Number(currentLevel) || 1;
  return Math.floor(BASE_XP * (Math.pow(level, GROWTH_FACTOR)));
}

export function getLevelProgress(currentXp, currentLevel) {
  // Converte para número e garante que não seja NaN
  const xp = Number(currentXp);
  const level = Number(currentLevel) || 1;
  
  // Se xp for inválido (null, undefined, NaN), retorna 0
  if (isNaN(xp) || xp < 0) return 0;

  const target = getXpToNextLevel(level);
  
  if (!target || target <= 0) return 0;
  
  // Calcula porcentagem e trava entre 0 e 100
  const percentage = (xp / target) * 100;
  
  return Math.min(100, Math.max(0, percentage));

}

// --- LÓGICA DE MOLDURAS (FRAMES) COM ESCALA VARIÁVEL ---
export function getRankInfo(levelInput) {
  const level = Number(levelInput) || 1;
  const basePath = "/frames"; // Certifique-se que a pasta public/frames existe

  // DICA DE AJUSTE (frameScale):
  // 1.0 = Tamanho exato da foto.
  // 1.1 = 10% maior que a foto (para bordas finas).
  // 1.5 = 50% maior que a foto (para cinturões gigantes).
  // Ajuste esses valores olhando no site até a borda não cortar a foto nem sobrar buraco.

  // FERRO (1-30) - Geralmente bordas mais finas
  if (level <= 10) return { title: "Iron I", tier: "iron", frameUrl: `${basePath}/iron_1.png`, textColor: "text-zinc-500", frameScale: 1.4 };
  if (level <= 20) return { title: "Iron II", tier: "iron", frameUrl: `${basePath}/iron_2.png`, textColor: "text-zinc-400", frameScale: 2 };
  if (level <= 30) return { title: "Iron III", tier: "iron", frameUrl: `${basePath}/iron_3.png`, textColor: "text-zinc-300", frameScale: 1.9 };

  // BRONZE (31-60)
  if (level <= 40) return { title: "Bronze I", tier: "bronze", frameUrl: `${basePath}/bronze_1.png`, textColor: "text-amber-700", frameScale: 1.5 };
  if (level <= 50) return { title: "Bronze II", tier: "bronze", frameUrl: `${basePath}/bronze_2.png`, textColor: "text-amber-600", frameScale: 1.85 };
  if (level <= 60) return { title: "Bronze III", tier: "bronze", frameUrl: `${basePath}/bronze_3.png`, textColor: "text-amber-500", frameScale: 2 };

  // PRATA (61-90)
  if (level <= 70) return { title: "Silver I", tier: "silver", frameUrl: `${basePath}/silver_1.png`, textColor: "text-slate-400", frameScale: 1.9 };
  if (level <= 80) return { title: "Silver II", tier: "silver", frameUrl: `${basePath}/silver_2.png`, textColor: "text-slate-300", frameScale: 1.95 };
  if (level <= 90) return { title: "Silver III", tier: "silver", frameUrl: `${basePath}/silver_3.png`, textColor: "text-slate-200", frameScale: 1.73 };

  // OURO (91-120)
  if (level <= 100) return { title: "Gold I", tier: "gold", frameUrl: `${basePath}/gold_1.png`, textColor: "text-yellow-600", frameScale: 2.2 };
  if (level <= 110) return { title: "Gold II", tier: "gold", frameUrl: `${basePath}/gold_2.png`, textColor: "text-yellow-500", frameScale: 2.3};
  if (level <= 120) return { title: "Gold III", tier: "gold", frameUrl: `${basePath}/gold_3.png`, textColor: "text-yellow-400", frameScale: 1.73 };

  // PLATINA (121-150)
  if (level <= 130) return { title: "Platinum I", tier: "platinum", frameUrl: `${basePath}/platinum_1.png`, textColor: "text-cyan-600", frameScale: 1.35 };
  if (level <= 140) return { title: "Platinum II", tier: "platinum", frameUrl: `${basePath}/platinum_2.png`, textColor: "text-cyan-500", frameScale: 1.35 };
  if (level <= 150) return { title: "Platinum III", tier: "platinum", frameUrl: `${basePath}/platinum_3.png`, textColor: "text-cyan-400", frameScale: 1.73 };

  // DIAMANTE (151-199) - Cinturões largos
  if (level <= 165) return { title: "Diamond I", tier: "diamond", frameUrl: `${basePath}/diamond_1.png`, textColor: "text-indigo-500", frameScale: 1.40 };
  if (level <= 180) return { title: "Diamond II", tier: "diamond", frameUrl: `${basePath}/diamond_2.png`, textColor: "text-indigo-400", frameScale: 1.40 };
  if (level <= 199) return { title: "Diamond III", tier: "diamond", frameUrl: `${basePath}/diamond_3.png`, textColor: "text-indigo-300", frameScale: 1.73 };

  // GOAT (200+) - O maior
  return { 
      title: "G.O.A.T.", 
      tier: "goat", 
      frameUrl: `${basePath}/goat.png`,
      textColor: "text-pink-500",
      frameScale: 1.50 
  };
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
  const daysLeft = Math.ceil((SEVEN_DAYS_MS - (now.getTime() - lastDate.getTime())) / (1000 * 60 * 60 * 24));
  return { xpGained: 0, updatedStats: stats, success: false, message: `Você já ganhou XP de duelo essa semana. Volte em ${daysLeft} dias.` };
}

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