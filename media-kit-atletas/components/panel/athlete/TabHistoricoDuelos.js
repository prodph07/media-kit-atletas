import React from 'react';
import Link from 'next/link';
import { Swords, Clock, ExternalLink, Trash2, AlertCircle } from 'lucide-react';

export default function TabHistoricoDuelos({ meusDuelos, perfilId, handleDueloAction }) {
    
    // Filtra para garantir que não quebre se vier nulo
    const listaDuelos = meusDuelos || [];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-purple-400 font-bold uppercase text-sm">Meus Combates</h3>
                <Link href="/duelos/criar" className="text-xs bg-yellow-500 hover:bg-yellow-400 transition text-black px-4 py-2 rounded-full font-bold flex items-center gap-1 shadow-lg shadow-yellow-900/20">
                    <Swords size={14}/> Criar Novo
                </Link>
            </div>
            
            {listaDuelos.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    <Swords size={40} className="mx-auto text-slate-600 mb-3 opacity-50"/>
                    <p className="text-slate-400 font-medium">Nenhum duelo encontrado.</p>
                    <p className="text-xs text-slate-600 mt-1">Crie um desafio para começar a ganhar votos.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {listaDuelos.map(duelo => {
                        // Definições de quem é quem
                        const souP1 = duelo.p1?.id === perfilId;
                        const oponente = souP1 ? duelo.p2 : duelo.p1;
                        
                        // Proteção contra dados corrompidos
                        if (!oponente) return null;

                        const total = (duelo.votos_1 || 0) + (duelo.votos_2 || 0);
                        
                        // Definição de Status
                        let statusColor = 'bg-slate-800 text-slate-400 border-slate-700'; 
                        let statusText = 'Desconhecido'; 
                        
                        const isExpired = new Date(duelo.expires_at) < new Date(); 

                        if(duelo.status === 'active') { 
                            statusColor = 'bg-green-500/10 text-green-400 border-green-500/20'; 
                            statusText = 'Ativo'; 
                        } 
                        if(duelo.status === 'pending') { 
                            statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'; 
                            statusText = 'Pendente'; 
                        } 
                        if(isExpired && duelo.status !== 'pending') { 
                            statusColor = 'bg-red-500/10 text-red-400 border-red-500/20'; 
                            statusText = 'Finalizado'; 
                        }
                        
                        return (
                            <div key={duelo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-700 transition group">
                                
                                {/* Info do Oponente */}
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="relative">
                                        <img 
                                            src={oponente.foto_url || "https://placehold.co/100"} 
                                            className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-slate-500 transition" 
                                            alt="Oponente"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-black text-[10px] font-black text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">VS</div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold">
                                            {souP1 ? 'Desafiado' : 'Desafiante'}
                                        </p>
                                        <h4 className="font-bold text-white text-lg leading-none mb-1">
                                            {oponente.apelido || oponente.nome}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <Clock size={10}/> {new Date(duelo.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Ações e Status */}
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800 pt-3 sm:border-0 sm:pt-0">
                                    
                                    <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
                                        {statusText}
                                    </div>

                                    <div className="text-right px-2 border-r border-slate-800">
                                        <p className="text-xs text-slate-200 font-bold">{total}</p>
                                        <p className="text-[9px] text-slate-600 uppercase">Votos</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/duelos/${duelo.id}`} 
                                            target="_blank" 
                                            className="p-2 bg-slate-800 hover:bg-cyan-900/30 hover:text-cyan-400 hover:border-cyan-500/30 transition rounded text-slate-400 border border-slate-700"
                                            title="Ver Duelo"
                                        >
                                            <ExternalLink size={16}/>
                                        </Link>
                                        
                                        {/* BOTÃO DELETAR VISÍVEL PARA AMBOS AGORA */}
                                        <button 
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                if(confirm("Tem certeza que deseja excluir este duelo?")) {
                                                    handleDueloAction(duelo.id, 'delete');
                                                }
                                            }} 
                                            className="p-2 bg-red-900/10 hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/30 transition rounded text-red-700 border border-red-900/20"
                                            title="Excluir Duelo"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}