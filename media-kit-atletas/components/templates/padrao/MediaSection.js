import React from 'react';
import { Play, Image as ImageIcon, Video } from 'lucide-react';

export default function MediaSection({ athleteData, onOpenMedia }) {
    // 1. Prepare Data
    const videos = (athleteData.video_lista || []).map(v => ({ ...normalizeVideo(v), type: 'video' })).filter(v => v.src);
    const gallery = (athleteData.galeria || []).map(i => ({ ...normalizeImage(i), type: 'image' })).filter(i => i.src);

    // Combine items: Videos first, then images
    const items = [...videos, ...gallery];

    if (items.length === 0) return null;

    return (
        <section className="bg-[#1E1E1E] industrial-border p-6 md:p-8 animate-fadeIn mb-16" id="gallery">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
                .font-display { font-family: 'Oswald', sans-serif; }
                .industrial-border { border: 1px solid #333333; }
                .gallery-overlay {
                    position: absolute;
                    inset: 0;
                    background-color: rgba(0,0,0,0.4);
                    opacity: 0;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(2px);
                }
                .group:hover .gallery-overlay {
                    opacity: 1;
                }
            `}</style>

            <h3 className="font-display font-bold uppercase text-2xl text-white mb-8 flex items-center gap-3">
                Media Gallery
                <span className="h-1 flex-1 bg-gradient-to-r from-[#FF4500] to-transparent opacity-50"></span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
                {items.map((item, idx) => {
                    const isFeatured = idx === 0;
                    const colSpan = isFeatured ? 'md:col-span-2' : '';
                    const rowSpan = isFeatured ? 'md:row-span-2' : '';

                    return (
                        <div
                            key={`${item.type}-${idx}`}
                            onClick={() => onOpenMedia(item.type, item.full || item.src)}
                            className={`relative group cursor-pointer overflow-hidden border border-[#333] bg-gray-900 shadow-2xl ${colSpan} ${rowSpan} h-[250px] md:h-auto`}
                        >
                            <img
                                src={item.thumb || item.src}
                                alt={item.title}
                                className={`w-full h-full object-cover ${isFeatured ? 'grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100' : 'opacity-80 group-hover:opacity-100'} transition-all duration-700 transform group-hover:scale-110`}
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400/111/333?text=No+Image'; }} // Fallback
                            />

                            {/* ITEM TYPE SPECIFIC OVERLAYS */}
                            {item.type === 'video' ? (
                                <>
                                    <div className={`absolute inset-0 ${isFeatured ? 'bg-gradient-to-t from-black via-transparent to-transparent opacity-90' : 'bg-gradient-to-t from-black/90 to-transparent'}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-14 h-14 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isFeatured ? 'group-hover:scale-110 group-hover:bg-[#FF4500] group-hover:border-[#FF4500]' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                                            <Play className="text-white w-6 h-6 fill-white ml-0.5" />
                                        </div>
                                    </div>
                                    <div className={`absolute ${isFeatured ? 'bottom-6 left-6 right-6' : 'bottom-4 left-4 z-10'}`}>
                                        {isFeatured && (
                                            <div className="inline-flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
                                                <span className="text-[10px] font-bold text-[#FF4500] uppercase tracking-widest">Featured</span>
                                            </div>
                                        )}
                                        <h4 className={`font-display font-bold text-white uppercase leading-none drop-shadow-lg ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg leading-tight'}`}>
                                            {item.title || "Highlighted Video"}
                                        </h4>
                                        {isFeatured && <p className="text-gray-400 text-xs md:text-sm mt-2 line-clamp-1 truncate">{item.desc || "Click to watch full content."}</p>}
                                        {!isFeatured && <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Video</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="gallery-overlay">
                                        <ImageIcon className="text-white w-8 h-8 drop-shadow-md" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">{item.title || "Gallery Image"}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// --- HELPER FUNCTIONS ---

function normalizeVideo(video) {
    if (typeof video === 'string') {
        return { src: video, title: "Video Content", thumb: null };
    }
    return {
        src: video.embedUrl || video.url,
        title: video.title || "Video Content",
        thumb: video.thumb,
        desc: video.description
    };
}

function normalizeImage(img) {
    if (typeof img === 'string') {
        return { src: img, full: img, title: "Gallery" };
    }
    return {
        src: img.thumb || img.url || img.full,
        full: img.full || img.url || img.thumb,
        title: img.caption || "Gallery",
    };
}