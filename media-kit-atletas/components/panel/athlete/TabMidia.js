import React, { useState } from 'react';
import { Instagram, Youtube, Trash2, Upload } from 'lucide-react';

const TikTokIcon = ({size=24, className}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);

export default function TabMidia({ 
    perfil, 
    setPerfil, 
    handleSocialChange, 
    openWidget, 
    handleDeleteImage 
}) {
    // Estado local para o input de vídeo
    const [videoInput, setVideoInput] = useState('');

    const handleAddVideo = () => { 
        if (!videoInput) return; 
        let embedUrl = videoInput; 
        if (videoInput.includes('watch?v=')) embedUrl = videoInput.replace('watch?v=', 'embed/'); 
        else if (videoInput.includes('youtu.be/')) embedUrl = videoInput.replace('youtu.be/', 'youtube.com/embed/'); 
        
        setPerfil({
            ...perfil, 
            video_lista: [...perfil.video_lista, { title: 'Novo Vídeo', date: '2025', thumb: '', embedUrl }]
        }); 
        setVideoInput(''); 
    };

    const handleUpdateVideoTitle = (index, newTitle) => {
        const n = [...perfil.video_lista]; 
        n[index].title = newTitle; 
        setPerfil({...perfil, video_lista: n});
    };

    const handleDeleteVideo = (index) => {
        const n = [...perfil.video_lista]; 
        n.splice(index, 1); 
        setPerfil({...perfil, video_lista: n});
    };

    return (
        <div className="space-y-6">
            
            {/* REDES SOCIAIS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Redes Sociais</h3>
                <div className="space-y-4">
                    {/* INSTAGRAM */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-3 bg-black/20 rounded border border-slate-700">
                        <div className="flex items-center gap-2 text-pink-500 font-bold text-sm col-span-1 md:col-span-3"><Instagram size={16}/> Instagram</div>
                        <input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.user} onChange={(e) => handleSocialChange('instagram', 'user', e.target.value)} />
                        <input placeholder="Seguidores (Ex: 10k)" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.followers} onChange={(e) => handleSocialChange('instagram', 'followers', e.target.value)} />
                        <input placeholder="Link" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.instagram.url} onChange={(e) => handleSocialChange('instagram', 'url', e.target.value)} />
                    </div>
                    {/* TIKTOK */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-3 bg-black/20 rounded border border-slate-700">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm col-span-1 md:col-span-3"><TikTokIcon size={16}/> TikTok</div>
                        <input placeholder="@usuario" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.user} onChange={(e) => handleSocialChange('tiktok', 'user', e.target.value)} />
                        <input placeholder="Seguidores" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.followers} onChange={(e) => handleSocialChange('tiktok', 'followers', e.target.value)} />
                        <input placeholder="Link" className="bg-black border border-slate-700 p-2 rounded text-white text-xs" value={perfil.socials.tiktok.url} onChange={(e) => handleSocialChange('tiktok', 'url', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* VÍDEOS */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4">Vídeos (YouTube)</h3>
                <div className="flex gap-2 mb-4">
                    <input className="w-full bg-black border border-slate-700 p-2 rounded text-white" placeholder="Cole o link do YouTube..." value={videoInput} onChange={(e) => setVideoInput(e.target.value)} />
                    <button onClick={handleAddVideo} className="bg-red-600 px-4 rounded text-white font-bold">Adicionar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {perfil.video_lista.map((v, i) => (
                        <div key={i} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative group">
                            <iframe src={v.embedUrl} className="w-full aspect-video" frameBorder="0"></iframe>
                            <div className="p-2 flex justify-between items-center bg-slate-900">
                                <input className="bg-transparent text-xs w-full" value={v.title} onChange={(e) => handleUpdateVideoTitle(i, e.target.value)} />
                                <button onClick={() => handleDeleteVideo(i)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GALERIA */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm">Galeria de Fotos</h3>
                    <button onClick={() => openWidget((url) => setPerfil({...perfil, galeria: [...perfil.galeria, { full: url, thumb: url }]}), false)} className="bg-cyan-600 px-3 py-1 rounded text-xs flex items-center gap-2"><Upload size={14}/> Upload</button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {perfil.galeria.map((img, i) => (
                        <div key={i} className="aspect-square bg-black rounded border border-slate-700 relative group overflow-hidden">
                            <img src={img.thumb} className="w-full h-full object-cover" />
                            <button onClick={() => handleDeleteImage('galeria', i, img.full)} className="absolute top-1 right-1 bg-red-600 p-1 rounded text-white opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}