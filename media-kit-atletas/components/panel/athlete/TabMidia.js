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
        <div className="space-y-8 animate-fadeIn">
            
            {/* FOTOS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2">
                        <ImageIcon size={18}/> Galeria 
                        <span className="text-slate-500 text-xs ml-2 normal-case">({photos.length}/{LIMIT_PHOTOS})</span>
                    </h3>
                    {!canAddPhoto && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
                            <Lock size={10}/> Máximo Atingido
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {canAddPhoto ? (
                        <div className="aspect-square">
                            <SmartImageUpload
                                userId={userId}
                                aspect={4/5} 
                                buttonLabel={<Plus size={24} />}
                                onUploadComplete={(url) => {
                                    setPerfil(prev => ({ ...prev, galeria: [...prev.galeria, url] }));
                                }}
                            />
                        </div>
                    ) : (
                        <div className="aspect-square bg-slate-950 border border-slate-800 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-600 opacity-50 cursor-not-allowed">
                            <Lock size={24} className="mb-2"/>
                            <span className="text-xs font-bold text-center">
                                {!isPremium ? "Upgrade para +" : "Limite Máx."}
                            </span>
                        </div>
                    )}

                    {photos.map((foto, i) => {
                        const src = typeof foto === 'string' ? foto : foto.url;
                        return (
                            <div key={i} className="group relative aspect-square bg-black rounded-lg overflow-hidden border border-slate-800">
                                <img src={src} alt="Galeria" className="w-full h-full object-cover" />
                                <button onClick={() => handleDeleteImage('galeria', i, src)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VÍDEOS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-purple-400 font-bold uppercase text-sm flex items-center gap-2">
                        <Video size={18}/> Vídeos
                        <span className="text-slate-500 text-xs ml-2 normal-case">({videos.length}/{LIMIT_VIDEOS})</span>
                    </h3>
                </div>

                {canAddVideo ? (
                    <button onClick={handleAddVideo} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition flex items-center justify-center gap-2 mb-4">
                        <Plus size={20}/> Adicionar Link do YouTube
                    </button>
                ) : (
                    <div className="w-full py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 flex items-center justify-center gap-2 mb-4 opacity-50">
                        <Lock size={16}/> Limite de Vídeos Atingido
                    </div>
                )}

                <div className="space-y-3">
                    {videos.map((video, i) => {
                        const url = typeof video === 'string' ? video : video.url;
                        return (
                            <div key={i} className="flex items-center justify-between bg-black p-3 rounded border border-slate-800">
                                <span className="text-sm text-slate-300 truncate max-w-[200px]">{url}</span>
                                <button onClick={() => {
                                    const n = [...videos]; n.splice(i, 1); setPerfil({...perfil, video_lista: n});
                                }} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}