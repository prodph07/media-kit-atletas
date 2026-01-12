'use client';
import { Crown, Zap, BarChart, Shield } from 'lucide-react';
import PremiumButton from '@/components/PremiumButton';

export default function BannerPremium({ atleta }) {

  // Se o cara já é Premium, mostra um banner de status VIP
  if (atleta.plano === 'premium') {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 to-[#1a1a1a] border border-[#FFD700]/30 rounded-sm p-6 relative overflow-hidden group mb-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold uppercase text-2xl text-[#FFD700] mb-1 flex items-center gap-2">
              <Crown size={24} className="fill-current" />
              Membro Premium
            </h3>
            <p className="text-gray-400 text-sm max-w-xl">Sua conta está em destaque máximo. O octógono é seu.</p>
          </div>

          <div className="flex-shrink-0">
            <div className="bg-[#FFD700]/20 text-[#FFD700] font-display font-bold uppercase px-6 py-2 text-sm tracking-wide rounded-sm border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.1)] flex items-center gap-2">
              <span className="material-symbols-outlined filled text-[18px]">verified</span>
              Ativo
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se for Free, mostra a oferta com o Botão de CPF Obrigatório
  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-[#1a1a1a] border border-gray-800 rounded-sm p-6 relative overflow-hidden group mb-8">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold uppercase text-2xl text-[#FFD700] mb-1 flex items-center gap-2">
            <Crown size={24} className="fill-current" />
            Banner Premium
          </h3>
          <p className="text-gray-400 text-sm max-w-xl">Acesse estatísticas avançadas, prioridade na busca de lutas e destaque na comunidade.</p>
        </div>

        {/* Usando o componente PremiumButton existente, mas estilizado ou wrappado */}
        <div className="flex-shrink-0">
          <PremiumButton user={atleta} customClass="bg-[#FFD700] hover:bg-yellow-400 text-black font-display font-bold uppercase px-6 py-2 text-sm tracking-wide rounded-sm shadow-lg shadow-yellow-500/10 transition-colors whitespace-nowrap border-none" label="Ver Vantagens" />
        </div>
      </div>
    </div>
  );
}