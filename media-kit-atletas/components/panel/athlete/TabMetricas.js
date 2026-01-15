import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MapPin, Activity, Eye, ChevronLeft, ChevronRight, Lock, Instagram, Youtube, Twitter, Video, Link as LinkIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { formatNumber } from '../../../lib/utils';

const BRAZIL_STATES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function TabMetricas({
    perfil,
    setPerfil,
    handleInstaStats,
    handleSocialChange,
    totalViews,
    profileViews,
    isPremium,

    ageRange, setAgeRange,
    genderSplit, setGenderSplit
}) {
    // --- ESTADOS DA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const totalPages = Math.ceil(profileViews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentViews = profileViews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const goToPrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const socials = perfil.socials || {};
    const instaStats = socials.instagram?.stats || {};

    // --- LÓGICA DE CIDADES (NOVO) ---
    const [citiesList, setCitiesList] = useState([]);
    const [newCity, setNewCity] = useState({ name: '', uf: 'SP', pct: '' });

    // 1. Carregar dados existentes (Parse da String para Array)
    useEffect(() => {
        const rawCities = perfil.socials.instagram?.audience?.cities || '';
        if (rawCities && citiesList.length === 0) {
            // Tenta converter "São Paulo - SP (40%), Rio - RJ (20%)" em objetos
            // Se o formato antigo for incompatível, começa vazio ou tenta limpar
            const items = rawCities.split(',').map(item => {
                const match = item.trim().match(/(.+) - ([A-Z]{2}) \((\d+)%\)/);
                if (match) {
                    return { name: match[1], uf: match[2], pct: parseInt(match[3]) };
                }
                return null;
            }).filter(Boolean);

            // Só atualiza se achou algo válido e diferente
            if (items.length > 0) setCitiesList(items);
        }
    }, [perfil.socials.instagram?.audience?.cities]); // Added dependency to avoid stale closure if prop updates differently

    // 2. Atualizar o Pai (String) sempre que a lista mudar
    const updateParentCities = (newList) => {
        const formattedString = newList.map(c => `${c.name} - ${c.uf} (${c.pct}%)`).join(', ');
        handleInstaStats('audience', 'cities', formattedString);
    };

    const totalPercentage = citiesList.reduce((acc, curr) => acc + (curr.pct || 0), 0);

    const handleAddCity = () => {
        if (!newCity.name || !newCity.pct) return alert("Preencha nome e porcentagem.");
        if (citiesList.length >= 5) return alert("Máximo de 5 cidades atingido.");

        const pctVal = parseInt(newCity.pct);
        if (totalPercentage + pctVal > 100) return alert(`A soma não pode passar de 100%. Disponível: ${100 - totalPercentage}%`);

        const newList = [...citiesList, { ...newCity, pct: pctVal }];
        setCitiesList(newList);
        updateParentCities(newList);
        setNewCity({ name: '', uf: 'SP', pct: '' }); // Reset form
    };

    const handleRemoveCity = (index) => {
        const newList = [...citiesList];
        newList.splice(index, 1);
        setCitiesList(newList);
        updateParentCities(newList);
    };

    const networks = [
        { id: 'instagram', icon: <Instagram size={18} className="text-[#E1306C]" />, label: 'Instagram', color: 'bg-green-500' },
        { id: 'youtube', icon: <Youtube size={18} className="text-red-600" />, label: 'YouTube', color: 'bg-green-500' },
        { id: 'tiktok', icon: <Video size={18} className="text-[#00F2EA]" />, label: 'TikTok', color: 'bg-gray-500' },
        { id: 'x', icon: <Twitter size={18} className="text-white" />, label: 'X (Twitter)', color: 'bg-gray-500' }
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-8 p-3 sm:p-4 lg:p-0 animate-fadeIn">
            <style jsx global>{`
                .section-header {
                    font-family: 'Oswald', sans-serif;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 1.25rem;
                    color: white;
                    margin-bottom: 1rem;
                    letter-spacing: 0.05em;
                }
                @media (min-width: 640px) {
                    .section-header { font-size: 1.5rem; margin-bottom: 1.5rem; }
                }
                .card-bg {
                    background-color: #1E1E1E;
                    border: 1px solid #333333;
                    padding: 0.75rem;
                }
                @media (min-width: 640px) {
                    .card-bg { padding: 1rem; }
                }
                .stat-value {
                    font-family: 'Oswald', sans-serif;
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin-top: 0.25rem;
                    letter-spacing: -0.025em;
                }
                @media (min-width: 640px) {
                    .stat-value { font-size: 2.25rem; margin-top: 0.5rem; }
                }
                .input-field {
                    width: 100%;
                    background-color: #111111;
                    border: 1px solid #333333;
                    color: white;
                    padding: 0.4rem 0.5rem;
                    font-size: 0.75rem;
                    outline: none;
                }
                @media (min-width: 640px) {
                    .input-field { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
                }
                .input-field:focus {
                    border-color: #FF4500;
                }
            `}</style>

            {/* 1. OVERVIEW CARDS */}
            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="card-bg relative overflow-hidden group rounded-sm">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-white">visibility</span>
                        </div>
                        <h3 className="font-display font-bold uppercase text-sm text-gray-400 tracking-wider">Total de Visitas</h3>
                        <div className="stat-value text-[#FF007F]">{formatNumber(totalViews.toString())}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Lifetime Views</div>
                    </div>
                    <div className="card-bg relative overflow-hidden group rounded-sm">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-white">people</span>
                        </div>
                        <h3 className="font-display font-bold uppercase text-sm text-gray-400 tracking-wider">Seguidores Insta</h3>
                        <div className="stat-value text-[#00E5FF]">{formatNumber(socials.instagram?.followers) || '-'}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Manual Entry</div>
                    </div>
                    <div className="card-bg relative overflow-hidden group rounded-sm">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-white">favorite</span>
                        </div>
                        <h3 className="font-display font-bold uppercase text-sm text-gray-400 tracking-wider">Engajamento</h3>
                        <div className="stat-value text-[#FFFF00]">{instaStats.engagement || '-'}%</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Average Rate</div>
                    </div>
                    <div className="card-bg relative overflow-hidden group border-[#FF4500]/30 rounded-sm">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-[#FF4500]">
                            <span className="material-symbols-outlined text-6xl">bolt</span>
                        </div>
                        <h3 className="font-display font-bold uppercase text-sm text-gray-400 tracking-wider">XP Atual</h3>
                        <div className="stat-value text-white">LVL {perfil.level || 1}</div>
                        <div className="w-full bg-gray-800 h-1 mt-3">
                            <div className="bg-[#FF4500] h-1" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: SOCIALS, METRICS, CITIES */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 2. SOCIAL CONNECTIONS */}
                    <section>
                        <h2 className="section-header border-l-4 border-[#FF4500] pl-4">Conexões Sociais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {networks.map((net) => {
                                const isLocked = !isPremium && net.id !== 'instagram';
                                return (
                                    <div key={net.id} className={`card-bg space-y-3 rounded-sm relative ${isLocked ? 'opacity-60' : ''}`}>
                                        {isLocked && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                <span className="bg-[#FFD700] text-black font-display font-bold text-xs px-2 py-1 uppercase flex items-center gap-1 rounded-sm">
                                                    <Lock size={12} /> Premium
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {net.icon}
                                                <span className="font-display font-bold uppercase text-lg text-white">{net.label}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={perfil.socials?.[net.id]?.active || false}
                                                onChange={(e) => handleSocialChange(net.id, 'active', e.target.checked)}
                                                disabled={isLocked}
                                                className="accent-[#FF4500]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Username</label>
                                            <input
                                                className="input-field rounded-sm"
                                                type="text"
                                                placeholder="@usuario"
                                                value={perfil.socials?.[net.id]?.user || ''}
                                                onChange={(e) => handleSocialChange(net.id, 'user', e.target.value)}
                                                disabled={isLocked}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Followers</label>
                                                <input
                                                    className="input-field rounded-sm"
                                                    type="text"
                                                    placeholder="Ex: 10k"
                                                    value={perfil.socials?.[net.id]?.followers || ''}
                                                    onChange={(e) => handleSocialChange(net.id, 'followers', e.target.value)}
                                                    disabled={isLocked}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Link</label>
                                                <input
                                                    className="input-field rounded-sm text-blue-400 underline cursor-pointer"
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={perfil.socials?.[net.id]?.url || ''}
                                                    onChange={(e) => handleSocialChange(net.id, 'url', e.target.value)}
                                                    disabled={isLocked}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 3. INSTAGRAM METRICS */}
                    <section className="relative">
                        {!isPremium && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-sm">
                                <div className="bg-[#1E1E1E] border border-[#333] p-4 rounded-sm flex flex-col items-center text-center">
                                    <Lock size={24} className="text-[#FFD700] mb-2" />
                                    <h4 className="text-white font-bold text-sm uppercase">Métricas Manuais Bloqueadas</h4>
                                    <p className="text-gray-500 text-xs mt-1">Upgrade para desbloquear</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6 border-l-4 border-[#FF4500] pl-4">
                            <h2 className="section-header mb-0">Instagram Metrics (Manual)</h2>
                            <span className="hidden sm:block text-xs text-gray-500 font-mono">UPDATES IN REAL-TIME</span>
                        </div>

                        <div className={`card-bg p-4 sm:p-6 rounded-sm ${!isPremium ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Reach (Alcance)</label>
                                    <input className="input-field text-lg font-display font-bold text-[#00E5FF] rounded-sm" type="text" placeholder="Ex: 15k" value={instaStats.reach || ''} onChange={(e) => handleInstaStats('stats', 'reach', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Impressions</label>
                                    <input className="input-field text-lg font-display font-bold text-white rounded-sm" type="text" placeholder="Ex: 50k" value={instaStats.impressions || ''} onChange={(e) => handleInstaStats('stats', 'impressions', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Engagement %</label>
                                    <input className="input-field text-lg font-display font-bold text-[#FFFF00] rounded-sm" type="text" placeholder="Ex: 5.2" value={instaStats.engagement || ''} onChange={(e) => handleInstaStats('stats', 'engagement', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Shares</label>
                                    <input className="input-field text-lg font-display font-bold text-white rounded-sm" type="text" placeholder="Ex: 120" value={instaStats.shares || ''} onChange={(e) => handleInstaStats('stats', 'shares', e.target.value)} />
                                </div>
                            </div>

                            <div className="border-t border-[#333] pt-6">
                                <h4 className="font-display text-sm uppercase text-gray-400 mb-4">Demographics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">Top Age Range</label>
                                        <div className="flex gap-2">
                                            <input className="input-field text-center w-20 rounded-sm" placeholder="18" type="text" value={ageRange.min} onChange={(e) => { setAgeRange({ ...ageRange, min: e.target.value }); handleInstaStats('audience', 'age', `${e.target.value}-${ageRange.max}`); }} />
                                            <span className="text-gray-500 self-center">-</span>
                                            <input className="input-field text-center w-20 rounded-sm" placeholder="34" type="text" value={ageRange.max} onChange={(e) => { setAgeRange({ ...ageRange, max: e.target.value }); handleInstaStats('audience', 'age', `${ageRange.min}-${e.target.value}`); }} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">Gender Split (%)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
                                                    <span>Men</span>
                                                    <span>{genderSplit.men}%</span>
                                                </div>
                                                <input
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF4500]"
                                                    max="100"
                                                    min="0"
                                                    type="range"
                                                    value={genderSplit.men}
                                                    onChange={(e) => {
                                                        const menVal = parseInt(e.target.value);
                                                        const womenVal = 100 - menVal;
                                                        setGenderSplit({ men: menVal, women: womenVal });
                                                        handleInstaStats('audience', 'gender', `${menVal}% Homens, ${womenVal}% Mulheres`);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
                                                    <span>Women</span>
                                                    <span>{genderSplit.women}%</span>
                                                </div>
                                                <input
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF007F]"
                                                    max="100"
                                                    min="0"
                                                    type="range"
                                                    value={genderSplit.women}
                                                    onChange={(e) => {
                                                        const womenVal = parseInt(e.target.value);
                                                        const menVal = 100 - womenVal;
                                                        setGenderSplit({ men: menVal, women: womenVal });
                                                        handleInstaStats('audience', 'gender', `${menVal}% Homens, ${womenVal}% Mulheres`);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. CITIES (PRINCIPAIS CIDADES) */}
                    <section className="relative">
                        {!isPremium && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-sm">
                                <div className="bg-[#1E1E1E] border border-[#333] p-4 rounded-sm flex flex-col items-center text-center">
                                    <Lock size={24} className="text-[#FFD700] mb-2" />
                                    <h4 className="text-white font-bold text-sm uppercase">Cidades Bloqueadas</h4>
                                    <p className="text-gray-500 text-xs mt-1">Upgrade para adicionar cidades</p>
                                </div>
                            </div>
                        )}

                        <h2 className="section-header border-l-4 border-[#FF4500] pl-4 text-xl">Principais Cidades</h2>
                        <div className={`card-bg p-6 space-y-6 rounded-sm ${!isPremium ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="text-center">
                                <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-full h-full">
                                        <circle cx="64" cy="64" fill="transparent" r="56" stroke="#333" strokeWidth="8"></circle>
                                        <circle cx="64" cy="64" fill="transparent" r="56" stroke="#FF4500" strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * (Math.min(totalPercentage, 100) / 100))} strokeWidth="8"></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-display font-bold text-white">{totalPercentage}%</span>
                                        <span className="text-[10px] uppercase text-gray-500 font-bold">Total Pct</span>
                                    </div>
                                </div>
                            </div>

                            {/* ADD CITY FORM */}
                            <div className="grid grid-cols-2 sm:grid-cols-[80px_1fr_80px_auto] gap-2 mb-6">
                                <select
                                    className="bg-[#111] border border-[#333] p-2 rounded-sm text-white text-sm outline-none focus:border-[#FF4500] w-full"
                                    value={newCity.uf}
                                    onChange={(e) => setNewCity({ ...newCity, uf: e.target.value })}
                                >
                                    {BRAZIL_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Nome da Cidade"
                                    className="bg-[#111] border border-[#333] p-2 rounded-sm text-white text-sm outline-none focus:border-[#FF4500]"
                                    value={newCity.name}
                                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                                />

                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="%"
                                        className="w-full bg-[#111] border border-[#333] p-2 pr-6 rounded-sm text-white text-sm outline-none focus:border-[#FF4500]"
                                        value={newCity.pct}
                                        onChange={(e) => setNewCity({ ...newCity, pct: e.target.value })}
                                    />
                                    <span className="absolute right-2 top-2 text-gray-500 text-xs">%</span>
                                </div>

                                <button
                                    onClick={handleAddCity}
                                    disabled={citiesList.length >= 5 || totalPercentage >= 100}
                                    className="bg-[#FF4500] hover:bg-orange-600 disabled:bg-[#333] disabled:text-gray-500 text-white p-2 rounded-sm transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* CITY LIST */}
                            <div className="space-y-4">
                                {citiesList.map((city, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-[#FF4500]"></div>
                                            <div>
                                                <h4 className="font-display font-bold text-white uppercase text-lg leading-none">{city.name}</h4>
                                                <span className="text-xs text-gray-500 font-bold">{city.uf}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-[#FF4500] text-lg">{city.pct}%</span>
                                            <button onClick={() => handleRemoveCity(idx)} className="text-gray-600 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: TRACKED VISITS */}
                <div className="lg:col-span-4 space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="section-header border-l-4 border-[#FF4500] pl-4 mb-0 text-xl">Visitas Rastreadas</h2>
                            <span className="text-xs font-bold text-[#FF4500] uppercase">View All</span>
                        </div>

                        <div className="card-bg p-0 rounded-sm">
                            {!isPremium && (
                                <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
                                    <p className="text-yellow-500 text-xs font-bold uppercase text-center">Histórico Limitado (Grátis)</p>
                                </div>
                            )}

                            <div className="divide-y divide-[#333] max-h-[600px] overflow-y-auto custom-scrollbar">
                                {profileViews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 text-sm">Nenhuma visita rastreada.</p>
                                ) : (
                                    currentViews.map((view, idx) => (
                                        <div key={idx} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="h-10 w-10 bg-gray-700 rounded-full overflow-hidden flex-shrink-0 border border-gray-600">
                                                <img src={view.detalhes?.foto_url || "https://placehold.co/100"} alt="User" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#FF4500] transition-colors">{view.detalhes?.apelido || view.detalhes?.nome || "Usuário Logado"}</h4>
                                                <p className="text-xs text-gray-500">Visitou seu perfil</p>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400">{new Date(view.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {profileViews.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-[#333] flex justify-between items-center">
                                    <button onClick={goToPrevPage} disabled={currentPage === 1} className="text-gray-400 hover:text-white disabled:text-[#333]">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-xs text-gray-500 font-bold">{currentPage} / {totalPages}</span>
                                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className="text-gray-400 hover:text-white disabled:text-[#333]">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}