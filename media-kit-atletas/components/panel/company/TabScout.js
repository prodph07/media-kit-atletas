import React, { useState, useEffect } from 'react';
import { Search, MapPin, Trophy, Loader2, Filter, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AvatarLevel } from '../../AvatarLevel';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabScout({ perfil, setPerfil }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [athletes, setAthletes] = useState([]);

    // Filters State
    const [filterCategory, setFilterCategory] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchAthletes = async () => {
            setLoading(true);
            let query = supabase
                .from('atletas')
                .select('id, nome, apelido, categoria, foto_url, xp, level, contato, redes_sociais, slug')
                .eq('tipo_conta', 'atleta'); // Only athletes

            // Text Search (Name/Nickname)
            if (searchTerm.length > 0) {
                query = query.or(`nome.ilike.%${searchTerm}%,apelido.ilike.%${searchTerm}%`);
            }

            // Category Filter
            if (filterCategory) {
                query = query.ilike('categoria', `%${filterCategory}%`);
            }

            // City Filter (JSONB search)
            if (filterCity) {
                // Using the arrow operator for JSON column 'contato' and key 'city'
                query = query.filter('contato->>city', 'ilike', `%${filterCity}%`);
            }

            // Level Filter
            if (filterLevel) {
                query = query.gte('level', parseInt(filterLevel));
            }

            // Order by XP descending to show top ranked first
            query = query.order('xp', { ascending: false }).limit(50);

            const { data, error } = await query;
            if (!error) setAthletes(data || []);
            setLoading(false);
        };

        // Debounce for all inputs
        const timeoutId = setTimeout(() => {
            fetchAthletes();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterCategory, filterCity, filterLevel]);

    const clearFilters = () => {
        setFilterCategory('');
        setFilterCity('');
        setFilterLevel('');
        setSearchTerm('');
    };

    const hasActiveFilters = filterCategory || filterCity || filterLevel || searchTerm;

    return (
        <div className="space-y-6">
            {/* SEARCH & FILTERS PANEL */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                            <Search className="text-purple-500" /> Scout de Talentos
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Encontre atletas para sua marca ou evento.</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${showFilters ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        <Filter size={16} /> Filtros Avançados
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input
                        className="w-full bg-black border border-slate-700 p-2.5 pl-10 rounded-lg text-white outline-none focus:border-purple-500 transition-colors"
                        placeholder="Buscar por nome ou apelido..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* FILTERS SECTION */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Categoria / Peso</label>
                            <input
                                className="w-full bg-black/50 border border-slate-700 p-2 rounded text-white text-sm outline-none focus:border-purple-500"
                                placeholder="Ex: Galo, Leve..."
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Cidade</label>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-2.5 text-slate-600" size={14} />
                                <input
                                    className="w-full bg-black/50 border border-slate-700 p-2 pl-8 rounded text-white text-sm outline-none focus:border-purple-500"
                                    placeholder="Ex: São Paulo"
                                    value={filterCity}
                                    onChange={e => setFilterCity(e.target.value)}
                                    title="A busca depende dos atletas terem preenchido a cidade no perfil."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Nível Mínimo</label>
                            <div className="relative">
                                <Trophy className="absolute left-2 top-2.5 text-slate-600" size={14} />
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full bg-black/50 border border-slate-700 p-2 pl-8 rounded text-white text-sm outline-none focus:border-purple-500"
                                    placeholder="1"
                                    value={filterLevel}
                                    onChange={e => setFilterLevel(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <X size={12} /> Limpar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* LISTA DE RESULTADOS */}
            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin text-purple-500 mx-auto" size={40} /></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {athletes.map(atleta => {
                        const city = atleta.contato && atleta.contato.city ? atleta.contato.city : 'Local não informado';
                        const followers = atleta.redes_sociais && atleta.redes_sociais.instagram && atleta.redes_sociais.instagram.followers
                            ? atleta.redes_sociais.instagram.followers
                            : 'N/A';

                        return (
                            <div key={atleta.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-900/10 group">
                                <div className="h-28 bg-gradient-to-r from-purple-900/80 to-slate-950 relative">
                                    <div className="absolute -bottom-10 left-6">
                                        <AvatarLevel foto={atleta.foto_url} level={atleta.level} size="medium" />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                        Lvl. {atleta.level}
                                    </div>
                                </div>
                                <div className="pt-12 px-6 pb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-white text-xl truncate w-48 leading-tight">{atleta.apelido || atleta.nome}</h3>
                                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{atleta.nome}</p>
                                        </div>
                                    </div>

                                    <div className="inline-block bg-purple-500/10 text-purple-400 text-xs font-bold px-2 py-1 rounded border border-purple-500/20 uppercase mb-4">
                                        {atleta.categoria || 'Sem Categoria'}
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <MapPin size={16} className="text-slate-600" />
                                            <span className="truncate">{city}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <span className="font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded text-[10px]">IG</span>
                                            <span>{followers} Seguidores</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => window.open(`/${atleta.slug || atleta.id}`, '_blank')}
                                        className="w-full bg-white hover:bg-slate-200 text-black font-bold uppercase py-3 rounded-xl text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                                    >
                                        Ver Media Kit
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {athletes.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                            <Search size={48} className="mb-4 text-slate-700" />
                            <p className="text-lg font-bold text-slate-400">Nenhum atleta encontrado</p>
                            <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                            <button onClick={clearFilters} className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-bold underline">
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
