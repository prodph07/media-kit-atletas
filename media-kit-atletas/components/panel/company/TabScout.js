import React, { useState, useEffect } from 'react';
import { Search, MapPin, Trophy, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AvatarLevel } from '../../AvatarLevel';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabScout({ perfil, setPerfil }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAthletes = async () => {
            setLoading(true);
            let query = supabase
                .from('atletas')
                .select('id, nome, apelido, categoria, foto_url, xp, level, contato, redes_sociais, slug')
                .eq('tipo_conta', 'atleta') // Apenas atletas
                .order('xp', { ascending: false }); // Melhores ranqueados primeiro

            if (searchTerm.length > 2) {
                query = query.or(`nome.ilike.%${searchTerm}%,apelido.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query.limit(50);
            if (!error) setAthletes(data || []);
            setLoading(false);
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchAthletes();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                    <Search className="text-purple-500" /> Scout de Talentos
                </h2>
                <p className="text-slate-400 text-sm mt-1 mb-4">Encontre o atleta ideal para sua marca usando filtros avançados.</p>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input
                            className="w-full bg-black border border-slate-700 p-2.5 pl-10 rounded text-white outline-none focus:border-purple-500"
                            placeholder="Buscar por nome, apelido ou categoria..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* LISTA DE RESULTADOS */}
            {loading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin text-purple-500 mx-auto" size={32} /></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {athletes.map(atleta => {
                        // Safe access for nested properties
                        const city = atleta.contato && atleta.contato.city ? atleta.contato.city : 'Local não informado';
                        const followers = atleta.redes_sociais && atleta.redes_sociais.instagram && atleta.redes_sociais.instagram.followers
                            ? atleta.redes_sociais.instagram.followers
                            : 'N/A';

                        return (
                            <div key={atleta.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition group">
                                <div className="h-24 bg-gradient-to-r from-purple-900 to-slate-900 relative">
                                    <div className="absolute -bottom-6 left-4">
                                        <AvatarLevel foto={atleta.foto_url} level={atleta.level} size="medium" />
                                    </div>
                                </div>
                                <div className="pt-8 px-4 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white text-lg truncate w-40">{atleta.apelido || atleta.nome}</h3>
                                            <p className="text-purple-400 text-xs font-bold uppercase">{atleta.categoria || 'Sem Categoria'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-yellow-500 font-bold text-xs flex items-center justify-end gap-1">
                                                <Trophy size={12} /> {atleta.xp} XP
                                            </div>
                                            <div className="text-slate-500 text-xs mt-1">Nível {atleta.level}</div>
                                        </div>
                                    </div>

                                    <div className="my-4 space-y-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {city}</div>
                                        <div className="flex items-center gap-2 font-bold text-white"><span className="text-pink-500">IG</span> {followers} Seguidores</div>
                                    </div>

                                    <button onClick={() => window.open(`/${atleta.slug || atleta.id}`, '_blank')} className="w-full bg-white hover:bg-gray-200 text-black font-bold uppercase py-2 rounded text-sm transition">
                                        Ver Perfil
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {athletes.length === 0 && (
                        <div className="col-span-full text-center text-slate-500 py-10">
                            Nenhum atleta encontrado com estes termos.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
