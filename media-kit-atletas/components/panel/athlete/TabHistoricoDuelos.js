import React from 'react';
import Link from 'next/link';
import { Swords, Clock, ExternalLink, Trash2 } from 'lucide-react';

export default function TabHistoricoDuelos({ meusDuelos, perfilId, handleDueloAction }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-purple-400 font-bold uppercase text-sm">Todos os Duelos</h3>
                <Link href="/duelos/criar" className="text-xs bg-yellow-500 text-black px-3 py-1 rounded font-bold flex items-center gap-1">
                    <Swords size={12}/> Criar Novo
                </Link>
            </div>
            
            {meusDuelos.length === 0 ? (
                <div className="text-center py-10 bg-slate-900 rounded-xl border border-slate-800">
                    <Swords size={40} className="mx-auto text-slate-600 mb-2"/>
                    <p className="text-slate-500">Você ainda não participou de nenhum duelo.</p>
                </div>
            ) : (
                meusDuelos.map(duelo => {
                    const souP1 = duelo.p1.id === perfilId; 
                    const oponente = souP1 ? duelo.p2 : duelo.p1; 
                    const total = duelo.votos_1 + duelo.votos_2; 
                    
                    let statusColor = 'bg-slate-700 text-slate-300'; 
                    let statusText = 'Desconhecido'; 
                    
                    if(duelo.status === 'active') { statusColor = 'bg-green-500/20 text-green-400 border border-green-500/30'; statusText = 'Ativo'; } 
                    if(duelo.status === 'pending') { statusColor = 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'; statusText = 'Pendente'; } 
                    const isExpired = new Date(duelo.expires_at) < new Date(); 
                    if(isExpired) { statusColor = 'bg-red-500/20 text-red-400 border border-red-500/30'; statusText = 'Expirado'; }
                    
                    return (
                        <div key={duelo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <img src={oponente.foto_url || "https://placehold.co/100"} className="w-14 h-14 rounded-full object-cover border-2 border-slate-600" />
                                    <div className="absolute -bottom-1 -right-1 bg-black text-[10px] px-1 rounded border border-slate-700">VS</div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Contra</p>
                                    <h4 className="font-bold text-white text-lg leading-none">{oponente.apelido || oponente.nome}</h4>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={10}/> {new Date(duelo.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${statusColor}`}>{statusText}</div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold">{total} Votos</p>
                                    <p className="text-[10px] text-slate-600">Total</p>
                                </div>
                                <Link href={`/duelos/${duelo.id}`} target="_blank" className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 border border-slate-700"><ExternalLink size={18}/></Link>
                                <button onClick={() => { if(confirm("Excluir duelo?")) handleDueloAction(duelo.id, 'delete') }} className="p-2 bg-red-900/20 hover:bg-red-900/40 rounded text-red-500 border border-red-900/30"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );
}