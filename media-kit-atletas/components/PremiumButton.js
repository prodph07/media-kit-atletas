'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Lock, Check } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ LINK DIRETO QUE VOCÊ DESCOBRIU (pay.kirvano.com)
// Esse é o link final que não sofre redirecionamento
const BASE_URL_KIRVANO = "https://pay.kirvano.com/f1fee1c5-2a1e-4710-b2bc-5fc6b883075b"; 

function validarCPF(cpf) {
  if (!cpf) return false;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length != 11) return false;
  return true;
}

export default function PremiumButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cpfInput, setCpfInput] = useState('');
  const [error, setError] = useState('');

  // Puxa o CPF do usuário se já existir
  useEffect(() => {
    if (user?.cpf) setCpfInput(user.cpf);
  }, [user]);

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    setCpfInput(value);
    setError('');
  };

  const handleClick = () => {
    const currentCpf = user?.cpf || cpfInput;
    // Se tiver CPF válido, vai direto. Se não, abre modal.
    if (currentCpf && validarCPF(currentCpf)) {
      goToCheckout(currentCpf);
    } else {
      setShowModal(true);
    }
  };

  const saveAndRedirect = async () => {
    setLoading(true);
    const cpfLimpo = cpfInput.replace(/\D/g, '');

    if (!validarCPF(cpfLimpo)) {
      setError('CPF inválido.');
      setLoading(false);
      return;
    }

    // Salva o CPF no banco antes de ir
    if (user?.id) {
        await supabase.from('atletas').update({ cpf: cpfLimpo }).eq('id', user.id);
    }
    
    goToCheckout(cpfLimpo);
  };

  const goToCheckout = (cpfValidado) => {
    try {
        const cpfFinal = cpfValidado.replace(/\D/g, '');
        
        // 1. Prepara os dados
        const nome = user?.nome || user?.name || '';
        const email = user?.email || user?.contact?.email || user?.contato?.email || '';
        
        let rawPhone = user?.contact?.phone || user?.contato?.phone || user?.phone || '';
        let phone = rawPhone.replace(/\D/g, '');
        
        // Adiciona 55 se não tiver
        if (phone.length >= 10 && !phone.startsWith('55')) {
            phone = '55' + phone;
        }

        // 2. Monta a URL Manualmente (Mais seguro que URLSearchParams nesse caso específico)
        // Usamos encodeURIComponent APENAS no nome para tratar espaços e acentos
        const params = [];
        
        if (nome) params.push(`customer.name=${encodeURIComponent(nome)}`);
        if (email) params.push(`customer.email=${email}`);
        if (cpfFinal) params.push(`customer.document=${cpfFinal}`);
        if (phone) params.push(`customer.phone=${phone}`);

        // Junta tudo com '&'
        const queryString = params.join('&');
        
        // Monta o link final
        const finalLink = `${BASE_URL_KIRVANO}?${queryString}`;

        console.log("🚀 REDIRECIONANDO PARA:", finalLink);
        
        // 3. Tchau! 👋
        window.location.href = finalLink;

    } catch (err) {
        alert("Erro no redirecionamento. Tentando link direto.");
        window.location.href = BASE_URL_KIRVANO;
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-black uppercase py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2 w-full md:w-auto justify-center"
      >
        <Lock size={18} className="text-black/70"/>
        Quero ser Premium
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >✕</button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-500">
                <Check size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Quase lá!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Confirme seu CPF para emissão da Nota Fiscal.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={cpfInput} 
                  onChange={handleCpfChange} 
                  placeholder="000.000.000-00" 
                  className={`w-full bg-black border p-3 rounded-lg text-white outline-none text-center font-mono text-lg transition ${error ? 'border-red-500' : 'border-slate-700 focus:border-yellow-500'}`}
                />
                {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
              </div>

              <button 
                onClick={saveAndRedirect} 
                disabled={loading} 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Ir para Pagamento'}
              </button>
            </div>
            
             <p className="text-[10px] text-center text-slate-600 mt-4">
                Seus dados estão seguros.
             </p>
          </div>
        </div>
      )}
    </>
  );
}