import React from 'react';
import { Image as ImageIcon, Video, Trash2, Plus, Lock } from 'lucide-react';
import SmartImageUpload from '@/components/SmartImageUpload';

export default function TabMidia({ perfil, setPerfil, handleSocialChange, handleDeleteImage, userId }) {

    // REGRAS
    const isPremium = perfil.plano === 'premium';
    const LIMIT_PHOTOS = isPremium ? 5 : 2; // Teto de 5 para Premium
    const LIMIT_VIDEOS = isPremium ? 5 : 1; // Teto de 5 para Premium

    const photos = perfil.galeria || [];
    const videos = perfil.video_lista || [];

    const canAddPhoto = photos.length < LIMIT_PHOTOS;
    const canAddVideo = videos.length < LIMIT_VIDEOS;

    const handleAddVideo = () => {
        const url = prompt("Cole o link do YouTube:");
        if (url) {
            setPerfil({ ...perfil, video_lista: [...videos, { url, title: 'Novo Vídeo' }] });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <style jsx global>{`
                .industrial-border {
                    border: 1px solid;
                    border-color: #333333;
                }
            `}</style>

            {/* GALERIA */}
            <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-6 rounded-sm shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
                    <div className="flex items-center gap-4">
                        <h3 className="font-display font-bold uppercase text-2xl text-black dark:text-white tracking-wide">Galeria</h3>
                        <span className="font-display font-bold text-gray-500 text-lg">{photos.length}/{LIMIT_PHOTOS}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* ADD BUTTON */}
                    {canAddPhoto ? (
                        <div className="aspect-square">
                            <SmartImageUpload
                                userId={userId}
                                aspect={4 / 5}
                                buttonLabel={
                                    <div className="w-full h-full border-2 border-dashed border-gray-700 hover:border-[#FF4500] hover:shadow-[0_0_15px_rgba(255,69,0,0.15)] bg-[#111] hover:bg-[#FF4500]/5 transition-all flex flex-col items-center justify-center group cursor-pointer rounded-sm">
                                        <span className="material-symbols-outlined text-4xl text-gray-600 group-hover:text-[#FF4500] transition-colors">add</span>
                                        <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-[#FF4500] mt-2 tracking-wide">Adicionar</span>
                                    </div>
                                }
                                onUploadComplete={(url) => {
                                    setPerfil(prev => ({ ...prev, galeria: [...prev.galeria, url] }));
                                }}
                            />
                        </div>
                    ) : (
                        <div className="aspect-square bg-gray-900 border border-gray-800 border-dashed rounded-sm flex flex-col items-center justify-center text-gray-600 opacity-50 cursor-not-allowed">
                            <Lock size={24} className="mb-2" />
                            <span className="text-xs font-bold text-center uppercase">
                                {!isPremium ? "Upgrade para +" : "Limite Máx."}
                            </span>
                        </div>
                    )}

                    {/* IMAGES */}
                    {photos.map((foto, i) => {
                        const src = typeof foto === 'string' ? foto : foto.url;
                        return (
                            <div key={i} className="aspect-square bg-gray-900 relative group rounded-sm overflow-hidden border border-gray-800">
                                <img src={src} alt={`Gallery Image ${i + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleDeleteImage('galeria', i, src)}
                                        className="text-white hover:text-red-500 bg-black/50 p-3 rounded-full hover:bg-black/80 transition-all transform hover:scale-110"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VÍDEOS */}
            <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-6 rounded-sm shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
                    <div className="flex items-center gap-4">
                        <h3 className="font-display font-bold uppercase text-2xl text-black dark:text-white tracking-wide">Vídeos</h3>
                        <span className="font-display font-bold text-gray-500 text-lg">{videos.length}/{LIMIT_VIDEOS}</span>
                    </div>
                </div>

                {canAddVideo ? (
                    <button
                        onClick={handleAddVideo}
                        className="w-full border-2 border-dashed border-[#FF4500]/50 hover:border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500]/5 py-4 flex items-center justify-center gap-3 font-display font-bold uppercase tracking-wide transition-all mb-8 rounded-sm group"
                    >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                        Adicionar Link do YouTube
                    </button>
                ) : (
                    <div className="w-full border-2 border-dashed border-gray-800 text-gray-500 py-4 flex items-center justify-center gap-3 font-display font-bold uppercase tracking-wide mb-8 rounded-sm opacity-50 cursor-not-allowed">
                        <Lock size={20} />
                        Limite de Vídeos Atingido
                    </div>
                )}

                <div className="space-y-3">
                    {videos.map((video, i) => {
                        const url = typeof video === 'string' ? video : video.url;
                        return (
                            <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-4 flex items-center justify-between rounded-sm group hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <span className="material-symbols-outlined text-red-600">smart_display</span>
                                    <div className="flex flex-col">
                                        <span className="text-white font-display font-bold text-sm uppercase tracking-wide">Vídeo {i + 1}</span>
                                        <span className="text-gray-500 font-mono text-xs truncate max-w-[200px] sm:max-w-md">{url}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const n = [...videos]; n.splice(i, 1); setPerfil({ ...perfil, video_lista: n });
                                    }}
                                    className="text-gray-600 hover:text-red-500 transition-colors p-2"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}