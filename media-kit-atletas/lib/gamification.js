// lib/gamification.js

// --- 1. CONFIGURAÇÃO MATEMÁTICA ---
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

export const REWARDS = {
    // Setup & Cadastro
    SETUP_BUNDLE_BASIC: 100,
    COMPLETE_PHYSICAL_STATS: 25,
    COMPLETE_FIGHT_RECORD: 50,
    ADD_AWARDS: 25,
    ADD_FIGHT_HISTORY: 25,
    JOIN_TEAM: 200,

    // Midia
    GALLERY_TIER_1: 15,
    GALLERY_TIER_2: 50,
    VIDEO_TIER_1: 15,
    VIDEO_TIER_2: 50,
    SOCIAL_PRO: 50,
    STORYTELLER: 30,
    FIGHT_VETERAN: 40,

    // Recorrência
    daily_login: 10,       // Chave minúscula para bater com a função interna
    daily_scout: 20,
    daily_respect: 10,
    daily_status: 15,
    daily_story: 100,      // I.A.
    daily_gear: 30,        // I.A.

    // Semanais / Únicas
    connection_bonus: 150,
    weight_checkin: 50,
    share_bonus: 30,
    vote_bonus: 15,
    link_in_bio: 200,      // I.A.

    // Palpites (Predictions)
    PREDICTION_WINNER: 30,    // Acertou só o vencedor
    PREDICTION_METHOD: 15,    // Bônus p/ método correto
    PREDICTION_ROUND: 15,     // Bônus p/ round correto
    PREDICTION_PERFECT: 100   // Bônus se acertar TUDO (Total = 30+15+15+100 = 160)
};

// Normaliza chaves para garantir compatibilidade (Ex: REWARDS.DAILY_LOGIN funciona igual REWARDS.daily_login)
Object.keys(REWARDS).forEach(key => {
    if (key === key.toLowerCase()) {
        REWARDS[key.toUpperCase()] = REWARDS[key];
    }
});

// --- 2. HELPERS DE DATA E TEMPO ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const getDateString = (iso) => iso ? new Date(iso).toISOString().split('T')[0] : null;

// Helper Genérico para verificar Cooldown (Diário ou Semanal)
function checkCooldown(lastDateIso, cooldownDays = 1) {
    if (!lastDateIso) return true; // Nunca fez

    const last = new Date(lastDateIso);
    const now = new Date();

    if (cooldownDays === 1) {
        // Lógica Diária: Verifica se a data (dia/mês/ano) é diferente
        return getDateString(lastDateIso) !== getTodayString();
    } else {
        // Lógica Semanal/Tempo: Verifica diferença em milissegundos
        const msDiff = now - last;
        const msInDays = cooldownDays * 24 * 60 * 60 * 1000;
        return msDiff > msInDays;
    }
}

// --- 3. CÁLCULOS DE NÍVEL ---
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

    return Math.min(100, Math.max(0, (xp / target) * 100));
}

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

// --- 4. LÓGICA DE RANKING (Refatorada para Array) ---
const RANK_TIERS = [
    { max: 10, title: "Iron I", tier: "iron", img: "iron_1.png", color: "text-zinc-500", scale: 1.4 },
    { max: 20, title: "Iron II", tier: "iron", img: "iron_2.png", color: "text-zinc-400", scale: 2 },
    { max: 30, title: "Iron III", tier: "iron", img: "iron_3.png", color: "text-zinc-300", scale: 1.9 },
    { max: 40, title: "Bronze I", tier: "bronze", img: "bronze_1.png", color: "text-amber-700", scale: 1.5 },
    { max: 50, title: "Bronze II", tier: "bronze", img: "bronze_2.png", color: "text-amber-600", scale: 1.85 },
    { max: 60, title: "Bronze III", tier: "bronze", img: "bronze_3.png", color: "text-amber-500", scale: 2 },
    { max: 70, title: "Silver I", tier: "silver", img: "silver_1.png", color: "text-slate-400", scale: 1.9 },
    { max: 80, title: "Silver II", tier: "silver", img: "silver_2.png", color: "text-slate-300", scale: 1.95 },
    { max: 90, title: "Silver III", tier: "silver", img: "silver_3.png", color: "text-slate-200", scale: 1.73 },
    { max: 100, title: "Gold I", tier: "gold", img: "gold_1.png", color: "text-yellow-600", scale: 2.2 },
    { max: 110, title: "Gold II", tier: "gold", img: "gold_2.png", color: "text-yellow-500", scale: 2.3 },
    { max: 120, title: "Gold III", tier: "gold", img: "gold_3.png", color: "text-yellow-400", scale: 1.73 },
    { max: 130, title: "Platinum I", tier: "platinum", img: "platinum_1.png", color: "text-cyan-600", scale: 1.35 },
    { max: 140, title: "Platinum II", tier: "platinum", img: "platinum_2.png", color: "text-cyan-500", scale: 1.35 },
    { max: 150, title: "Platinum III", tier: "platinum", img: "platinum_3.png", color: "text-cyan-400", scale: 1.73 },
    { max: 165, title: "Diamond I", tier: "diamond", img: "diamond_1.png", color: "text-indigo-500", scale: 1.40 },
    { max: 180, title: "Diamond II", tier: "diamond", img: "diamond_2.png", color: "text-indigo-400", scale: 1.40 },
    { max: 199, title: "Diamond III", tier: "diamond", img: "diamond_3.png", color: "text-indigo-300", scale: 1.73 },
];

export function getRankInfo(levelInput) {
    const level = Number(levelInput) || 1;
    const basePath = "/frames";

    const rank = RANK_TIERS.find(r => level <= r.max);

    if (rank) {
        return {
            title: rank.title,
            tier: rank.tier,
            frameUrl: `${basePath}/${rank.img}`,
            textColor: rank.color,
            frameScale: rank.scale
        };
    }

    return { title: "G.O.A.T.", tier: "goat", frameUrl: `${basePath}/goat.png`, textColor: "text-pink-500", frameScale: 1.50 };
}

// --- 5. PROCESSADOR DE MISSÕES (Gamification Profile) ---
export function processGamification(perfil, currentTasks = []) {
    let xpGained = 0;
    let newTasks = [...currentTasks];
    let notifications = [];

    const checkTask = (taskKey, condition, label) => {
        if (condition && !newTasks.includes(taskKey)) {
            xpGained += REWARDS[taskKey] || 0;
            newTasks.push(taskKey);
            notifications.push(`+${REWARDS[taskKey]} XP: ${label}`);
        }
    };

    // Verificações
    checkTask('SETUP_BUNDLE_BASIC', (perfil.foto_url && perfil.about && perfil.socials?.instagram?.active), 'Perfil Básico');
    checkTask('COMPLETE_PHYSICAL_STATS', (perfil.stats?.height && perfil.stats?.weight), 'Atributos Físicos');
    checkTask('COMPLETE_FIGHT_RECORD', (perfil.record?.wins !== null && perfil.record?.wins !== ''), 'Cartel');
    checkTask('ADD_AWARDS', (perfil.premios?.length > 0), 'Primeira Conquista');
    checkTask('ADD_FIGHT_HISTORY', (perfil.historico?.length > 0), 'Luta no Histórico');

    const galleryCount = perfil.galeria ? perfil.galeria.length : 0;
    checkTask('GALLERY_TIER_1', (galleryCount >= 1), 'Primeira Foto');
    checkTask('GALLERY_TIER_2', (galleryCount >= 5), 'Galeria Top');

    const videoCount = perfil.video_lista ? perfil.video_lista.length : 0;
    checkTask('VIDEO_TIER_1', (videoCount >= 1), 'Primeiro Vídeo');
    checkTask('VIDEO_TIER_2', (videoCount >= 5), 'Videoteca');

    checkTask('JOIN_TEAM', (perfil.connected_coaches?.length > 0), 'Entrou para Equipe');

    const socialCount = Object.values(perfil.socials || {}).filter(s => s.active && s.user).length;
    checkTask('SOCIAL_PRO', (socialCount >= 3), 'Influenciador');

    checkTask('STORYTELLER', (perfil.about?.length >= 100), 'Biografia Detalhada');
    checkTask('FIGHT_VETERAN', (perfil.historico?.length >= 5), 'Veterano');

    return { xpGained, newTasks, notifications };
}

// --- 6. FUNÇÕES RECORRENTES (HELPER CENTRALIZADO) ---

// Processador Genérico para reduzir código duplicado
function processTimeBasedAction(stats, dbKey, cooldownDays, rewardKey, successMsg) {
    const currentStats = stats || {};
    const lastDate = currentStats[dbKey];

    if (checkCooldown(lastDate, cooldownDays)) {
        return {
            success: true,
            xpGained: REWARDS[rewardKey] || 0,
            message: successMsg,
            updatedStats: { ...currentStats, [dbKey]: new Date().toISOString() }
        };
    }
    return { success: false, xpGained: 0, updatedStats: currentStats, message: "Aguarde o cooldown." };
}

// --- WRAPPERS (Mantendo compatibilidade com seu código antigo) ---

export function processDailyAction(stats, actionKey) {
    // actionKey ex: 'DAILY_RESPECT' -> vira 'last_daily_respect_date'
    const dbKey = `last_${actionKey.toLowerCase()}_date`;
    return processTimeBasedAction(stats, dbKey, 1, actionKey, "Missão diária cumprida!");
}

export function processWeightCheckIn(stats) {
    return processTimeBasedAction(stats, 'last_weight_update', 7, 'WEIGHT_CHECKIN', `Disciplina: Peso atualizado (+${REWARDS.WEIGHT_CHECKIN} XP)`);
}

export function processWeeklyShare(stats) {
    return processTimeBasedAction(stats, 'last_share_date', 7, 'SHARE_BONUS', `Hype: Link compartilhado (+${REWARDS.SHARE_BONUS} XP)`);
}

export function processDuelParticipation(stats) {
    return processTimeBasedAction(stats, 'last_duel_participation_date', 7, 'GLADIADOR', `Duelo: Combate realizado (+75 XP)`);
    // Obs: Adicionei GLADIADOR no REWARDS se não tiver, ou use valor fixo
}

export function processDuelVoting(stats) {
    return processTimeBasedAction(stats, 'last_vote_date', 1, 'VOTE_BONUS', `Juri Ativo: Voto computado (+${REWARDS.VOTE_BONUS} XP)`);
}

// Missões de I.A. (Wrappers para clareza)
export function processStoryMission(stats) {
    return processTimeBasedAction(stats, 'last_daily_story_date', 1, 'DAILY_STORY', "Story Validado! (+100 XP)");
}

// --- 7. PROCESSADOR UNIVERSAL DE I.A. ---
export function processAIMission(currentStats, currentTasks, missionType) {
    // 1. STORY (Diário)
    if (missionType === 'STORY_INSTAGRAM') {
        return processTimeBasedAction(currentStats, 'last_daily_story_date', 1, 'DAILY_STORY', "Story Validado! (+100 XP)");
    }

    // 2. EQUIPAMENTO (Diário)
    if (missionType === 'GEAR_CHECK') {
        return processTimeBasedAction(currentStats, 'last_daily_gear_date', 1, 'DAILY_GEAR', "Equipamento Pronto! (+30 XP)");
    }

    // 3. LINK NA BIO (Único)
    if (missionType === 'LINK_IN_BIO') {
        const tasks = [...currentTasks];
        if (!tasks.includes('LINK_IN_BIO')) {
            tasks.push('LINK_IN_BIO');
            return {
                success: true,
                xpGained: REWARDS.LINK_IN_BIO,
                updatedStats: currentStats,
                updatedTasks: tasks,
                message: "Parceiro Oficial! Link verificado. (+200 XP)"
            };
        }
        return { success: false, message: "Recompensa já resgatada." };
    }

    return { success: false, message: "Tipo de missão desconhecido." };
}

// --- 8. LÓGICAS ESPECÍFICAS (Mantidas separadas pois são complexas) ---

export function processDailyLogin(currentStats) {
    const stats = currentStats || {};
    const today = getTodayString();
    const lastLogin = getDateString(stats.last_login_date);

    if (lastLogin === today) return { success: false, updatedStats: stats };

    let streak = stats.login_streak || 0;
    let xp = REWARDS.DAILY_LOGIN;
    let message = `Login Diário (+${xp} XP)`;

    // Check Streak
    const lastDate = new Date(stats.last_login_date || 0);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) { // Aceita login no dia seguinte ou muito próximo (margem de erro)
        streak++;
        if (streak > 1) message = `🔥 ${streak} Dias Seguidos! (+${xp} XP)`;
        if (streak % 7 === 0) { xp += 100; message = `🔥 ${streak} Dias! Bônus Semanal (+${xp} XP)`; }
    } else {
        streak = 1; // Reset
    }

    return {
        success: true,
        xpGained: xp,
        updatedStats: { ...stats, last_login_date: new Date().toISOString(), login_streak: streak },
        message
    };
}

export function processScouting(currentStats) {
    const stats = currentStats || {};
    const today = getTodayString();

    // Reset se mudou o dia
    let count = (getDateString(stats.last_scout_date) === today) ? (stats.daily_scout_count || 0) : 0;

    if (count >= 3) return { success: false, updatedStats: stats };

    count++;
    const newStats = { ...stats, last_scout_date: new Date().toISOString(), daily_scout_count: count };

    if (count === 3) {
        return {
            success: true,
            xpGained: REWARDS.DAILY_SCOUT,
            message: "Olheiro: Meta batida (+20 XP)",
            updatedStats: newStats
        };
    }

    return { success: true, xpGained: 0, updatedStats: newStats, message: `Perfil visitado (${count}/3)` };
}

export function processVisitMilestone(currentViews, currentWeeklyStats) {
    // Lógica complexa de snapshots, mantida original mas limpa
    const stats = {
        visits_snapshot: 0,
        visits_xp_earned: 0,
        last_weekly_reset: new Date().toISOString(),
        ...(currentWeeklyStats || {})
    };

    // Reset semanal
    const now = new Date();
    const lastReset = new Date(stats.last_weekly_reset);
    if ((now - lastReset) > (7 * 24 * 60 * 60 * 1000)) {
        stats.visits_xp_earned = 0;
        stats.last_weekly_reset = now.toISOString();
    }

    if (stats.visits_xp_earned >= 500) return { success: false, updatedStats: stats };

    const diff = currentViews - stats.visits_snapshot;
    if (diff >= 300) {
        const milestones = Math.floor(diff / 300);
        let xp = milestones * 50;

        // Cap semanal de 500 XP
        if ((stats.visits_xp_earned + xp) > 500) xp = 500 - stats.visits_xp_earned;

        if (xp > 0) {
            return {
                success: true,
                xpGained: xp,
                message: `Viralizou! +${milestones * 300} visitas (+${xp} XP)`,
                updatedStats: {
                    ...stats,
                    visits_snapshot: stats.visits_snapshot + (milestones * 300),
                    visits_xp_earned: stats.visits_xp_earned + xp
                }
            };
        }
    }
    return { success: false, updatedStats: stats };
}

// --- 9. RESET TEMPORAL DE XP (SNAPSHOTS) ---
export function processTemporalXPResets(perfil) {
    const stats = perfil.weekly_stats || {};
    const currentXp = perfil.xp || 0;
    const now = new Date();

    let updatedStats = { ...stats };
    let hasUpdates = false;

    // --- 1. Weekly Reset (Domingo às 21:00) ---
    // Encontrar o "Alvo" (Último Domingo às 21h que já passou)
    const targetWeeklyReset = new Date(now);
    const day = targetWeeklyReset.getDay(); // 0 = Domingo
    const hour = targetWeeklyReset.getHours();

    // Se é Domingo depois das 21h, o alvo é Hoje às 21h.
    // Se não, volta para o último Domingo.
    if (day === 0 && hour >= 21) {
        targetWeeklyReset.setHours(21, 0, 0, 0);
    } else {
        // Voltar dias até chegar no domingo
        // Se for segunda (1), volta 1 dia -> Domingo.
        // Se for domingo (0) mas antes das 21h, volta 7 dias para o domingo anterior.
        const daysToGoBack = (day === 0) ? 7 : day;
        targetWeeklyReset.setDate(targetWeeklyReset.getDate() - daysToGoBack);
        targetWeeklyReset.setHours(21, 0, 0, 0);
    }

    const lastWeekly = stats.last_weekly_xp_reset ? new Date(stats.last_weekly_xp_reset) : null;

    // Se nunca teve reset, OU o último reset foi ANTES do alvo
    if (!lastWeekly || lastWeekly < targetWeeklyReset) {
        updatedStats.xp_weekly_snapshot = currentXp; // Snapshot é o XP atual na hora do reset
        updatedStats.last_weekly_xp_reset = now.toISOString(); // Marca que resetou agora
        hasUpdates = true;
    }

    // --- 2. Monthly Reset (Dia 1 de cada mês) ---
    // Checa se o mês/ano atual é diferente do mês/ano do último reset
    const lastMonthly = stats.last_monthly_xp_reset ? new Date(stats.last_monthly_xp_reset) : null;
    const isNewMonth = !lastMonthly || lastMonthly.getMonth() !== now.getMonth() || lastMonthly.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
        updatedStats.xp_monthly_snapshot = currentXp;
        updatedStats.last_monthly_xp_reset = now.toISOString();
        hasUpdates = true;
    }

    return { hasUpdates, updatedStats };
}