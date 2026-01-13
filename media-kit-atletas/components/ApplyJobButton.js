'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function ApplyJobButton({ jobId, jobTitle }) {
    const [status, setStatus] = useState('idle'); // idle, checking, applying, success, error, already_applied
    const [message, setMessage] = useState('');

    const handleApply = async () => {
        setStatus('checking');
        setMessage('');

        // 1. Check Auth
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setStatus('error');
            setMessage('Você precisa estar logado para aplicar.');
            return;
        }

        // 2. Check if user is an Athlete
        const { data: atleta, error: atletaError } = await supabase
            .from('atletas')
            .select('id, tipo_conta')
            .eq('user_id', user.id)
            .single();

        if (atletaError || !atleta) {
            setStatus('error');
            setMessage('Perfil de atleta não encontrado.');
            return;
        }

        if (atleta.tipo_conta === 'empresa') {
            setStatus('error');
            setMessage('Empresas não podem se candidatar a vagas.');
            return;
        }

        // 3. Check if already applied
        const { data: existingApp } = await supabase
            .from('candidaturas')
            .select('id')
            .eq('oportunidade_id', jobId)
            .eq('atleta_id', atleta.id)
            .maybeSingle();

        if (existingApp) {
            setStatus('already_applied');
            setMessage('Você já se candidatou para esta vaga.');
            return;
        }

        // 4. Apply
        if (!confirm(`Confirmar candidatura para "${jobTitle}"?`)) {
            setStatus('idle');
            return;
        }

        setStatus('applying');

        const { error: applyError } = await supabase
            .from('candidaturas')
            .insert({
                oportunidade_id: jobId,
                atleta_id: atleta.id,
                status: 'pendente'
            });

        if (applyError) {
            console.error(applyError);
            setStatus('error');
            setMessage('Erro ao aplicar. Tente novamente.');
        } else {
            setStatus('success');
            setMessage('Candidatura enviada com sucesso!');
        }
    };

    if (status === 'success') {
        return (
            <button disabled className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-bold uppercase text-sm flex items-center justify-center gap-2 cursor-default">
                <CheckCircle size={18} /> Candidatura Enviada
            </button>
        );
    }

    if (status === 'already_applied') {
        return (
            <button disabled className="w-full md:w-auto bg-slate-700 text-slate-400 px-6 py-3 rounded-lg font-bold uppercase text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <CheckCircle size={18} /> Já Candidatado
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center md:items-start gap-2">
            <button
                onClick={handleApply}
                disabled={status === 'checking' || status === 'applying'}
                className="w-full md:w-auto bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-bold uppercase text-sm transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
                {(status === 'checking' || status === 'applying') ? (
                    <> <Loader2 size={16} className="animate-spin" /> Processando... </>
                ) : (
                    <> Aplicar Agora <ArrowRight size={16} /> </>
                )}
            </button>
            {message && status === 'error' && (
                <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                    <XCircle size={12} /> {message}
                </span>
            )}
        </div>
    );
}
