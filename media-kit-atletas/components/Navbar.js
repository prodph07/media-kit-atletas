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
            if (!session) {
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
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .material-symbols-outlined.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            `}</style>

            {/* =======================
                NAVBAR SUPERIOR (DESKTOP + MOBILE HEADER)
               ======================= */}
            <header className="sticky top-0 z-[100] w-full border-b border-[#222] bg-[#0a0a0c] text-white h-16 shadow-md transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full w-full">

                        {/* 1. LOGO */}
                        <div className="flex items-center gap-2 cursor-pointer group">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-5 w-5 bg-[#FFD700] flex items-center justify-center rounded-sm group-hover:bg-yellow-400 transition-colors">
                                    <span className="font-display font-bold text-black text-xs">N</span>
                                </div>
                                <h1 className="font-display font-bold text-base tracking-tight text-white uppercase group-hover:text-gray-200 transition-colors">
                                    NOCAUTE<span className="text-[#FFD700]">.PRO</span>
                                </h1>
                            </Link>
                        </div>

                        {/* 2. MENU CENTRAL (Desktop) */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/" className="font-display font-bold text-sm text-gray-400 hover:text-white uppercase tracking-wide transition-colors">Início</Link>
                            <Link href="/busca" className="font-display font-bold text-sm text-gray-400 hover:text-white uppercase tracking-wide transition-colors">Buscar</Link>
                            <Link href="/duelos" className="flex items-center gap-1.5 font-display font-bold text-sm text-[#FFD700] uppercase tracking-wide transition-colors">
                                <span className="material-symbols-outlined text-[18px]">swords</span>
                                Arena
                            </Link>
                            <Link href="/ranking" className="font-display font-bold text-sm text-gray-400 hover:text-white uppercase tracking-wide transition-colors">Ranking</Link>
                        </nav>

                        {/* 3. DIREITA (User Actions) */}
                        <div className="flex items-center gap-4 lg:gap-6">

                            {session ? (
                                <>
                                    {/* Notifications */}
                                    <Link href="/painel" className="relative text-gray-400 hover:text-white transition-colors" title="Notifications">
                                        <span className="material-symbols-outlined">notifications</span>
                                        {hasNotification && (
                                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 shadow-sm animate-pulse"></span>
                                        )}
                                    </Link>

                                    {/* Desktop Profile Pill (Dropdown Trigger) */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="hidden md:flex items-center gap-3 bg-[#161616] border border-[#333] pl-3 pr-1 py-1 rounded-full cursor-pointer hover:border-gray-600 transition-colors"
                                        >
                                            <div className="flex flex-col items-end leading-none">
                                                <span className="font-display font-bold text-xs text-white uppercase max-w-[100px] truncate">{userData?.apelido || 'Atleta'}</span>
                                                <span className="font-display font-bold text-[10px] text-[#FFD700]">LVL {userData?.level || 1}</span>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                                                {userData?.foto_url ? (
                                                    <img alt="User" className="h-full w-full object-cover" src={userData.foto_url} />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-500"><User size={16} /></div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Mobile Profile Icon (Just the image) */}
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="md:hidden h-8 w-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden"
                                        >
                                            {userData?.foto_url ? (
                                                <img alt="User" className="h-full w-full object-cover" src={userData.foto_url} />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-500"><User size={16} /></div>
                                            )}
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 top-12 w-52 bg-[#0a0a0c] border border-[#333] rounded-sm shadow-2xl py-2 z-[200]">
                                                <Link href="/painel" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-display uppercase tracking-wide text-gray-400 hover:bg-[#161616] hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">dashboard</span> Meu Painel
                                                </Link>
                                                <Link href={`/${userData?.slug || userData?.id}`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-display uppercase tracking-wide text-gray-400 hover:bg-[#161616] hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">person</span> Perfil Público
                                                </Link>

                                                {session?.user?.email === ADMIN_EMAIL && (
                                                    <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-display uppercase tracking-wide text-cyan-400 hover:bg-cyan-950/30 border-t border-[#222] mt-1 pt-3">
                                                        <span className="material-symbols-outlined text-[18px]">verified_user</span> Área Admin
                                                    </Link>
                                                )}

                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-display uppercase tracking-wide text-red-500 hover:bg-red-950/20 border-t border-[#222] text-left mt-1">
                                                    <span className="material-symbols-outlined text-[18px]">logout</span> Sair
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link href="/login" className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full text-sm font-bold uppercase transition flex items-center gap-2 shadow-lg shadow-white/10">
                                    <span className="material-symbols-outlined text-[18px]">login</span> Entrar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* =======================
                MOBILE BOTTOM BAR
               ======================= */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 px-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.8)]"
            >
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item, index) => {
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);

                        // Special styling for "Arena" (index 2 usually, or check styling/label)
                        // In navItems: 0=Home, 1=Search, 2=Arena, 3=Rank, 4=Panel
                        const isSpecial = item.label === 'Arena';

                        if (isSpecial) {
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex flex-col items-center justify-center gap-1 text-[#FFD700] group w-full relative -top-4"
                                >
                                    <div className={`bg-[#1a1a1a] border ${isActive ? 'border-[#FFD700]' : 'border-gray-700'} p-3 rounded-full shadow-lg shadow-black group-hover:border-[#FFD700] transition-colors`}>
                                        <span className="material-symbols-outlined text-[24px]">swords</span>
                                    </div>
                                    <span className="text-[10px] font-display font-bold uppercase tracking-wide text-[#FFD700]">Arena</span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 group w-full transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${isActive ? 'filled' : ''}`}>
                                    {item.label === 'Início' && 'home'}
                                    {item.label === 'Buscar' && 'search'}
                                    {item.label === 'Rank' && 'emoji_events'}
                                    {item.label === 'Painel' && 'dashboard'}
                                    {item.label === 'Entrar' && 'login'}
                                </span>
                                <span className="text-[10px] font-display font-bold uppercase tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="md:hidden h-20 w-full hidden"></div>
        </>
    );
}