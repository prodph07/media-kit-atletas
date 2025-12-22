'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Cadastro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (formData.senha !== formData.confirmarSenha) {
      setMsg('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // 1. Cria o usuário no sistema de Autenticação (Login)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Cria o perfil na tabela 'atletas'
        // AQUI ESTÁ O SEGREDO: Salvamos o email na tabela também!
        const { error: dbError } = await supabase
          .from('atletas')
          .insert([
            {
              user_id: data.user.id,
              nome: formData.nome,
              email: formData.email, // <--- ESSA LINHA GARANTE A AUTOMAÇÃO
              plano: 'free' // Garante que começa como free
            }
          ]);

        if (dbError) throw dbError;

        setMsg('Cadastro realizado com sucesso! Redirecionando...');
        
        // Pequeno delay para o usuário ler a mensagem
        setTimeout(() => {
          router.push('/painel');
        }, 1500);
      }

    } catch (error) {
      console.error(error);
      setMsg('Erro ao cadastrar: ' + (error.message || 'Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Crie sua Conta</h1>
        <p className="text-center text-slate-400 mb-8">Comece a construir seu legado.</p>

        {msg && (
          <div className={`p-3 rounded text-center text-sm mb-4 ${msg.includes('sucesso') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Nome Completo</label>
            <input 
              type="text" 
              name="nome"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none transition"
              placeholder="Seu nome de lutador"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none transition"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Senha</label>
            <input 
              type="password" 
              name="senha"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none transition"
              placeholder="******"
              value={formData.senha}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Confirmar Senha</label>
            <input 
              type="password" 
              name="confirmarSenha"
              required
              className="w-full bg-black border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none transition"
              placeholder="******"
              value={formData.confirmarSenha}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded transition transform hover:scale-105"
          >
            {loading ? 'Criando...' : 'CRIAR CONTA GRÁTIS'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Já tem conta? <Link href="/login" className="text-yellow-500 hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}