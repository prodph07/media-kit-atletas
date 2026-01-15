'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Trophy, MapPin, Building2, Crown, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function CompanySearchPage() {
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [search, setSearch] = useState('');
    const [filterNiche, setFilterNiche] = useState('');

    // Auth & Premium State
    const [user, setUser] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            // Check premium
            const { data: profile } = await supabase.from('atletas').select('plano').eq('user_id', user.id).single();
            if (profile?.plano === 'premium') {
                setIsPremium(true);
                fetchCompanies();
            } else {
                setIsPremium(false);
                setLoading(false);
            }
        }
        setCheckingAuth(false);
    };

    const fetchCompanies = async () => {
        const { data, error } = await supabase
            .from('atletas')
            .select('*')
            .eq('tipo_conta', 'empresa');

        if (error) {
            console.error("Erro ao buscar empresas:", error);
            alert("Erro ao buscar: " + JSON.stringify(error));
        }

        if (data) {
            console.log("Empresas encontradas:", data);
            if (data.length === 0) {
                // Fallback query to debug if 'empresa' is case sensitive or wrong
                const { count } = await supabase.from('atletas').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'Empresa');
                if (count > 0) alert("Aviso: Encontrei empresas com 'Empresa' (Maiúsculo). Ajustando filtro...");
            }
            setCompanies(data);
            setFilteredCompanies(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!companies.length) return;

        let results = companies;

        // Search by Name
        if (search) {
            const term = search.toLowerCase();
            results = results.filter(c =>
                c.nome?.toLowerCase().includes(term) ||
                c.apelido?.toLowerCase().includes(term)
            );
        }

        // Filter by Niche (Apelido/Slogan often used as niche)
        if (filterNiche) {
            results = results.filter(c => c.apelido?.toLowerCase().includes(filterNiche.toLowerCase()));
        }

        setFilteredCompanies(results);
    }, [search, filterNiche, companies]);

    if (checkingAuth) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

    if (!isPremium) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <Crown size={64} className="mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                    <h2 className="text-2xl font-bold text-white mb-2 uppercase italic">Acesso Restrito</h2>
                    <p className="text-slate-400 mb-8">A busca de empresas e patrocinadores é exclusiva para assinantes Premium.</p>
                    <Link href="/painel" className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl uppercase tracking-widest hover:scale-105 transition shadow-lg shadow-purple-900/50">
                        Seja Premium
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black text-white uppercase italic flex items-center gap-3">
                            <Building2 className="text-purple-500" /> Busca de Empresas
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Encontre patrocinadores, academias e marcas parceiras.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                        <Crown size={16} className="text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500 uppercase">Acesso Premium</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 animate-fadeIn">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-3 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div className="w-full md:w-64 relative">
                        <Filter size={20} className="absolute left-3 top-3 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filtrar por Nicho..."
                            value={filterNiche}
                            onChange={(e) => setFilterNiche(e.target.value)}
                            className="w-full bg-black border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Carregando empresas...</div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="text-center py-20 text-slate-600">
                        <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhuma empresa encontrada com os filtros atuais.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredCompanies.map(company => (
                            <Link href={`/${company.slug}`} key={company.id} className="block group">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500 transition relative h-full flex flex-col">
                                    {/* Cover / Header */}
                                    <div className="h-24 bg-gradient-to-r from-slate-950 to-slate-900 relative">
                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                                    </div>

                                    {/* Content */}
                                    {/* Content */}
                                    <div className="px-6 pb-6 flex-1 flex flex-col relative">
                                        <div className="-mt-12 mb-4 relative z-10">
                                            <div className="w-24 h-24 rounded-xl border-4 border-slate-900 bg-slate-800 shadow-lg overflow-hidden group-hover:scale-105 transition">
                                                <img
                                                    src={company.foto_url || "https://placehold.co/100?text=Logo"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100?text=Logo" }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-white uppercase italic truncate group-hover:text-purple-400 transition" title={company.nome}>{company.nome}</h3>
                                            <p className="text-purple-500 text-xs font-bold uppercase tracking-wider">{company.apelido || 'Parceiro Oficial'}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between text-slate-500 text-xs">
                                            {(company.cidade || company.estado) ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    <span className="truncate max-w-[150px]">{company.cidade ? `${company.cidade}${company.estado ? `/${company.estado}` : ''}` : company.estado}</span>
                                                </div>
                                            ) : <span>Localização não informada</span>}
                                        </div>
                                    </div>

                                    {/* Hover Effect Details */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <div className="bg-purple-600 text-white p-2 rounded-full shadow-lg shadow-purple-900/50">
                                            <Search size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
