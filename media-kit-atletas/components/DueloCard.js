'use client';

import { Scale, Ruler, Trophy, Users, Zap, User, Youtube, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Ícone do TikTok SVG direto
const TikTokIcon = ({size=14}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);

export default function DueloCard({ p1, p2, votes1, votes2, onVote, showVoting = true }) {
  
  // Função auxiliar para limpar números
  const cleanNum = (val) => {
      if(!val) return 0;
      const cleaned = val.toString().replace(/,/g, '.').replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
  };

  // Função para comparar e retornar cor
  const getAdv = (val1, val2, invert = false) => {
    const v1 = cleanNum(val1);
    const v2 = cleanNum(val2);
    
    if(v1 === v2) return { c1: 'text-white', c2: 'text-white' };
    
    if (invert) {
        return v1 < v2 ? { c1: 'text-green-400 font-bold', c2: 'text-red-400 opacity-70' } : { c1: 'text-red-400 opacity-70', c2: 'text-green-400 font-bold' };
    }
    return v1 > v2 ? { c1: 'text-green-400 font-bold', c2: 'text-red-400 opacity-70' } : { c1: 'text-red-400 opacity-70', c2: 'text-green-400 font-bold' };
  };

  // --- COMPARAÇÕES ---
  const cHeight = getAdv(p1.stats?.height, p2.stats?.height);
  const cReach = getAdv(p1.stats?.reach, p2.stats?.reach);
  const cAge = getAdv(p1.stats?.age, p2.stats?.age, true); 
  
  const cWins = getAdv(p1.record?.wins, p2.record?.wins);
  const cKo = getAdv(p1.record?.knockouts, p2.record?.knockouts);
  
  const cInsta = getAdv(p1.socials?.instagram?.followers, p2.socials?.instagram?.followers);
  const cTiktok = getAdv(p1.socials?.tiktok?.followers, p2.socials?.tiktok?.followers);
  const cYoutube = getAdv(p1.socials?.youtube?.followers, p2.socials?.youtube?.followers);

  // Calculo de porcentagem de votos
  const totalVotes = (votes1 || 0) + (votes2 || 0);
  const per1 = totalVotes === 0 ? 50 : Math.round((votes1 / totalVotes) * 100);
  const per2 = totalVotes === 0 ? 50 : Math.round((votes2 / totalVotes) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 via-transparent to-red-900/10 z-0"></div>

      {/* HEADER */}
      <div className="relative z-10 text-center py-4 bg-slate-900/80 border-b border-slate-700 backdrop-blur-sm">
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            TALE OF THE <span className="text-yellow-500">TAPE</span>
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3">
        
        {/* LUTADOR 1 (BLUE CORNER) */}
        <div className="order-2 md:order-1 relative flex flex-col items-center p-6 border-r border-slate-800/50">
            
            {/* LINK PARA O PERFIL P1 */}
            <Link href={`/${p1.slug || p1.id}`} target="_blank" className="group flex flex-col items-center cursor-pointer mb-4">
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-blue-600 overflow-hidden mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)] bg-slate-800 group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
                    <img src={p1.foto_url || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="text-white" size={24}/>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white uppercase text-center leading-none mb-1 group-hover:text-blue-400 transition-colors">
                    {p1.apelido || p1.nome}
                </h3>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">{p1.categoria}</p>
            </Link>
            
            {showVoting && (
                <button onClick={() => onVote(1)} className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded skew-x-[-10deg] transition transform hover:scale-105 shadow-lg shadow-blue-900/50">
                    Votar
                </button>
            )}
        </div>

        {/* STATS (CENTER) */}
        <div className="order-1 md:order-2 flex flex-col justify-center bg-black/40 backdrop-blur-sm">
            
            {/* FÍSICO */}
            <div className="grid grid-cols-3 items-center text-center py-3 border-b border-slate-800/50 hover:bg-slate-900/20 transition">
                <span className={`text-xl font-bold ${cHeight.c1}`}>{p1.stats?.height || '-'}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Ruler size={14}/> Altura</span>
                <span className={`text-xl font-bold ${cHeight.c2}`}>{p2.stats?.height || '-'}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center py-3 border-b border-slate-800/50 hover:bg-slate-900/20 transition">
                <span className={`text-xl font-bold ${cReach.c1}`}>{p1.stats?.reach || '-'}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Scale size={14}/> Envergadura</span>
                <span className={`text-xl font-bold ${cReach.c2}`}>{p2.stats?.reach || '-'}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center py-3 border-b border-slate-800/50 hover:bg-slate-900/20 transition">
                <span className={`text-xl font-bold ${cAge.c1}`}>{p1.stats?.age || '-'}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><User size={14}/> Idade</span>
                <span className={`text-xl font-bold ${cAge.c2}`}>{p2.stats?.age || '-'}</span>
            </div>

            {/* CARTEL */}
            <div className="grid grid-cols-3 items-center text-center py-3 border-b border-slate-800/50 bg-slate-900/30">
                <span className={`text-2xl font-black ${cWins.c1}`}>{p1.record?.wins}</span>
                <span className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Trophy size={14}/> Vitórias</span>
                <span className={`text-2xl font-black ${cWins.c2}`}>{p2.record?.wins}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center py-3 border-b border-slate-800/50 hover:bg-slate-900/20 transition">
                <span className={`text-xl font-bold ${cKo.c1}`}>{p1.record?.knockouts}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Zap size={14}/> Nocautes</span>
                <span className={`text-xl font-bold ${cKo.c2}`}>{p2.record?.knockouts}</span>
            </div>

             {/* REDES SOCIAIS */}
             <div className="grid grid-cols-3 items-center text-center py-2 border-b border-slate-800/50 hover:bg-pink-900/10 transition">
                <span className={`text-sm font-bold ${cInsta.c1}`}>{p1.socials?.instagram?.followers || '-'}</span>
                <span className="text-[10px] text-pink-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Users size={14}/> Insta</span>
                <span className={`text-sm font-bold ${cInsta.c2}`}>{p2.socials?.instagram?.followers || '-'}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center py-2 border-b border-slate-800/50 hover:bg-cyan-900/10 transition">
                <span className={`text-sm font-bold ${cTiktok.c1}`}>{p1.socials?.tiktok?.followers || '-'}</span>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><TikTokIcon size={14}/> TikTok</span>
                <span className={`text-sm font-bold ${cTiktok.c2}`}>{p2.socials?.tiktok?.followers || '-'}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center py-2 hover:bg-red-900/10 transition">
                <span className={`text-sm font-bold ${cYoutube.c1}`}>{p1.socials?.youtube?.followers || '-'}</span>
                <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest flex flex-col items-center gap-1"><Youtube size={14}/> YouTube</span>
                <span className={`text-sm font-bold ${cYoutube.c2}`}>{p2.socials?.youtube?.followers || '-'}</span>
            </div>

        </div>

        {/* LUTADOR 2 (RED CORNER) */}
        <div className="order-3 relative flex flex-col items-center p-6 border-l border-slate-800/50">
            
            {/* LINK PARA O PERFIL P2 */}
            <Link href={`/${p2.slug || p2.id}`} target="_blank" className="group flex flex-col items-center cursor-pointer mb-4">
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-600 overflow-hidden mb-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] bg-slate-800 group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
                    <img src={p2.foto_url || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="text-white" size={24}/>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white uppercase text-center leading-none mb-1 group-hover:text-red-400 transition-colors">
                    {p2.apelido || p2.nome}
                </h3>
                <p className="text-red-400 font-bold text-xs uppercase tracking-widest">{p2.categoria}</p>
            </Link>

            {showVoting && (
                <button onClick={() => onVote(2)} className="mt-auto w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded skew-x-[-10deg] transition transform hover:scale-105 shadow-lg shadow-red-900/50">
                    Votar
                </button>
            )}
        </div>
      </div>

      {/* BARRA DE VOTAÇÃO */}
      {showVoting && totalVotes > 0 && (
          <div className="relative h-6 bg-slate-800 w-full flex border-t border-slate-700">
              <div className="h-full bg-blue-600 transition-all duration-1000 flex items-center justify-start px-2" style={{ width: `${per1}%` }}>
                 {per1 > 10 && <span className="text-[10px] font-black text-white">{per1}%</span>}
              </div>
              <div className="h-full bg-red-600 transition-all duration-1000 flex items-center justify-end px-2" style={{ width: `${per2}%` }}>
                 {per2 > 10 && <span className="text-[10px] font-black text-white">{per2}%</span>}
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 rounded-full border border-slate-700">
                  <span className="text-[8px] font-black text-white">VS</span>
              </div>
          </div>
      )}
    </div>
  )
}