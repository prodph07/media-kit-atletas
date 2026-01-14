'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, MapPin, Trophy, Swords, Dumbbell, Filter, Flame, Calendar, X, Shield, ChevronRight } from 'lucide-react';

// --- LISTAS PARA FILTROS ---
const ESTILOS_LUTA = [
    "MMA", "Muay Thai", "Boxe", "Kickboxing", "Jiu-Jitsu Brasileiro (BJJ)",
    "Wrestling (Luta Olímpica)", "Judô", "Sambo", "Krav Maga", "Capoeira", "Karatê"
];

const ESTADOS_BR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Busca() {
    const [atletas, setAtletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

    // --- ESTADOS DOS FILTROS ---
    const [filters, setFilters] = useState({
        termo: '',
        categoria: '',
        modalidade: '',
        estado: '',
        academia: '',
        team: '',           // NOVO: Filtro por Time
        minLutas: '',
        minWeight: '',      // NOVO: Filtro Peso Min
        maxWeight: '',      // NOVO: Filtro Peso Max
        apenasPremium: false,
        temLutaMarcada: false
    });

    const handleFilter = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            termo: '', categoria: '', modalidade: '', estado: '', academia: '', team: '', minLutas: '', minWeight: '', maxWeight: '', apenasPremium: false, temLutaMarcada: false
        });
        setShowFiltersMobile(false);
    };

    useEffect(() => {
        const fetchAtletas = async () => {
            setLoading(true);

            let query = supabase
                .from('atletas')
                .select('id, nome, apelido, categoria, estilodeluta, foto_url, plano, slug, cartel, atributos, contato, prox_luta, team')
                .order('plano', { ascending: false }) // Premium primeiro
                .order('nome', { ascending: true });

            // Busca Textual (Nome/Apelido)
            if (filters.termo) {
                query = query.or(`nome.ilike.%${filters.termo}%,apelido.ilike.%${filters.termo}%`);
            }

            // Filtros DB Diretos
            if (filters.categoria) query = query.ilike('categoria', `%${filters.categoria}%`);
            if (filters.modalidade) query = query.ilike('estilodeluta', `%${filters.modalidade}%`);
            if (filters.apenasPremium) query = query.eq('plano', 'premium');
            // Filtro TEAM/Equipe
            if (filters.team) query = query.ilike('team', `%${filters.team}%`);

            const { data, error } = await query;

            if (error) {
                console.error('Erro:', error);
                setLoading(false);
                return;
            }

            let resultados = data;

            // Filtros Client-Side (Campos JSON ou complexos)
            if (filters.estado) {
                resultados = resultados.filter(a => a.contato?.state === filters.estado);
            }

            if (filters.academia) {
                resultados = resultados.filter(a =>
                    a.contato?.trainingCenter?.toLowerCase().includes(filters.academia.toLowerCase())
                );
            }

            if (filters.minLutas) {
                const min = parseInt(filters.minLutas);
                resultados = resultados.filter(a => {
                    const total = (parseInt(a.cartel?.wins) || 0) + (parseInt(a.cartel?.losses) || 0) + (parseInt(a.cartel?.draws) || 0);
                    return total >= min;
                });
            }

            // NOVO: Filtro de Peso (Range)
            if (filters.minWeight || filters.maxWeight) {
                resultados = resultados.filter(a => {
                    // Limpar string de peso: "70kg" -> 70, "70,5" -> 70.5
                    const rawWeight = a.atributos?.weight || '';
                    if (!rawWeight) return false;
                    const cleanWeight = parseFloat(rawWeight.toString().replace(/[^\d.,]/g, '').replace(',', '.'));

                    if (isNaN(cleanWeight)) return false;

                    const min = filters.minWeight ? parseFloat(filters.minWeight) : 0;
                    const max = filters.maxWeight ? parseFloat(filters.maxWeight) : 999;

                    return cleanWeight >= min && cleanWeight <= max;
                });
            }

            if (filters.temLutaMarcada) {
                resultados = resultados.filter(a => a.prox_luta?.date && a.prox_luta?.date.length > 5);
            }

            setAtletas(resultados);
            setLoading(false);
        };

        const delay = setTimeout(fetchAtletas, 400); // Debounce
        return () => clearTimeout(delay);
    }, [filters]);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans pb-20">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-body { font-family: 'Roboto', sans-serif; }
      `}</style>

            {/* MOBILE HEADER & FILTER TOGGLE */}
            <div className="lg:hidden bg-[#111] p-4 flex gap-3 sticky top-0 z-40 border-b border-[#222]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        name="termo"
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded px-10 py-2.5 text-sm text-white focus:border-[#FF4500] outline-none"
                        placeholder="Buscar atleta..."
                        value={filters.termo}
                        onChange={handleFilter}
                    />
                </div>
                <button
                    onClick={() => setShowFiltersMobile(true)}
                    className="bg-[#222] text-white p-2.5 rounded border border-[#333] relative"
                >
                    <Filter size={20} />
                    {(filters.categoria || filters.estado || filters.team) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4500] rounded-full animate-pulse"></span>}
                </button>
            </div>

            <div className="max-w-[1600px] mx-auto pt-4 lg:pt-8 px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* SIDEBAR FILTERS (DESKTOP) */}
                    <aside className={`
                  fixed inset-0 z-50 bg-[#0c0c0c] p-6 lg:p-0 lg:static lg:bg-transparent lg:block lg:col-span-3 lg:z-auto
                  transition-transform duration-300 ease-in-out overflow-y-auto
                  ${showFiltersMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                        <div className="flex justify-between items-center lg:hidden mb-6">
                            <h2 className="font-display font-bold text-2xl uppercase">Filtros</h2>
                            <button onClick={() => setShowFiltersMobile(false)} className="text-gray-400"><X size={24} /></button>
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-8">
                            {/* DESKTOP SEARCH */}
                            <div className="hidden lg:block relative mb-6">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Buscar Nome/Apelido</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        name="termo"
                                        className="w-full bg-[#111] border border-[#333] rounded px-10 py-3 text-white focus:border-[#FF4500] outline-none transition font-display uppercase font-medium tracking-wide"
                                        placeholder="BUSCAR..."
                                        value={filters.termo}
                                        onChange={handleFilter}
                                    />
                                </div>
                            </div>

                            {/* FILTERS GROUPS */}
                            <div className="p-5 bg-[#111] border border-[#222] rounded-lg space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><Trophy size={14} /> Modalidade</label>
                                    <select name="modalidade" className="w-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]" value={filters.modalidade} onChange={handleFilter}>
                                        <option value="">Todas</option>
                                        {ESTILOS_LUTA.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><MapPin size={14} /> Estado (UF)</label>
                                    <select name="estado" className="w-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]" value={filters.estado} onChange={handleFilter}>
                                        <option value="">Todos</option>
                                        {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><Dumbbell size={14} /> Categoria / Peso</label>
                                    <input name="categoria" placeholder="Ex: Leve" className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]" value={filters.categoria} onChange={handleFilter} />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><Shield size={14} /> Equipe / Team</label>
                                    <input name="team" placeholder="Ex: Chute Boxe" className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]" value={filters.team} onChange={handleFilter} />
                                </div>

                                {/* WEIGHT FILTER */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><Dumbbell size={14} /> Peso (kg)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="minWeight"
                                            placeholder="Min"
                                            className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]"
                                            value={filters.minWeight}
                                            onChange={handleFilter}
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="number"
                                            name="maxWeight"
                                            placeholder="Max"
                                            className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#FF4500]"
                                            value={filters.maxWeight}
                                            onChange={handleFilter}
                                        />
                                    </div>
                                </div>

                                {/* TOGGLES */}
                                <div className="pt-4 border-t border-[#222] space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="apenasPremium" className="sr-only peer" checked={filters.apenasPremium} onChange={handleFilter} />
                                            <div className="w-10 h-5 bg-[#333] rounded-full peer peer-checked:bg-[#FFD700] transition-all"></div>
                                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-[#FFD700] uppercase transition-colors">Apenas Premium</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="temLutaMarcada" className="sr-only peer" checked={filters.temLutaMarcada} onChange={handleFilter} />
                                            <div className="w-10 h-5 bg-[#333] rounded-full peer peer-checked:bg-red-600 transition-all"></div>
                                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 uppercase transition-colors">Luta Marcada</span>
                                    </label>
                                </div>

                                <button onClick={clearFilters} className="w-full py-2 text-xs font-bold text-[#FF4500] hover:bg-[#FF4500]/10 border border-[#FF4500]/30 rounded uppercase mt-4 transition">
                                    Limpar Filtros
                                </button>

                                <button
                                    onClick={() => setShowFiltersMobile(false)}
                                    className="lg:hidden w-full bg-[#FF4500] text-white font-display font-bold uppercase py-3 rounded mt-4 shadow-lg hover:bg-[#e04000] flex items-center justify-center gap-2"
                                >
                                    Ver {atletas.length} Resultados
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* RESULTS GRID (9 cols) */}
                    <main className="lg:col-span-9">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h1 className="font-display font-bold text-4xl text-white uppercase leading-none mb-1">Buscar <span className="text-[#FF4500]">Atletas</span></h1>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">
                                    {loading ? 'Pesquisando...' : `${atletas.length} guerreiros encontrados`}
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-[#111] rounded border border-[#222]"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pb-20">
                                {atletas.map((atleta) => (
                                    <CardAtleta key={atleta.id} data={atleta} />
                                ))}

                                {atletas.length === 0 && (
                                    <div className="col-span-full py-32 text-center border border-dashed border-[#333] rounded-lg bg-[#111]/50">
                                        <Swords size={64} className="mx-auto text-[#333] mb-4" />
                                        <h3 className="text-gray-500 font-display font-bold text-xl uppercase">Nenhum atleta encontrado</h3>
                                        <p className="text-gray-600 text-sm">Tente ajustar seus filtros de busca.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

// --- IMPROVED CARD COMPONENT ---
function CardAtleta({ data }) {
    const isPremium = data.plano === 'premium';
    const temLuta = data.prox_luta?.date && data.prox_luta.date.length > 5;
    const wins = parseInt(data.cartel?.wins) || 0;
    const losses = parseInt(data.cartel?.losses) || 0;
    const totalFights = wins + losses + (parseInt(data.cartel?.draws) || 0);

    return (
        <Link href={`/${data.slug || data.id}`} className="group relative block bg-[#111] border border-[#222] hover:border-[#FF4500] transition-colors duration-300 overflow-hidden">
            {/* IMAGE */}
            <div className="aspect-[4/5] relative overflow-hidden bg-[#0c0c0c]">
                {data.foto_url ? (
                    <img
                        src={data.foto_url}
                        alt={data.nome}
                        className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${!isPremium ? 'grayscale group-hover:grayscale-0 contrast-125' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                        <Dumbbell size={48} className="opacity-20" />
                    </div>
                )}

                {/* OVERLAY GRADIENT */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90"></div>

                {/* BADGES */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isPremium && <span className="bg-[#FFD700] text-black text-[10px] font-bold uppercase px-2 py-0.5 shadow-lg">PRO</span>}
                </div>
                {temLuta && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-red-600/90 text-white text-[10px] font-bold uppercase px-2 py-1 shadow-lg flex items-center gap-1 animate-pulse border border-red-500">
                            Luta Marcada
                        </span>
                    </div>
                )}

                {/* INFO ON IMAGE */}
                {/* INFO ON IMAGE */}
                {/* INFO ON IMAGE */}
                <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-display font-bold text-base md:text-2xl leading-none uppercase mb-0.5 md:mb-1 drop-shadow-md truncate">{data.apelido || data.nome}</h3>
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase mb-1.5 md:mb-3 truncate border-l-2 border-[#FF4500] pl-2">{data.team || 'Sem Equipe'}</p>

                    {/* BADGES ALWAYS VISIBLE */}
                    <div className="flex gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase text-gray-300 mb-1.5 md:mb-3">
                        <div className="bg-white/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded backdrop-blur-sm truncate text-center flex-1 border border-white/5">
                            {data.categoria}
                        </div>
                        <div className="bg-white/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded backdrop-blur-sm truncate text-center flex-1 border border-white/5">
                            {data.estilodeluta}
                        </div>
                    </div>

                    {/* STATS FOOTER */}
                    <div className="grid grid-cols-2 gap-1 md:gap-2 mt-1 md:mt-2">
                        <div className="bg-[#111]/80 backdrop-blur border border-[#333] rounded px-1 py-0.5 md:px-2 md:py-1 flex flex-col items-center justify-center">
                            <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase">Cartel</span>
                            <div className="flex gap-1 text-[10px] md:text-xs font-bold uppercase leading-none">
                                <span className="text-green-500">{wins}V</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-red-500">{losses}D</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-300">{parseInt(data.cartel?.draws) || 0}E</span>
                            </div>
                        </div>
                        <div className="bg-[#111]/80 backdrop-blur border border-[#333] rounded px-1 py-0.5 md:px-2 md:py-1 flex flex-col items-center justify-center">
                            <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase">Total Lutas</span>
                            <span className="text-white text-[10px] md:text-xs font-bold uppercase leading-none">{totalFights}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* HOVER BORDER EFFECT */}
            <div className="absolute inset-0 border-2 border-[#FF4500] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"></div>
        </Link>
    );
}