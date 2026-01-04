import React from 'react';
import { Play, Image as ImageIcon, Video } from 'lucide-react';

export default function MediaSection({ athleteData, onOpenMedia }) {
    // Garante que pega as listas, mesmo que venham nulas
    const videos = athleteData.video_lista || [];
    const gallery = athleteData.galeria || [];

    // Se não tiver nada, não renderiza a seção
    if (videos.length === 0 && gallery.length === 0) return null;

    return (
        <div id="media-section" className="w-full max-w-7xl mx-auto mb-20 animate-fadeIn relative z-10">
            
            <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                    <Video size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight italic">Galeria & Mídia</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
                
                {/* --- RENDERIZAÇÃO DOS VÍDEOS --- */}
                {videos.map((video, idx) => {
                    // Lógica Híbrida: Aceita tanto String (Link) quanto Objeto
                    const isString = typeof video === 'string';
                    const embedUrl = isString ? video : (video.embedUrl || video.url);
                    const title = isString ? "Vídeo" : (video.title || "Highlight");
                    const thumb = isString ? null : video.thumb;

                    if (!embedUrl) return null;

                    return (
                        <div 
                            key={`vid-${idx}`} 
                            onClick={() => onOpenMedia('video', embedUrl)}
                            className="group relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg"
                        >
                            {/* Thumbnail (Se existir, ou fallback escuro) */}
                            {thumb ? (
                                <img 
                                    src={thumb} 
                                    alt={title} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                                    <Play className="text-slate-700 w-12 h-12" />
                                </div>
                            )}

                            {/* Ícone de Play Central */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all duration-300">
                                    <Play className="w-6 h-6 text-white ml-1 fill-white" />
                                </div>
                            </div>

                            {/* Título no Rodapé */}
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <p className="text-white font-bold text-sm truncate">{title}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Assistir</p>
                            </div>
                        </div>
                    );
                })}

                {/* --- RENDERIZAÇÃO DA GALERIA (SUPABASE + LEGADO) --- */}
                {gallery.map((img, idx) => {
                    // Lógica Híbrida: Aceita String (Supabase) ou Objeto (Legado)
                    const src = typeof img === 'string' ? img : (img.thumb || img.full || img.url);
                    const full = typeof img === 'string' ? img : (img.full || img.url || img.thumb);

                    if (!src) return null;

                    return (
                        <div 
                            key={`img-${idx}`} 
                            onClick={() => onOpenMedia('image', full)}
                            className="group relative aspect-[4/5] bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-slate-600 transition-all shadow-lg"
                        >
                            <img 
                                src={src} 
                                alt="Galeria" 
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                loading="lazy"
                            />
                            
                            {/* Overlay ao passar o mouse */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <ImageIcon className="text-white w-8 h-8 drop-shadow-md" />
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}