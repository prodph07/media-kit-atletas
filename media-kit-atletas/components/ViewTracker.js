'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function ViewTracker({ profileId, profileUserId }) {
    const hasRecorded = useRef(false);

    useEffect(() => {
        // Inicializa o cliente aqui dentro para evitar avisos de instâncias múltiplas
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL, 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const registrarVisita = async () => {
            // 1. Evita duplicação em ambiente de desenvolvimento
            if (hasRecorded.current) return;
            hasRecorded.current = true;

            // 2. Verifica se já contou a visita nesta sessão do navegador (evita F5 spam)
            const sessionKey = `view_registrado_${profileId}`;
            if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
                return;
            }

            // 3. Verifica quem é o visitante
            const { data: { session } } = await supabase.auth.getSession();
            const visitorId = session?.user?.id;

            // 4. TRAVA DE SEGURANÇA: Se for o dono do perfil, cancela e não conta
            if (visitorId && visitorId === profileUserId) {
                return; 
            }

            // 5. Define o tipo de visitante (Atleta, Empresa, Evento ou Anônimo)
            let tipo = 'anonimo';
            let idVisitante = null;

            if (visitorId) {
                idVisitante = visitorId;
                const { data: perfil } = await supabase
                    .from('atletas')
                    .select('tipo_conta')
                    .eq('user_id', visitorId)
                    .single();
                
                tipo = perfil?.tipo_conta || 'atleta';
            }

            // 6. Grava a visita no banco
            const { error } = await supabase.from('profile_views').insert({
                perfil_visitado_id: profileId,
                visitante_id: idVisitante,
                visitante_tipo: tipo
            });

            // 7. Se gravou com sucesso, marca a sessão como "visitada"
            if (!error) {
                sessionStorage.setItem(sessionKey, 'true');
            }
        };

        registrarVisita();
    }, [profileId, profileUserId]);

    return null; // Componente invisível
}