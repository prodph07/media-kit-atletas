'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Users, DollarSign, AlertTriangle, 
    Search, ExternalLink, ShieldCheck, 
    Crown, Loader2, Swords, UserPlus, Clock, 
    ChevronLeft, ChevronRight, TrendingUp, Handshake, CheckCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'prod.ph07@gmail.com';
const PLAN_PRICE = 9.97; 
const COMISSAO_VALOR = 50.00;

const getRankName = (level) => {
    if (level <= 10) return "Iron";
    if (level <= 30) return "Bronze";
    if (level <= 60) return "Silver";
    if (level <= 90) return "Gold";
    if (level <= 120) return "Platinum";
    if (level <= 165) return "Diamond";
    return "GOAT";
};

// --- COMPONENTE INTERNO COM A LÓGICA (ANTIGO AdminPanel) ---
function AdminContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
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

    // Parceiros
    const [partnerDateRange, setPartnerDateRange] = useState(30);

    // Gráfico
    const [growthRange, setGrowthRange] = useState(30);
    const [dailyGrowthData, setDailyGrowthData] = useState([]);

    // Métricas
    const [metrics, setMetrics] = useState({
        totalUsers: 0, premiumUsers: 0, freeUsers: 0, churnRisk: 0,
        grossRevenue: 0, netRevenue: 0, growth30Days: 0, growthPercentage: 0
    });

    useEffect(() => { checkAuthAndFetchData(); }, []);
    useEffect(() => { if(users.length > 0) calculateGrowthChart(users, growthRange); }, [users, growthRange]);

    const checkAuthAndFetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== ADMIN_EMAIL) { alert("Acesso Negado."); router.push('/'); return; }

        const { data: atletas, error } = await supabase
            .from('atletas')
            .select('*') 
            .order('created_at', { ascending: false });

        const { data: duelos } = await supabase.from('duelos').select('id, created_at, atleta_1_id, atleta_2_id, p1:atletas!atleta_1_id(nome, apelido), p2:atletas!atleta_2_id(nome, apelido)').order('created_at', { ascending: false }).limit(50);

        if (error) { console.error(error); return; }

        processMetrics(atletas);
        generateLogs(atletas, duelos || []);
        setUsers(atletas);
        setLoading(false);
    };

    const getUTCDateString = (isoString) => {
        if (!isoString) return null;
        const d = new Date(isoString);
        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const calculateGrowthChart = (allUsers, days) => {
        const chartData = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const loopDateString = date.toLocaleDateString('pt-BR');
            
            const signupCount = allUsers.filter(u => getUTCDateString(u.created_at) === loopDateString).length;
            const premiumCount = allUsers.filter(u => getUTCDateString(u.first_premium_at) === loopDateString).length;
            const revenue = premiumCount * PLAN_PRICE;
            const totalActivity = signupCount + premiumCount;

            chartData.push({ 
                date: `${date.getDate()}/${date.getMonth() + 1}`, 
                signupCount, premiumCount, totalActivity, revenue, fullDate: loopDateString 
            });
        }
        setDailyGrowthData(chartData);
    };

    const processMetrics = (data) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let premiumCount = 0; let churnCount = 0; let newUsersCount = 0;

        data.forEach(user => {
            if (user.plano === 'premium') premiumCount++;
            const lastLogin = user.weekly_stats?.last_login_date ? new Date(user.weekly_stats.last_login_date) : null;
            if (!lastLogin || lastLogin < thirtyDaysAgo) churnCount++;
            if (new Date(user.created_at) > thirtyDaysAgo) newUsersCount++;
        });

        const previousTotal = data.length - newUsersCount;
        const growthPercentage = previousTotal > 0 ? ((newUsersCount / previousTotal) * 100).toFixed(1) : 100;

        setMetrics({
            totalUsers: data.length, premiumUsers: premiumCount, freeUsers: data.length - premiumCount,
            churnRisk: churnCount, grossRevenue: premiumCount * PLAN_PRICE, netRevenue: premiumCount * (PLAN_PRICE - 1),
            growth30Days: newUsersCount, growthPercentage
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
                type: 'duel', date: new Date(duelo.created_at), title: 'Duelo Criado',
                message: `${duelo.p1?.apelido} desafiou ${duelo.p2?.apelido}`,
                icon: <Swords size={16} className="text-red-500"/>, color: 'border-red-500/50 bg-red-500/10'
            });
        });
        setRecentActivity(logs.sort((a, b) => b.date - a.date));
    };

    const partnersData = useMemo(() => {
        const partnersMap = {};
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - partnerDateRange);

        users.forEach(user => {
            if (user.invited_by) {
                const partnerId = user.invited_by;
                if (!partnersMap[partnerId]) {
                    const partnerInfo = users.find(u => u.id === partnerId);
                    partnersMap[partnerId] = {
                        id: partnerId,
                        name: partnerInfo?.nome || partnerInfo?.apelido || `ID: ${partnerId}`,
                        totalInvites: 0,
                        conversionsPeriod: 0,
                        totalPaid: 0,
                        totalPending: 0,
                        pendingUsersIds: []
                    };
                }
                partnersMap[partnerId].totalInvites++;
                if (user.first_premium_at) {
                    const conversionDate = new Date(user.first_premium_at);
                    if (conversionDate >= cutoffDate) {
                        partnersMap[partnerId].conversionsPeriod++;
                    }
                    if (user.affiliate_paid_at) {
                        partnersMap[partnerId].totalPaid++;
                    } else {
                        partnersMap[partnerId].totalPending++;
                        partnersMap[partnerId].pendingUsersIds.push(user.id);
                    }
                }
            }
        });
        return Object.values(partnersMap).sort((a, b) => b.conversionsPeriod - a.conversionsPeriod);
    }, [users, partnerDateRange]);

    const handleMarkAsPaid = async (partnerId, pendingIds) => {
        if (pendingIds.length === 0) return;
        if (!confirm(`Confirmar pagamento de ${pendingIds.length} comissões para este parceiro?\nTotal: R$ ${pendingIds.length * COMISSAO_VALOR}`)) return;

        setProcessingPayment(true);
        const now = new Date().toISOString();

        const { error } = await supabase.from('atletas').update({ affiliate_paid_at: now }).in('id', pendingIds);

        if (error) {
            alert("Erro ao registrar pagamento.");
        } else {
            const updatedUsers = users.map(u => {
                if (pendingIds.includes(u.id)) {
                    return { ...u, affiliate_paid_at: now };
                }
                return u;
            });
            setUsers(updatedUsers);
            alert("Pagamento registrado com sucesso!");
        }
        setProcessingPayment(false);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || user.apelido?.toLowerCase().includes(searchTerm.toLowerCase());
            const planMatch = filterPlan ? user.plano === filterPlan : true;
            const rankMatch = filterRank ? getRankName(user.level || 1) === filterRank : true;
            let typeMatch = true;
            if (filterType === 'coach') typeMatch = user.is_coach;
            if (filterType === 'athlete') typeMatch = user.is_athlete;
            let inactivityMatch = true;
            if (filterInactivity) {
                const days = user.weekly_stats?.last_login_date ? Math.floor((new Date() - new Date(user.weekly_stats.last_login_date)) / (1000 * 60 * 60 * 24)) : 999;
                if (filterInactivity === '7') inactivityMatch = days >= 7;
                if (filterInactivity === '15') inactivityMatch = days >= 15;
                if (filterInactivity === '30') inactivityMatch = days >= 30;
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
        if(!confirm(`Alterar para ${newPlan.toUpperCase()}?`)) return;
        const updates = { plano: newPlan };
        if (newPlan === 'premium') {
             const user = users.find(u => u.id === userId);
             if (!user.first_premium_at) updates.first_premium_at = new Date().toISOString();
        }
        const { error } = await supabase.from('atletas').update(updates).eq('id', userId);
        if (!error) {
            const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
            setUsers(updatedUsers);
            processMetrics(updatedUsers);
            setRecentActivity(prev => [{ type: 'admin_change', date: new Date(), title: 'Alteração Manual', message: `Admin alterou plano.`, icon: <Crown size={16}/>, color: 'border-slate-500 bg-slate-800' }, ...prev]);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2"><ShieldCheck className="text-cyan-500"/> GOD MODE</h1>
                        <p className="text-slate-500 text-xs mt-1">Visão Geral do Sistema</p>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right">
                        <span className="text-[10px] bg-slate-900 px-3 py-1 rounded border border-slate-800 text-slate-400 font-mono block md:inline-block text-center">{ADMIN_EMAIL}</span>
                    </div>
                </div>

                {/* KPI CARDS */}
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

                {/* GRÁFICO EMPILHADO */}
                <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 w-full md:w-auto">
                            <TrendingUp size={18} className="text-cyan-500"/> Crescimento (Ciano) & Vendas (Ouro)
                        </h3>
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 w-full md:w-auto">
                            {[7, 15, 30].map(d => (
                                <button key={d} onClick={() => setGrowthRange(d)} className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded ${growthRange === d ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}>{d} Dias</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
                        {dailyGrowthData.map((item, idx) => {
                            const maxVal = Math.max(...dailyGrowthData.map(i => i.totalActivity), 1);
                            const totalHeightPct = (item.totalActivity / maxVal) * 100;
                            const displayHeight = item.totalActivity > 0 ? `${Math.max(totalHeightPct, 15)}%` : '4px';
                            const cyanPct = item.totalActivity > 0 ? (item.signupCount / item.totalActivity) * 100 : 0;
                            const goldPct = item.totalActivity > 0 ? (item.premiumCount / item.totalActivity) * 100 : 0;
                            
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="hidden group-hover:block absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white p-3 rounded-xl border border-slate-700 shadow-2xl z-20 min-w-[140px] pointer-events-none">
                                        <div className="text-xs font-bold text-slate-400 mb-2 border-b border-slate-800 pb-1">{item.fullDate}</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-cyan-400 flex items-center gap-1"><UserPlus size={10}/> Criadas:</span><span className="font-bold">{item.signupCount}</span></div>
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-yellow-500 flex items-center gap-1"><Crown size={10}/> Premium:</span><span className="font-bold">{item.premiumCount}</span></div>
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-green-400 flex items-center gap-1"><DollarSign size={10}/> Receita:</span><span className="font-bold">R$ {item.revenue.toFixed(0)}</span></div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700"></div>
                                    </div>
                                    <div className={`w-full rounded-t overflow-hidden flex flex-col justify-end transition-all duration-500 ${item.totalActivity > 0 ? 'bg-slate-800' : 'bg-slate-800'}`} style={{ height: displayHeight }}>
                                        {cyanPct > 0 && (<div style={{ height: `${cyanPct}%` }} className="bg-cyan-500 w-full hover:bg-cyan-400 transition-colors"></div>)}
                                        {goldPct > 0 && (<div style={{ height: `${goldPct}%` }} className="bg-yellow-500 w-full hover:bg-yellow-400 transition-colors shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>)}
                                    </div>
                                    <span className={`text-[8px] text-slate-600 mt-2 truncate w-full text-center ${growthRange === 30 && idx % 3 !== 0 ? 'hidden md:block' : 'block'}`}>{item.date}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- BLOCÃO DE PARCEIROS E FINANCEIRO --- */}
                <div className="bg-gradient-to-r from-purple-900/20 to-slate-900 border border-purple-500/30 p-4 md:p-6 rounded-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-white font-bold text-lg uppercase flex items-center gap-2"><Handshake size={20} className="text-purple-500"/> Controle de Afiliados</h3>
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-purple-500/30">
                            {[7, 30, 90, 365].map(d => (
                                <button key={d} onClick={() => setPartnerDateRange(d)} className={`px-3 py-1 text-xs font-bold rounded ${partnerDateRange === d ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'}`}>{d === 365 ? 'Total' : `${d} Dias`}</button>
                            ))}
                        </div>
                    </div>
                    {partnersData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {partnersData.slice(0, 9).map(partner => (
                                <div key={partner.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col gap-4">
                                    <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                                        <div>
                                            <p className="font-bold text-white text-sm">{partner.name}</p>
                                            <p className="text-slate-500 text-[10px]">ID: {partner.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase text-slate-500">Convites Totais</div>
                                            <div className="font-bold text-white">{partner.totalInvites}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                        <div className="bg-slate-900 p-2 rounded">
                                            <div className="text-slate-400">Conversões</div>
                                            <div className="text-white font-bold text-sm">{partner.conversionsPeriod}</div>
                                            <div className="text-[8px] text-slate-600">{partnerDateRange}d</div>
                                        </div>
                                        <div className="bg-green-900/20 p-2 rounded border border-green-900/30">
                                            <div className="text-green-400">Pagos</div>
                                            <div className="text-white font-bold text-sm">{partner.totalPaid}</div>
                                            <div className="text-[8px] text-green-600">Total</div>
                                        </div>
                                        <div className="bg-orange-900/20 p-2 rounded border border-orange-900/30">
                                            <div className="text-orange-400">Pendente</div>
                                            <div className="text-white font-bold text-sm">{partner.totalPending}</div>
                                            <div className="text-[8px] text-orange-600">Total</div>
                                        </div>
                                    </div>
                                    {partner.totalPending > 0 ? (
                                        <button 
                                            onClick={() => handleMarkAsPaid(partner.id, partner.pendingUsersIds)}
                                            disabled={processingPayment}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded text-xs font-bold uppercase transition flex justify-center items-center gap-2"
                                        >
                                            {processingPayment ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle size={12}/>}
                                            Pagar R$ {(partner.totalPending * COMISSAO_VALOR).toFixed(0)}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-slate-900 text-slate-500 py-2 rounded text-xs font-bold uppercase text-center border border-slate-800">
                                            Tudo Pago
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : ( <p className="text-slate-500 text-sm text-center py-4">Nenhum parceiro registrou vendas no período selecionado.</p> )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LOGS */}
                    <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                        <div className="p-4 md:p-6 border-b border-slate-800"><h3 className="text-white font-bold text-sm uppercase flex items-center gap-2"><Clock size={16}/> Atividade Recente</h3></div>
                        <div className="p-4 flex-1 space-y-3">{paginatedLogs.map((log, i) => (<div key={i} className={`p-3 rounded-lg border ${log.color} flex gap-3 items-start`}><div className="mt-1">{log.icon}</div><div className="overflow-hidden"><p className="text-white font-bold text-xs truncate">{log.title}</p><p className="text-slate-400 text-[10px] leading-tight mb-1 truncate">{log.message}</p><p className="text-slate-600 text-[9px]">{log.date.toLocaleString()}</p></div></div>))}</div>
                        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs"><button onClick={() => setLogPage(p => Math.max(1, p-1))} disabled={logPage===1} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16}/></button><span className="text-slate-500">{logPage} / {totalLogPages}</span><button onClick={() => setLogPage(p => Math.min(totalLogPages, p+1))} disabled={logPage===totalLogPages} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={16}/></button></div>
                    </div>

                    {/* TABELA */}
                    <div className="lg:col-span-2 bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800">
                        <h3 className="text-white font-bold text-sm uppercase mb-6 flex items-center gap-2"><LayoutDashboard size={16}/> Visão Geral</h3>
                        <div className="space-y-6 mb-8">
                            <div><div className="flex justify-between text-xs mb-2"><span className="text-yellow-500 font-bold uppercase flex items-center gap-1"><Crown size={12}/> Premium</span><span className="text-white font-mono">{metrics.premiumUsers} usuários</span></div><div className="w-full bg-slate-950 h-6 rounded-md overflow-hidden border border-slate-800 relative"><div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.premiumUsers / metrics.totalUsers) * 100, 2)}%` }}></div><span className="absolute right-2 top-1 text-[10px] text-white font-bold z-10">{((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(0)}%</span></div></div>
                            <div><div className="flex justify-between text-xs mb-2"><span className="text-slate-400 font-bold uppercase flex items-center gap-1"><Users size={12}/> Grátis</span><span className="text-white font-mono">{metrics.freeUsers} usuários</span></div><div className="w-full bg-slate-950 h-6 rounded-md overflow-hidden border border-slate-800 relative"><div className="bg-slate-600 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.freeUsers / metrics.totalUsers) * 100, 2)}%` }}></div><span className="absolute right-2 top-1 text-[10px] text-white font-bold z-10">{((metrics.freeUsers / metrics.totalUsers) * 100).toFixed(0)}%</span></div></div>
                        </div>

                        <div className="flex flex-col gap-4 mb-6"><h3 className="text-white font-bold text-lg">Gerenciar Atletas</h3><div className="relative w-full"><Search className="absolute left-3 top-2.5 text-slate-500" size={16}/><input type="text" placeholder="Buscar por nome..." className="bg-black border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:border-cyan-500 outline-none" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setUserPage(1); }} /></div><div className="grid grid-cols-2 md:flex md:flex-wrap gap-2"><select onChange={(e) => { setFilterPlan(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto"><option value="">Todos Planos</option><option value="premium">Premium</option><option value="free">Free</option></select><select onChange={(e) => { setFilterRank(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto"><option value="">Todos Ranks</option><option value="Iron">Iron</option><option value="Bronze">Bronze</option><option value="Silver">Silver</option><option value="Gold">Gold</option><option value="Platinum">Platinum</option><option value="Diamond">Diamond</option><option value="GOAT">GOAT</option></select><select onChange={(e) => { setFilterInactivity(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto"><option value="">Inatividade</option><option value="7">7+ Dias Off</option><option value="15">15+ Dias Off</option><option value="30">30+ Dias Off</option></select><select onChange={(e) => { setFilterType(e.target.value); setUserPage(1); }} className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded px-3 py-2 outline-none w-full md:w-auto"><option value="">Todos Tipos</option><option value="athlete">Apenas Atletas</option><option value="coach">Apenas Coaches</option></select></div></div>

                        <div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[800px]"><thead><tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold border-b border-slate-800">Atleta</th><th className="p-4 font-bold border-b border-slate-800">Rank</th><th className="p-4 font-bold border-b border-slate-800">Status</th><th className="p-4 font-bold border-b border-slate-800">Off</th><th className="p-4 font-bold border-b border-slate-800 text-right">Ação</th></tr></thead><tbody className="text-sm divide-y divide-slate-800">{paginatedUsers.map(user => {const isPremium = user.plano === 'premium';const rank = getRankName(user.level || 1);const daysInactive = user.weekly_stats?.last_login_date ? Math.floor((new Date() - new Date(user.weekly_stats.last_login_date)) / (1000 * 60 * 60 * 24)) : 999;return (<tr key={user.id} className="hover:bg-slate-800/50 transition-colors"><td className="p-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">{user.foto_url ? <img src={user.foto_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">?</div>}</div><div><p className="text-white font-bold text-xs">{user.nome}</p><div className="flex gap-1">{user.is_coach && <span className="text-[9px] bg-orange-900/50 text-orange-400 px-1 rounded border border-orange-900">COACH</span>}{user.is_athlete && <span className="text-[9px] bg-blue-900/50 text-blue-400 px-1 rounded border border-blue-900">ATLETA</span>}</div></div></div></td><td className="p-4 whitespace-nowrap"><span className="text-xs font-bold text-slate-300">{rank} <span className="text-slate-600 font-normal">({user.level})</span></span></td><td className="p-4 whitespace-nowrap"><button onClick={() => togglePremium(user.id, user.plano)} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all ${isPremium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}>{user.plano || 'Free'}</button></td><td className="p-4 whitespace-nowrap"><div className={`flex items-center gap-1 text-xs ${daysInactive > 30 ? 'text-red-500 font-bold' : daysInactive > 15 ? 'text-orange-500' : 'text-slate-500'}`}>{daysInactive === 999 ? 'Nunca' : `${daysInactive}d`}</div></td><td className="p-4 text-right whitespace-nowrap"><a href={`/${user.slug || user.id}`} target="_blank" className="p-2 inline-block bg-slate-800 hover:text-cyan-400 rounded text-slate-400 border border-slate-700 transition-colors"><ExternalLink size={14}/></a></td></tr>)})}</tbody></table><div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs"><button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage===1} className="text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"><ChevronLeft size={16}/> Anterior</button><span className="text-slate-500">Página {userPage} de {totalUserPages}</span><button onClick={() => setUserPage(p => Math.min(totalUserPages, p+1))} disabled={userPage===totalUserPages} className="text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1">Próximo <ChevronRight size={16}/></button></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- EXPORTAÇÃO DEFAULT COM SUSPENSE (A MÁGICA) ---
export default function AdminPanel() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando Admin...</div>}>
            <AdminContent />
        </Suspense>
    );
}