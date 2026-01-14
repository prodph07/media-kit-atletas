'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, DollarSign, AlertTriangle,
    Search, ExternalLink, ShieldCheck,
    Crown, Loader2, Swords, UserPlus, Clock,
    ChevronLeft, ChevronRight, TrendingUp, Handshake, CheckCircle, Ticket
} from 'lucide-react';

const ADMIN_EMAIL = 'prod.ph07@gmail.com';
const PLAN_PRICE = 9.97;
const COMISSAO_VALOR = 5.00;

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
    const UsersValues = 10;
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
    useEffect(() => { if (users.length > 0) calculateGrowthChart(users, growthRange); }, [users, growthRange]);

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
                title: user.plano === 'premium' ? 'NOVO ASSINANTE' : 'NOVO CADASTRO',
                message: `${user.apelido || user.nome} entrou na plataforma.`,
                icon: user.plano === 'premium' ? <Crown size={16} className="text-yellow-500" /> : <UserPlus size={16} className="text-gray-400" />,
                color: user.plano === 'premium' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-gray-700 bg-gray-800/30'
            });
        });
        duelos.forEach(duelo => {
            logs.push({
                type: 'duel', date: new Date(duelo.created_at), title: 'DUELO CRIADO',
                message: `${duelo.p1?.apelido} vs ${duelo.p2?.apelido}`,
                icon: <Swords size={16} className="text-red-500" />, color: 'border-red-900/50 bg-red-900/10'
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
        if (!confirm(`Alterar para ${newPlan.toUpperCase()}?`)) return;
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
            setRecentActivity(prev => [{ type: 'admin_change', date: new Date(), title: 'ALTERAÇÃO MANUAL', message: `Admin alterou plano.`, icon: <Crown size={16} />, color: 'border-slate-500 bg-slate-800' }, ...prev]);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-red-600" size={40} />
                <p className="text-sm font-bold tracking-widest uppercase text-gray-400 animate-pulse">Carregando Admin...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-gray-200 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#222] pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black italic text-white flex items-center gap-2 tracking-tighter uppercase">
                            <ShieldCheck className="text-red-600" /> FightNexus <span className="text-red-600">Admin</span>
                        </h1>
                        <p className="text-gray-500 text-xs font-mono mt-1">SISTEMA INTEGRADO DE GESTÃO - v3.0</p>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right">
                        <span className="text-[10px] bg-[#111] px-3 py-1 rounded border border-[#222] text-gray-400 font-mono block md:inline-block text-center shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            {ADMIN_EMAIL}
                        </span>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-[#111] p-5 rounded-sm border border-[#222] relative overflow-hidden group hover:border-[#333] transition-colors">
                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider">Base Total</p>
                        <h2 className="text-3xl font-black text-white">{metrics.totalUsers}</h2>
                        <div className="absolute top-4 right-4 text-[#222] group-hover:text-[#333] transition-colors"><Users size={24} /></div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-sm border border-[#222] relative overflow-hidden group hover:border-green-900/50 transition-colors">
                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider">Receita Líquida</p>
                        <h2 className="text-3xl font-black text-green-500">R$ {metrics.netRevenue.toFixed(0)}</h2>
                        <div className="absolute top-4 right-4 text-green-900/20 group-hover:text-green-900/40 transition-colors"><DollarSign size={24} /></div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-sm border border-[#222] relative overflow-hidden group hover:border-yellow-900/50 transition-colors">
                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider">Assinantes</p>
                        <h2 className="text-3xl font-black text-yellow-500">{metrics.premiumUsers}</h2>
                        <div className="absolute top-4 right-4 text-yellow-900/20 group-hover:text-yellow-900/40 transition-colors"><Crown size={24} /></div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-sm border border-[#222] relative overflow-hidden group hover:border-red-900/50 transition-colors">
                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider">Risco Churn</p>
                        <h2 className="text-3xl font-black text-red-500">{metrics.churnRisk}</h2>
                        <div className="absolute top-4 right-4 text-red-900/20 group-hover:text-red-900/40 transition-colors"><AlertTriangle size={24} /></div>
                    </div>
                </div>

                {/* GRÁFICO EMPILHADO */}
                <div className="bg-[#111] p-4 md:p-6 rounded-sm border border-[#222]">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-white font-black italic text-sm uppercase flex items-center gap-2 w-full md:w-auto">
                            <TrendingUp size={18} className="text-red-600" /> Crescimento (Azul) & Premium (Ouro)
                        </h3>
                        <div className="flex bg-black rounded p-1 border border-[#222] w-full md:w-auto">
                            {[7, 15, 30].map(d => (
                                <button key={d} onClick={() => setGrowthRange(d)} className={`flex-1 md:flex-none px-4 py-1 text-[10px] font-bold uppercase transition-colors ${growthRange === d ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-300'}`}>{d} Dias</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
                        {dailyGrowthData.map((item, idx) => {
                            const maxVal = Math.max(...dailyGrowthData.map(i => i.totalActivity), 1);
                            const totalHeightPct = (item.totalActivity / maxVal) * 100;
                            const displayHeight = item.totalActivity > 0 ? `${Math.max(totalHeightPct, 15)}%` : '4px';
                            const bluePct = item.totalActivity > 0 ? (item.signupCount / item.totalActivity) * 100 : 0;
                            const goldPct = item.totalActivity > 0 ? (item.premiumCount / item.totalActivity) * 100 : 0;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="hidden group-hover:block absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-3 rounded border border-[#333] shadow-2xl z-20 min-w-[140px] pointer-events-none">
                                        <div className="text-xs font-bold text-gray-400 mb-2 border-b border-[#333] pb-1">{item.fullDate}</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-blue-500 flex items-center gap-1"><UserPlus size={10} /> Criadas:</span><span className="font-bold">{item.signupCount}</span></div>
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-yellow-500 flex items-center gap-1"><Crown size={10} /> Premium:</span><span className="font-bold">{item.premiumCount}</span></div>
                                            <div className="flex justify-between items-center text-[10px]"><span className="text-green-500 flex items-center gap-1"><DollarSign size={10} /> Receita:</span><span className="font-bold">R$ {item.revenue.toFixed(0)}</span></div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black"></div>
                                    </div>
                                    <div className={`w-full rounded-sm overflow-hidden flex flex-col justify-end transition-all duration-500 ${item.totalActivity > 0 ? 'bg-[#222]' : 'bg-[#1a1a1a]'}`} style={{ height: displayHeight }}>
                                        {bluePct > 0 && (<div style={{ height: `${bluePct}%` }} className="bg-blue-600 w-full hover:bg-blue-500 transition-colors"></div>)}
                                        {goldPct > 0 && (<div style={{ height: `${goldPct}%` }} className="bg-yellow-500 w-full hover:bg-yellow-400 transition-colors shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>)}
                                    </div>
                                    <span className={`text-[8px] text-gray-600 mt-2 truncate w-full text-center ${growthRange === 30 && idx % 3 !== 0 ? 'hidden md:block' : 'block'}`}>{item.date}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- BLOCÃO DE PARCEIROS E FINANCEIRO --- */}
                <div className="bg-gradient-to-r from-[#111] to-[#0c0c0c] border border-[#222] p-4 md:p-6 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 relative z-10">
                        <h3 className="text-white font-black italic text-lg uppercase flex items-center gap-2"><Handshake size={20} className="text-red-600" /> Controle de Afiliados</h3>
                        <div className="flex bg-black rounded p-1 border border-[#222]">
                            {[7, 30, 90, 365].map(d => (
                                <button key={d} onClick={() => setPartnerDateRange(d)} className={`px-4 py-1 text-[10px] uppercase font-bold transition-colors ${partnerDateRange === d ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{d === 365 ? 'Total' : `${d} Dias`}</button>
                            ))}
                        </div>
                    </div>
                    {partnersData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                            {partnersData.slice(0, 9).map(partner => (
                                <div key={partner.id} className="bg-black/40 border border-[#222] p-4 flex flex-col gap-4 hover:border-[#333] transition-colors">
                                    <div className="flex justify-between items-start border-b border-[#222] pb-2">
                                        <div>
                                            <p className="font-bold text-white text-sm uppercase">{partner.name}</p>
                                            <p className="text-gray-600 text-[10px] font-mono">ID: {partner.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] uppercase font-bold text-gray-500">Convites</div>
                                            <div className="font-black text-white text-lg leading-none">{partner.totalInvites}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                        <div className="bg-[#111] p-2 rounded border border-[#222]">
                                            <div className="text-gray-500 font-bold uppercase text-[9px]">Conv.</div>
                                            <div className="text-white font-bold text-sm">{partner.conversionsPeriod}</div>
                                        </div>
                                        <div className="bg-green-900/10 p-2 rounded border border-green-900/20">
                                            <div className="text-green-500 font-bold uppercase text-[9px]">Pagos</div>
                                            <div className="text-white font-bold text-sm">{partner.totalPaid}</div>
                                        </div>
                                        <div className="bg-red-900/10 p-2 rounded border border-red-900/20">
                                            <div className="text-red-500 font-bold uppercase text-[9px]">Pendente</div>
                                            <div className="text-white font-bold text-sm">{partner.totalPending}</div>
                                        </div>
                                    </div>
                                    {partner.totalPending > 0 ? (
                                        <button
                                            onClick={() => handleMarkAsPaid(partner.id, partner.pendingUsersIds)}
                                            disabled={processingPayment}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-sm text-xs font-black uppercase transition flex justify-center items-center gap-2 shadow-lg shadow-green-900/20"
                                        >
                                            {processingPayment ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                                            Pagar R$ {(partner.totalPending * COMISSAO_VALOR).toFixed(0)}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-[#111] text-gray-500 py-2 rounded-sm text-xs font-bold uppercase text-center border border-[#222] flex items-center justify-center gap-2">
                                            <CheckCircle size={14} /> Tudo Pago
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-gray-500 text-sm text-center py-4 font-mono">Nenhum parceiro registrou vendas no período.</p>)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LOGS */}
                    <div className="lg:col-span-1 bg-[#111] rounded-sm border border-[#222] flex flex-col">
                        <div className="p-4 md:p-6 border-b border-[#222]"><h3 className="text-white font-black italic text-sm uppercase flex items-center gap-2"><Clock size={16} className="text-red-600" /> Atividade Recente</h3></div>
                        <div className="p-4 flex-1 space-y-3">{paginatedLogs.map((log, i) => (<div key={i} className={`p-3 rounded border ${log.color} flex gap-3 items-start`}><div className="mt-1">{log.icon}</div><div className="overflow-hidden"><p className="text-white font-bold text-xs uppercase">{log.title}</p><p className="text-gray-400 text-[10px] leading-tight mb-1 truncate">{log.message}</p><p className="text-gray-600 text-[9px] font-mono">{log.date.toLocaleString()}</p></div></div>))}</div>
                        <div className="p-4 border-t border-[#222] flex justify-between items-center text-xs bg-black/20"><button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button><span className="text-gray-500 font-mono">{logPage} / {totalLogPages}</span><button onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))} disabled={logPage === totalLogPages} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button></div>
                    </div>

                    {/* TABELA */}
                    <div className="lg:col-span-2 bg-[#111] p-4 md:p-6 rounded-sm border border-[#222]">
                        <h3 className="text-white font-black italic text-sm uppercase mb-6 flex items-center gap-2"><LayoutDashboard size={16} className="text-red-600" /> Visão Geral</h3>
                        <div className="space-y-6 mb-8">
                            <div><div className="flex justify-between text-xs mb-2"><span className="text-yellow-500 font-bold uppercase flex items-center gap-1"><Crown size={12} /> Premium</span><span className="text-white font-mono">{metrics.premiumUsers} usuários</span></div><div className="w-full bg-black h-4 rounded-full overflow-hidden border border-[#333] relative"><div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.premiumUsers / metrics.totalUsers) * 100, 2)}%` }}></div></div><div className="text-right mt-1"><span className="text-[10px] text-gray-500 font-mono">{((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1)}% da base</span></div></div>
                            <div><div className="flex justify-between text-xs mb-2"><span className="text-gray-400 font-bold uppercase flex items-center gap-1"><Users size={12} /> Grátis</span><span className="text-white font-mono">{metrics.freeUsers} usuários</span></div><div className="w-full bg-black h-4 rounded-full overflow-hidden border border-[#333] relative"><div className="bg-gray-700 h-full transition-all duration-1000" style={{ width: `${Math.max((metrics.freeUsers / metrics.totalUsers) * 100, 2)}%` }}></div></div><div className="text-right mt-1"><span className="text-[10px] text-gray-500 font-mono">{((metrics.freeUsers / metrics.totalUsers) * 100).toFixed(1)}% da base</span></div></div>
                        </div>

                        <div className="flex flex-col gap-4 mb-6">
                            <h3 className="text-white font-bold text-lg uppercase flex items-center gap-2"><Search size={18} /> Filtros & Busca</h3>
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input type="text" placeholder="Buscar por nome, email ou apelido..." className="bg-black border border-[#333] text-white pl-10 pr-4 py-2.5 rounded text-sm w-full focus:border-red-600 outline-none transition-colors" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setUserPage(1); }} />
                            </div>
                            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                                <select onChange={(e) => { setFilterPlan(e.target.value); setUserPage(1); }} className="bg-[#0c0c0c] border border-[#333] text-xs text-gray-300 rounded px-3 py-2 outline-none w-full md:w-auto hover:border-gray-600"><option value="">Todos Planos</option><option value="premium">Premium</option><option value="free">Free</option></select>
                                <select onChange={(e) => { setFilterRank(e.target.value); setUserPage(1); }} className="bg-[#0c0c0c] border border-[#333] text-xs text-gray-300 rounded px-3 py-2 outline-none w-full md:w-auto hover:border-gray-600"><option value="">Todos Ranks</option><option value="Iron">Iron</option><option value="Bronze">Bronze</option><option value="Silver">Silver</option><option value="Gold">Gold</option><option value="Platinum">Platinum</option><option value="Diamond">Diamond</option><option value="GOAT">GOAT</option></select>
                                <select onChange={(e) => { setFilterInactivity(e.target.value); setUserPage(1); }} className="bg-[#0c0c0c] border border-[#333] text-xs text-gray-300 rounded px-3 py-2 outline-none w-full md:w-auto hover:border-gray-600"><option value="">Inatividade</option><option value="7">7+ Dias Off</option><option value="15">15+ Dias Off</option><option value="30">30+ Dias Off</option></select>
                                <select onChange={(e) => { setFilterType(e.target.value); setUserPage(1); }} className="bg-[#0c0c0c] border border-[#333] text-xs text-gray-300 rounded px-3 py-2 outline-none w-full md:w-auto hover:border-gray-600"><option value="">Todos Tipos</option><option value="athlete">Apenas Atletas</option><option value="coach">Apenas Coaches</option></select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-black text-gray-500 text-[10px] uppercase tracking-widest border-b border-[#222]">
                                        <th className="p-4 font-bold">Atleta</th>
                                        <th className="p-4 font-bold">Rank</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Off</th>
                                        <th className="p-4 font-bold text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-[#222]">
                                    {paginatedUsers.map(user => {
                                        const isPremium = user.plano === 'premium';
                                        const rank = getRankName(user.level || 1);
                                        const daysInactive = user.weekly_stats?.last_login_date ? Math.floor((new Date() - new Date(user.weekly_stats.last_login_date)) / (1000 * 60 * 60 * 24)) : 999;
                                        return (
                                            <tr key={user.id} className="hover:bg-[#1a1a1a] transition-colors group">
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#222] overflow-hidden flex-shrink-0 border border-[#333]">
                                                            {user.foto_url ? <img src={user.foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">?</div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-xs group-hover:text-red-500 transition-colors uppercase">{user.nome}</p>
                                                            <div className="flex gap-1 mt-0.5">
                                                                {user.is_coach && <span className="text-[9px] bg-orange-900/20 text-orange-500 px-1 rounded border border-orange-900/30">COACH</span>}
                                                                {user.is_athlete && <span className="text-[9px] bg-blue-900/20 text-blue-500 px-1 rounded border border-blue-900/30">ATLETA</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap"><span className="text-xs font-bold text-gray-300 font-mono">{rank} <span className="text-gray-600">v.{user.level}</span></span></td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <button onClick={() => togglePremium(user.id, user.plano)} className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border transition-all ${isPremium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-[#222] text-gray-500 border-[#333] hover:bg-[#333] hover:text-white'}`}>
                                                        {user.plano || 'Free'}
                                                    </button>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${daysInactive > 30 ? 'text-red-500' : daysInactive > 15 ? 'text-orange-500' : 'text-gray-500'}`}>
                                                        {daysInactive === 999 ? 'NUNCA' : `${daysInactive}d`}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap">
                                                    <a href={`/${user.slug || user.id}`} target="_blank" className="p-2 inline-flex items-center justify-center bg-[#222] hover:bg-red-600 hover:text-white text-gray-400 rounded-sm transition-all border border-[#333] hover:border-red-500">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-[#222] flex justify-between items-center text-xs bg-black/20">
                            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="text-gray-500 hover:text-white disabled:opacity-30 flex items-center gap-1"><ChevronLeft size={16} /> Anterior</button>
                            <span className="text-gray-500 font-mono">Página {userPage} de {totalUserPages}</span>
                            <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="text-gray-500 hover:text-white disabled:opacity-30 flex items-center gap-1">Próximo <ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- EXPORTAÇÃO DEFAULT COM SUSPENSE ---
export default function AdminPanel() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2 text-red-600" /> Carregando Admin...</div>}>
            <AdminContent />
        </Suspense>
    );
}