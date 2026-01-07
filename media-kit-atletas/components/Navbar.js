'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
    Home, Search, Swords, LayoutDashboard, Trophy, 
    Bell, LogIn, User, LogOut, ShieldCheck, ChevronDown, UserCircle 
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ADMIN_EMAIL = 'prod.ph07@gmail.com';

export default function Navbar() {
    const [session, setSession] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [hasNotification, setHasNotification] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const pathname = usePathname();
    const router = useRouter();

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Busca dados
    useEffect(() => {
        const initData = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            if (currentSession) {
                const { data: profile } = await supabase
                    .from('atletas')
                    .select('*')
                    .eq('user_id', currentSession.user.id)
                    .single();
                
                if (profile) {
                    setUserData(profile);
                    
                    const { count } = await supabase
                        .from('duelos')
                        .select('*', { count: 'exact', head: true })
                        .eq('atleta_2_id', profile.id)
                        .eq('status', 'pending');
                    
                    if (count > 0) setHasNotification(true);
                }
            }
            setLoadingUser(false);
        };

        initData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if(!session) {
                setUserData(null);
                setHasNotification(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserData(null);
        router.push('/login');
    };

    const navItems = [
        { href: '/', label: 'Início', icon: <Home size={24} /> },
        { href: '/busca', label: 'Buscar', icon: <Search size={24} /> },
        { href: '/duelos', label: 'Arena', icon: <Swords size={24} /> },
        { href: '/ranking', label: 'Rank', icon: <Trophy size={24} /> },
        { 
            href: session ? '/painel' : '/login', 
            label: session ? 'Painel' : 'Entrar', 
            icon: session ? <LayoutDashboard size={24} /> : <LogIn size={24} /> 
        },
    ];

    return (
        <>
            {/* =======================
                NAVBAR SUPERIOR (DESKTOP + MOBILE HEADER)
               ======================= */}
            <nav className="sticky top-0 z-[100] w-full border-b border-slate-800 bg-[#0a0a0c] text-white h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full w-full">
                        
                        {/* 1. LOGO */}
                        <div className="flex-shrink-0 flex items-center z-20">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-black text-black italic text-lg shadow-lg shadow-yellow-500/20">
                                    N
                                </div>
                                <span className="font-bold text-lg text-white tracking-tighter">
                                    NOCAUTE<span className="text-yellow-500">.PRO</span>
                                </span>
                            </Link>
                        </div>

                        {/* 2. MENU CENTRAL (Desktop) */}
                        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                            <Link href="/" className="text-slate-300 hover:text-white font-bold text-sm transition-colors">Início</Link>
                            <Link href="/busca" className="text-slate-300 hover:text-white font-bold text-sm transition-colors">Buscar</Link>
                            <Link href="/duelos" className="text-yellow-500 hover:text-yellow-400 font-bold text-sm transition-colors flex items-center gap-1">
                                <Swords size={16}/> Arena
                            </Link>
                            <Link href="/ranking" className="text-slate-300 hover:text-white font-bold text-sm transition-colors">Ranking</Link>
                        </div>

                        {/* 3. DIREITA (User Actions) */}
                        <div className="flex items-center gap-3 md:gap-4 z-20">
                            
                            {session ? (
                                <>
                                    {/* SINO */}
                                    <Link href="/painel" className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-full border border-slate-800">
                                        <Bell size={20} />
                                        {hasNotification && (
                                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0c] animate-pulse"></span>
                                        )}
                                    </Link>

                                    {/* MOBILE: FOTO (Leva ao Perfil) */}
                                    {loadingUser ? (
                                        <div className="md:hidden w-[36px] h-[36px] rounded-full bg-slate-800 animate-pulse border border-slate-700"></div>
                                    ) : (
                                        <Link 
                                            href={`/${userData?.slug || userData?.id}`} 
                                            // AQUI ESTÁ A CORREÇÃO: Forçando dimensões fixas com estilo inline e classes '!'
                                            className="md:hidden relative rounded-full overflow-hidden border border-slate-600 bg-slate-800 block flex-shrink-0"
                                            style={{ width: '36px', height: '36px', minWidth: '36px' }}
                                        >
                                            {userData?.foto_url ? (
                                                <img 
                                                    src={userData.foto_url} 
                                                    // Forçando imagem a respeitar o pai
                                                    className="!w-full !h-full !object-cover !max-w-none" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    alt="Perfil"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={18}/></div>
                                            )}
                                        </Link>
                                    )}

                                    {/* DESKTOP: DROPDOWN */}
                                    <div className="hidden md:block relative" ref={dropdownRef}>
                                        <button 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all"
                                        >
                                            <div className="text-right min-w-[60px]">
                                                <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">{userData?.apelido || 'Atleta'}</p>
                                                <p className="text-[10px] text-yellow-500 font-bold leading-none mt-1">LVL {userData?.level || 1}</p>
                                            </div>
                                            
                                            {/* CORREÇÃO FOTO DESKTOP */}
                                            <div 
                                                className="rounded-full overflow-hidden border border-slate-500 bg-slate-700 relative flex-shrink-0"
                                                style={{ width: '36px', height: '36px', minWidth: '36px' }}
                                            >
                                                {userData?.foto_url ? (
                                                    <img 
                                                        src={userData.foto_url} 
                                                        className="!w-full !h-full !object-cover !max-w-none" 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        alt="User"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><User size={18}/></div>
                                                )}
                                            </div>
                                            <ChevronDown size={14} className="text-slate-400 mr-1"/>
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 top-12 w-52 bg-[#0a0a0c] border border-slate-800 rounded-xl shadow-2xl py-2 z-[200]">
                                                <Link href="/painel" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition-colors">
                                                    <LayoutDashboard size={18}/> Meu Painel
                                                </Link>
                                                <Link href={`/${userData?.slug || userData?.id}`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition-colors">
                                                    <UserCircle size={18}/> Perfil Público
                                                </Link>
                                                
                                                {session?.user?.email === ADMIN_EMAIL && (
                                                    <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-950/30 border-t border-slate-900 mt-1 pt-3">
                                                        <ShieldCheck size={18}/> Área Admin
                                                    </Link>
                                                )}

                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/20 border-t border-slate-900 text-left mt-1">
                                                    <LogOut size={18}/> Sair
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link href="/login" className="bg-white text-black hover:bg-slate-200 px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-white/10">
                                    <LogIn size={16}/> Entrar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* =======================
                MOBILE BOTTOM BAR
               ======================= */}
            <div 
                className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black border-t border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]"
                style={{ zIndex: 999999 }}
            >
                <div className="flex justify-around items-center h-full w-full px-1">
                    {navItems.map((item, index) => {
                        const isActive = item.href === '/' 
                            ? pathname === '/' 
                            : pathname.startsWith(item.href);
                        
                        return (
                            <Link 
                                key={index} 
                                href={item.href}
                                className={`flex-1 flex flex-col items-center justify-center h-full gap-1 active:scale-95 transition-all ${isActive ? 'text-yellow-500' : 'text-slate-500'}`}
                            >
                                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-yellow-500/10' : 'bg-transparent'}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
            
            <div className="md:hidden h-20 w-full"></div>
        </>
    );
}