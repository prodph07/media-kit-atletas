import React from 'react';

export default function FightHistory({ history }) {
    if (!history || history.length === 0) return null;

    // Helper to determine badge color based on result string
    const getResultStyle = (result) => {
        const lower = (result || '').toLowerCase();
        if (lower.includes('win') || lower.includes('vitória') || lower.includes('vitoria')) {
            return {
                bg: 'bg-green-500/10',
                text: 'text-green-500',
                border: 'border-green-500/50',
                label: 'Win'
            };
        }
        if (lower.includes('loss') || lower.includes('derrota')) {
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-500',
                border: 'border-red-500/50',
                label: 'Loss'
            };
        }
        return {
            bg: 'bg-gray-500/10',
            text: 'text-gray-400',
            border: 'border-gray-500/50',
            label: result || '-'
        };
    };

    return (
        <section className="bg-[#1E1E1E] border border-[#333333] p-6 md:p-8 animate-fadeIn" id="history">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
            `}</style>

            <div className="mb-8 border-b border-gray-800 pb-2">
                <h3 className="font-display font-bold text-4xl md:text-5xl text-white uppercase italic tracking-tighter inline-block border-b-4 border-[#FF4500] pb-1">
                    Histórico Recente
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <th className="py-4 pl-4 pr-2">Resultado</th>
                            <th className="py-4 px-4">Oponente</th>
                            <th className="py-4 px-4">Método</th>
                            <th className="py-4 pl-2 pr-4 text-right">Evento / Data</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-800/50">
                        {history.map((fight, idx) => {
                            const style = getResultStyle(fight.result);

                            return (
                                <tr key={idx} className="group hover:bg-[#252525] transition-colors duration-200">
                                    {/* RESULTADO */}
                                    <td className="py-5 pl-4 pr-2 align-middle">
                                        <span className={`inline-flex items-center justify-center ${style.bg} ${style.text} border ${style.border} px-3 py-1 text-[11px] font-black uppercase tracking-wider transform -skew-x-12`}>
                                            <span className="transform skew-x-12">{style.label}</span>
                                        </span>
                                    </td>

                                    {/* OPONENTE */}
                                    <td className="py-5 px-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold font-display text-lg uppercase tracking-wide group-hover:text-[#FF4500] transition-colors">
                                                {fight.opponent || "—"}
                                            </span>
                                            {fight.opponent_gym && (
                                                <span className="text-xs text-gray-600 font-bold uppercase">{fight.opponent_gym}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* MÉTODO */}
                                    <td className="py-5 px-4 align-middle">
                                        <span className="text-gray-400 font-medium uppercase text-xs tracking-wider">
                                            {fight.method || "Decisão"}
                                        </span>
                                        {(fight.round || fight.time) && (
                                            <span className="block text-[10px] text-gray-600 font-mono mt-0.5">
                                                {fight.round ? `Round ${fight.round}` : ''} {fight.time ? `• ${fight.time}` : ''}
                                            </span>
                                        )}
                                    </td>

                                    {/* EVENTO / DATA */}
                                    <td className="py-5 pl-2 pr-4 text-right align-middle">
                                        <div className="flex flex-col items-end">
                                            <span className="text-white font-bold uppercase tracking-tight">
                                                {fight.event || "Evento Desconhecido"}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono mt-1">
                                                {fight.date}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}