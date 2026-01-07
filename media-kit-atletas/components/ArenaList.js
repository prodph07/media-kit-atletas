'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Search, Filter, Swords } from 'lucide-react';

export default function ArenaList({ initialDuelos }) {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Extrai todas as categorias únicas
    const categories = useMemo(() => {
        const cats = new Set();
        initialDuelos.forEach(d => {
            if(d.p1.categoria) cats.add(d.p1.categoria);
            if(d.p2.categoria) cats.add(d.p2.categoria);
        });
        return Array.from(cats).sort();
    }, [initialDuelos]);

    // Lógica de Filtragem
    const filteredDuelos = initialDuelos.filter(duelo => {
        const term = search.toLowerCase();
        
        const matchesName = 
            duelo.p1.nome?.toLowerCase().includes(term) ||
            duelo.p1.apelido?.toLowerCase().includes(term) ||
            duelo.p2.nome?.toLowerCase().includes(term) ||
            duelo.p2.apelido?.toLowerCase().includes(term);

        const matchesCategory = filterCategory 
            ? (duelo.p1.categoria === filterCategory || duelo.p2.categoria === filterCategory)
            : true;

        return matchesName && matchesCategory;
    });

    return (
        <div>
            {/* BARRA DE PESQUISA E FILTROS RESPONSIVA */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-500" size={20}/>
                    <input 
                        className="w-full bg-black border border-slate-700 pl-10 p-3 rounded-lg text-white outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Pesquisar atleta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-3 text-slate-500" size={20}/>
                    <select 
                        className="w-full bg-black border border-slate-700 pl-10 p-3 rounded-lg text-white outline-none focus:border-yellow-500 appearance-none cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Todas Categorias</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* LISTA DE RESULTADOS */}
            {/* Grid ajustado: 1 coluna no mobile, 2 no tablet, 3 no desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredDuelos.map(duelo => {
                     const total = (duelo.votos_1 || 0) + (duelo.votos_2 || 0);
                     
                     return (
                        <Link href={`/duelos/${duelo.id}`} key={duelo.id} className="block group">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all relative shadow-lg hover:shadow-yellow-900/10">
                                
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-1 backdrop-blur-md z-10 border border-white/10">
                                    <Clock size={10}/> Expira {new Date(duelo.expires_at).getDate()}/{new Date(duelo.expires_at).getMonth()+1}
                                </div>
                                
                                {/* Padding ajustado para mobile (p-4) e desktop (md:p-6) */}
                                <div className="flex items-center justify-between p-4 md:p-6 pb-2 relative">
                                    
                                    <div className="absolute top-3 left-3 flex gap-1">
                                         <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase tracking-wider">
                                            {duelo.p1.categoria}
                                         </span>
                                    </div>

                                    <div className="flex items-center justify-center w-full gap-2 mt-4">
                                        <div className="relative">
                                            <img src={duelo.p1.foto_url || "https://placehold.co/100"} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-blue-600 object-cover shadow-[0_0_15px_rgba(37,99,235,0.3)]"/>
                                        </div>
                                        
                                        <span className="text-2xl font-black text-slate-700 group-hover:text-yellow-500 italic px-2 transition-colors">VS</span>
                                        
                                        <div className="relative">
                                            <img src={duelo.p2.foto_url || "https://placehold.co/100"} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-red-600 object-cover shadow-[0_0_15px_rgba(220,38,38,0.3)]"/>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center px-4 pb-4 md:pb-6">
                                    <div className="flex justify-between text-xs md:text-sm font-bold text-white mb-2">
                                        <span className="truncate w-1/2 text-left pr-2 text-blue-100">{duelo.p1.apelido || duelo.p1.nome}</span>
                                        <span className="truncate w-1/2 text-right pl-2 text-red-100">{duelo.p2.apelido || duelo.p2.nome}</span>
                                    </div>
                                    
                                    <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden mb-2">
                                        <div className="h-full bg-blue-600" style={{width: `${total ? (duelo.votos_1/total)*100 : 50}%`}}></div>
                                        <div className="h-full bg-red-600" style={{width: `${total ? (duelo.votos_2/total)*100 : 50}%`}}></div>
                                    </div>
                                    
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{total} Votos Computados</p>
                                </div>
                            </div>
                        </Link>
                     )
                })}
            </div>

            {filteredDuelos.length === 0 && (
                <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl mt-8">
                    <p>Nenhum duelo encontrado com esses filtros.</p>
                    <button onClick={() => {setSearch(''); setFilterCategory('')}} className="text-yellow-500 underline text-sm mt-2">Limpar filtros</button>
                </div>
            )}
        </div>
    )
}