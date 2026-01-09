'use client';

import Link from 'next/link';
import { Suspense } from 'react';

// Componente visual da página de erro
function NotFoundContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white p-4">
      <div className="text-center space-y-6 max-w-md">
        
        {/* Ícone ou Ilustração */}
        <div className="text-9xl font-black text-slate-800 select-none">404</div>
        
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-200 bg-clip-text text-transparent">
          Corner Errado!
        </h1>
        
        <p className="text-slate-400">
          O lutador que você está procurando não está neste evento. Verifique o link ou volte para o vestiário.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/"
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition transform hover:scale-105"
          >
            Voltar ao Início
          </Link>
          
          <Link 
            href="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition border border-slate-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}

// Exportação com Suspense para evitar erro de build
export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]"/>}>
      <NotFoundContent />
    </Suspense>
  );
}