'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Search, Filter, Swords } from 'lucide-react';

export default function ArenaList({ initialDuelos }) {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Extrai todas as categorias únicas dos duelos para criar o <select>
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
        
        // Verifica Nome/Apelido
        const matchesName = 
            duelo.p1.nome?.toLowerCase().includes(term) ||
            duelo.p1.apelido?.toLowerCase().includes(term) ||
            duelo.p2.nome?.toLowerCase().includes(term) ||
            duelo.p2.apelido?.toLowerCase().includes(term);

        // Verifica Categoria (se houver filtro selecionado)
        const matchesCategory = filterCategory 
            ? (duelo.p1.categoria === filterCategory || duelo.p2.categoria === filterCategory)
            : true;

        return matchesName && matchesCategory;
    });

    return (
        <div>
            {/* BARRA DE PESQUISA E FILTROS */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredDuelos.map(duelo => {
                     const total = duelo.votos_1 + duelo.votos_2;
                     return (
                        <Link href={`/duelos/${duelo.id}`} key={duelo.id} className="block group">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all relative">
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1 backdrop-blur-md z-10">
                                    <Clock size={12}/> Expira em {new Date(duelo.expires_at).getDate()}/{new Date(duelo.expires_at).getMonth()+1}
                                </div>
                                
                                <div className="flex items-center justify-between p-6 pb-2 relative">
                                    {/* Categorias no topo */}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                         <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-900/50">{duelo.p1.categoria}</span>
                                    </div>

                                    <img src={duelo.p1.foto_url || "https://placehold.co/100"} className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"/>
                                    <span className="text-2xl font-black text-slate-700 group-hover:text-yellow-500 italic">VS</span>
                                    <img src={duelo.p2.foto_url || "https://placehold.co/100"} className="w-16 h-16 rounded-full border-2 border-red-500 object-cover"/>
                                </div>
                                
                                <div className="text-center px-4 pb-4">
                                    <div className="flex justify-between text-sm font-bold text-white mb-2">
                                        <span className="truncate w-1/2 text-left pr-2">{duelo.p1.apelido || duelo.p1.nome}</span>
                                        <span className="truncate w-1/2 text-right pl-2">{duelo.p2.apelido || duelo.p2.nome}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full flex overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{width: `${total ? (duelo.votos_1/total)*100 : 50}%`}}></div>
                                        <div className="h-full bg-red-500" style={{width: `${total ? (duelo.votos_2/total)*100 : 50}%`}}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">{total} Votos</p>
                                </div>
                            </div>
                        </Link>
                     )
                })}
            </div>

            {filteredDuelos.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p>Nenhum duelo encontrado com esses filtros.</p>
                </div>
            )}
        </div>
    )
}