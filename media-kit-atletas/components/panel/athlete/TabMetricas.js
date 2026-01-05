import React, { useState } from 'react';
import { BarChart3, Users, MapPin, Activity, Eye, ChevronLeft, ChevronRight, Lock, Instagram, Youtube, Twitter, Video, Link as LinkIcon } from 'lucide-react';

export default function TabMetricas({ 
    perfil, 
    setPerfil, 
    handleInstaStats, 
    handleSocialChange, // Recebendo a função de atualização
    totalViews, 
    profileViews, 
    isPremium, 
    formatNumber,
    ageRange, setAgeRange,
    genderSplit, setGenderSplit
}) {
    // --- ESTADOS DA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Cálculos da Paginação
    const totalPages = Math.ceil(profileViews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentViews = profileViews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handlers de Navegação
    const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const goToPrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const socials = perfil.socials || {};
    const instaStats = socials.instagram?.stats || {};

    const networks = [
        { id: 'instagram', icon: <Instagram size={18} className="text-pink-500"/>, label: 'Instagram' },
        { id: 'youtube', icon: <Youtube size={18} className="text-red-500"/>, label: 'YouTube' },
        { id: 'tiktok', icon: <Video size={18} className="text-cyan-500"/>, label: 'TikTok' },
        { id: 'x', icon: <Twitter size={18} className="text-white"/>, label: 'X (Twitter)' }
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            
            {/* 1. VISÃO GERAL (Cards do Topo) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">Total de Visitas</span>
                    <span className="text-3xl font-black text-white">{formatNumber(totalViews.toString())}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">Seguidores Insta</span>
                    <span className="text-3xl font-black text-pink-500">{formatNumber(socials.instagram?.followers) || '-'}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">Engajamento</span>
                    <span className="text-3xl font-black text-cyan-500">{instaStats.engagement || '-'}%</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">XP Atual</span>
                    <span className="text-3xl font-black text-yellow-500">{perfil.xp || 0}</span>
                </div>
            </div>

            {/* 2. NOVO: CONEXÕES SOCIAIS (Movido da TabGeral) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-bold uppercase text-sm mb-6 flex items-center gap-2">
                    <LinkIcon size={18} className="text-cyan-500"/> Conexões Sociais
                </h3>
                
                <div className="space-y-4">
                    {networks.map((net) => {
                        const isLocked = !isPremium && net.id !== 'instagram'; // Bloqueia tudo menos Instagram no Free
                        
                        return (
                            <div key={net.id} className={`bg-slate-950 p-4 rounded-lg border border-slate-800 relative ${isLocked ? 'opacity-60' : ''}`}>
                                
                                {isLocked && (
                                    <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                                        <div className="flex items-center gap-2 text-yellow-500 bg-black/80 px-3 py-1 rounded border border-yellow-500/30">
                                            <Lock size={12} /> <span className="text-xs font-bold uppercase">Premium</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    {net.icon}
                                    <span className="font-bold text-sm text-slate-300">{net.label}</span>
                                    {/* Checkbox Ativo */}
                                    <input 
                                        type="checkbox" 
                                        checked={perfil.socials?.[net.id]?.active || false}
                                        onChange={(e) => handleSocialChange(net.id, 'active', e.target.checked)}
                                        disabled={isLocked}
                                        className="ml-auto accent-cyan-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Usuário (@)</label>
                                        <input 
                                            type="text" 
                                            value={perfil.socials?.[net.id]?.user || ''} 
                                            onChange={(e) => handleSocialChange(net.id, 'user', e.target.value)}
                                            disabled={isLocked}
                                            placeholder="@usuario"
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Seguidores</label>
                                        <input 
                                            type="text" 
                                            value={perfil.socials?.[net.id]?.followers || ''} 
                                            onChange={(e) => handleSocialChange(net.id, 'followers', e.target.value)}
                                            disabled={isLocked}
                                            placeholder="Ex: 10k"
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Link do Perfil</label>
                                        <input 
                                            type="text" 
                                            value={perfil.socials?.[net.id]?.url || ''} 
                                            onChange={(e) => handleSocialChange(net.id, 'url', e.target.value)}
                                            disabled={isLocked}
                                            placeholder="https://..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. VISITAS RASTREADAS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-green-500 font-bold uppercase text-sm mb-6 flex items-center gap-2">
                    <Eye size={18}/> Visitas Rastreadas
                </h3>
                
                {!isPremium && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4 text-center">
                        <p className="text-yellow-500 text-xs font-bold uppercase">Funcionalidade Limitada</p>
                        <p className="text-slate-400 text-xs">Usuários Grátis veem apenas as últimas 5 visitas. Faça upgrade para ver o histórico completo.</p>
                    </div>
                )}

                <div className="space-y-3 min-h-[300px]">
                    {profileViews.length === 0 ? (
                        <p className="text-slate-500 text-center py-8 text-sm">Nenhuma visita rastreada recentemente.</p>
                    ) : (
                        currentViews.map((view, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/40 p-4 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img 
                                            src={view.detalhes?.foto_url || "https://placehold.co/100"} 
                                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                            alt="Visitante"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border border-black"></div>
                                    </div>
                                    <div>
                                        {view.detalhes ? (
                                            <a href={`/${view.detalhes.slug}`} target="_blank" className="font-bold text-white text-sm hover:text-cyan-400 hover:underline">
                                                {view.detalhes.apelido || view.detalhes.nome}
                                            </a>
                                        ) : (
                                            <p className="font-bold text-slate-400 text-sm">Usuário Logado</p>
                                        )}
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(view.created_at).toLocaleDateString()} às {new Date(view.created_at).toLocaleTimeString().slice(0,5)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase">
                                    {view.visitante_tipo}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* --- PAGINAÇÃO --- */}
                {profileViews.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                        <button onClick={goToPrevPage} disabled={currentPage === 1} className={`flex items-center gap-1 text-xs font-bold uppercase px-3 py-2 rounded transition-colors ${currentPage === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-white hover:bg-slate-800'}`}>
                            <ChevronLeft size={16}/> Anterior
                        </button>
                        <span className="text-xs text-slate-500">Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span></span>
                        <button onClick={goToNextPage} disabled={currentPage === totalPages} className={`flex items-center gap-1 text-xs font-bold uppercase px-3 py-2 rounded transition-colors ${currentPage === totalPages ? 'text-slate-600 cursor-not-allowed' : 'text-white hover:bg-slate-800'}`}>
                            Próximo <ChevronRight size={16}/>
                        </button>
                    </div>
                )}
            </div>

            {/* 4. DADOS DO INSTAGRAM (Manuais) - BLOQUEADO SE NÃO FOR PREMIUM */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative">
                
                {/* TRAVA VISUAL (Overlay) */}
                {!isPremium && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-slate-700/50">
                        <div className="bg-slate-800 p-3 rounded-full mb-2 border border-slate-700 shadow-lg">
                            <Lock size={24} className="text-yellow-500" />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1">Métricas Manuais Bloqueadas</h4>
                        <p className="text-slate-400 text-xs text-center max-w-[200px] mb-4">
                            Faça upgrade para informar seus números de alcance e engajamento aos patrocinadores.
                        </p>
                    </div>
                )}

                <h3 className="text-pink-500 font-bold uppercase text-sm mb-6 flex items-center gap-2">
                    <Activity size={18}/> Métricas do Instagram (Manual)
                </h3>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ${!isPremium ? 'opacity-20 pointer-events-none' : ''}`}>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Alcance (Reach)</label>
                        <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm mt-1" placeholder="Ex: 15.4k" value={instaStats.reach || ''} onChange={(e) => handleInstaStats('stats', 'reach', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Impressões</label>
                        <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm mt-1" placeholder="Ex: 50k" value={instaStats.impressions || ''} onChange={(e) => handleInstaStats('stats', 'impressions', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Engajamento (%)</label>
                        <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm mt-1" placeholder="Ex: 5.2" value={instaStats.engagement || ''} onChange={(e) => handleInstaStats('stats', 'engagement', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Compartilhamentos</label>
                        <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm mt-1" placeholder="Ex: 120" value={instaStats.shares || ''} onChange={(e) => handleInstaStats('stats', 'shares', e.target.value)} />
                    </div>
                </div>

                <div className={`grid md:grid-cols-2 gap-6 ${!isPremium ? 'opacity-20 pointer-events-none' : ''}`}>
                    {/* Faixa Etária */}
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Público (Idade)</label>
                        <div className="flex items-center gap-2">
                            <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm" placeholder="Min (18)" value={ageRange.min} onChange={(e) => { setAgeRange({...ageRange, min: e.target.value}); handleInstaStats('audience', 'age', `${e.target.value}-${ageRange.max}`); }} />
                            <span className="text-slate-500">-</span>
                            <input className="w-full bg-black border border-slate-700 p-2 rounded text-white text-sm" placeholder="Max (34)" value={ageRange.max} onChange={(e) => { setAgeRange({...ageRange, max: e.target.value}); handleInstaStats('audience', 'age', `${ageRange.min}-${e.target.value}`); }} />
                        </div>
                    </div>
                    {/* Gênero */}
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Gênero (%)</label>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full">
                                <input className="w-full bg-black border border-slate-700 p-2 pl-8 rounded text-white text-sm" placeholder="Homens" value={genderSplit.men} onChange={(e) => { setGenderSplit({...genderSplit, men: e.target.value}); handleInstaStats('audience', 'gender', `${e.target.value}% Homens, ${genderSplit.women}% Mulheres`); }} />
                                <span className="absolute left-2 top-2.5 text-blue-500 text-xs font-bold">H</span>
                            </div>
                            <div className="relative w-full">
                                <input className="w-full bg-black border border-slate-700 p-2 pl-8 rounded text-white text-sm" placeholder="Mulheres" value={genderSplit.women} onChange={(e) => { setGenderSplit({...genderSplit, women: e.target.value}); handleInstaStats('audience', 'gender', `${genderSplit.men}% Homens, ${e.target.value}% Mulheres`); }} />
                                <span className="absolute left-2 top-2.5 text-pink-500 text-xs font-bold">M</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. CIDADES (Manual) - TAMBÉM BLOQUEADO */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative">
                
                {/* TRAVA VISUAL (Overlay) - Reusado */}
                {!isPremium && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-slate-700/50">
                        <Lock size={24} className="text-yellow-500 mb-2" />
                        <p className="text-white font-bold text-xs">Recurso Premium</p>
                    </div>
                )}

                <h3 className="text-purple-500 font-bold uppercase text-sm mb-6 flex items-center gap-2">
                    <MapPin size={18}/> Principais Cidades
                </h3>
                <textarea 
                    className={`w-full bg-black border border-slate-700 p-3 rounded text-white text-sm min-h-[100px] ${!isPremium ? 'opacity-20' : ''}`}
                    placeholder="Ex: São Paulo (45%), Rio de Janeiro (20%), Curitiba (10%)..."
                    value={perfil.socials.instagram?.audience?.cities || ''}
                    onChange={(e) => handleInstaStats('audience', 'cities', e.target.value)}
                    disabled={!isPremium}
                />
                <p className="text-[10px] text-slate-500 mt-2">Digite as cidades e porcentagens conforme aparecem nos seus insights do Instagram.</p>
            </div>
        </div>
    );
}