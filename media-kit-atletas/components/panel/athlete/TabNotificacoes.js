import React from 'react';
import { Swords, GraduationCap, Check, X } from 'lucide-react';

export default function TabNotificacoes({ notificacoes, convitesEquipe, handleDueloAction, handleEquipeAction }) {
    
    const hasDuelos = notificacoes.length > 0;
    const hasConvites = convitesEquipe && convitesEquipe.length > 0;

    if (!hasDuelos && !hasConvites) {
        return (
            <div className="text-center p-10 bg-slate-900 rounded-xl border border-slate-800 text-slate-500">
                Nenhuma solicitação pendente no momento.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            
            {/* 1. SEÇÃO DE CONVITES DE EQUIPE (NOVO) */}
            {hasConvites && (
                <div className="space-y-4">
                    <h3 className="text-orange-500 font-bold uppercase text-sm flex items-center gap-2">
                        <GraduationCap size={18}/> Convites de Treinadores/Equipe
                    </h3>
                    {convitesEquipe.map(convite => (
                        <div key={convite.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-fadeIn">
                            <div className="flex items-center gap-4">
                                <img src={convite.coach?.foto_url || "https://placehold.co/100"} className="w-16 h-16 rounded-full object-cover border-2 border-orange-500" />
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Quer te adicionar como aluno</p>
                                    <h4 className="text-xl font-bold text-white">{convite.coach?.apelido || convite.coach?.nome}</h4>
                                    <p className="text-slate-500 text-xs">{convite.coach?.coach_details?.team || 'Sem Equipe Cadastrada'}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => handleEquipeAction(convite.id, 'reject')} className="flex-1 sm:flex-none px-4 py-2 bg-red-900/20 text-red-500 font-bold rounded hover:bg-red-900/40 transition flex items-center justify-center gap-2"><X size={16}/> Recusar</button>
                                <button onClick={() => handleEquipeAction(convite.id, 'accept')} className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition flex items-center justify-center gap-2"><Check size={16}/> ACEITAR</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. SEÇÃO DE DUELOS (MANTIDA) */}
            {hasDuelos && (
                <div className="space-y-4">
                    <h3 className="text-yellow-500 font-bold uppercase text-sm flex items-center gap-2">
                        <Swords size={18}/> Desafios de Duelo
                    </h3>
                    {notificacoes.map(duelo => (
                        <div key={duelo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <img src={duelo.desafiante.foto_url} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Desafiante</p>
                                    <h4 className="text-xl font-bold text-white">{duelo.desafiante.apelido || duelo.desafiante.nome}</h4>
                                    <p className="text-slate-500 text-xs">Criado em {new Date(duelo.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => handleDueloAction(duelo.id, 'reject')} className="flex-1 sm:flex-none px-6 py-3 bg-red-900/30 text-red-500 font-bold rounded hover:bg-red-900/50 transition">Recusar</button>
                                <button onClick={() => handleDueloAction(duelo.id, 'accept')} className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition">ACEITAR DESAFIO</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}