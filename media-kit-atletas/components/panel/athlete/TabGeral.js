import React, { useState } from 'react';
import { User, AlignLeft, Info, Lock, MessageSquareQuote, Shield } from 'lucide-react';
import SmartImageUpload from '@/components/SmartImageUpload';

export default function TabGeral({
    perfil,
    setPerfil,
    handleChange,
    handleSlugChange,
    handleDeleteProfilePic,
    isPremium,
    userId,
    onUpdateStatus
}) {
    // Estado local para o input de status
    const [statusTemp, setStatusTemp] = useState(perfil.status_message || "");

    const handleStatusSave = () => {
        if (onUpdateStatus) {
            onUpdateStatus(statusTemp);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c0c] font-sans text-gray-200 transition-colors duration-200 flex overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .font-display { font-family: 'Oswald', sans-serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
                
                .industrial-border {
                    border: 1px solid;
                    border-color: #333333;
                }
                
                /* Custom Scrollbar for this component */
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF4500; }

                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                }
            `}</style>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0c0c0c]">
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* LEFT COLUMN (4) */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* PROFILE IMAGE CARD */}
                                <div className="bg-[#161616] industrial-border p-6">
                                    <div className="flex flex-col gap-6 items-center sm:items-start">
                                        <div className="flex flex-row gap-6 w-full items-start">
                                            <div className="relative flex-shrink-0">
                                                <div className="h-24 w-24 bg-gray-800 border-2 border-gray-700 p-1 overflow-hidden">
                                                    {perfil.foto_url ? (
                                                        <img src={perfil.foto_url} alt="Fighter" className="h-full w-full object-cover grayscale contrast-125" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900">
                                                            <User size={40} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-black text-[10px] font-bold uppercase px-2 py-1 border border-black shadow-md">
                                                    Ready
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display font-bold uppercase text-xl text-white mb-1">Profile Image</h3>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Max 5MB (JPG/PNG)</p>
                                                <div className="w-full sm:w-auto">
                                                    <SmartImageUpload
                                                        userId={userId}
                                                        aspect={1}
                                                        buttonLabel="UPLOAD"
                                                        onUploadComplete={(newUrl) => {
                                                            setPerfil(prev => ({ ...prev, foto_url: newUrl }));
                                                        }}
                                                        className="bg-transparent border border-gray-600 hover:border-[#FF4500] text-white hover:text-[#FF4500] font-display font-bold uppercase px-4 py-2 text-xs tracking-wide transition-colors w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Custom URL</label>
                                            <div className="flex bg-[#202020] border border-gray-700 p-2 items-center">
                                                <span className="text-gray-500 font-mono text-xs px-2 whitespace-nowrap">MUAY/</span>
                                                <input
                                                    className="bg-transparent border-none text-white font-bold font-display uppercase tracking-wide focus:ring-0 p-0 w-full text-sm"
                                                    type="text"
                                                    value={perfil.slug || ''}
                                                    onChange={handleSlugChange}
                                                    disabled={!isPremium}
                                                    placeholder="THE-SILENCER"
                                                />
                                            </div>
                                            {!isPremium && <p className="text-[9px] text-[#FFD700] mt-1">* Requires Premium</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* DAILY STATUS */}
                                <div className="bg-[#161616] industrial-border p-6">
                                    <div className="flex items-center gap-2 text-[#FF4500] mb-4">
                                        <span className="material-symbols-outlined">edit_note</span>
                                        <h3 className="font-display font-bold uppercase text-xl text-white">Daily Status</h3>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <textarea
                                            className="w-full bg-[#202020] border border-gray-700 text-white px-4 py-3 text-sm focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] placeholder-gray-500 resize-none font-body"
                                            placeholder="How's training feeling?"
                                            rows="2"
                                            value={statusTemp}
                                            onChange={(e) => setStatusTemp(e.target.value)}
                                        ></textarea>
                                        <button
                                            onClick={handleStatusSave}
                                            className="bg-[#FF4500] hover:bg-orange-600 text-white font-display font-bold uppercase py-2 text-sm tracking-wide transition-colors w-full"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>

                                {/* SELECT ROLES */}
                                <div className="bg-[#161616] industrial-border p-6">
                                    <h3 className="font-display font-bold uppercase text-xl text-white mb-4">Select Role(s)</h3>
                                    <div className="space-y-3">
                                        <label className="checkbox-wrapper cursor-pointer group block relative">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={perfil.is_athlete || false}
                                                onChange={(e) => setPerfil({ ...perfil, is_athlete: e.target.checked })}
                                            />
                                            <div className="bg-[#202020] border border-gray-700 p-4 flex items-center gap-4 transition-all peer-checked:border-[#FF4500] peer-checked:bg-[#FF4500]/5">
                                                <div className="h-6 w-6 border-2 border-gray-600 flex items-center justify-center peer-checked:bg-[#FF4500] peer-checked:border-[#FF4500] transition-colors">
                                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                                </div>
                                                <div>
                                                    <span className="block font-display font-bold uppercase text-white text-lg">Nak Muay</span>
                                                    <span className="text-xs uppercase font-bold text-gray-400">Active Fighter</span>
                                                </div>
                                            </div>
                                        </label>
                                        <label className="checkbox-wrapper cursor-pointer group block relative">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={perfil.is_coach || false}
                                                onChange={(e) => setPerfil({ ...perfil, is_coach: e.target.checked })}
                                            />
                                            <div className="bg-[#202020] border border-gray-700 p-4 flex items-center gap-4 transition-all peer-checked:border-[#FF4500] peer-checked:bg-[#FF4500]/5">
                                                <div className="h-6 w-6 border-2 border-gray-600 flex items-center justify-center peer-checked:bg-[#FF4500] peer-checked:border-[#FF4500] transition-colors">
                                                    <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                                                </div>
                                                <div>
                                                    <span className="block font-display font-bold uppercase text-white text-lg">Kru / Coach</span>
                                                    <span className="text-xs uppercase font-bold text-gray-400">Trainer / Holder</span>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN (8) */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-[#161616] industrial-border p-6 lg:p-8 h-full">
                                    <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                                        <h3 className="font-display font-bold uppercase text-3xl text-white">Fighter Data</h3>
                                        <span className="text-[10px] font-bold text-[#FF4500] uppercase">* Required Fields</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                                <input
                                                    className="w-full bg-[#202020] border border-gray-700 text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
                                                    type="text"
                                                    name="nome"
                                                    value={perfil.nome || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fight Name</label>
                                                <input
                                                    className="w-full bg-[#202020] border border-[#FF4500] text-[#FF4500] px-4 py-3 font-display font-bold tracking-wide uppercase focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
                                                    type="text"
                                                    name="apelido"
                                                    value={perfil.apelido || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Weight Class</label>
                                                <div className="relative">
                                                    {/* 
                                                        Keeping input to match data structure if 'categoria' is free text in DB, 
                                                        but styled as user requested.
                                                    */}
                                                    <input
                                                        className="w-full bg-[#202020] border border-gray-700 text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
                                                        type="text"
                                                        name="categoria"
                                                        value={perfil.categoria || ''}
                                                        onChange={handleChange}
                                                        placeholder="WELTERWEIGHT"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Style</label>
                                                <input
                                                    className="w-full bg-[#202020] border border-gray-700 text-white px-4 py-3 font-display font-bold tracking-wide uppercase focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
                                                    type="text"
                                                    name="fightingStyle"
                                                    value={perfil.fightingStyle || ''}
                                                    onChange={handleChange}
                                                    placeholder="MUAY MAT"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Team / Gym</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Shield size={16} className="text-gray-500" />
                                                </div>
                                                <input
                                                    className="w-full bg-[#202020] border border-gray-700 text-white pl-10 pr-4 py-3 font-display font-bold tracking-wide uppercase focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
                                                    type="text"
                                                    name="team"
                                                    value={perfil.team || ''}
                                                    onChange={handleChange}
                                                    placeholder="TIGER MUAY THAI"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                                            <textarea
                                                className="w-full bg-[#202020] border border-gray-700 text-white px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500] resize-none h-40 font-body"
                                                rows="4"
                                                name="about"
                                                value={perfil.about || ''}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}