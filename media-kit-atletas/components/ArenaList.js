'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Search, Filter, Swords, Trophy, Zap } from 'lucide-react';

export default function ArenaList({ initialDuelos }) {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Extrai todas as categorias únicas
    const categories = useMemo(() => {
        const cats = new Set();
        initialDuelos.forEach(d => {
            if (d.p1.categoria) cats.add(d.p1.categoria);
            if (d.p2.categoria) cats.add(d.p2.categoria);
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
            <div className="bg-[#111] border border-[#222] p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 shadow-lg shadow-black/50">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                        className="w-full bg-[#0c0c0c] border border-[#333] pl-10 p-3 rounded-lg text-white outline-none focus:border-red-600 transition-colors placeholder:text-gray-600"
                        placeholder="Pesquisar atleta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-3 text-gray-500" size={20} />
                    <select
                        className="w-full bg-[#0c0c0c] border border-[#333] pl-10 p-3 rounded-lg text-white outline-none focus:border-red-600 appearance-none cursor-pointer"
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
                            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden hover:border-red-600/50 transition-all relative shadow-xl hover:shadow-red-900/10 group-hover:-translate-y-1 duration-300">

                                {/* Background Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] text-gray-400 flex items-center gap-1 backdrop-blur-md z-10 border border-[#333]">
                                    <Clock size={10} /> Expira {new Date(duelo.expires_at).getDate()}/{new Date(duelo.expires_at).getMonth() + 1}
                                </div>

                                <div className="flex items-center justify-between p-6 pb-2 relative z-10">
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[9px] bg-[#222] text-gray-300 px-2 py-0.5 rounded border border-[#333] font-bold uppercase tracking-wider">
                                            {duelo.p1.categoria}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-center w-full gap-4 mt-6">
                                        <div className="relative group/p1">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#222] overflow-hidden shadow-lg group-hover/p1:border-blue-600 transition-colors">
                                                <img src={duelo.p1.foto_url || "https://placehold.co/100"} className="w-full h-full object-cover" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <Swords className="w-6 h-6 text-red-600 mb-1" />
                                            <span className="text-xl font-black text-[#333] group-hover:text-red-600 italic transition-colors">VS</span>
                                        </div>

                                        <div className="relative group/p2">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#222] overflow-hidden shadow-lg group-hover/p2:border-red-600 transition-colors">
                                                <img src={duelo.p2.foto_url || "https://placehold.co/100"} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center px-6 pb-6 pt-2 relative z-10">
                                    <div className="flex justify-between text-sm font-bold text-gray-200 mb-3">
                                        <span className="truncate w-1/2 text-left pr-2 group-hover:text-blue-500 transition-colors">{duelo.p1.apelido || duelo.p1.nome}</span>
                                        <span className="truncate w-1/2 text-right pl-2 group-hover:text-red-500 transition-colors">{duelo.p2.apelido || duelo.p2.nome}</span>
                                    </div>

                                    <div className="w-full h-1.5 bg-[#222] rounded-full flex overflow-hidden mb-3">
                                        <div className="h-full bg-blue-600/80" style={{ width: `${total ? (duelo.votos_1 / total) * 100 : 50}%` }}></div>
                                        <div className="h-full bg-red-600/80" style={{ width: `${total ? (duelo.votos_2 / total) * 100 : 50}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1"><Trophy size={10} className="text-yellow-600" /> Rank Match</div>
                                        <div>{total} Votos</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {filteredDuelos.length === 0 && (
                <div className="text-center py-20 text-gray-500 border border-dashed border-[#222] rounded-xl mt-8 bg-[#111]">
                    <Swords size={32} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum duelo encontrado.</p>
                    <button onClick={() => { setSearch(''); setFilterCategory('') }} className="text-red-500 hover:text-red-400 text-sm mt-2 font-bold">Limpar filtros</button>
                </div>
            )}
        </div>
    )
}
