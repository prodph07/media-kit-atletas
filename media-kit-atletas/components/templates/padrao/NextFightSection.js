import React from 'react';
import { Calendar, MapPin, Swords } from 'lucide-react';

export default function NextFightSection({ nextFight }) {
    // Segurança: se não tiver evento, não mostra nada
    if (!nextFight || !nextFight.event) return null;

    // Função segura para formatar a data (CORRIGIDO: adicionei o espaço após 'const')
    const formatDate = (dateString) => {
        if (!dateString) return 'Data a definir';
        
        // Tenta criar o objeto de data
        const date = new Date(dateString);
        
        // Se a data for inválida (ex: texto), retorna o original
        if (isNaN(date.getTime())) return dateString;

        // Se for válida, formata para PT-BR (UTC para evitar problemas de fuso)
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    return (
        // Margem negativa no topo para "colar" na Hero Section visualmente
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 -mt-6 mb-8 relative z-20 animate-fadeIn">
            
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                
                {/* LADO ESQUERDO: EVENTO E DATA */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-10 w-10 bg-red-600/10 text-red-500 rounded flex items-center justify-center flex-shrink-0 border border-red-600/20">
                        <Swords size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Próximo Combate</p>
                        <h3 className="text-white font-bold text-sm sm:text-base uppercase">{nextFight.event}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={12}/> {formatDate(nextFight.date)}
                            </span>
                            {nextFight.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12}/> {nextFight.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* DIVISOR NO MOBILE */}
                <div className="w-full h-px bg-zinc-800 sm:hidden"></div>

                {/* LADO DIREITO: VS OPONENTE */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-right">
                    <div className="text-right w-full sm:w-auto">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Adversário</p>
                        <p className="text-white font-bold text-sm sm:text-base">{nextFight.opponent || "A Definir"}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}