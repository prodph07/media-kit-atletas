import React from 'react';
import { getRankInfo } from '../lib/gamification';

export function AvatarLevel({ foto, level = 1, size = "large" }) {
  const rank = getRankInfo(level);

  // Define o tamanho FIXO da FOTO. A moldura vai crescer em volta disso.
  // 'large' = 144px (w-36), 'small' = 48px (w-12)
  const photoSize = size === "large" ? "w-36 h-36" : "w-12 h-12";
  
  // Define o tamanho do container geral (precisa ser um pouco maior que a foto para caber a moldura expandida sem cortar)
  const wrapperSize = size === "large" ? "w-48 h-48" : "w-16 h-16";

  // Estilo de escala para a moldura
  const frameStyle = {
      transform: `scale(${rank.frameScale || 1.0})`,
      transition: 'transform 0.3s ease-in-out' // Suaviza a troca de rank
  };

  return (
    <div className="flex flex-col items-center gap-2">
        {/* Wrapper principal: centraliza tudo e define o espaço total ocupado */}
      <div className={`relative ${wrapperSize} flex items-center justify-center`}>
        
        {/* 1. FOTO DO ATLETA (Tamanho Fixo Base) */}
        {/* Fica no centro (z-0) */}
        <div className={`relative ${photoSize} rounded-full overflow-hidden z-0 bg-slate-900 shadow-lg`}>
            <img 
                src={foto || "https://placehold.co/400"} 
                alt="Avatar" 
                className="w-full h-full object-cover"
            />
        </div>

        {/* 2. MOLDURA/CINTURÃO (Escala Variável) */}
        {/* Fica posicionado absolutamente no centro, por cima da foto (z-10). 
            O 'scale' faz ele crescer para fora do tamanho base da foto. */}
        <img 
            src={rank.frameUrl} 
            alt={rank.title} 
            className="absolute z-10 pointer-events-none drop-shadow-2xl"
            // A imagem base da moldura deve ter o mesmo tamanho base da foto para o scale 1.0 funcionar
            // Se a foto é w-36, a moldura base tb é w-36, e o scale aumenta ela.
            style={{ ...frameStyle, width: size === "large" ? '9rem' : '3rem', height: size === "large" ? '9rem' : '3rem' }}
            onError={(e) => { e.target.style.display = 'none'; }} 
        />
        
        {/* 3. Badge de Nível */}
        <div className="absolute bottom-1 right-1 bg-black border border-slate-500 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-white z-20 shadow-md">
            {level}
        </div>
      </div>

      {/* Título do Rank */}
      {size === "large" && (
          <div className="text-center -mt-4 relative z-30">
            <span className={`text-xs font-bold uppercase tracking-widest ${rank.textColor} bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xl`}>
                {rank.title}
            </span>
          </div>
      )}
    </div>
  );
}