'use client';
export const runtime = 'edge';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, MapPin, Calendar, Trophy, Filter, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function EventosPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterModality, setFilterModality] = useState('');
    const [filterMonth, setFilterMonth] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setLoading(true);
        // Fetch all published events
        // We could filter here or client side. For smaller datasets, client side is instant.
        // Let's fetch all active events and filter client side for better UX (instant search).
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('status', 'publicado') // Assuming we only want published events
            .order('data_evento', { ascending: true }); // Soonest first

        if (error) {
            console.error("Erro ao buscar eventos:", error);
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    }

    // Filter Logic
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.data_evento);
        const eventMonth = eventDate.getMonth(); // 0-11

        const matchesSearch = event.nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = !filterCity || event.localizacao?.includes(filterCity);
        const matchesModality = !filterModality || event.modalidade?.toLowerCase() === filterModality.toLowerCase();

        // Month Filter (0 = Janeiro, 1 = Fevereiro...)
        const matchesMonth = filterMonth === '' || eventMonth === parseInt(filterMonth);

        return matchesSearch && matchesCity && matchesModality && matchesMonth;
    });

    // Unique Values for Dropdowns
    const uniqueModalities = [...new Set(events.map(e => e.modalidade).filter(Boolean))];
    const uniqueCities = [...new Set(events.map(e => e.localizacao?.split('-')[0]?.trim()).filter(Boolean))].sort();

    // Month Names
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">

            {/* HERO SECTION */}
            <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] to-transparent"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4 animate-fadeIn">
                        Calendário Oficial
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight mb-6 drop-shadow-2xl animate-zoomIn">
                        Próximos Eventos
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fadeIn delay-100">
                        Encontre campeonatos, desafios e seminários. Inscreva-se e garanta seu lugar no pódio.
                    </p>

                    {/* SEARCH BAR (Floating) */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-2 shadow-2xl animate-fadeIn delay-200">
                        {/* Term Search */}
                        <div className="flex items-center bg-black/50 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-500 transition md:col-span-1">
                            <Search className="text-slate-500 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar nome..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600 min-w-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Modality Filter */}
                        <div className="flex items-center bg-black/50 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-500 transition relative">
                            <Trophy className="text-slate-500 mr-3 shrink-0" size={16} />
                            <select
                                className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none cursor-pointer z-10"
                                value={filterModality}
                                onChange={(e) => setFilterModality(e.target.value)}
                            >
                                <option value="" className="bg-black text-slate-400">Modalidade</option>
                                {uniqueModalities.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div className="flex items-center bg-black/50 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-500 transition relative">
                            <MapPin className="text-slate-500 mr-3 shrink-0" size={16} />
                            <select
                                className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none cursor-pointer z-10"
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                            >
                                <option value="" className="bg-black text-slate-400">Cidade</option>
                                {uniqueCities.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div className="flex items-center bg-black/50 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-500 transition relative">
                            <Calendar className="text-slate-500 mr-3 shrink-0" size={16} />
                            <select
                                className="bg-transparent border-none outline-none text-white w-full text-sm appearance-none cursor-pointer z-10"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            >
                                <option value="" className="bg-black text-slate-400">Mês</option>
                                {monthNames.map((m, idx) => (
                                    <option key={idx} value={idx} className="bg-black">{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-6 mt-12">

                {/* ACTIVE FILTERS DISPLAY */}
                {(searchTerm || filterModality || filterCity || filterMonth !== '') && (
                    <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 flex-wrap">
                        <span>Filtros ativos:</span>
                        {searchTerm && <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-bold">{searchTerm}</span>}
                        {filterModality && <span className="bg-purple-900/20 border border-purple-500/30 px-2 py-1 rounded text-purple-400 font-bold">{filterModality}</span>}
                        {filterCity && <span className="bg-blue-900/20 border border-blue-500/30 px-2 py-1 rounded text-blue-400 font-bold">{filterCity}</span>}
                        {filterMonth !== '' && <span className="bg-green-900/20 border border-green-500/30 px-2 py-1 rounded text-green-400 font-bold">{monthNames[parseInt(filterMonth)]}</span>}
                        <button
                            onClick={() => { setSearchTerm(''); setFilterModality(''); setFilterCity(''); setFilterMonth(''); }}
                            className="text-slate-400 hover:text-white underline ml-2"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="animate-spin mb-4 text-purple-500" size={32} />
                        <p>Carregando calendário...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <Trophy className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
                        <p className="text-slate-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map(event => (
                            <Link
                                href={`/eventos/${event.slug}`}
                                key={event.id}
                                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-300 transform hover:-translate-y-1 block"
                            >
                                {/* IMAGE */}
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                                            {event.modalidade}
                                        </span>
                                    </div>
                                    {event.banner_url ? (
                                        <img
                                            src={event.banner_url}
                                            className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <Trophy size={32} className="text-slate-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                </div>

                                {/* CONTENT */}
                                <div className="p-6">
                                    <h3 className="text-xl font-display font-bold uppercase text-white mb-3 group-hover:text-purple-400 transition truncate">
                                        {event.nome}
                                    </h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center text-slate-400 text-sm">
                                            <Calendar size={14} className="mr-2 text-purple-500" />
                                            {new Date(event.data_evento).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </div>
                                        <div className="flex items-center text-slate-400 text-sm">
                                            <MapPin size={14} className="mr-2 text-purple-500" />
                                            <span className="truncate">{event.localizacao}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${event.status === 'publicado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                                            }`}>
                                            Inscrições Abertas
                                        </span>
                                        <span className="text-white text-xs font-bold uppercase flex items-center group-hover:translate-x-1 transition">
                                            Ver Detalhes <ArrowRight size={12} className="ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
