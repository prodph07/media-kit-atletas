import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Download } from 'lucide-react';

export default function ContactSection({ athleteData }) {
    
    // Lógica movida para cá para limpar o pai
    const getWhatsAppLink = () => { 
        const phoneOnlyNumbers = (athleteData.contact?.phone || '').replace(/\D/g, ''); 
        return `https://wa.me/${phoneOnlyNumbers}?text=Olá,%20vi%20seu%20Media%20Kit%20e%20gostaria%20de%20falar%20sobre%20patrocínio.`; 
    };

    return (
        <section id="contact-section" className="animate-fadeIn scroll-mt-24"> 
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
                    Contato e <span className="text-cyan-400">Patrocínio</span>
                </h2>
                <div className="h-px bg-slate-800 flex-grow"></div>
            </div> 
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"> 
                {/* INFO ESQUERDA */}
                <div> 
                    <p className="text-slate-400 mb-8">Disponível para lutas, seminários, patrocínios e parcerias de marca. Entre em contato com minha equipe de gestão ou diretamente pelo WhatsApp.</p> 
                    <div className="space-y-6"> 
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-cyan-400"><Mail size={24} /></div>
                            <div><h4 className="text-white font-bold">Email Comercial</h4><p className="text-slate-400 text-sm break-all">{athleteData.contact?.email}</p><p className="text-slate-400 text-sm break-all">{athleteData.contact?.managerEmail}</p></div>
                        </div> 
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-cyan-400"><Phone size={24} /></div>
                            <div><h4 className="text-white font-bold">Telefone / WhatsApp</h4><p className="text-slate-400 text-sm">{athleteData.contact?.phoneDisplay || athleteData.contact?.phone}</p></div>
                        </div> 
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-cyan-400"><MapPin size={24} /></div>
                            <div><h4 className="text-white font-bold">Base de Treinamento</h4><p className="text-slate-400 text-sm">{athleteData.contact?.city}, Brasil</p><p className="text-slate-400 text-sm">{athleteData.contact?.trainingCenter}</p></div>
                        </div> 
                    </div> 
                </div> 
                
                {/* CARD WHATSAPP DIREITA */}
                <div className="flex flex-col gap-4 justify-center"> 
                    <div className="bg-gradient-to-br from-[#1a1a1e] to-[#0f0f11] p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center"> 
                        <h3 className="text-xl font-bold text-white mb-2">Parcerias Rápidas</h3> 
                        <p className="text-slate-400 text-sm mb-6">Tem uma proposta? Fale diretamente com nossa equipe agora.</p> 
                        <a href={getWhatsAppLink()} target="_blank" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-black py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4 transform hover:scale-105">
                            <MessageCircle size={24} /> Chamar no WhatsApp
                        </a> 
                        <div className="w-full h-px bg-slate-800 my-4"></div> 
                        <div className="flex items-center justify-between w-full">
                            <div className="text-left"><h4 className="text-white font-bold text-sm">Media Kit 2025</h4><p className="text-slate-500 text-xs">PDF, 4.2 MB</p></div>
                            <button className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-sm font-bold uppercase"><Download size={16} /> Baixar</button>
                        </div> 
                    </div> 
                </div> 
            </div> 
        </section>
    );
}