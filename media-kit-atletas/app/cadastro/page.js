'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// AQUI ESTAVA O PROBLEMA: É PRECISO TER "export default function"
export default function Cadastro() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Função para criar o slug (url) amigável
  const gerarSlug = (texto) => {
    return texto
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // 1. Criar Usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.senha,
    });

    if (authError) {
      setErro("Erro no cadastro: " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Criar a linha na tabela 'atletas'
    if (authData.user) {
      const slugGerado = gerarSlug(formData.nome) + '-' + Math.floor(Math.random() * 1000);

      const { error: dbError } = await supabase
        .from('atletas')
        .insert([
          {
            user_id: authData.user.id,
            nome: formData.nome,
            slug: slugGerado,
            categoria: 'Nova Categoria',
            foto_url: '',
            atributos: { height: '', weight: '', age: '' },
            cartel: { wins: 0, losses: 0, draws: 0 },
            redes_sociais: { instagram: { active: false } },
            prox_luta: {},
            video_lista: [],
            galeria: [],
            premios: []
          }
        ]);

      if (dbError) {
        setErro("Erro ao criar perfil no banco: " + dbError.message);
      } else {
        alert("Cadastro realizado! Você será redirecionado.");
        router.push('/painel');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Criar Conta</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Crie seu Mídia Kit profissional em segundos.</p>
        
        {erro && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm border border-red-500/20">{erro}</div>}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase font-bold">Nome do Atleta</label>
            <input 
              type="text" 
              className="w-full bg-black border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none mt-1"
              placeholder="Ex: Anderson Silva"
              required
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs uppercase font-bold">Seu Melhor Email</label>
            <input 
              type="email" 
              className="w-full bg-black border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none mt-1"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-slate-400 text-xs uppercase font-bold">Senha Segura</label>
            <input 
              type="password" 
              className="w-full bg-black border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none mt-1"
              required
              minLength={6}
              value={formData.senha}
              onChange={e => setFormData({...formData, senha: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 mt-4 uppercase tracking-wide"
          >
            {loading ? 'Criando Perfil...' : 'Cadastrar Gratuitamente'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-slate-500 text-sm hover:text-white transition">
            Já tem conta? <span className="text-cyan-500 font-bold">Fazer Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}