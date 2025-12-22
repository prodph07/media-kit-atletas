'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Ajuste o import conforme seu projeto (../../lib/supabase se precisar)

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [secret, setSecret] = useState('');
  
  // Estados do Formulário
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [wins, setWins] = useState('0');
  const [msg, setMsg] = useState('');

  // 1. Verifica a senha mestra (Isso é uma proteção básica de Front-end)
  // O ideal seria verificar no servidor, mas para MVP isso resolve.
  const checkAuth = () => {
    // Atenção: Em apps React 'client', variáveis de ambiente precisam começar com NEXT_PUBLIC_ 
    // SE você quiser expô-las, mas aqui faremos uma verificação manual simples ou 
    // idealmente criaríamos uma Server Action. 
    // Para simplificar MÁXIMO agora: vamos hardcoded ou confiar que só você tem o link.
    // Vamos fazer um check simples:
    if (secret === '27510756') { // Troque pela mesma senha do .env se for validar back-end
      setAuth(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const criarAtleta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Estrutura básica do JSON (Baseada no seu template)
    const dadosIniciais = {
      name: nome,
      nickname: "", 
      category: "Profissional", 
      fightingStyle: "MMA",
      record: { wins: wins, losses: "0", draws: "0", knockouts: "0", submissions: "0" },
      stats: { height: "1.75m", weight: "70kg", reach: "1.75m", age: "25" },
      socials: {
        instagram: { active: false, user: "", followers: "", url: "" },
        youtube: { active: false },
        twitter: { active: false },
        tiktok: { active: false },
        kwai: { active: false }
      },
      awards: [],
      about: "Biografia inicial...",
      fightHistory: [],
      videos: [],
      gallery: [],
      contact: { phone: "", email: "", city: "" }
    };

    const { data, error } = await supabase
      .from('atletas')
      .insert([
        { 
          slug: slug.toLowerCase().replace(/ /g, '-'), 
          nome: nome,
          foto_url: foto,
          template: 'padrao',
          dados: dadosIniciais
        }
      ])
      .select();

    if (error) {
      setMsg('Erro: ' + error.message);
    } else {
      setMsg(`✅ Atleta criado! Acesse: /${slug}`);
      // Limpar form
      setSlug('');
      setNome('');
    }
    setLoading(false);
  };

  // TELA DE BLOQUEIO
  if (!auth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-white mb-4 font-bold">Área Restrita 🔒</h1>
        <input 
          type="password" 
          placeholder="Senha Mestra" 
          className="p-2 rounded text-black mb-2"
          onChange={(e) => setSecret(e.target.value)}
        />
        <button onClick={checkAuth} className="bg-cyan-500 px-4 py-2 rounded text-black font-bold">
          Entrar
        </button>
      </div>
    );
  }

  // TELA DE CADASTRO
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Novo Atleta 🥊</h1>
        
        <form onSubmit={criarAtleta} className="space-y-4 bg-slate-800 p-6 rounded-xl">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Nome do Atleta</label>
            <input 
              className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-cyan-500 outline-none"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Anderson Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-400">Slug (Link da página)</label>
            <input 
              className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-cyan-500 outline-none"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="Ex: anderson-silva (sem espaços)"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-400">Link da Foto (URL)</label>
            <input 
              className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-cyan-500 outline-none"
              value={foto}
              onChange={e => setFoto(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-400">Vitórias Iniciais</label>
            <input 
              type="number"
              className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:border-cyan-500 outline-none"
              value={wins}
              onChange={e => setWins(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'CRIAR PÁGINA'}
          </button>

          {msg && (
            <div className={`p-4 rounded ${msg.includes('Erro') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {msg}
            </div>
          )}
        </form>

        <p className="mt-8 text-sm text-slate-500 text-center">
          Dica: Depois de criar, você pode editar os detalhes completos direto no banco de dados do Supabase se precisar.
        </p>
      </div>
    </div>
  );
}