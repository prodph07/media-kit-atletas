import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function CyberContact({ athleteData }) {
    return (
        <section id="contact" className="relative mt-32 rounded-3xl overflow-hidden border border-zinc-800"> 
            <div className="absolute inset-0 bg-lime-400/5 z-0"></div> 
            <div className="relative z-10 p-12 md:p-24 text-center"> 
                <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-6 uppercase">Pronto para <br/><span className="text-lime-400">fazer história?</span></h2> 
                <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg"> Disponível para patrocínios globais, aparições e parcerias de mídia. </p> 
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-10 text-left"> 
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"> 
                        <div className="p-2 bg-lime-400/10 rounded-lg text-lime-400"><Mail className="w-5 h-5"/></div> 
                        <div> 
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Email</p> 
                            <p className="text-white font-bold text-sm">{athleteData.contact?.email}</p> 
                            <p className="text-zinc-400 text-xs">{athleteData.contact?.managerEmail}</p> 
                        </div> 
                    </div> 
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"> 
                        <div className="p-2 bg-lime-400/10 rounded-lg text-lime-400"><Phone className="w-5 h-5"/></div> 
                        <div> 
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">WhatsApp</p> 
                            <p className="text-white font-bold text-sm">{athleteData.contact?.phoneDisplay}</p> 
                        </div> 
                    </div> 
                </div> 
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center"> 
                    <a href={`https://wa.me/${athleteData.contact?.phone?.replace(/\D/g, '')}`} target="_blank" className="bg-[#25D366] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors flex items-center gap-2"> 
                        <Phone className="w-6 h-6"/> Chamar no WhatsApp 
                    </a> 
                </div> 
            </div> 
        </section>
    );
}