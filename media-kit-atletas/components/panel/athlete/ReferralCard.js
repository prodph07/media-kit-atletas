'use client';

import React, { useEffect, useState } from 'react';
import { Users, Crown, Copy, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ReferralCard({ perfil }) {
    const [stats, setStats] = useState({ total: 0, premium: 0 });
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const referralLink = typeof window !== 'undefined' 
        ? `${window.location.origin}/cadastro?ref=${perfil.slug || perfil.id}` // Usei ID como fallback se não tiver slug
        : '';

    useEffect(() => {
        async function loadReferralStats() {
            if (!perfil.id) return;

            // 1. Conta total de indicados
            const { count: totalCount } = await supabase
                .from('atletas')
                .select('*', { count: 'exact', head: true })
                .eq('invited_by', perfil.id);

            // 2. Conta indicados que são Premium (CORREÇÃO AQUI: 'plano' em vez de 'plan_tier')
            const { count: premiumCount } = await supabase
                .from('atletas')
                .select('*', { count: 'exact', head: true })
                .eq('invited_by', perfil.id)
                .eq('plano', 'premium'); // <--- AQUI ESTAVA O ERRO

            setStats({ total: totalCount || 0, premium: premiumCount || 0 });
            setLoading(false);
        }

        loadReferralStats();
    }, [perfil.id]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden shadow-lg">
            {/* Background Decorativo */}
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                <Users size={150} />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Users className="text-blue-500" size={20}/> Programa de Indicação
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Convide amigos. Acompanhe quem entrou para o time através de você.
                </p>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                        <span className="text-slate-400 text-[10px] md:text-xs uppercase font-bold">Cadastros</span>
                        <div className="text-2xl md:text-3xl font-black text-white mt-1">
                            {loading ? '-' : stats.total}
                        </div>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                        <span className="text-slate-400 text-[10px] md:text-xs uppercase font-bold flex items-center gap-1">
                            Viraram Premium <Crown size={12} className="text-yellow-500"/>
                        </span>
                        <div className="text-2xl md:text-3xl font-black text-yellow-500 mt-1">
                            {loading ? '-' : stats.premium}
                        </div>
                    </div>
                </div>

                {/* Link de Cópia */}
                <div className="flex gap-2">
                    <div className="bg-slate-950 text-slate-400 px-4 py-3 rounded-lg text-xs font-mono truncate flex-1 border border-slate-800 flex items-center">
                        {referralLink}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {copied ? <Check size={18}/> : <Copy size={18}/>}
                        <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}