'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <--- O ERRO ESTAVA FALTANDO ISSO AQUI

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
    } else {
      router.push('/painel');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Área do Atleta</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="text-slate-400 text-sm">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Acessar Painel'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-800">
          <Link href="/cadastro" className="text-slate-500 text-sm hover:text-white transition">
            Não tem conta? <span className="text-cyan-500 font-bold">Criar Conta Gratuitamente</span>
          </Link>
        </div>
      </div>
    </div>
  );
}