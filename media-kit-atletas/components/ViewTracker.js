'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { processScouting, calculateNewLevelState } from '../lib/gamification';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ViewTracker({ profileId, profileUserId }) {
    const ranOnce = useRef(false);

    useEffect(() => {
        // Evita rodar duas vezes (comportamento do React Strict Mode)
        if (ranOnce.current) return;
        ranOnce.current = true;

        const trackView = async () => {
            console.log("🔍 ViewTracker: Iniciando rastreamento...");

            // 1. Identifica quem está visitando
            const { data: { session } } = await supabase.auth.getSession();
            const visitorId = session?.user?.id;
            
            // Se for o dono do perfil, cancela (não conta visita própria)
            if (visitorId === profileUserId) {
                console.log("🚫 ViewTracker: Dono do perfil visitando a si mesmo. Ignorado.");
                return;
            }

            const visitanteTipo = visitorId ? 'atleta' : 'anonimo';

            // 2. Registra a View na tabela profile_views (Estatística do perfil visitado)
            const { error: viewError } = await supabase.from('profile_views').insert({
                perfil_visitado_id: profileId,
                visitante_id: visitorId,
                visitante_tipo: visitanteTipo
            });

            if (viewError) console.error("❌ Erro ao registrar view:", viewError.message);
            else console.log("✅ View registrada com sucesso.");

            // 3. GAMIFICAÇÃO: Missão "Olheiro" (Apenas se o visitante estiver logado)
            if (visitorId) {
                console.log("🏆 Processando missão Olheiro...");

                // Busca dados do VISITANTE para atualizar o XP dele
                const { data: visitorData, error: fetchError } = await supabase
                    .from('atletas')
                    .select('xp, level, weekly_stats')
                    .eq('user_id', visitorId)
                    .single();

                if (fetchError || !visitorData) {
                    console.error("❌ Erro ao buscar dados do visitante:", fetchError);
                    return;
                }

                // Processa a lógica (incrementa contagem ou dá XP)
                // Garante que weekly_stats não seja nulo
                const statsAtuais = visitorData.weekly_stats || {};
                const scoutResult = processScouting(statsAtuais);

                // Se houve sucesso na lógica (mesmo que seja só contagem 1/3)
                if (scoutResult.success) {
                    let finalXp = visitorData.xp;
                    let finalLevel = visitorData.level;

                    // Se ganhou XP (chegou em 3/3)
                    if (scoutResult.xpGained > 0) {
                        const state = calculateNewLevelState(visitorData.xp, visitorData.level, scoutResult.xpGained);
                        finalXp = state.newXp;
                        finalLevel = state.newLevel;
                        console.log(`🎉 XP GANHO: +${scoutResult.xpGained}`);
                    }

                    // Atualiza o banco do VISITANTE
                    const { error: updateError } = await supabase.from('atletas').update({
                        xp: finalXp,
                        level: finalLevel,
                        weekly_stats: scoutResult.updatedStats
                    }).eq('user_id', visitorId);

                    if (updateError) {
                        console.error("❌ Erro ao salvar progresso do Olheiro:", updateError.message);
                    } else {
                        console.log(`✅ Progresso salvo: ${scoutResult.message}`);
                    }
                } else {
                    console.log("ℹ️ Missão Olheiro já concluída hoje ou sem alteração.");
                }
            }
        };

        trackView();
    }, [profileId, profileUserId]);

    return null; // Componente invisível
}