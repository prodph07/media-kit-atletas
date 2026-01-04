import React from 'react';
import { Camera, Link as LinkIcon, Check, Lock, User, Medal, GraduationCap } from 'lucide-react';
import { AvatarLevel } from '../../AvatarLevel'; 

const ESTILOS_LUTA = ["MMA", "Muay Thai", "Boxe", "Kickboxing", "Jiu-Jitsu Brasileiro (BJJ)", "Wrestling (Luta Olímpica)", "Judô", "Sambo", "Krav Maga", "Capoeira", "Karatê"];

export default function TabGeral({ 
    perfil, 
    setPerfil, 
    handleChange, 
    handleSlugChange, 
    openWidget, 
    handleDeleteProfilePic, 
    isPremium 
}) {
    
    // Função auxiliar para mudar os checkboxes
    const toggleRole = (role) => {
        setPerfil(prev => ({ ...prev, [role]: !prev[role] }));
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-6">
            <h3 className="text-cyan-400 font-bold uppercase text-sm">Informações Básicas</h3>
            
            {/* ÁREA DA FOTO */}
            <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-xl border border-slate-700 border-dashed">
                <div onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="cursor-pointer group relative transition-transform hover:scale-105">
                    <AvatarLevel foto={perfil.foto_url} level={perfil.level} size="large" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-full z-30">
                         <Camera size={24} className="text-white"/>
                    </div>
                </div>
                <div className="flex gap-4 text-xs mt-4">
                    <button onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="text-yellow-500 hover:underline font-bold uppercase">Alterar Foto</button>
                    {perfil.foto_url && <button onClick={handleDeleteProfilePic} className="text-red-500 hover:underline">Remover</button>}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                
                {/* --- NOVO: SELEÇÃO DE PAPÉIS (CHECKBOXES) --- */}
                <div className="md:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <label className="text-xs text-slate-400 font-bold mb-3 block uppercase">O que você faz? (Selecione todos que aplicar)</label>
                    <div className="flex gap-4">
                        {/* Checkbox ATLETA */}
                        <div 
                            onClick={() => toggleRole('is_athlete')}
                            className={`flex-1 flex items-center gap-3 p-3 rounded cursor-pointer border transition-all ${perfil.is_athlete ? 'bg-cyan-900/30 border-cyan-500' : 'bg-black/30 border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${perfil.is_athlete ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'}`}>
                                {perfil.is_athlete && <Check size={14} className="text-black font-bold"/>}
                            </div>
                            <div>
                                <span className={`font-bold text-sm block ${perfil.is_athlete ? 'text-cyan-400' : 'text-slate-400'}`}>Sou Atleta</span>
                                <span className="text-[10px] text-slate-500">Exibir Cartel e Lutas</span>
                            </div>
                        </div>

                        {/* Checkbox TREINADOR */}
                        <div 
                            onClick={() => toggleRole('is_coach')}
                            className={`flex-1 flex items-center gap-3 p-3 rounded cursor-pointer border transition-all ${perfil.is_coach ? 'bg-orange-900/30 border-orange-500' : 'bg-black/30 border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${perfil.is_coach ? 'bg-orange-500 border-orange-500' : 'border-slate-500'}`}>
                                {perfil.is_coach && <Check size={14} className="text-black font-bold"/>}
                            </div>
                            <div>
                                <span className={`font-bold text-sm block ${perfil.is_coach ? 'text-orange-400' : 'text-slate-400'}`}>Sou Treinador</span>
                                <span className="text-[10px] text-slate-500">Exibir Aulas e Graduação</span>
                            </div>
                        </div>
                    </div>

                    {/* Switch para EMPRESA (Mantido pequeno caso queira mudar) */}
                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Ou gerencie uma conta jurídica:</span>
                        <label className="flex items-center gap-1 cursor-pointer text-xs text-purple-400 hover:underline">
                            <input type="radio" name="tipo_conta" value="empresa" checked={perfil.tipo_conta === 'empresa'} onChange={handleChange} className="accent-purple-500"/> 
                            Mudar para Perfil de Empresa
                        </label>
                    </div>
                </div>

                {/* TEMPLATE STYLE */}
                <div className="md:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700 mt-2">
                    <label className="text-xs text-slate-400 font-bold mb-3 block uppercase">Layout do Media Kit</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => setPerfil({...perfil, template_style: 'padrao'})} className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${perfil.template_style === 'padrao' ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
                            <div className="h-10 bg-slate-700 mb-2 rounded flex items-center justify-center text-xs text-slate-400">Padrão</div>
                            <div className="flex justify-between items-center"><span className="font-bold text-white text-sm">Dark Pro</span>{perfil.template_style === 'padrao' && <Check size={16} className="text-cyan-500"/>}</div>
                        </div>
                        <div onClick={() => { if(isPremium) setPerfil({...perfil, template_style: 'cyber'}); else alert("Este template é exclusivo para assinantes Premium!"); }} className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${perfil.template_style === 'cyber' ? 'border-lime-400 bg-lime-900/20' : 'border-slate-700 hover:border-lime-500/50'}`}>
                            <div className="h-10 bg-zinc-900 mb-2 rounded flex items-center justify-center text-xs text-lime-400 font-mono border border-zinc-700">CYBER</div>
                            <div className="flex justify-between items-center"><span className="font-bold text-white text-sm">Cyber</span>{perfil.template_style === 'cyber' && <Check size={16} className="text-lime-400"/>}{!isPremium && <Lock size={16} className="text-yellow-500"/>}</div>
                        </div>
                    </div>
                </div>

                {/* CAMPOS DE TEXTO */}
                <div><label className="text-xs text-slate-500">Nome Completo</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div>
                <div><label className="text-xs text-slate-500">Apelido (Como é conhecido)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div>
                
                <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 flex items-center gap-1">Link Personalizado {isPremium && <Check size={10} className="text-green-500"/>}</label>
                    <div className={`flex items-center border p-2 rounded ${isPremium ? 'bg-black border-slate-700' : 'bg-slate-800/50 border-slate-800 opacity-60'}`}>
                        <LinkIcon size={16} className="text-slate-500 mr-2"/>
                        <span className="text-slate-500 text-sm mr-1 hidden sm:inline">nocautepages.com/</span>
                        <input className="bg-transparent text-white w-full outline-none font-bold" name="slug" value={perfil.slug} onChange={handleSlugChange} disabled={!isPremium} />
                        {!isPremium && <Lock size={16} className="text-yellow-500 ml-2" />}
                    </div>
                </div>

                <div><label className="text-xs text-slate-500">Categoria de Peso (Principal)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="categoria" value={perfil.categoria} onChange={handleChange} /></div>
                
                <div>
                    <label className="text-xs text-slate-500">Estilo Base</label>
                    <select className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="fightingStyle" value={perfil.fightingStyle} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {ESTILOS_LUTA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2"><label className="text-xs text-slate-500">Bio / Sobre Você</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={3} name="about" value={perfil.about} onChange={handleChange} /></div>
            </div>
        </div>
    );
}