'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return router.push('/login');
            }

            // 1. Check if Athlete
            const { data: atleta } = await supabase.from('atletas').select('id').eq('user_id', user.id).single();
            if (atleta) {
                return router.push('/painel');
            }

            // 2. Check if Fan
            const { data: fan } = await supabase.from('fans').select('id').eq('user_id', user.id).single();
            if (fan) {
                return router.push('/painel/fan');
            }

            // 3. No profile -> Registration Choice
            router.push('/cadastro');
        }

        checkUser();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
            <Loader2 size={48} className="animate-spin text-[#FFD700] mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wider">Verificando Perfil...</h2>
        </div>
    );
}
