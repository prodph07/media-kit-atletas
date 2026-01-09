'use client';
import { Crown, Zap, BarChart, Shield } from 'lucide-react';
import PremiumButton from '@/components/PremiumButton';

export default function BannerPremium({ atleta }) {
  
  // Se o cara já é Premium, mostra um banner de status VIP
  if (atleta.plano === 'premium') {
    return (
      <div className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-xl p-6 text-black shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Crown size={200} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
            <div className="bg-black/20 p-3 rounded-full">
                <Crown size={32} className="text-black"/>
            </div>
            <div>
                <h2 className="text-2xl font-black uppercase">Membro Premium</h2>
                <p className="font-medium opacity-80">Sua conta está em destaque máximo. O octógono é seu.</p>
            </div>
        </div>
      </div>
    );
  }

  // Se for Free, mostra a oferta com o Botão de CPF Obrigatório
  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-yellow-500/30 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden group">
      
      {/* Efeito de brilho no fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Texto de Venda */}
        <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Zap size={12} fill="currentColor"/> Oferta Exclusiva
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white italic">
                DESBLOQUEIE SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">POTENCIAL MÁXIMO</span>
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Atletas Premium têm <strong>5x mais visibilidade</strong>, estatísticas avançadas de luta e aparecem no topo das buscas de olheiros e eventos.
            </p>

            {/* Lista de Vantagens */}
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1"><Shield size={14} className="text-yellow-500"/> Selo de Verificação</span>
                <span className="flex items-center gap-1"><BarChart size={14} className="text-yellow-500"/> Analytics Completo</span>
                <span className="flex items-center gap-1"><Crown size={14} className="text-yellow-500"/> Destaque na Home</span>
            </div>
        </div>

        {/* O BOTÃO BLINDADO AQUI */}
        <div className="flex-shrink-0">
            <PremiumButton user={atleta} />
            <p className="text-[10px] text-center text-slate-500 mt-2">
                Apenas R$ 9,90 / mês. Cancele quando quiser.
            </p>
        </div>

      </div>
    </div>
  );
}