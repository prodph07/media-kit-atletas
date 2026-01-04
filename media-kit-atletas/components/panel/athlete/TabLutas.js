import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const RESULTADOS = ["W", "L", "D", "NC"];

export default function TabLutas({ perfil, setPerfil, handleNextFightChange }) {
    
    // Lógica local para manipular o array de histórico
    const handleAddLuta = () => { 
        setPerfil({
            ...perfil, 
            historico: [{ result: 'W', event: 'Evento', opponent: 'Oponente', date: '2025' }, ...perfil.historico]
        }); 
    };

    const handleFightChange = (index, field, value) => { 
        const n = [...perfil.historico]; 
        n[index][field] = value; 
        setPerfil({...perfil, historico: n}); 
    };

    const handleDeleteLuta = (index) => {
        const n = [...perfil.historico]; 
        n.splice(index, 1); 
        setPerfil({...perfil, historico: n});
    };

    return (
        <div className="space-y-6">
            {/* PRÓXIMA LUTA */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Próxima Luta</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500">Data</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="date" value={perfil.nextFight.date} onChange={handleNextFightChange} /></div>
                    <div><label className="text-xs text-slate-500">Evento</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="event" value={perfil.nextFight.event} onChange={handleNextFightChange} /></div>
                    <div><label className="text-xs text-slate-500">Oponente</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="opponent" value={perfil.nextFight.opponent} onChange={handleNextFightChange} /></div>
                    <div><label className="text-xs text-slate-500">Local</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" name="location" value={perfil.nextFight.location} onChange={handleNextFightChange} /></div>
                </div>
            </div>

            {/* HISTÓRICO */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between mb-4">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Histórico de Lutas</h3>
                    <button onClick={handleAddLuta} className="text-xs bg-cyan-600 px-3 py-1 rounded flex items-center gap-1"><PlusCircle size={14}/> Adicionar</button>
                </div>
                <div className="space-y-2">
                    {perfil.historico.map((luta, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 bg-black/50 p-2 rounded border border-slate-800 items-center">
                            <div className="col-span-2">
                                <select value={luta.result} onChange={(e) => handleFightChange(i, 'result', e.target.value)} className={`w-full p-1 rounded font-bold ${luta.result === 'W' ? 'bg-green-900 text-green-400' : luta.result === 'L' ? 'bg-red-900 text-red-400' : 'bg-slate-700'}`}>
                                    {RESULTADOS.map(r=><option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="col-span-4"><input value={luta.event} onChange={(e) => handleFightChange(i, 'event', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs" placeholder="Evento"/></div>
                            <div className="col-span-3"><input value={luta.opponent} onChange={(e) => handleFightChange(i, 'opponent', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs" placeholder="Oponente"/></div>
                            <div className="col-span-2"><input value={luta.date} onChange={(e) => handleFightChange(i, 'date', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-xs text-right" placeholder="Data"/></div>
                            <div className="col-span-1 text-center">
                                <button onClick={() => handleDeleteLuta(i)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}