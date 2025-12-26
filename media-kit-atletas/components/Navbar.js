'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Menu, X, Swords, LogIn, Search, LayoutDashboard } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // Função segura para buscar sessão
    const fetchSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                // Se der erro de token inválido, forçamos logout local para limpar
                console.log("Sessão inválida, limpando...", error.message);
                await supabase.auth.signOut();
                setSession(null);
                return;
            }
            setSession(session);
        } catch (err) {
            console.error("Erro inesperado na auth:", err);
            setSession(null);
        }
    };

    fetchSession();

    // Escuta mudanças em tempo real (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0a0a0c]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded flex items-center justify-center font-black text-black italic text-lg">
                    N
                </div>
                <span className="font-bold text-lg text-white tracking-tighter">
                    NOCAUTE<span className="text-yellow-500">.PAGES</span>
                </span>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              
              <Link href="/busca" className="text-slate-300 hover:text-white transition-colors text-sm font-bold flex items-center gap-1">
                <Search size={16}/> BUSCAR ATLETAS
              </Link>

              {/* BOTÃO DE DUELOS */}
              <Link href="/duelos" className="text-slate-300 hover:text-yellow-500 transition-colors text-sm font-bold flex items-center gap-1">
                <Swords size={18}/> DUELOS
              </Link>

              {session ? (
                 <Link href="/painel" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 border border-slate-700">
                    <LayoutDashboard size={16}/> MEU PAINEL
                 </Link>
              ) : (
                 <Link href="/login" className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-black transition flex items-center gap-2">
                    <LogIn size={16}/> ENTRAR
                 </Link>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (Expandable) */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0c] border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/busca" className="text-slate-300 hover:text-white block px-3 py-4 rounded-md text-base font-bold border-b border-slate-800">
               <div className="flex items-center gap-2"><Search size={18}/> Buscar Atletas</div>
            </Link>
            
            <Link href="/duelos" className="text-yellow-500 hover:text-yellow-400 block px-3 py-4 rounded-md text-base font-bold border-b border-slate-800">
               <div className="flex items-center gap-2"><Swords size={18}/> Arena de Duelos</div>
            </Link>

            {session ? (
                <Link href="/painel" className="text-white block px-3 py-4 rounded-md text-base font-bold bg-slate-800/50 mt-2">
                    <div className="flex items-center gap-2"><LayoutDashboard size={18}/> Acessar Painel</div>
                </Link>
            ) : (
                <div className="grid grid-cols-2 gap-2 mt-4 px-2">
                    <Link href="/login" className="text-center text-slate-300 block px-3 py-3 rounded-md text-base font-bold border border-slate-700">
                        Login
                    </Link>
                    <Link href="/cadastro" className="text-center bg-yellow-500 text-black block px-3 py-3 rounded-md text-base font-black">
                        Criar Conta
                    </Link>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}