import React from 'react';
import Link from 'next/link';
import { Eye, TrendingUp, Building2, Calendar, Medal, Lock } from 'lucide-react';

export default function TabMetricas({ 
    perfil, 
    setPerfil, // Para atualizar os estados locais de audiencia
    handleInstaStats, 
    totalViews, 
    profileViews, 
    isPremium,
    formatNumber,
    ageRange, setAgeRange,
    genderSplit, setGenderSplit
}) {
    
    // Componente interno de Lock (Cadeado)
    const PremiumLock = ({ text }) => ( 
        <div className="bg-slate-900/50 border border-yellow-500/20 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 opacity-80"> 
            <Lock className="text-yellow-500 mb-2" size={32} /> 
            <h3 className="text-white font-bold">Funcionalidade Premium</h3> 
            <p className="text-slate-400 text-sm mb-4">{text}</p> 
            <a href="#" target="_blank" className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold py-2 px-4 rounded transition">LIBERAR AGORA</a> 
        </div> 
    );

    return (
        <div className="space-y-6">
            
            {/* VISITAS E GAMIFICAÇÃO */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2"><Eye size={18}/> Visitas no Perfil</h3>
                    <div className="ml-auto bg-black px-3 py-1 rounded-full border border-slate-700 text-sm font-mono text-white">Total: {totalViews}</div>
                </div>

                <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h4 className="text-purple-400 font-bold text-xs uppercase mb-2 flex items-center gap-2"><TrendingUp size={14}/> Gamificação de Visitas</h4>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>XP Ganho esta semana: <b className="text-white">{perfil.weekly_stats?.visits_xp_earned || 0}</b> / 500</span>
                        <span>Próximo marco: <b className="text-white">{(perfil.weekly_stats?.visits_snapshot || 0) + 300}</b> views</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, ((perfil.weekly_stats?.visits_xp_earned || 0) / 500) * 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Você ganha +50 XP a cada 300 novas visitas (Max 500 XP/semana).</p>
                </div>

                <div className="space-y-2">
                    {profileViews.length === 0 ? <p className="text-sm text-slate-500 text-center italic">Nenhuma visita de empresa/evento identificada ainda.</p> : profileViews.map((view, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded border border-slate-800">
                            <div className="flex items-center gap-3">
                                {view.detalhes?.foto_url && isPremium ? 
                                    <img src={view.detalhes.foto_url} alt="Visitante" className="w-10 h-10 rounded-full object-cover border border-slate-700" /> : 
                                    <div className={`p-2 rounded-full ${view.visitante_tipo === 'empresa' ? 'bg-purple-900/20 text-purple-400' : view.visitante_tipo === 'evento' ? 'bg-orange-900/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {view.visitante_tipo === 'empresa' ? <Building2 size={16}/> : view.visitante_tipo === 'evento' ? <Calendar size={16}/> : <Medal size={16}/>}
                                    </div>
                                }
                                <div>
                                    {isPremium ? (
                                        view.detalhes ? 
                                        <Link href={`/${view.detalhes.slug}`} target="_blank" className="font-bold text-sm text-white hover:text-cyan-400 hover:underline">{view.detalhes.apelido || view.detalhes.nome}</Link> : 
                                        <p className="font-bold text-sm text-white">Visitante não identificado</p>
                                    ) : (
                                        <div className="flex flex-col"><span className="font-bold text-sm blur-sm select-none text-slate-400">Usuário Oculto</span><span className="text-[10px] text-yellow-500 font-bold">PREMIUM</span></div>
                                    )}
                                    <p className="text-xs text-slate-500 capitalize">{view.visitante_tipo}</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600">{new Date(view.created_at).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
                
                {!isPremium && profileViews.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                        <p className="text-yellow-500 text-xs font-bold mb-2">Empresas estão vendo você!</p>
                        <p className="text-slate-400 text-xs mb-3">Vire Premium para saber exatamente quem são.</p>
                        <a href="#" target="_blank" className="text-xs bg-yellow-500 text-black font-bold px-3 py-1 rounded">Desbloquear Lista</a>
                    </div>
                )}
            </div>

            {/* INSTAGRAM STATS */}
            <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                <h3 className="text-pink-500 font-bold uppercase text-sm mb-4">Performance Instagram</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500">Alcance</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 15.000" value={perfil.socials?.instagram?.stats?.reach} onChange={e => handleInstaStats('stats', 'reach', formatNumber(e.target.value))} /></div>
                    <div><label className="text-xs text-slate-500">Impressões</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 50.000" value={perfil.socials?.instagram?.stats?.impressions} onChange={e => handleInstaStats('stats', 'impressions', formatNumber(e.target.value))} /></div>
                    <div><label className="text-xs text-slate-500">Compartilhamentos</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 25.000" value={perfil.socials?.instagram?.stats?.shares} onChange={e => handleInstaStats('stats', 'shares', formatNumber(e.target.value))} /></div>
                    <div><label className="text-xs text-slate-500">Engajamento (%)</label><input disabled={!isPremium} className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: 8.5%" value={perfil.socials?.instagram?.stats?.engagement} onChange={e => handleInstaStats('stats', 'engagement', e.target.value)} /></div>
                </div>
                {!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere métricas" /></div>}
            </div>

            {/* PUBLICO / DEMOGRAFIA */}
            <div className={`bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden ${!isPremium ? 'opacity-80' : ''}`}>
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Público</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="text-xs text-slate-500">Idade</label>
                        <div className="flex gap-2">
                            <input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.min} onChange={e => setAgeRange({...ageRange, min: e.target.value})} />
                            <span className="text-slate-500">-</span>
                            <input disabled={!isPremium} className="bg-black border border-slate-700 p-2 w-full text-center" value={ageRange.max} onChange={e => setAgeRange({...ageRange, max: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Gênero</label>
                        <div className="flex gap-2">
                            <input disabled={!isPremium} placeholder="% H" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.men} onChange={e => setGenderSplit({...genderSplit, men: e.target.value})} />
                            <input disabled={!isPremium} placeholder="% M" className="bg-black border border-slate-700 p-2 w-full text-center" value={genderSplit.women} onChange={e => setGenderSplit({...genderSplit, women: e.target.value})} />
                        </div>
                    </div>
                </div>
                {!isPremium && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10"><PremiumLock text="Libere demografia" /></div>}
            </div>
        </div>
    );
}