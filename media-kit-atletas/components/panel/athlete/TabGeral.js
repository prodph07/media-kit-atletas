import React, { useState } from 'react';
import { User, AlignLeft, Info, Lock, MessageSquareQuote } from 'lucide-react';
import SmartImageUpload from '@/components/SmartImageUpload';

export default function TabGeral({ 
    perfil, 
    setPerfil, 
    handleChange, 
    handleSlugChange, 
    handleDeleteProfilePic, 
    isPremium, 
    userId,
    onUpdateStatus 
}) {
    // Estado local para o input de status
    const [statusTemp, setStatusTemp] = useState(perfil.status_message || "");

    const handleStatusSave = () => {
        if (onUpdateStatus) {
            onUpdateStatus(statusTemp);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* COLUNA 1: FOTO E URL */}
            <div className="md:col-span-1 space-y-6">
                
                {/* CARTÃO DE FOTO DE PERFIL */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center">
                    <div className="relative w-40 h-40 mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-700 bg-black">
                            {perfil.foto_url ? (
                                <img src={perfil.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <User size={48}/>
                                </div>
                            )}
                        </div>
                        {perfil.foto_url && (
                            <button 
                                onClick={handleDeleteProfilePic}
                                className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                title="Remover foto atual"
                            >
                                <User size={16} className="rotate-45" /> 
                            </button>
                        )}
                    </div>

                    <div className="w-full">
                        <SmartImageUpload
                            userId={userId}
                            aspect={1} 
                            buttonLabel="Alterar Foto"
                            onUploadComplete={(newUrl) => {
                                setPerfil(prev => ({ ...prev, foto_url: newUrl }));
                            }}
                        />
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                            Recomendado: Imagem quadrada, rosto centralizado.
                        </p>
                    </div>
                </div>

                {/* NOVO: STATUS DO DIA */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <label className="text-green-400 text-xs font-bold uppercase mb-2 block flex items-center gap-2">
                        <MessageSquareQuote size={14}/> Status do Dia (+15 XP)
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            maxLength={50}
                            value={statusTemp} 
                            onChange={(e) => setStatusTemp(e.target.value)}
                            placeholder="Ex: Focado no treino!"
                            className="bg-slate-950 border border-slate-800 text-white text-sm w-full rounded-lg px-3 py-2 focus:border-green-500 outline-none transition"
                        />
                        <button 
                            onClick={handleStatusSave}
                            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition"
                            title="Atualizar Status"
                        >
                            <MessageSquareQuote size={18}/>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Uma frase curta que aparece no topo do seu perfil.</p>
                </div>

                {/* SLUG / URL */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <label className="text-slate-400 text-xs font-bold uppercase mb-2 block flex justify-between">
                        Seu Link Personalizado
                        {!isPremium && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 rounded border border-yellow-500/20 flex items-center gap-1"><Lock size={10}/> Fixo no Free</span>}
                    </label>
                    <div className={`flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="text-slate-500 text-sm mr-1">athlete.pro/</span>
                        <input 
                            type="text" 
                            name="slug" 
                            value={perfil.slug || ''} 
                            onChange={handleSlugChange}
                            disabled={!isPremium}
                            placeholder="seu-nome"
                            className="bg-transparent border-none text-white text-sm w-full focus:ring-0 p-0 disabled:cursor-not-allowed"
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Este é o link que você compartilhará no Instagram.</p>
                </div>
            </div>

            {/* COLUNA 2: DADOS PESSOAIS (Mantido igual) */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><AlignLeft size={18} className="text-cyan-500"/> Informações Básicas</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Nome Completo</label>
                            <input type="text" name="nome" value={perfil.nome} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Apelido (Fight Name)</label>
                            <input type="text" name="apelido" value={perfil.apelido} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 outline-none transition" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Categoria de Peso</label>
                            <input type="text" name="categoria" value={perfil.categoria} onChange={handleChange} placeholder="Ex: Peso Leve, 70kg" className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Estilo Base</label>
                            <input type="text" name="fightingStyle" value={perfil.fightingStyle || ''} onChange={handleChange} placeholder="Ex: Muay Thai, Jiu-Jitsu" className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 outline-none transition" />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-400 text-xs font-bold uppercase mb-1 block">Sobre Você (Bio)</label>
                        <textarea name="about" value={perfil.about || ''} onChange={handleChange} rows="4" placeholder="Conte um pouco da sua história, títulos e objetivos..." className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 outline-none transition"></textarea>
                    </div>
                </div>

                {/* TIPOS DE PERFIL */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Info size={18} className="text-purple-500"/> Tipo de Perfil</h3>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded border border-slate-800 hover:border-cyan-500 transition">
                            <input 
                                type="checkbox" 
                                checked={perfil.is_athlete} 
                                onChange={(e) => setPerfil({...perfil, is_athlete: e.target.checked})}
                                className="accent-cyan-500 w-4 h-4"
                            />
                            <span className="text-sm font-bold">Sou Atleta</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded border border-slate-800 hover:border-orange-500 transition">
                            <input 
                                type="checkbox" 
                                checked={perfil.is_coach} 
                                onChange={(e) => setPerfil({...perfil, is_coach: e.target.checked})}
                                className="accent-orange-500 w-4 h-4"
                            />
                            <span className="text-sm font-bold">Sou Treinador</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}