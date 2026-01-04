import React from 'react';
import { Image as ImageIcon, Video, Trash2, ExternalLink } from 'lucide-react';
// Substitua a linha do import por esta:
import SmartImageUpload from '@/components/SmartImageUpload';

export default function TabMidia({ perfil, setPerfil, handleSocialChange, openWidget, handleDeleteImage, userId }) {
    
    // Função auxiliar para atualizar a lista de vídeos
    const updateVideoList = (newList) => {
        setPerfil({ ...perfil, video_lista: newList });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            
            {/* SEÇÃO 1: GALERIA DE FOTOS (Novo Upload) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <ImageIcon size={20} className="text-cyan-500"/> Galeria de Fotos
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                        {perfil.galeria?.length || 0} fotos
                    </span>
                </div>
                
                {/* Grid de Fotos Existentes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    {perfil.galeria?.map((foto, index) => {
                        // Suporte híbrido (string antiga ou objeto novo)
                        const src = typeof foto === 'string' ? foto : (foto.thumb || foto.url);
                        
                        return (
                            <div key={index} className="relative aspect-[4/5] group bg-black rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all">
                                <img src={src} alt={`Galeria ${index}`} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteImage('galeria', index, src)}
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500 hover:scale-110 transition-all"
                                        title="Excluir foto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Área de Upload */}
                <div className="bg-slate-950 p-4 rounded-lg border border-dashed border-slate-700">
                    <div className="max-w-xs mx-auto">
                        <SmartImageUpload
                            userId={userId}
                            aspect={4/5} // Formato Retrato (Ideal para Galeria)
                            buttonLabel="Adicionar Nova Foto"
                            onUploadComplete={(newUrl) => {
                                // Adiciona a nova URL ao array de galeria
                                setPerfil(prev => ({
                                    ...prev,
                                    galeria: [...(prev.galeria || []), newUrl]
                                }));
                            }}
                        />
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                            Suporta Zoom e Recorte. Formato otimizado.
                        </p>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: VÍDEOS (Mantido a lógica de Links do YouTube/Vimeo) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                    <Video size={20} className="text-red-500"/> Vídeos (YouTube/Vimeo)
                </h3>
                
                <div className="space-y-4">
                    {perfil.video_lista?.map((video, index) => {
                        const isString = typeof video === 'string';
                        const urlValue = isString ? video : (video.embedUrl || video.url || '');
                        const titleValue = isString ? '' : (video.title || '');

                        return (
                            <div key={index} className="flex gap-3 items-start bg-slate-950 p-3 rounded border border-slate-800">
                                <div className="flex-1 space-y-2">
                                    <input 
                                        type="text" 
                                        placeholder="Título (Opcional, ex: Luta vs Fulano)"
                                        value={titleValue}
                                        onChange={(e) => {
                                            const newList = [...perfil.video_lista];
                                            // Se era string, converte para objeto
                                            if (isString) newList[index] = { url: urlValue, title: e.target.value };
                                            else newList[index].title = e.target.value;
                                            updateVideoList(newList);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Cole o link do vídeo aqui..." 
                                        value={urlValue}
                                        onChange={(e) => {
                                            const newList = [...perfil.video_lista];
                                            if (isString) newList[index] = e.target.value;
                                            else newList[index].url = e.target.value; // Ajustar para embedUrl se necessário
                                            updateVideoList(newList);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        const newList = [...perfil.video_lista];
                                        newList.splice(index, 1);
                                        updateVideoList(newList);
                                    }}
                                    className="mt-1 bg-slate-800 text-red-500 p-2 rounded hover:bg-slate-700"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        );
                    })}

                    <button 
                        onClick={() => updateVideoList([...(perfil.video_lista || []), { title: '', url: '' }])}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold uppercase rounded border border-dashed border-slate-600 transition-colors"
                    >
                        + Adicionar Link de Vídeo
                    </button>
                </div>
            </div>

            {/* SEÇÃO 3: REDES SOCIAIS (Mantido) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ExternalLink size={18} className="text-purple-500"/> Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['instagram', 'youtube', 'tiktok', 'x', 'kwai'].map(network => (
                        <div key={network} className="bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-slate-400">{network}</span>
                                <input 
                                    type="checkbox" 
                                    checked={perfil.socials?.[network]?.active || false} 
                                    onChange={(e) => handleSocialChange(network, 'active', e.target.checked)}
                                    className="accent-cyan-500"
                                />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Link do perfil" 
                                value={perfil.socials?.[network]?.url || ''} 
                                onChange={(e) => handleSocialChange(network, 'url', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none mb-2"
                            />
                            <input 
                                type="text" 
                                placeholder="Nº Seguidores (ex: 10k)" 
                                value={perfil.socials?.[network]?.followers || ''} 
                                onChange={(e) => handleSocialChange(network, 'followers', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}