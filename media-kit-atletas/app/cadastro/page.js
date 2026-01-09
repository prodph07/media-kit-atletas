'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react'; // Importei o ícone de loading

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
  const [googleLoading, setGoogleLoading] = useState(false); // Loading do Google
  const [msg, setMsg] = useState('');
  const [referrerId, setReferrerId] = useState(null);

  // --- BUSCA INDICAÇÃO AO CARREGAR ---
  useEffect(() => {
    async function checkReferral() {
      if (typeof window !== 'undefined') {
        const referralSlug = localStorage.getItem('fightnexus_referral');
        if (referralSlug) {
          const { data } = await supabase
            .from('atletas')
            .select('id')
            .eq('slug', referralSlug)
            .single();
          
          if (data) {
            setReferrerId(data.id);
            console.log("Cadastro com indicação de ID:", data.id);
          }
        }
      }
    }
    checkReferral();
  }, []);

  // --- LOGIN COM GOOGLE ---
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Tenta passar o referral ID nos metadados (para uso futuro no trigger)
          data: {
             invited_by_id: referrerId 
          }
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erro Google:", error);
      setMsg('Erro ao conectar com Google.');
      setGoogleLoading(false);
    }
  };

  // --- FUNÇÕES AUXILIARES ---
  const gerarSlug = (texto) => {
    return texto.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const mascaraCPF = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1'); 
  };

  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    if (cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999") return false;
    let add = 0; for (let i = 0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11); if (rev == 10 || rev == 11) rev = 0; if (rev != parseInt(cpf.charAt(9))) return false;
    add = 0; for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11); if (rev == 10 || rev == 11) rev = 0; if (rev != parseInt(cpf.charAt(10))) return false;
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

    if (formData.senha !== formData.confirmarSenha) { setMsg('As senhas não coincidem.'); setLoading(false); return; }
    if (!validarCPF(formData.cpf)) { setMsg('CPF inválido. Verifique os números.'); setLoading(false); return; }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            throw new Error('Este email já está cadastrado. Tente fazer login.');
        }
        throw error;
      }

      if (data.user) {
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        const slugFinal = `${gerarSlug(formData.nome)}-${Math.floor(Math.random() * 10000)}`;

        const { error: dbError } = await supabase
          .from('atletas')
          .insert([{
              user_id: data.user.id,
              nome: formData.nome,
              email: formData.email,
              cpf: cpfLimpo,
              slug: slugFinal,
              plano: 'free',
              invited_by: referrerId
            }]);

        if (dbError) {
            if (dbError.code === '23505') throw new Error("Este CPF já está cadastrado.");
            throw dbError;
        }

        if (typeof window !== 'undefined') localStorage.removeItem('fightnexus_referral');

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

        {referrerId && (
            <div className="mb-6 text-center text-xs text-green-400 bg-green-900/20 py-2 rounded border border-green-900/50">
                ✨ Você foi indicado por um parceiro!
            </div>
        )}

        {/* --- BOTÃO DE CADASTRO COM GOOGLE --- */}
        <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full bg-white hover:bg-gray-100 text-slate-900 font-bold py-3 rounded-lg transition mb-6 flex items-center justify-center gap-3"
        >
            {googleLoading ? (
                <Loader2 size={20} className="animate-spin text-slate-600"/>
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            )}
            Cadastrar com Google
        </button>

        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-500 text-xs uppercase">ou use seu email</span>
            <div className="h-px bg-slate-800 flex-1"></div>
        </div>

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

          <button type="submit" disabled={loading || googleLoading} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded transition transform hover:scale-105">
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