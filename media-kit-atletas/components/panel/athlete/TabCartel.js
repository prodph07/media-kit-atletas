import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function TabCartel({ perfil, setPerfil, handleStatsChange, handleRecordChange }) {
    // Estado local para o input de prêmio (limpa o pai)
    const [novoPremio, setNovoPremio] = useState('');

    const handleAddPremio = () => { 
        if(!novoPremio) return; 
        setPerfil({...perfil, premios: [...perfil.premios, novoPremio]}); 
        setNovoPremio(''); 
    };

    const handleDeletePremio = (index) => {
        const n = [...perfil.premios]; 
        n.splice(index, 1); 
        setPerfil({...perfil, premios: n});
    };

    return (
        <div className="space-y-6">
            {/* ATRIBUTOS FÍSICOS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Atributos Físicos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-xs text-slate-500">Altura</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="height" value={perfil.stats.height} onChange={handleStatsChange} /></div>
                    <div><label className="text-xs text-slate-500">Peso</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="weight" value={perfil.stats.weight} onChange={handleStatsChange} /></div>
                    <div><label className="text-xs text-slate-500">Envergadura</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="reach" value={perfil.stats.reach} onChange={handleStatsChange} /></div>
                    <div><label className="text-xs text-slate-500">Idade</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="age" value={perfil.stats.age} onChange={handleStatsChange} /></div>
                </div>
            </div>

            {/* CARTEL */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Cartel Profissional</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><label className="text-xs text-green-500">Vitórias</label><input className="w-full bg-black border border-green-900/50 p-2 rounded text-white" name="wins" value={perfil.record.wins} onChange={handleRecordChange} /></div>
                    <div><label className="text-xs text-red-500">Derrotas</label><input className="w-full bg-black border border-red-900/50 p-2 rounded text-white" name="losses" value={perfil.record.losses} onChange={handleRecordChange} /></div>
                    <div><label className="text-xs text-yellow-500">Empates</label><input className="w-full bg-black border border-yellow-900/50 p-2 rounded text-white" name="draws" value={perfil.record.draws} onChange={handleRecordChange} /></div>
                    <div><label className="text-xs text-slate-400">K.O.s</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="knockouts" value={perfil.record.knockouts} onChange={handleRecordChange} /></div>
                    <div><label className="text-xs text-slate-400">Subs</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="submissions" value={perfil.record.submissions} onChange={handleRecordChange} /></div>
                </div>
            </div>

            {/* PRÊMIOS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Prêmios</h3>
                <div className="flex gap-2 mb-4">
                    <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Ex: Campeão 2024" value={novoPremio} onChange={(e) => setNovoPremio(e.target.value)} />
                    <button onClick={handleAddPremio} className="bg-cyan-600 p-2 rounded"><PlusCircle size={20}/></button>
                </div>
                <ul className="space-y-2">
                    {perfil.premios.map((p, i) => (
                        <li key={i} className="flex justify-between bg-black/50 p-2 rounded border border-slate-800">
                            <span>{p}</span>
                            <button onClick={() => handleDeletePremio(i)} className="text-red-500"><Trash2 size={16}/></button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}