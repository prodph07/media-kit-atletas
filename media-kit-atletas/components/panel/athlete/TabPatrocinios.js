import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AvatarLevel } from '../../AvatarLevel'; // Adjust path if needed

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TabPatrocinios({ perfil }) {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSponsors();
    }, [perfil.id]);

    const fetchSponsors = async () => {
        if (!perfil.id) return;
        setLoading(true);
        // Buscamos parcerias onde somos o atleta
        const { data, error } = await supabase
            .from('parcerias')
            .select(`
                id, status, created_at,
                empresa:empresa_id ( id, nome, apelido, foto_url, slug, tipo_conta )
            `)
            .eq('atleta_id', perfil.id)
            .neq('status', 'recusado'); // Podemos mostrar recusados se quisermos, mas geralmente polui

        if (!error && data) {
            setSponsors(data);
        }
        setLoading(false);
    };

    const handleLeave = async (parceriaId, empresaName) => {
        if (!confirm(`Tem certeza que deseja encerrar a parceria com ${empresaName || 'esta empresa'}?`)) return;

        const { error } = await supabase.from('parcerias').delete().eq('id', parceriaId);

        if (error) {
            alert("Erro ao sair: " + error.message);
        } else {
            alert("Parceria encerrada.");
            fetchSponsors();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                        <Shield className="text-[#FFA500]" /> Meus Patrocinadores
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Empresas e marcas que apoiam sua carreira.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Carregando patrocínios...</div>
            ) : sponsors.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    <Shield size={64} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-slate-500 font-bold text-xl">Nenhum patrocínio ativo</h3>
                    <p className="text-slate-600 mb-6">Mantenha seu perfil atualizado para atrair marcas no Scout.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsors.map(item => {
                        const empresa = item.empresa || {};
                        return (
                            <div key={item.id} className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group hover:border-[#FFA500]/50 transition-all">
                                <div className={`h-1.5 w-full ${item.status === 'ativo' ? 'bg-[#FFA500]' : 'bg-yellow-500'}`}></div>
                                <div className="p-4 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-black border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                        {empresa.foto_url ? (
                                            <img src={empresa.foto_url} alt={empresa.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-xl">{(empresa.nome || 'E').charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-lg truncate">{empresa.apelido || empresa.nome}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {item.status === 'ativo' && (
                                                <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <CheckCircle size={10} /> ATIVO
                                                </span>
                                            )}
                                            {item.status === 'pendente' && (
                                                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Clock size={10} /> PENDENTE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 pb-4 flex justify-between items-center border-t border-slate-800 pt-3 mt-1">
                                    {empresa.slug && (
                                        <a href={`/${empresa.slug}`} target="_blank" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                            <ExternalLink size={12} /> Ver Perfil
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleLeave(item.id, empresa.apelido || empresa.nome)}
                                        className="text-xs text-red-500 hover:text-red-400 font-bold hover:underline"
                                    >
                                        ENCERRAR
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
