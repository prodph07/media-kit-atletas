'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Users, DollarSign, AlertTriangle, 
    Search, ExternalLink, ShieldCheck, MapPin, 
    ArrowUpRight, Crown, Loader2, Swords, UserPlus, Clock, 
    ChevronLeft, ChevronRight, UserMinus, TrendingUp 
} from 'lucide-react';

const ADMIN_EMAIL = 'prod.ph07@gmail.com';

const getRankName = (level) => {
    if (level <= 10) return "Iron";
    if (level <= 30) return "Bronze";
    if (level <= 60) return "Silver";
    if (level <= 90) return "Gold";
    if (level <= 120) return "Platinum";
    if (level <= 165) return "Diamond";
    return "GOAT";
};

export default function AdminPanel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    
    // --- ESTADOS ---
    const [userPage, setUserPage] = useState(1);
    const [logPage, setLogPage] = useState(1);
    const USERS_PER_PAGE = 10;
    const LOGS_PER_PAGE = 5;

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('');
    const [filterRank, setFilterRank] = useState('');
    const [filterInactivity, setFilterInactivity] = useState('');
    const [filterType, setFilterType] = useState('');

    // Gráfico
    const [growthRange, setGrowthRange] = useState(7);
    const [dailyGrowthData, setDailyGrowthData] = useState([]);

    // Métricas
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        churnRisk: 0,
        grossRevenue: 0,
        netRevenue: 0,
        growth30Days: 0,
        growthPercentage: 0
    });

    useEffect(() => {
        checkAuthAndFetchData();
    }, []);

    useEffect(() => {
        if(users.length > 0) calculateGrowthChart(users, growthRange);
    }, [users, growthRange]);

    const checkAuthAndFetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== ADMIN_EMAIL) {
            alert("Acesso Negado.");
            router.push('/');
            return;
        }

        const { data: atletas, error: errAtletas } = await supabase
            .from('atletas')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: duelos, error: errDuelos } = await supabase
            .from('duelos')
            .select('id, created_at, atleta_1_id, atleta_2_id, p1:atletas!atleta_1_id(nome, apelido), p2:atletas!atleta_2_id(nome, apelido)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (errAtletas) { console.error(errAtletas); return; }

        processMetrics(atletas);
        generateLogs(atletas, duelos || []);
        setUsers(atletas);
        setLoading(false);
    };

    // --- LÓGICA ---
    const calculateGrowthChart = (allUsers, days) => {
        const chartData = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const count = allUsers.filter(u => u.created_at.startsWith(dateString)).length;
            chartData.push({ date: `${date.getDate()}/${date.getMonth()+1}`, count, fullDate: dateString });
        }
        setDailyGrowthData(chartData);
    };

    const processMetrics = (data) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let premiumCount = 0;
        let churnCount = 0;
        let newUsersCount = 0;

        data.forEach(user => {
            if (user.plano === 'premium') premiumCount++;
            const lastLogin = user.weekly_stats?.last_login_date ? new Date(user.weekly_stats.last_login_date) : null;
            if (!lastLogin || lastLogin < thirtyDaysAgo) churnCount++;
            const joinedAt = new Date(user.created_at);
            if (joinedAt > thirtyDaysAgo) newUsersCount++;
        });

        const previousTotal = data.length - newUsersCount;
        const growthPercentage = previousTotal > 0 ? ((newUsersCount / previousTotal) * 100).toFixed(1) : 100;

        setMetrics({
            totalUsers: data.length,
            premiumUsers: premiumCount,
            freeUsers: data.length - premiumCount,
            churnRisk: churnCount,
            grossRevenue: premiumCount * 9.97,
            netRevenue: premiumCount * 8.97,
            growth30Days: newUsersCount,
            growthPercentage
        });
    };

    const generateLogs = (atletas, duelos) => {
        const logs = [];
        atletas.forEach(user => {
            logs.push({
                type: user.plano === 'premium' ? 'premium_signup' : 'signup',
                date: new Date(user.created_at),
                title: user.plano === 'premium' ? 'Novo Assinante Premium' : 'Novo Cadastro',
                message: `${user.apelido || user.nome} entrou na plataforma.`,
                icon: user.plano === 'premium' ? <Crown size={16} className="text-yellow-500"/> : <UserPlus size={16} className="text-cyan-400"/>,
                color: user.plano === 'premium' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-cyan-500/50 bg-cyan-500/10'
            });
        });
        duelos.forEach(duelo => {
            logs.push({
                type: 'duel',
                date: new Date(duelo.created_at),
                title: 'Duelo Criado',
                message: `${duelo.p1?.apelido} desafiou ${duelo.p2?.apelido}`,
                icon: <Swords size={16} className="text-red-500"/>,
                color: 'border-red-500/50 bg-red-500/10'
            });
        });
        setRecentActivity(logs.sort((a, b) => b.date - a.date));
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = 
                user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.apelido?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const planMatch = filterPlan ? user.plano === filterPlan : true;
            const userRank = getRankName(user.level || 1);
            const rankMatch = filterRank ? userRank === filterRank : true;

            let typeMatch = true;
            if (filterType === 'coach') typeMatch = user.is_coach;
            if (filterType === 'athlete') typeMatch = user.is_athlete;

            let inactivityMatch = true;
            if (filterInactivity) {
                const daysInactive = user.weekly_stats?.last_login_date 
                    ? Math.floor((new Date() - new Date(user.weekly_stats.last_login_date)) / (1000 * 60 * 60 * 24))
                    : 999;
                
                if (filterInactivity === '7') inactivityMatch = daysInactive >= 7;
                if (filterInactivity === '15') inactivityMatch = daysInactive >= 15;
                if (filterInactivity === '30') inactivityMatch = daysInactive >= 30;
            }

            return searchMatch && planMatch && rankMatch && typeMatch && inactivityMatch;
        });
    }, [users, searchTerm, filterPlan, filterRank, filterType, filterInactivity]);

    const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);
    const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    const paginatedLogs = recentActivity.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);
    const totalLogPages = Math.ceil(recentActivity.length / LOGS_PER_PAGE);

    const togglePremium = async (userId, currentPlan) => {
        const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
        if(!confirm(`Alterar plano para ${newPlan.toUpperCase()}?`)) return;

        const { error } = await supabase.from('atletas').update({ plano: newPlan }).eq('id', userId);
        if (!error) {
            const updatedUsers = users.map(u => u.id === userId ? { ...u, plano: newPlan } : u);
            setUsers(updatedUsers);
            processMetrics(updatedUsers);
            setRecentActivity(prev => [{
                type: 'admin_change',
                date: new Date(),
                title: 'Alteração Manual',
                message: `Admin alterou plano de usuário para ${newPlan}.`,
                icon: newPlan === 'premium' ? <Crown size={16}/> : <UserMinus size={16}/>,
                color: 'border-slate-500 bg-slate-800'
            }, ...prev]);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando Admin...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER RESPONSIVO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <ShieldCheck className="text-cyan-500"/> GOD MODE
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">Visão Geral do Sistema</p>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right">
                        <span className="text-[10px] bg-slate-900 px-3 py-1 rounded border border-slate-800 text-slate-400 font-mono block md:inline-block text-center">{ADMIN_EMAIL}</span>
                    </div>
                </div>

                {/* --- KPI CARDS (Grid 2 colunas mobile, 4 desktop) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                        <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Base Total</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white">{metrics.totalUsers}</h2>
                        <div className="absolute top-4 right-4 text-slate-700"><Users size={20}/></div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                        <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Receita Líquida</p>
                        <h2 className="text-2xl md:text-3xl font-black text-green-400">R$ {metrics.netRevenue.toFixed(0)}</h2>
                        <div className="absolute top-4 right-4 text-green-900"><DollarSign size={20}/></div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                        <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Assinantes</p>
                        <h2 className="text-2xl md:text-3xl font-black text-yellow-500">{metrics.premiumUsers}</h2>
                        <div className="absolute top-4 right-4 text-yellow-900"><Crown size={20}/></div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                        <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Risco Churn</p>
                        <h2 className="text-2xl md:text-3xl font-black text-red-500">{metrics.churnRisk}</h2>
                        <div className="absolute top-4 right-4 text-red-900"><AlertTriangle size={20}/></div>
                    </div>
                </div>

                {/* --- GRÁFICO DE CRESCIMENTO --- */}
                <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 w-full md:w-auto">
                            <TrendingUp size={18} className="text-cyan-500"/> Crescimento Diário
                        </h3>
                        {/* Botões ocupam largura total no mobile */}
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 w-full md:w-auto">
                            {[7, 15, 30].map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setGrowthRange(d)}
                                    className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded ${growthRange === d ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {d} Dias
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
                        {dailyGrowthData.map((item, idx) => {
                            const maxVal = Math.max(...dailyGrowthData.map(i => i.count), 1);
                            const heightPct = (item.count / maxVal) * 100;
                            
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                    <div className="hidden md:block absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 border border-slate-700">
                                        {item.count} usuários em {item.date}
                                    </div>
                                    <div 
                                        className={`w-full rounded-t transition-all duration-500 ${item.count > 0 ? 'bg-cyan-500' : 'bg-slate-800 h-[2px]'}`}
                                        style={{ height: item.count > 0 ? `${heightPct}%` : '2px' }}
                                    ></div>
                                    {/* Esconde labels no mobile se tiver muitos dias */}
                                    <span className={`text-[8px] md:text-[9px] text-slate-500 mt-2 truncate w-full text-center ${growthRange === 30 && idx % 3 !== 0 ? 'hidden md:block' : ''}`}>
                                        {item.date}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LOGS DE ATIVIDADE */}
                    <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                        <div className="p-4 md:p-6 border-b border-slate-800">
                            <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2"><Clock size={16}/> Logs de Atividade</h3>
                        </div>
                        <div className="p-4 flex-1 space-y-3">
                            {paginatedLogs.map((log, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${log.color} flex gap-3 items-start relative overflow-hidden`}>
                                    <div className="mt-1">{log.icon}</div>
                                    <div className="overflow-hidden">
                                        <p className="text-white font-bold text-xs truncate">{log.title}</p>
                                        <p className="text-slate-400 text-[10px] leading-tight mb-1 truncate">{log.message}</p>
                                        <p className="text-slate-600 text-[9px]">{log.date.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs">
                            <button onClick={() => setLogPage(p => Math.max(1, p-1))} disabled={logPage===1} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16}/></button>
                            <span className="text-slate-500">{logPage} / {totalLogPages}</span>
                            <button onClick={() => setLogPage(p => Math.min(totalLogPages, p+1))} disabled={logPage===totalLogPages} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={16}/></button>
                        </div>
                    </div>

                    {/* ASSINATURAS (Barras Laterais) */}
                    <div className="lg:col-span-2 bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800">
                        <h3 className="text-white font-bold text-sm uppercase mb-6 flex items-center gap-2"><LayoutDashboard size={16}/> Assinaturas</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-yellow-500 font-bold uppercase flex items-center gap-1"><Crown size={12}/> Premium</span>
                                    <span className="text-white font-mono">{metrics.premiumUsers} usuários</span>
                                </div>
                                <div className="w-full bg-slate-950 h-6 rounded-md overflow-hidden border border-slate-800 relative">
                                    <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.premiumUsers / metrics.totalUsers) * 100, 2)}%` }}></div>
                                    <span className="absolute right-2 top-1 text-[10px] text-white font-bold z-10">{((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400 font-bold uppercase flex items-center gap-1"><Users size={12}/> Grátis</span>
                                    <span className="text-white font-mono">{metrics.freeUsers} usuários</span>
                                </div>
                                <div className="w-full bg-slate-950 h-6 rounded-md overflow-hidden border border-slate-800 relative">
                                    <div className="bg-slate-600 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.freeUsers / metrics.totalUsers) * 100, 2)}%` }}></div>
                                    <span className="absolute right-2 top-1 text-[10px] text-white font-bold z-10">{((metrics.freeUsers / metrics.totalUsers) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABELA DE USUÁRIOS --- */}
                <div className="bg-slate-900 rounded-xl border border-slate-800">
                    <div className="p-4 md:p-6 border-b border-slate-800">
                        <div className="flex flex-col gap-4 mb-6">
                            <h3 className="text-white font-bold text-lg">Gerenciar Atletas</h3>
                            
                            {/* SEARCH BAR FULL WIDTH ON MOBILE */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={16}/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nome..." 
                                    className="bg-black border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:border-cyan-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setUserPage(1); }}
                                />
                            </div>
                        </div>

                        {/* FILTROS EM GRID RESPONSIVO (2 colunas mobile, flex desktop) */}
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                            <select onChange={(e) => { setFilterPlan(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto">
                                <option value="">Todos Planos</option>
                                <option value="premium">Premium</option>
                                <option value="free">Free</option>
                            </select>
                            
                            <select onChange={(e) => { setFilterRank(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto">
                                <option value="">Todos Ranks</option>
                                <option value="Iron">Iron</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                                <option value="Diamond">Diamond</option>
                                <option value="GOAT">GOAT</option>
                            </select>

                            <select onChange={(e) => { setFilterInactivity(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto">
                                <option value="">Inatividade</option>
                                <option value="7">7+ Dias Off</option>
                                <option value="15">15+ Dias Off</option>
                                <option value="30">30+ Dias Off (Churn)</option>
                            </select>

                            <select onChange={(e) => { setFilterType(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto">
                                <option value="">Todos Tipos</option>
                                <option value="athlete">Apenas Atletas</option>
                                <option value="coach">Apenas Coaches</option>
                            </select>
                        </div>
                    </div>

                    {/* TABELA COM SCROLL HORIZONTAL */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-800">Atleta</th>
                                    <th className="p-4 font-bold border-b border-slate-800">Rank</th>
                                    <th className="p-4 font-bold border-b border-slate-800">Status</th>
                                    <th className="p-4 font-bold border-b border-slate-800">Off</th>
                                    <th className="p-4 font-bold border-b border-slate-800 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800">
                                {paginatedUsers.map(user => {
                                    const isPremium = user.plano === 'premium';
                                    const rank = getRankName(user.level || 1);
                                    const daysInactive = user.weekly_stats?.last_login_date 
                                        ? Math.floor((new Date() - new Date(user.weekly_stats.last_login_date)) / (1000 * 60 * 60 * 24))
                                        : 999;

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                                        {user.foto_url ? <img src={user.foto_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">?</div>}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-xs">{user.nome}</p>
                                                        <div className="flex gap-1">
                                                            {user.is_coach && <span className="text-[9px] bg-orange-900/50 text-orange-400 px-1 rounded border border-orange-900">COACH</span>}
                                                            {user.is_athlete && <span className="text-[9px] bg-blue-900/50 text-blue-400 px-1 rounded border border-blue-900">ATLETA</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-300">{rank} <span className="text-slate-600 font-normal">({user.level})</span></span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <button 
                                                    onClick={() => togglePremium(user.id, user.plano)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all ${isPremium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}
                                                >
                                                    {user.plano || 'Free'}
                                                </button>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className={`flex items-center gap-1 text-xs ${daysInactive > 30 ? 'text-red-500 font-bold' : daysInactive > 15 ? 'text-orange-500' : 'text-slate-500'}`}>
                                                    {daysInactive === 999 ? 'Nunca' : `${daysInactive}d`}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <a href={`/${user.slug || user.id}`} target="_blank" className="p-2 inline-block bg-slate-800 hover:text-cyan-400 rounded text-slate-400 border border-slate-700 transition-colors" title="Ver Perfil">
                                                    <ExternalLink size={14}/>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        
                        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs">
                            <button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage===1} className="text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"><ChevronLeft size={16}/> Anterior</button>
                            <span className="text-slate-500">Página {userPage} de {totalUserPages}</span>
                            <button onClick={() => setUserPage(p => Math.min(totalUserPages, p+1))} disabled={userPage===totalUserPages} className="text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1">Próximo <ChevronRight size={16}/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}