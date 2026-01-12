import React from 'react';

export default function TabContato({ perfil, handleContactChange }) {
    return (
        <div className="bg-[#161616] p-6 lg:p-8 border border-[#333] animate-fadeIn">
            <style jsx global>{`
                .industrial-border {
                    border: 1px solid #333;
                }
                .font-display {
                    font-family: 'Oswald', sans-serif;
                }
                .focus-ring-primary:focus {
                    --tw-ring-color: #FF4500;
                }
            `}</style>

            <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
                <h3 className="font-display font-bold uppercase text-3xl text-white">Contact Info</h3>
            </div>

            <div className="space-y-6">
                {/* EMAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">Email Comercial</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] placeholder-gray-600 transition-all"
                            placeholder="CONTACT@FIGHTER.COM"
                            type="email"
                            name="email"
                            value={perfil.contact.email || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">Email Empresário</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] placeholder-gray-600 transition-all"
                            placeholder="MANAGER@AGENCY.COM"
                            type="email"
                            name="managerEmail"
                            value={perfil.contact.managerEmail || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                </div>

                {/* PHONES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">Telefone / Whatsapp</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] transition-all"
                            type="tel"
                            name="phone"
                            value={perfil.contact.phone || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">Celular Visível (Formatado)</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] transition-all"
                            type="text"
                            name="phoneDisplay"
                            placeholder="+55 11 99999-9999"
                            value={perfil.contact.phoneDisplay || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                </div>

                {/* LOCATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">Cidade/Estado</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] transition-all"
                            type="text"
                            name="city"
                            value={perfil.contact.city || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#FFD700] uppercase mb-2">CT (Centro de Treinamento)</label>
                        <input
                            className="w-full bg-[#202020] border border-[#333] text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] transition-all"
                            type="text"
                            name="trainingCenter"
                            value={perfil.contact.trainingCenter || ''}
                            onChange={handleContactChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}