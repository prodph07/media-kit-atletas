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

        <div className="bg-[#FFFFFF] dark:bg-[#161616] industrial-border p-5 rounded-sm">
            <style jsx>{`
                .industrial-border { border: 1px solid; border-color: #333333; }
                .bg-action-green { background-color: #00E676; }
                .text-action-green { color: #00E676; }
                .bg-input-dark { background-color: #202020; }
            `}</style>
            <div className="flex flex-col xl:flex-row items-center gap-6">
                <div className="flex flex-1 items-center gap-6 w-full">
                    <div className="h-12 w-12 rounded-full bg-green-900/20 flex items-center justify-center border border-green-500/30 shrink-0">
                        <Users className="text-[#00E676]" size={24} />
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-display font-bold uppercase text-lg text-gray-900 dark:text-white">Indique e Ganhe</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Convide lutadores e ganhe 1 mês PRO.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row w-full xl:w-auto items-center gap-6 justify-between xl:justify-end border-t xl:border-t-0 border-gray-200 dark:border-gray-800 pt-4 xl:pt-0">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center xl:items-end">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contas Criadas</span>
                            <span className="font-display font-bold text-2xl text-gray-900 dark:text-white">{loading ? '-' : stats.total}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="flex flex-col items-center xl:items-end">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contas Premium</span>
                            <span className="font-display font-bold text-2xl text-[#FFD700]">{loading ? '-' : stats.premium}</span>
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-gray-700 rounded-sm p-1">
                        <input
                            className="bg-transparent border-none text-gray-600 dark:text-gray-300 font-mono text-sm px-3 focus:ring-0 w-full md:w-48 text-center md:text-left"
                            readOnly
                            value={referralLink}
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase transition-colors flex items-center gap-1 ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}