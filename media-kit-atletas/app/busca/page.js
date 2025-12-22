'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, MapPin, Trophy, Swords, Dumbbell, Filter, Flame, Calendar } from 'lucide-react';

// --- LISTAS PARA FILTROS IGUAIS AO PAINEL ---
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
  const [showFilters, setShowFilters] = useState(false);

  // --- ESTADOS DOS FILTROS ---
  const [filters, setFilters] = useState({
    termo: '',          
    categoria: '',      
    modalidade: '',     
    estado: '',         // Mudou de cidade para estado
    academia: '',       
    minLutas: '',       // Novo filtro: Total de lutas
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

  useEffect(() => {
    const fetchAtletas = async () => {
      setLoading(true);

      let query = supabase
        .from('atletas')
        .select('id, nome, apelido, categoria, estilodeluta, foto_url, plano, slug, cartel, atributos, contato, prox_luta')
        .order('plano', { ascending: false })
        .order('nome', { ascending: true });

      if (filters.termo) {
        query = query.or(`nome.ilike.%${filters.termo}%,apelido.ilike.%${filters.termo}%`);
      }
      if (filters.categoria) {
        query = query.ilike('categoria', `%${filters.categoria}%`);
      }
      if (filters.modalidade) {
        query = query.ilike('estilodeluta', `%${filters.modalidade}%`);
      }
      if (filters.apenasPremium) {
        query = query.eq('plano', 'premium');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro:', error);
        setLoading(false);
        return;
      }

      let resultados = data;

      // Filtro Estado (JSON)
      if (filters.estado) {
        resultados = resultados.filter(a => 
            a.contato?.state === filters.estado
        );
      }

      // Filtro Academia (JSON)
      if (filters.academia) {
        resultados = resultados.filter(a => 
            a.contato?.trainingCenter?.toLowerCase().includes(filters.academia.toLowerCase())
        );
      }

      // NOVO FILTRO: Total de Lutas (Wins + Losses + Draws)
      if (filters.minLutas) {
        const min = parseInt(filters.minLutas);
        resultados = resultados.filter(a => {
            const total = (parseInt(a.cartel?.wins) || 0) + 
                          (parseInt(a.cartel?.losses) || 0) + 
                          (parseInt(a.cartel?.draws) || 0);
            return total >= min;
        });
      }

      // Filtro Tem Luta Marcada
      if (filters.temLutaMarcada) {
        resultados = resultados.filter(a => 
            a.prox_luta?.date && a.prox_luta?.date.length > 5
        );
      }

      setAtletas(resultados);
      setLoading(false);
    };

    const delay = setTimeout(fetchAtletas, 400);
    return () => clearTimeout(delay);

  }, [filters]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans pb-20">
      
      {/* HEADER + BARRA PRINCIPAL */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-8 px-4 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500 uppercase tracking-wider">
                Encontre Lutadores
            </h1>
            
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input 
                        name="termo"
                        className="w-full bg-black/50 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-yellow-500 outline-none transition"
                        placeholder="Buscar por nome ou apelido..."
                        value={filters.termo}
                        onChange={handleFilter}
                    />
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition ${showFilters ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                >
                    <Filter size={20} /> <span className="hidden md:inline">Filtros</span>
                </button>
            </div>

            {/* ÁREA DE FILTROS AVANÇADOS */}
            <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Linha 1 */}
                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block">Modalidade</label>
                        <div className="flex items-center bg-black border border-slate-700 rounded px-2">
                            <Swords size={14} className="text-slate-500 mr-2"/>
                            <select name="modalidade" className="bg-transparent w-full py-2 text-sm outline-none text-white" value={filters.modalidade} onChange={handleFilter}>
                                <option value="">Todas</option>
                                {ESTILOS_LUTA.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block">Estado (UF)</label>
                        <div className="flex items-center bg-black border border-slate-700 rounded px-2">
                            <MapPin size={14} className="text-slate-500 mr-2"/>
                            <select name="estado" className="bg-transparent w-full py-2 text-sm outline-none text-white" value={filters.estado} onChange={handleFilter}>
                                <option value="">Todos</option>
                                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block">Categoria</label>
                        <div className="flex items-center bg-black border border-slate-700 rounded px-2">
                            <Dumbbell size={14} className="text-slate-500 mr-2"/>
                            <input name="categoria" placeholder="Ex: Leve" className="bg-transparent w-full py-2 text-sm outline-none" value={filters.categoria} onChange={handleFilter} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block">Academia</label>
                        <div className="flex items-center bg-black border border-slate-700 rounded px-2">
                            <Flame size={14} className="text-slate-500 mr-2"/>
                            <input name="academia" placeholder="Equipe" className="bg-transparent w-full py-2 text-sm outline-none" value={filters.academia} onChange={handleFilter} />
                        </div>
                    </div>

                    {/* Linha 2 */}
                    <div className="flex items-center gap-2 bg-black border border-slate-700 rounded px-3 py-2">
                        <input type="number" name="minLutas" placeholder="0" className="bg-transparent w-10 text-center border-r border-slate-700 mr-2 outline-none" value={filters.minLutas} onChange={handleFilter} />
                        <label className="text-xs text-slate-400 font-bold">Mín. Lutas (Total)</label>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer bg-black border border-slate-700 rounded px-3 py-2 hover:border-yellow-500 transition">
                        <input type="checkbox" name="apenasPremium" className="accent-yellow-500 w-4 h-4" checked={filters.apenasPremium} onChange={handleFilter} />
                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1"><Trophy size={12}/> Apenas Premium</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer bg-black border border-slate-700 rounded px-3 py-2 hover:border-red-500 transition">
                        <input type="checkbox" name="temLutaMarcada" className="accent-red-500 w-4 h-4" checked={filters.temLutaMarcada} onChange={handleFilter} />
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1"><Calendar size={12}/> Luta Marcada</span>
                    </label>

                    <button onClick={() => setFilters({termo:'', categoria:'', modalidade:'', estado:'', academia:'', minLutas:'', apenasPremium:false, temLutaMarcada:false})} className="text-xs text-slate-500 hover:text-white underline">
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4 text-slate-400 text-sm">
            {loading ? 'Carregando...' : `${atletas.length} lutadores encontrados`}
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-900 rounded-xl border border-slate-800"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {atletas.map((atleta) => (
                    <CardAtleta key={atleta.id} data={atleta} />
                ))}
                
                {atletas.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
                        <Swords size={64} className="mb-4"/>
                        <p>Nenhum guerreiro encontrado com esses filtros.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTE CARD ---
function CardAtleta({ data }) {
    const isPremium = data.plano === 'premium';
    const temLuta = data.prox_luta?.date && data.prox_luta.date.length > 5;

    return (
        <Link href={`/${data.slug || data.id}`} className="group relative block bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all hover:translate-y-[-5px] hover:shadow-2xl hover:shadow-cyan-900/10">
            {isPremium && (
                <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-xl z-10 pointer-events-none shadow-[0_0_15px_rgba(234,179,8,0.15)]"></div>
            )}
            <div className="h-56 bg-black relative overflow-hidden">
                {data.foto_url ? (
                    <img src={data.foto_url} alt={data.nome} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-600">
                        <Dumbbell size={32} opacity={0.5}/>
                        <span className="text-xs mt-2">Sem Foto</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {isPremium && <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase"><Trophy size={10} /> Destaque</span>}
                    {temLuta && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase animate-pulse"><Swords size={10} /> Em Combate</span>}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>

            <div className="p-5 relative z-20 -mt-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-white truncate max-w-[80%] leading-tight">{data.apelido || data.nome}</h3>
                    {data.atributos?.age && <span className="text-xs text-slate-500 bg-slate-800 px-1 rounded">{data.atributos.age}y</span>}
                </div>
                
                <p className="text-xs text-slate-400 mb-3 truncate">{data.nome}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-cyan-900/30 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/30 font-bold uppercase">{data.estilodeluta || 'Lutador'}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">{data.categoria || 'Peso n/d'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 bg-black/20 p-2 rounded">
                    <div className="flex items-center gap-1"><MapPin size={10}/> <span className="truncate max-w-[80px]">{data.contato?.state || 'N/A'}</span></div>
                    <div className="flex items-center gap-1 justify-end"><Flame size={10}/> <span className="truncate max-w-[80px]">{data.contato?.trainingCenter || 'N/A'}</span></div>
                </div>

                <div className="flex rounded-md overflow-hidden h-6 text-[10px] font-bold text-center leading-6">
                    <div className="bg-green-600/80 text-white flex-1" title="Vitórias">{data.cartel?.wins || 0} V</div>
                    <div className="bg-red-600/80 text-white flex-1" title="Derrotas">{data.cartel?.losses || 0} D</div>
                    <div className="bg-slate-600/80 text-white flex-1" title="Empates">{data.cartel?.draws || 0} E</div>
                </div>
            </div>
        </Link>
    );
}