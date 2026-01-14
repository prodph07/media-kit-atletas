'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, Swords, Medal, Trophy, Gem, Crown,
  ClipboardList, Calendar, CalendarRange, Zap, Sparkles, CheckCircle,
  Search, Check, BadgeCheck, Dumbbell, Shirt, HeartPulse, Activity, MousePointer2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">

      {/* GLOBAL STYLES FOR MARQUEE & UTILS */}
      <style jsx global>{`
        .glass-card {
            background-color: rgba(17, 17, 17, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid #222222;
        }
        .text-primary { color: #dc2626; }
        .bg-primary { background-color: #dc2626; }
        .border-primary { border-color: #dc2626; }
        .red-glow { box-shadow: 0 0 25px rgba(220, 38, 38, 0.4); }
        .btn-primary {
            background-color: #dc2626;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.25rem;
            font-weight: 700;
            transition: all 0.3s;
            box-shadow: 0 0 20px rgba(220,38,38,0.3);
        }
        .btn-primary:hover { filter: brightness(1.1); }
        
        .btn-ghost {
            border: 1px solid #222222;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.25rem;
            font-weight: 700;
            transition: all 0.3s;
        }
        .btn-ghost:hover { background-color: rgba(255,255,255,0.05); }

        @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
      `}</style>

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-10">
          {/* Background Effects */}
          <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600/20 rounded-full blur-[100px] md:blur-[140px] pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none"></div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              Transforme Suor <br /> em <span className="text-primary">Legado</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
              O ecossistema profissional definitivo para atletas de elite e organizadores. Gamificação, Media Kits dinâmicos e conexão global.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro" className="btn-primary flex items-center justify-center">Começar Jornada</Link>
              <Link href="/ranking" className="btn-ghost flex items-center justify-center">Ver Rankings</Link>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="w-full max-w-5xl mt-16 md:mt-24 border-y border-[#222222] bg-[#020617]/50 backdrop-blur-sm">
            <div className="grid grid-cols-3 divide-x divide-[#222222] py-8">
              <div className="text-center group cursor-default">
                <div className="text-2xl md:text-3xl font-black group-hover:text-red-500 transition-colors">+15k Atletas</div>
                <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Registrados</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl md:text-3xl font-black group-hover:text-red-500 transition-colors">+50k Duelos</div>
                <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Finalizados</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl md:text-3xl font-black group-hover:text-red-500 transition-colors">R$ 2M</div>
                <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Em Patrocínios</div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="py-12 border-b border-[#222222] overflow-hidden bg-[#020617]">
          <div className="flex w-full overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap">
              <div className="flex gap-16 items-center shrink-0 pr-16">
                <div className="flex items-center gap-2"><Dumbbell className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Elite Combat</span></div>
                <div className="flex items-center gap-2"><Shirt className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Nexus Gear</span></div>
                <div className="flex items-center gap-2"><HeartPulse className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Apex Nutrition</span></div>
                <div className="flex items-center gap-2"><Trophy className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Vanguard</span></div>
                <div className="flex items-center gap-2"><Zap className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Stryker Systems</span></div>
                <div className="flex items-center gap-2"><Activity className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Global Rings</span></div>
              </div>
              {/* Duplicated for smooth loop */}
              <div className="flex gap-16 items-center shrink-0 pr-16">
                <div className="flex items-center gap-2"><Dumbbell className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Elite Combat</span></div>
                <div className="flex items-center gap-2"><Shirt className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Nexus Gear</span></div>
                <div className="flex items-center gap-2"><HeartPulse className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Apex Nutrition</span></div>
                <div className="flex items-center gap-2"><Trophy className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Vanguard</span></div>
                <div className="flex items-center gap-2"><Zap className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Stryker Systems</span></div>
                <div className="flex items-center gap-2"><Activity className="text-slate-700 w-8 h-8" /> <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Global Rings</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* RANK EVOLUTION */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-primary font-bold tracking-[0.3em] text-xs mb-4 uppercase">Caminho do Guerreiro</h3>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Evolução de Rank</h2>
          </div>

          {/* XP Bar Mockup */}
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="flex justify-between text-xs font-black uppercase mb-2 tracking-widest">
              <span>Nível 42</span>
              <span className="text-primary">80% PARA O PRÓXIMO RANK</span>
            </div>
            <div className="h-3 w-full bg-[#111111] rounded-full border border-[#222222] overflow-hidden p-[2px]">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Ranks Grid */}
          <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-center">
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="text-slate-500 font-black mb-2 text-xs">FERRO</div>
              <div className="size-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="text-orange-900 font-black mb-2 text-xs">BRONZE</div>
              <div className="size-16 mx-auto bg-orange-950 rounded-full flex items-center justify-center mb-4 text-orange-700">
                <Swords className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5 opacity-70 grayscale hover:grayscale-0 transition-all">
              <div className="text-slate-300 font-black mb-2 text-xs">PRATA</div>
              <div className="size-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-100">
                <Medal className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5 opacity-80 grayscale hover:grayscale-0 transition-all">
              <div className="text-yellow-500 font-black mb-2 text-xs">OURO</div>
              <div className="size-16 mx-auto bg-yellow-900/40 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5 opacity-90 grayscale hover:grayscale-0 transition-all">
              <div className="text-emerald-400 font-black mb-2 text-xs">PLATINA</div>
              <div className="size-16 mx-auto bg-emerald-900/40 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                <Gem className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-white/5">
              <div className="text-blue-400 font-black mb-2 text-xs">DIAMANTE</div>
              <div className="size-16 mx-auto bg-blue-900/40 rounded-full flex items-center justify-center mb-4 text-blue-400">
                <Gem className="w-8 h-8" />
              </div>
            </div>
            <div className="glass-card flex-1 min-w-[140px] p-6 text-center rounded-xl border-primary/50 red-glow bg-gradient-to-b from-red-600/10 to-transparent">
              <div className="text-primary font-black mb-2 text-xs tracking-widest">G.O.A.T.</div>
              <div className="size-16 mx-auto bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* MISSIONS */}
        <section className="py-24 bg-[#080808]/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black uppercase mb-12 flex items-center gap-4">
              <ClipboardList className="text-primary w-8 h-8" />
              Missões Ativas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Diária */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calendar className="w-24 h-24 text-blue-400" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded bg-blue-500/20 text-blue-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xl uppercase">Diária</h4>
                </div>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-blue-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Login Diário (Streak)</span>
                    </div>
                    <span className="text-xs font-bold text-blue-400">+100 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-blue-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Postar Story (I.A.)</span>
                    </div>
                    <span className="text-xs font-bold text-blue-400">+100 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-blue-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Validar Equipamento</span>
                    </div>
                    <span className="text-xs font-bold text-blue-400">+30 XP</span>
                  </li>
                </ul>
              </div>

              {/* Semanal */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group border-purple-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CalendarRange className="w-24 h-24 text-purple-400" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xl uppercase">Semanal</h4>
                </div>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-purple-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Atualizar Peso</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">+50 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-purple-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Compartilhar Perfil</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">+30 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-purple-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Votar em Duelo</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">+15 XP</span>
                  </li>
                </ul>
              </div>

              {/* Épica/Única */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Medal className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded bg-yellow-500/20 text-yellow-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xl uppercase">Carreira</h4>
                </div>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-yellow-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Link Oficial na Bio</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">+200 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-[#222222] rounded flex items-center justify-center group-hover/item:border-yellow-400 transition-colors"></div>
                      <span className="text-slate-400 text-sm">Entrar para Equipe</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">+200 XP</span>
                  </li>
                  <li className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className="size-5 border-2 border-yellow-400 rounded flex items-center justify-center bg-yellow-400">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                      <span className="text-slate-300 text-sm line-through">Cadastrar Cartel</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">CONCLUÍDO</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DUELOS & MEDIA KIT */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* ARENA */}
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase">Arena de Duelos</h2>
              <div className="glass-card rounded-2xl overflow-hidden p-6 border-white/5 bg-gradient-to-r from-red-950/20 to-slate-900/20">
                <div className="flex justify-between items-center mb-8 px-4">
                  <div className="text-center">
                    <div className="size-24 rounded-full border-4 border-red-600 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMFdS0YmwsOgI8kc9EzIZhEKHfhMCT2gP4FQB_1Zq5S9911rnPY9f0sXDLx3BH_JvAZ7Cvp2NqSpaFwt_EbddcBmWqgXueOdvqaPlyCVNLCVMZaxJ56rPbH1YgyAmZlMHXvNDLC1IZ80ZHlGgccoM-PEudC-jrzjIlrMstGvDiufBwwFpvjNeqCg7njSAdlPLsu2dCKdSyi7iLbweyfcGVpWPa4M5vNpB7gmvWkSwxTazAHH84QA2ZH8rcqTgpYDDHxiZRnE6ueySl" alt="Fighter 1" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="font-bold text-sm uppercase">Thiago "The Axe"</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">12-2-0</div>
                  </div>
                  <div className="text-6xl font-black italic text-slate-800 opacity-50">VS</div>
                  <div className="text-center">
                    <div className="size-24 rounded-full border-4 border-slate-700 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr8Fa1mEwC6jShRWQr-2SVvlraHrW823-jfE_Q2L03Lxe7IfrpwB9yumUH7CR9qi_gm2lLZzyBwn7_djePzS5mtqWZ7wjvMwL8RC9CywJYmDJa_ajkuSr39TP8dz1oUYpA-oJ6IvcCAa9LDDYeJvTJBNTSkW8X9jKH0t4w9Azs2BjOjr9aghb5M12H1UOdnqJ9byo_Tww9qKSndKCadSbPfwZFUiq6E0F5PfEMx_6TE2u2OoV_Lqq7t-oXJsyw8EDxX0-num5iRT3c" alt="Fighter 2" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="font-bold text-sm uppercase">Marcus "Iron"</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">10-4-0</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase mb-1">
                    <span>65% VOTES</span>
                    <span>35% VOTES</span>
                  </div>
                  <div className="h-4 w-full bg-[#111111] rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                    <div className="h-full bg-slate-700" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-[#222222] hover:bg-primary transition-colors text-xs font-black uppercase tracking-widest rounded">Votar Thiago</button>
              </div>
            </div>

            {/* MEDIA KIT MOCKUP */}
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase">Media Kit Digital</h2>
              <div className="bg-[#111111] rounded-t-xl border border-[#222222] shadow-2xl overflow-hidden">
                {/* Fake Browser Header */}
                <div className="bg-[#1a1a1a] p-3 flex items-center gap-2 border-b border-[#222222]">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-500/50"></div>
                    <div className="size-3 rounded-full bg-yellow-500/50"></div>
                    <div className="size-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="bg-[#020617] text-[10px] px-3 py-1 rounded text-slate-500 flex-1 mx-4 border border-[#222222] font-mono truncate">
                    fightnexus.com/profile/carlos-the-beast
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="size-20 rounded-full border-4 border-yellow-500/50 p-1">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEbuiDnDhfw737Yz3WD4scYy9t9-Aie4tbS89MkdL7mjCkw2jrz-sgAGEPjvcmmhfz23L5-VD4Cdq5sUyTA6HxX5ZctNP5S1ZB45aOadnlFtBb71HRZ5JgRZeGqDORH_WfbFfzUXS7INvz-YTGX2QbEuBHFHtqxov6AlxYA30KWFJWdLdmK-EzWrHME5-wKXyFjC40WjE5lxNGpj8zsj8V8EyIMzZinwAzeiS0orpMGZGDPuKj5_hbPQlHarc629XUx-2MlcgILkdQ" alt="Carlos" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black p-1 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase">Carlos "The Beast"</h4>
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <div className="text-sm font-bold">14.2k</div>
                          <div className="text-[9px] text-slate-500 uppercase font-black">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-primary">8.5%</div>
                          <div className="text-[9px] text-slate-500 uppercase font-black">Engagement</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden border border-[#222222] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1a1a1a] text-slate-500 font-bold">
                        <tr>
                          <th className="p-3">EVENTO</th>
                          <th className="p-3">OPONENTE</th>
                          <th className="p-3">MÉTODO</th>
                          <th className="p-3">RESULTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        <tr>
                          <td className="p-3 font-bold">NX-24</td>
                          <td className="p-3">John Doe</td>
                          <td className="p-3 text-slate-500">KO - R2</td>
                          <td className="p-3"><span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-black text-[9px] uppercase">Vitória</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold">Apex 12</td>
                          <td className="p-3">Marcus Silva</td>
                          <td className="p-3 text-slate-500">DEC (UN)</td>
                          <td className="p-3"><span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-black text-[9px] uppercase">Derrota</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH SECTION */}
        <section className="py-24 bg-[#080808]/80 border-y border-[#222222]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black uppercase mb-8">Encontre o Próximo <span className="text-primary">Campeão</span></h2>
            <div className="glass-card p-2 rounded-2xl flex flex-col md:flex-row gap-2">
              <input className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 font-medium text-lg outline-none text-white placeholder-slate-500" placeholder="Nome do atleta, academia ou especialidade..." type="text" />
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                <select className="bg-[#1a1a1a] border-none text-sm font-bold rounded-xl px-4 py-4 min-w-[120px] focus:ring-primary outline-none">
                  <option>Região</option>
                  <option>Brasil</option>
                  <option>EUA</option>
                </select>
                <select className="bg-[#1a1a1a] border-none text-sm font-bold rounded-xl px-4 py-4 min-w-[120px] focus:ring-primary outline-none">
                  <option>Peso</option>
                  <option>Pena</option>
                  <option>Leve</option>
                  <option>Meio-médio</option>
                </select>
                <select className="bg-[#1a1a1a] border-none text-sm font-bold rounded-xl px-4 py-4 min-w-[120px] focus:ring-primary outline-none">
                  <option>Rank</option>
                  <option>Pro</option>
                  <option>Amador</option>
                </select>
                <Link href="/busca" className="bg-primary text-white p-4 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors">
                  <Search className="w-6 h-6" />
                </Link>
              </div>
            </div>
            <p className="mt-6 text-slate-500 text-sm font-medium">Filtre por cartel, engajamento social e disponibilidade para eventos.</p>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase">Escolha seu Nível</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="glass-card p-10 rounded-2xl border-white/5 flex flex-col">
              <h3 className="text-2xl font-black uppercase mb-2">Grátis</h3>
              <div className="text-4xl font-black mb-8">R$ 0<span className="text-lg text-slate-500 font-medium">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle className="text-green-500 w-5 h-5" /> Perfil Básico
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle className="text-green-500 w-5 h-5" /> Ranking Nacional
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle className="text-green-500 w-5 h-5" /> Participação em Arenas
                </li>
              </ul>
              <Link href="/cadastro" className="w-full py-4 border border-[#222222] rounded-xl font-bold hover:bg-white/5 transition-all text-center">Começar Agora</Link>
            </div>

            {/* Premium */}
            <div className="glass-card p-10 rounded-2xl border-primary red-glow relative bg-gradient-to-b from-red-600/5 to-transparent flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Recomendado</div>
              <h3 className="text-2xl font-black uppercase mb-2 text-primary">Premium</h3>
              <div className="text-4xl font-black mb-8">R$ 49<span className="text-lg text-slate-500 font-medium">,90/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-white">
                  <BadgeCheck className="text-primary w-5 h-5" /> Media Kit Dinâmico Profissional
                </li>
                <li className="flex items-center gap-3 text-white">
                  <BadgeCheck className="text-primary w-5 h-5" /> Insights de Engajamento Social
                </li>
                <li className="flex items-center gap-3 text-white">
                  <BadgeCheck className="text-primary w-5 h-5" /> Prioridade em Matchmaking
                </li>
                <li className="flex items-center gap-3 text-white">
                  <BadgeCheck className="text-primary w-5 h-5" /> Suporte Jurídico & Consultoria
                </li>
                <li className="flex items-center gap-3 text-white">
                  <BadgeCheck className="text-primary w-5 h-5" /> Selo de Atleta Verificado
                </li>
              </ul>
              <button className="w-full py-4 bg-primary rounded-xl font-bold hover:brightness-110 transition-all text-white">Assinar Premium</button>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 px-6 mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[2rem] p-12 md:p-24 text-center relative overflow-hidden group shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight">Chegou a sua vez de <br />dominar o ringue.</h2>
                <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 font-medium">Junte-se a milhares de atletas que já estão profissionalizando suas carreiras.</p>
                <Link href="/cadastro" className="bg-white text-primary px-12 py-5 rounded-full font-black text-2xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-2xl inline-block">
                  Cadastre-se Grátis
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-20 border-t border-[#222222] bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Shield className="w-8 h-8" />
                <h2 className="text-xl font-black uppercase text-white">FightNexus</h2>
              </div>
              <p className="text-slate-500 max-w-sm">Elevando o patamar do esporte de combate através de tecnologia, transparência e conexão profissional.</p>
            </div>
            <div>
              <h5 className="font-black uppercase text-sm mb-6 text-white">Plataforma</h5>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><Link className="hover:text-primary transition-colors" href="/ranking">Rankings</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/busca">Atletas</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/eventos">Eventos</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase text-sm mb-6 text-white">Social</h5>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a className="hover:text-primary transition-colors" href="#">Instagram</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Twitter / X</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-[#222222] flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-600 tracking-widest uppercase">
            <p>© 2024 FightNexus. Built for warriors.</p>
            <div className="flex gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span className="text-primary">System Status: Optimal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}