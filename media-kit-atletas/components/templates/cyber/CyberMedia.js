import React from 'react';
import { Play } from 'lucide-react';

export default function CyberMedia({ athleteData, onOpenMedia }) {
    if (!((athleteData.videos && athleteData.videos.length > 0) || (athleteData.gallery && athleteData.gallery.length > 0))) return null;

    return (
        <section id="media"> 
            <h3 className="font-display font-bold text-4xl text-white mb-8 text-right">GALERIA <span className="text-lime-400">&</span> VÍDEOS</h3> 
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:auto-rows-[200px]"> 
                
                {/* VÍDEOS */}
                {athleteData.videos && athleteData.videos.map((video, idx) => ( 
                    <div key={`vid-${idx}`} onClick={() => onOpenMedia('video', video.embedUrl)} className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 ${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`} > 
                        <img src={video.thumb || "https://placehold.co/400x250/1e293b/a3e635?text=VIDEO"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" /> 
                        <div className="absolute inset-0 flex items-center justify-center"> 
                            <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"> 
                                <Play className="w-6 h-6 text-black ml-1" /> 
                            </div> 
                        </div> 
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent"> 
                            <p className="font-display font-bold text-white text-xl truncate">{video.title}</p> 
                        </div> 
                    </div> 
                ))} 

                {/* FOTOS */}
                {athleteData.gallery && athleteData.gallery.map((img, idx) => ( 
                    <div key={`img-${idx}`} onClick={() => onOpenMedia('image', img.full)} className="group relative rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 col-span-1 row-span-1 aspect-square" > 
                        <img src={img.thumb} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> 
                    </div> 
                ))} 
            </div> 
        </section>
    );
}