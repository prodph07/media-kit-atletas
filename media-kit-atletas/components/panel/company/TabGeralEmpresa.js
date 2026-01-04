import React from 'react';
import { Camera, Link as LinkIcon, Check, Lock, Building2, Globe } from 'lucide-react';
import { AvatarLevel } from '../../AvatarLevel'; 

export default function TabGeralEmpresa({ 
    perfil, 
    setPerfil, 
    handleChange, 
    handleSlugChange, 
    openWidget, 
    handleDeleteProfilePic, 
    isPremium 
}) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid gap-6">
            <div className="flex items-center gap-2 mb-2">
                <Building2 className="text-purple-400" />
                <h3 className="text-purple-400 font-bold uppercase text-sm">Dados da Empresa</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-xl border border-slate-700 border-dashed">
                <div onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="cursor-pointer group relative transition-transform hover:scale-105">
                    <AvatarLevel foto={perfil.foto_url} level={perfil.level} size="large" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-full z-30">
                         <Camera size={24} className="text-white"/>
                    </div>
                </div>
                <div className="flex gap-4 text-xs mt-4">
                    <button onClick={() => openWidget((url) => setPerfil({...perfil, foto_url: url}))} className="text-purple-400 hover:underline font-bold uppercase">Alterar Logo</button>
                    {perfil.foto_url && <button onClick={handleDeleteProfilePic} className="text-red-500 hover:underline">Remover</button>}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <label className="text-xs text-slate-400 font-bold mb-2 block uppercase">Modo de Edição:</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition"><input type="radio" name="tipo_conta" value="atleta" checked={perfil.tipo_conta === 'atleta'} onChange={handleChange} className="accent-cyan-400"/> Atleta</label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-400"><input type="radio" name="tipo_conta" value="empresa" checked={perfil.tipo_conta === 'empresa'} onChange={handleChange} className="accent-purple-500"/> Empresa</label>
                    </div>
                </div>

                <div><label className="text-xs text-slate-500">Nome da Empresa</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="nome" value={perfil.nome} onChange={handleChange} /></div>
                <div><label className="text-xs text-slate-500">Slogan / Nicho</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="apelido" value={perfil.apelido} onChange={handleChange} /></div>
                
                <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 flex items-center gap-1">Link do Perfil {isPremium && <Check size={10} className="text-green-500"/>}</label>
                    <div className={`flex items-center border p-2 rounded ${isPremium ? 'bg-black border-slate-700' : 'bg-slate-800/50 border-slate-800 opacity-60'}`}>
                        <LinkIcon size={16} className="text-slate-500 mr-2"/><span className="text-slate-500 text-sm mr-1 hidden sm:inline">nocautepages.com/</span>
                        <input className="bg-transparent text-white w-full outline-none font-bold" name="slug" value={perfil.slug} onChange={handleSlugChange} disabled={!isPremium} />
                    </div>
                </div>
            </div>
        </div>
    );
}