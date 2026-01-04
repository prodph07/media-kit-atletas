'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';
import imageCompression from 'browser-image-compression';
import { createClient } from '@supabase/supabase-js';
import { Upload, X, Check, Loader2, ZoomIn, Image as ImageIcon } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SmartImageUpload({ userId, onUploadComplete, aspect = 1, buttonLabel = "Adicionar Foto" }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const imageDataUrl = await readFile(file);
        setImageSrc(imageDataUrl);
      } catch (e) {
        console.error("Erro leitura:", e);
        alert("Erro ao ler arquivo.");
      }
      e.target.value = null; 
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', (err) => reject(err));
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    // Log para garantir que estamos recebendo dados
    // console.log("Área de corte calculada:", croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!userId || !imageSrc) return;
    
    // Proteção extra: Se não tiver pixels calculados, tenta usar valores padrão
    if (!croppedAreaPixels) {
        alert("Aguarde a imagem carregar totalmente.");
        return;
    }

    setIsUploading(true);
    try {
      // 1. Recorte
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Imagem gerada vazia. Tente ajustar o zoom.");

      // 2. Compressão
      const croppedFile = new File([croppedBlob], "temp.jpg", { type: "image/jpeg" });
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' };
      const compressedFile = await imageCompression(croppedFile, options);

      // 3. Upload
      const fileName = `${userId}/${Date.now()}.webp`;
      const { error } = await supabase.storage.from('media-kit').upload(fileName, compressedFile, { upsert: false });

      if (error) throw error;

      // 4. URL
      const { data: publicUrlData } = supabase.storage.from('media-kit').getPublicUrl(fileName);
      onUploadComplete(publicUrlData.publicUrl);
      
      setImageSrc(null);
      setZoom(1);

    } catch (e) {
      console.error('Erro Upload:', e);
      alert(`Erro: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!imageSrc) {
    return (
      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors text-sm font-bold border border-slate-700 w-full">
        <Upload size={18} /> <span>{isUploading ? 'Aguarde...' : buttonLabel}</span>
        <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={isUploading}/>
      </label>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-2xl h-[600px]">
            
            {/* Header */}
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-20">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <ImageIcon size={16} className="text-cyan-500"/> Ajustar Foto
                </h3>
                <button onClick={() => setImageSrc(null)} className="text-slate-400 hover:text-white p-1">
                    <X size={20}/>
                </button>
            </div>

            {/* CORPO DO CROPPER - CSS CRÍTICO AQUI */}
            {/* O container precisa ser relative e ter tamanho definido */}
            <div className="relative flex-1 bg-black w-full overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    objectFit="contain"
                    // O estilo aqui é aplicado na div interna do Cropper
                    style={{
                        containerStyle: { 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#000'
                        }
                    }}
                />
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 z-20">
                <div className="flex items-center gap-3">
                    <ZoomIn size={18} className="text-slate-500"/>
                    <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setImageSrc(null)} disabled={isUploading} className="flex-1 py-2 bg-slate-800 text-white rounded font-bold text-sm border border-slate-700">Cancelar</button>
                    <button onClick={handleSave} disabled={isUploading} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-sm flex items-center justify-center gap-2">
                        {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                        {isUploading ? 'Salvando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}