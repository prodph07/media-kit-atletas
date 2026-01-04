import React from 'react';

export default function TabContato({ perfil, handleContactChange }) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid md:grid-cols-2 gap-6">
            <div><label className="text-xs text-slate-500">Email Comercial</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="email" value={perfil.contact.email} onChange={handleContactChange} /></div>
            <div><label className="text-xs text-slate-500">Email Empresário</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="managerEmail" value={perfil.contact.managerEmail} onChange={handleContactChange} /></div>
            <div><label className="text-xs text-slate-500">Telefone / Whatsapp</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="phone" value={perfil.contact.phone} onChange={handleContactChange} /></div>
            <div><label className="text-xs text-slate-500">Celular Visível (Formatado)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="phoneDisplay" placeholder="+55 11 99999-9999" value={perfil.contact.phoneDisplay} onChange={handleContactChange} /></div>
            <div><label className="text-xs text-slate-500">Cidade/Estado</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="city" value={perfil.contact.city} onChange={handleContactChange} /></div>
            <div><label className="text-xs text-slate-500">CT (Centro de Treinamento)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="trainingCenter" value={perfil.contact.trainingCenter} onChange={handleContactChange} /></div>
        </div>
    );
}