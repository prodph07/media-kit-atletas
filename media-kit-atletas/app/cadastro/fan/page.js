'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { User, Camera, ArrowRight, Trophy } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function CadastroFan() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apelido, setApelido] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/login');
        setUser(user);

        // Se já for atleta ou fã, redireciona
        const { data: atleta } = await supabase.from('atletas').select('id').eq('user_id', user?.id).single();
        if (atleta) router.push('/painel');

        const { data: fan } = await supabase.from('fans').select('id').eq('user_id', user?.id).single();
        if (fan) router.push('/');
    }

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (!apelido || apelido.length < 3) {
            setErrorMsg('O apelido deve ter pelo menos 3 letras.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from('fans').insert([{
                user_id: user.id,
                apelido: apelido,
                foto_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null // Tenta pegar do Google
            }]);

            if (error) {
                if (error.code === '23505') throw new Error('Este apelido já está em uso.');
                throw error;
            }

            // Sucesso
            router.push('/');

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || 'Erro ao criar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">

                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <Trophy size={32} className="text-[#FFD700]" />
                    </div>
                    <h1 className="text-3xl font-display font-bold uppercase tracking-tight mb-2">Criar Perfil de Fã</h1>
                    <p className="text-slate-400 text-sm">Crie sua identidade para fazer palpites e subir no ranking.</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm mb-4 text-center font-bold">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleCreateProfile} className="space-y-6 relative z-10">

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Escolha seu Apelido</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-500" size={20} />
                            <input
                                type="text"
                                value={apelido}
                                onChange={(e) => setApelido(e.target.value)}
                                className="w-full bg-black border border-slate-700 p-3 pl-10 rounded-lg text-white outline-none focus:border-purple-500 transition font-bold"
                                placeholder="Ex: TheKing, Nocauteador99..."
                            />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1">Este nome aparecerá nos rankings.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                        {loading ? 'Criando...' : 'Iniciar Jornada'} <ArrowRight size={20} />
                    </button>
                </form>

            </div>
        </div>
    );
}
