import React, { useState, useRef } from 'react';
import { Download, Share2, Shield, X } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function FightCardGenerator({ eventName, date, category, athleteA, athleteB, onClose }) {
    const cardRef = useRef(null);
    const [generating, setGenerating] = useState(false);
    const [template, setTemplate] = useState('square'); // 'square' (feed) or 'vertical' (story)

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true, // Important for fetching images from Supabase/External
                scale: 2, // Retin quality
                backgroundColor: null,
            });

            const link = document.createElement('a');
            link.download = `fight-card-${athleteA.nome}-vs-${athleteB.nome}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Erro ao gerar card:", err);
            alert("Erro ao gerar a imagem. Tente novamente.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-4xl p-6 relative flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X size={24} />
                </button>

                {/* CONTROLS */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h3 className="text-2xl font-display font-black text-white italic uppercase">Gerador de Card</h3>
                        <p className="text-sm text-gray-400">Crie artes profissionais para divulgar sua luta.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Formato</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTemplate('square')}
                                    className={`flex-1 py-3 rounded-lg border font-bold text-sm transition-all ${template === 'square' ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'}`}
                                >
                                    Quadrado (Feed)
                                </button>
                                <button
                                    onClick={() => setTemplate('vertical')}
                                    className={`flex-1 py-3 rounded-lg border font-bold text-sm transition-all ${template === 'vertical' ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'}`}
                                >
                                    Vertical (Story)
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                                <Shield size={14} className="text-[#FFD700]" /> Dados da Luta
                            </h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li><strong className="text-gray-300">Evento:</strong> {eventName}</li>
                                <li><strong className="text-gray-300">Data:</strong> {new Date(date).toLocaleDateString()}</li>
                                <li><strong className="text-gray-300">Categoria:</strong> {category}</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={generating}
                            className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {generating ? 'Gerando...' : <><Download size={20} /> Baixar Card</>}
                        </button>
                    </div>
                </div>

                {/* PREVIEW AREA */}
                <div className="flex-1 flex items-center justify-center bg-[#0c0c0c] rounded-xl border border-[#222] p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                    {/* THE CARD ITSELF */}
                    <div
                        ref={cardRef}
                        className={`relative bg-black text-white shadow-2xl overflow-hidden flex flex-col
                            ${template === 'square' ? 'w-[400px] h-[400px]' : 'w-[320px] h-[568px]'}
                        `}
                    >
                        {/* Background Image (Optional/Generic) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0">
                            {/* Texture overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>

                        {/* VS Splash */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                            <h1 className="text-[80px] font-display font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#FF4500] to-red-900 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] leading-none">
                                VS
                            </h1>
                        </div>

                        {/* Event Header */}
                        <div className="relative z-10 w-full p-4 text-center bg-gradient-to-b from-black/80 to-transparent">
                            <h2 className="text-lg font-display font-bold uppercase tracking-widest text-[#FFD700] drop-shadow-md">{eventName}</h2>
                            <p className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">{new Date(date).toLocaleDateString()} • {category}</p>
                        </div>

                        {/* Fighters Container */}
                        <div className="flex-1 grid grid-cols-2 relative z-10">

                            {/* Fighter A (Red Corner) */}
                            <div className="relative h-full border-r border-red-600/30">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent"></div>
                                <div className="h-full flex flex-col justify-end pb-12 items-center">
                                    <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
                                        {athleteA.foto_url ? (
                                            <img src={athleteA.foto_url} className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition duration-500 scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Bot size={48} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative z-20 text-center bg-black/60 w-full py-2 backdrop-blur-sm border-t border-red-600">
                                        <h3 className="font-display font-black text-xl uppercase italic leading-none">{athleteA.nome.split(' ')[0]}</h3>
                                        <p className="text-xs font-bold text-red-500 uppercase">{athleteA.apelido || 'Fighter'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fighter B (Blue Corner) */}
                            <div className="relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-l from-blue-600/10 to-transparent"></div>
                                <div className="h-full flex flex-col justify-end pb-12 items-center">
                                    <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
                                        {athleteB.foto_url ? (
                                            <img src={athleteB.foto_url} className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition duration-500 scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Bot size={48} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative z-20 text-center bg-black/60 w-full py-2 backdrop-blur-sm border-t border-blue-600">
                                        <h3 className="font-display font-black text-xl uppercase italic leading-none">{athleteB.nome.split(' ')[0]}</h3>
                                        <p className="text-xs font-bold text-blue-500 uppercase">{athleteB.apelido || 'Opponent'}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="relative z-10 w-full p-2 bg-black flex justify-between items-center border-t border-[#333]">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-white" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FIGHTNEXUS</span>
                            </div>
                            <div className="flex gap-2">
                                {/* Optional Sponsor Logos placeholders */}
                                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper icon component if Bot is not imported
function Bot({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
        </svg>
    )
}
