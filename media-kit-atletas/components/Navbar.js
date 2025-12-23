'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, User, Menu, X, Trophy } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Verifica se tem usuário logado
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [pathname]); // Roda toda vez que muda de página

  // Estilo para link ativo
  const linkClass = (path) => 
    `text-sm font-bold transition hover:text-yellow-500 ${pathname === path ? 'text-yellow-500' : 'text-slate-300'}`;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-yellow-500 text-black p-1 rounded font-black text-xl group-hover:scale-110 transition">NP</div>
                <span className="font-bold text-white tracking-wide">NOCAUTE<span className="text-yellow-500">PAGES</span></span>
            </Link>

            {/* LINKS (DESKTOP) */}
            <div className="hidden md:flex items-center gap-8">
                <Link href="/busca" className={linkClass('/busca')}>BUSCAR ATLETAS</Link>
                
                {user ? (
                    <Link href="/painel" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded font-bold transition flex items-center gap-2">
                        <User size={18}/> MEU PAINEL
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className={linkClass('/login')}>ENTRAR</Link>
                        <Link href="/cadastro" className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded font-bold transition">
                            CRIAR CONTA
                        </Link>
                    </div>
                )}
            </div>

            {/* MENU MOBILE (HAMBURGUER) */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
                {menuOpen ? <X size={28}/> : <Menu size={28}/>}
            </button>
        </div>
      </div>

      {/* MENU MOBILE EXPANDIDO */}
      {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-4 shadow-2xl">
              <Link href="/busca" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-slate-300 py-2 border-b border-slate-800">
                  <Search size={18}/> Buscar Atletas
              </Link>
              
              {user ? (
                  <Link href="/painel" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-yellow-500 font-bold py-2">
                      <User size={18}/> Acessar Painel
                  </Link>
              ) : (
                  <>
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="text-slate-300 py-2">Login</Link>
                      <Link href="/cadastro" onClick={() => setMenuOpen(false)} className="bg-yellow-500 text-black text-center py-3 rounded font-bold">CRIAR CONTA GRÁTIS</Link>
                  </>
              )}
          </div>
      )}
    </nav>
  );
}