'use client';
import { Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CopyButton() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if(typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg transform hover:scale-105 ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
        >
            {copied ? <Check size={18}/> : <Copy size={18}/>}
            {copied ? 'Link Copiado!' : 'Copiar Link do Duelo'}
        </button>
    );
}