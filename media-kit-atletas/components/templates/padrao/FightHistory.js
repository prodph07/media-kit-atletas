import React from 'react';
import { Swords } from 'lucide-react';

export default function FightHistory({ history }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mb-16 animate-fadeIn">
            <h3 className="text-white font-bold uppercase text-lg mb-6 flex items-center gap-2 px-4 sm:px-0">
                <Swords className="text-red-500"/> Histórico de Lutas
            </h3>
            
            <div className="overflow-x-auto px-4 sm:px-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest">
                            <th className="py-3 px-4 w-32">Resultado</th>
                            <th className="py-3 px-4">Evento</th>
                            <th className="py-3 px-4 text-right">Data</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-300">
                        {history.map((fight, idx) => (
                            <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                                {/* 1. Resultado */}
                                <td className="py-4 px-4">
                                    <span className={`font-bold px-3 py-1 rounded text-xs uppercase ${
                                        fight.result === 'Vitória' ? 'bg-green-900/30 text-green-500' : 
                                        fight.result === 'Derrota' ? 'bg-red-900/30 text-red-500' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {fight.result}
                                    </span>
                                </td>
                                
                                {/* 2. Evento */}
                                <td className="py-4 px-4 font-bold text-white">
                                    {fight.event || "Evento não informado"}
                                </td>
                                
                                {/* 3. Data */}
                                <td className="py-4 px-4 text-right text-slate-500 font-mono text-xs">
                                    {fight.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}