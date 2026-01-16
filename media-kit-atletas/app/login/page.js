'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Inicializa o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Loading específico do Google
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN COM EMAIL/SENHA ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      });

      if (error) throw error;

      if (data.user) {
        // Verifica se é Atleta
        const { data: atleta } = await supabase.from('atletas').select('id').eq('user_id', data.user.id).single();
        if (atleta) return router.push('/painel');

        // Verifica se é Fã
        const { data: fan } = await supabase.from('fans').select('id').eq('user_id', data.user.id).single();
        if (fan) return router.push('/painel/fan');

        // Se não tem perfil em LUGAR NENHUM, manda para a tela de ESCOLHA, onde ele decide se é Atleta, Fan ou Empresa
        router.push('/cadastro');
      }
    } catch (error) {
      console.error(error);
      setMsg('Erro: Verifique email e senha.');
      setLoading(false);
    }
  };

  // --- LOGIN COM GOOGLE ---
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redireciona para o painel após o Google devolver o usuário
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // O redirecionamento é automático pelo Supabase, não precisa de router.push aqui
    } catch (error) {
      console.error("Erro Google:", error);
      setMsg('Erro ao conectar com Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-400">Entre para gerenciar seu perfil.</p>
        </div>

        {msg && (
          <div className="p-3 rounded text-center text-sm mb-4 bg-red-500/20 text-red-400 border border-red-500/50">
            {msg}
          </div>
        )}

        {/* --- BOTÃO DO GOOGLE --- */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full bg-white hover:bg-gray-100 text-slate-900 font-bold py-3 rounded-lg transition mb-6 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <Loader2 size={20} className="animate-spin text-slate-600" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Entrar com Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-slate-500 text-xs uppercase">ou use seu email</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-yellow-500 transition"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Senha</label>
            <input
              type="password"
              name="senha"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-yellow-500 transition"
              value={formData.senha}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Não tem conta? <Link href="/cadastro" className="text-yellow-500 hover:underline font-bold">Crie grátis</Link>
        </p>
      </div>
    </div>
  );
}