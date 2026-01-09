'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralListener() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    
    if (ref) {
      // Salva no navegador por 30 dias
      // Se a pessoa fechar o site e voltar amanhã pra cadastrar, ainda conta.
      localStorage.setItem('fightnexus_referral', ref);
      console.log('Indicação detectada:', ref);
    }
  }, [searchParams]);

  return null; // Este componente não renderiza nada visualmente
}