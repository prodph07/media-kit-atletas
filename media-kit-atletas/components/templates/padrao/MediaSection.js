import React from 'react';
import { Play } from 'lucide-react';

export default function MediaSection({ athleteData, onOpenMedia }) {
    return (
        <section id="media-section" className="animate-fadeIn scroll-mt-24"> 
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
                    Galeria e <span className="text-cyan-400">Vídeos</span>
                </h2>
                <div className="h-px bg-slate-800 flex-grow"></div>
            </div> 
            
            {/* VÍDEOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"> 
                {athleteData.videos?.map((item, index) => ( 
                    <div key={index} onClick={() => onOpenMedia('video', item.embedUrl)} className="group relative aspect-video bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-400/50 transition-all"> 
                        <img src={item.thumb || "https://placehold.co/600x400/1e293b/FFF?text=VIDEO"} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /> 
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/80 text-black flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Play fill="currentColor" size={20} />
                            </div>
                        </div> 
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                            <p className="text-white font-bold text-sm truncate">{item.title}</p>
                        </div> 
                    </div> 
                ))} 
            </div> 
            
            {/* FOTOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> 
                {athleteData.gallery?.map((item, index) => ( 
                    <div key={index} onClick={() => onOpenMedia('image', item.full)} className="aspect-square bg-slate-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer border border-slate-800 hover:border-cyan-400/30"> 
                        <img src={item.thumb || "https://placehold.co/400x400/1e293b/FFF?text=FOTO"} alt={`Galeria ${index}`} className="w-full h-full object-cover" /> 
                    </div> 
                ))} 
            </div> 
        </section>
    );
}