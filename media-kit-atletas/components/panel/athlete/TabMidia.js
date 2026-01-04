import React, { useState } from 'react';
import { Instagram, Youtube, Trash2, Upload, Twitter, Film, Video, Link as LinkIcon } from 'lucide-react';

export default function TabMidia({ 
    perfil, 
    setPerfil, 
    handleSocialChange, 
    openWidget, 
    handleDeleteImage 
}) {
    // Estado local para o input de vídeo
    const [videoInput, setVideoInput] = useState('');

    // Configuração das Redes para não repetir código
    const NETWORKS = [
        { id: 'instagram', label: 'Instagram', icon: <Instagram size={16}/>, color: 'text-pink-500', placeholderUser: '@usuario' },
        { id: 'tiktok', label: 'TikTok', icon: <Film size={16}/>, color: 'text-cyan-400', placeholderUser: '@usuario' },
        { id: 'youtube', label: 'YouTube', icon: <Youtube size={16}/>, color: 'text-red-500', placeholderUser: '@canal' },
        { id: 'x', label: 'X (Twitter)', icon: <Twitter size={16}/>, color: 'text-slate-300', placeholderUser: '@usuario' },
        { id: 'kwai', label: 'Kwai', icon: <Video size={16}/>, color: 'text-orange-500', placeholderUser: 'ID ou Nome' },
    ];

    // Lógica de adicionar vídeo (YouTube -> Embed)
    const handleAddVideo = () => { 
        if (!videoInput) return; 
        let embedUrl = videoInput; 
        // Lógica simples de conversão para embed
        if (videoInput.includes('watch?v=')) embedUrl = videoInput.replace('watch?v=', 'embed/'); 
        else if (videoInput.includes('youtu.be/')) embedUrl = videoInput.replace('youtu.be/', 'youtube.com/embed/'); 
        
        setPerfil({
            ...perfil, 
            video_lista: [...(perfil.video_lista || []), { title: 'Novo Vídeo', date: new Date().getFullYear().toString(), thumb: '', embedUrl }]
        }); 
        setVideoInput(''); 
    };

    const handleUpdateVideoTitle = (index, newTitle) => {
        const n = [...(perfil.video_lista || [])]; 
        // Garante que é um objeto antes de editar
        if (typeof n[index] === 'string') {
            n[index] = { title: newTitle, embedUrl: n[index] };
        } else {
            n[index].title = newTitle; 
        }
        setPerfil({...perfil, video_lista: n});
    };

    const handleDeleteVideo = (index) => {
        const n = [...(perfil.video_lista || [])]; 
        n.splice(index, 1); 
        setPerfil({...perfil, video_lista: n});
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            
            {/* 1. REDES SOCIAIS (GRID) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-6 flex items-center gap-2">
                    <LinkIcon size={18}/> Redes Sociais
                </h3>
                
                <div className="space-y-4">
                    {NETWORKS.map((net) => {
                        const socialData = perfil.socials?.[net.id] || { user: '', followers: '', url: '' };
                        
                        return (
                            <div key={net.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center p-3 bg-black/40 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                                {/* Nome da Rede */}
                                <div className={`flex items-center gap-2 ${net.color} font-bold text-sm col-span-1 md:col-span-4 mb-2 md:mb-0`}>
                                    {net.icon} {net.label}
                                </div>
                                
                                {/* Inputs */}
                                <input 
                                    placeholder={net.placeholderUser} 
                                    className="bg-black border border-slate-700 focus:border-cyan-500 p-2 rounded text-white text-xs outline-none" 
                                    value={socialData.user || ''} 
                                    onChange={(e) => handleSocialChange(net.id, 'user', e.target.value)} 
                                />
                                <input 
                                    placeholder="Seguidores (Ex: 10k)" 
                                    className="bg-black border border-slate-700 focus:border-cyan-500 p-2 rounded text-white text-xs outline-none" 
                                    value={socialData.followers || ''} 
                                    onChange={(e) => handleSocialChange(net.id, 'followers', e.target.value)} 
                                />
                                <input 
                                    placeholder="Link do Perfil (https://...)" 
                                    className="bg-black border border-slate-700 focus:border-cyan-500 p-2 rounded text-white text-xs outline-none col-span-1 md:col-span-2" 
                                    value={socialData.url || ''} 
                                    onChange={(e) => handleSocialChange(net.id, 'url', e.target.value)} 
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. VÍDEOS (YOUTUBE) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-4 flex items-center gap-2">
                    <Youtube size={18}/> Vídeos (YouTube)
                </h3>
                
                <div className="flex gap-2 mb-6">
                    <input 
                        className="w-full bg-black border border-slate-700 p-2 rounded text-white placeholder-slate-500 focus:border-cyan-500 outline-none" 
                        placeholder="Cole o link do YouTube aqui..." 
                        value={videoInput} 
                        onChange={(e) => setVideoInput(e.target.value)} 
                    />
                    <button onClick={handleAddVideo} className="bg-red-600 hover:bg-red-500 px-6 rounded text-white font-bold transition-colors">
                        Adicionar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(perfil.video_lista || []).map((v, i) => {
                        // Tratamento híbrido: Se for string antiga, usa como url. Se for objeto, usa propriedades.
                        const isString = typeof v === 'string';
                        const embedUrl = isString ? v : (v.embedUrl || v);
                        const title = isString ? "Vídeo sem título" : (v.title || "Novo Vídeo");

                        return (
                            <div key={i} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative group hover:border-slate-600 transition-colors">
                                <div className="aspect-video w-full bg-black">
                                    <iframe src={embedUrl} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                                </div>
                                <div className="p-3 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm">
                                    <input 
                                        className="bg-transparent text-xs w-full text-slate-300 focus:text-white outline-none font-bold" 
                                        value={title} 
                                        onChange={(e) => handleUpdateVideoTitle(i, e.target.value)} 
                                        placeholder="Título do vídeo"
                                    />
                                    <button onClick={() => handleDeleteVideo(i)} className="text-red-500 hover:bg-red-900/20 p-2 rounded transition">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. GALERIA */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm flex items-center gap-2">
                        <Upload size={18}/> Galeria de Fotos
                    </h3>
                    <button 
                        onClick={() => openWidget((url) => setPerfil({...perfil, galeria: [...(perfil.galeria || []), { full: url, thumb: url }]}), false)} 
                        className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-xs font-bold text-white flex items-center gap-2 transition"
                    >
                        <Upload size={14}/> Upload Foto
                    </button>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {(perfil.galeria || []).length === 0 && <p className="text-slate-500 text-xs italic col-span-full">Galeria vazia.</p>}
                    
                    {(perfil.galeria || []).map((img, i) => {
                        // Tratamento híbrido (String ou Objeto)
                        const src = typeof img === 'string' ? img : (img.thumb || img.full);
                        const full = typeof img === 'string' ? img : (img.full || img.thumb);

                        return (
                            <div key={i} className="aspect-square bg-black rounded border border-slate-700 relative group overflow-hidden hover:border-slate-500 transition-colors">
                                <img src={src} className="w-full h-full object-cover" alt="Galeria" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDeleteImage('galeria', i, full)} 
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500 transition shadow-lg"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}