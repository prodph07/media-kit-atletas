import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AvatarLevel } from '../../AvatarLevel';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabMeuTime({ empresaId }) {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'search'
    const [myTeam, setMyTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado da Busca
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [invitedIds, setInvitedIds] = useState([]);

    // 1. Carregar Time Atual
    useEffect(() => {
        fetchTeam();
    }, [empresaId]);

    const fetchTeam = async () => {
        if (!empresaId) return;
        setLoading(true);
        // Buscamos parcerias onde somos a empresa
        const { data, error } = await supabase
            .from('parcerias')
            .select(`
                id, status, created_at,
                atleta:atleta_id ( id, nome, apelido, categoria, foto_url, xp, level, slug )
            `)
            .eq('empresa_id', empresaId);

        if (!error && data) {
            setMyTeam(data);
            // Marcar IDs já convidados para não convidar de novo
            setInvitedIds(data.map(p => p.atleta?.id).filter(Boolean));
        }
        setLoading(false);
    };

    // 2. Buscar Atletas para Convidar (Clone simplificado do Scout)
    useEffect(() => {
        const fetchAthletes = async () => {
            if (searchTerm.length < 3) return;
            setSearching(true);

            let query = supabase
                .from('atletas')
                .select('id, nome, apelido, categoria, foto_url, xp, level, slug')
                .eq('tipo_conta', 'atleta')
                .order('xp', { ascending: false })
                .limit(20);

            // Filtro de texto
            query = query.or(`nome.ilike.%${searchTerm}%,apelido.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);

            const { data } = await query;
            setSearchResults(data || []);
            setSearching(false);
        };

        const timeoutId = setTimeout(fetchAthletes, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // 3. Enviar Convite
    const handleInvite = async (atletaId) => {
        if (!confirm("Enviar convite oficial para este atleta? Ele receberá uma notificação.")) return;

        const { error } = await supabase.from('parcerias').insert({
            empresa_id: empresaId,
            atleta_id: atletaId,
            status: 'pendente'
        });

        if (error) {
            alert("Erro ao enviar convite: " + error.message);
        } else {
            alert("Convite enviado com sucesso!");
            setInvitedIds([...invitedIds, atletaId]);
            fetchTeam(); // Atualiza a lista para mostrar pendente
        }
    };

    const handleRemove = async (parceriaId) => {
        if (!confirm("Tem certeza que deseja remover este atleta/convite do time?")) return;

        await supabase.from('parcerias').delete().eq('id', parceriaId);
        fetchTeam();
    };


    // --- RENDER ---

    return (
        <div className="space-y-6">
            {/* CABEÇALHO */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                        <Users className="text-purple-500" /> Meu Time
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Gerencie seu elenco oficial de atletas.</p>
                </div>
                {viewMode === 'list' ? (
                    <button onClick={() => setViewMode('search')} className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded font-bold uppercase flex items-center gap-2 transition">
                        <UserPlus size={18} /> Adicionar Atleta
                    </button>
                ) : (
                    <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-white px-4 py-2 rounded font-bold uppercase transition border border-slate-700 hover:border-slate-500">
                        Voltar para Lista
                    </button>
                )}
            </div>

            {/* MODO BUSCA */}
            {viewMode === 'search' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Search size={18} className="text-purple-500" /> Buscar Novo Talento</h3>
                    <input
                        className="w-full bg-black border border-slate-700 p-3 rounded text-white outline-none focus:border-purple-500 transition mb-6"
                        placeholder="Digite o nome, apelido ou categoria do atleta..."
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />

                    {searchResults.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {searchResults.map(atleta => {
                                const isInvited = invitedIds.includes(atleta.id);
                                return (
                                    <div key={atleta.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-slate-800">
                                        <AvatarLevel foto={atleta.foto_url} level={atleta.level} size="small" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold truncate">{atleta.apelido || atleta.nome}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase">{atleta.categoria || 'Sem categoria'}</p>
                                        </div>
                                        {isInvited ? (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">No Time / Convidado</span>
                                        ) : (
                                            <button onClick={() => handleInvite(atleta.id)} className="text-green-500 hover:bg-green-500/10 p-2 rounded transition" title="Convidar">
                                                <UserPlus size={20} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {searchTerm.length > 2 && searchResults.length === 0 && !searching && (
                        <p className="text-center text-slate-500">Nenhum atleta encontrado.</p>
                    )}
                </div>
            )}

            {/* MODO LISTA (TIME ATUAL) */}
            {viewMode === 'list' && (
                <>
                    {myTeam.length === 0 && !loading ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                            <Users size={64} className="mx-auto text-slate-700 mb-4" />
                            <h3 className="text-slate-500 font-bold text-xl">Seu time está vazio</h3>
                            <p className="text-slate-600 mb-6">Convide atletas para representarem sua marca.</p>
                            <button onClick={() => setViewMode('search')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold uppercase transition shadow-lg shadow-purple-900/20">
                                Encontrar Atletas Agora
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myTeam.map(item => {
                                const atleta = item.atleta || {};
                                return (
                                    <div key={item.id} className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group">
                                        <div className={`h-1.5 w-full ${item.status === 'ativo' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <div className="p-4 flex items-center gap-4">
                                            <AvatarLevel foto={atleta.foto_url} level={atleta.level} size="medium" />
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-lg">{atleta.apelido || atleta.nome}</h4>
                                                <p className="text-xs text-purple-400 font-bold uppercase">{atleta.categoria}</p>

                                                <div className="mt-2 flex items-center gap-2 text-xs font-bold bg-black/30 w-fit px-2 py-1 rounded">
                                                    {item.status === 'ativo' && <><CheckCircle size={12} className="text-green-500" /> <span>ATIVO</span></>}
                                                    {item.status === 'pendente' && <><Clock size={12} className="text-yellow-500" /> <span>AGUARDANDO</span></>}
                                                    {item.status === 'recusado' && <><XCircle size={12} className="text-red-500" /> <span>RECUSADO</span></>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* AÇÕES */}
                                        <div className="px-4 pb-4 flex justify-end">
                                            <button onClick={() => handleRemove(item.id)} className="text-xs text-red-500 hover:text-red-400 hover:underline">
                                                Remover / Cancelar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
