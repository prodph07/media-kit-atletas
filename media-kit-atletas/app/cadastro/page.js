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
    cpf: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // --- MÁSCARA DE CPF ---
  const mascaraCPF = (value) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede de digitar mais caracteres
  };

  // --- VALIDAÇÃO MATEMÁTICA DE CPF ---
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length != 11 || 
        cpf == "00000000000" || 
        cpf == "11111111111" || 
        cpf == "22222222222" || 
        cpf == "33333333333" || 
        cpf == "44444444444" || 
        cpf == "55555555555" || 
        cpf == "66666666666" || 
        cpf == "77777777777" || 
        cpf == "88888888888" || 
        cpf == "99999999999")
            return false;
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    return true;
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = mascaraCPF(value);
    setFormData({ ...formData, [name]: value });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setMsg('As senhas não coincidem.'); setLoading(false); return;
    }
    if (!validarCPF(formData.cpf)) {
      setMsg('CPF inválido. Verifique os números.'); setLoading(false); return;
    }

    try {
      // 1. Cria usuário Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Cria perfil na tabela (COM CPF LIMPO, SOMENTE NÚMEROS)
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        
        const { error: dbError } = await supabase
          .from('atletas')
          .insert([
            {
              user_id: data.user.id,
              nome: formData.nome,
              email: formData.email,
              cpf: cpfLimpo, // Salva só numeros para facilitar busca depois
              plano: 'free'
            }
          ]);

        if (dbError) {
            // Erro de CPF duplicado (código 23505 no Postgres)
            if (dbError.code === '23505') throw new Error("Este CPF já está cadastrado.");
            throw dbError;
        }

        setMsg('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => { router.push('/painel'); }, 1500);
      }

    } catch (error) {
      console.error(error);
      setMsg('Erro: ' + (error.message || 'Tente novamente.'));
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
            <input type="text" name="nome" required className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-yellow-500" value={formData.nome} onChange={handleChange}/>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">CPF</label>
            <input type="text" name="cpf" required maxLength="14" className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-yellow-500" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange}/>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Email</label>
            <input type="email" name="email" required className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-yellow-500" value={formData.email} onChange={handleChange}/>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Senha</label>
            <input type="password" name="senha" required className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-yellow-500" value={formData.senha} onChange={handleChange}/>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Confirmar Senha</label>
            <input type="password" name="confirmarSenha" required className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-yellow-500" value={formData.confirmarSenha} onChange={handleChange}/>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded transition transform hover:scale-105">
            {loading ? 'Validando...' : 'CRIAR CONTA GRÁTIS'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Já tem conta? <Link href="/login" className="text-yellow-500 hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}