'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, Swords, Users, Search, TrendingUp, Shield, Target, 
  Instagram, Share2, Activity, Award, ChevronRight, Star, 
  Zap, Medal, Calendar, Crosshair, Flame, ChevronDown, LogIn, 
  CheckCircle, Check, Dumbbell, ShieldCheck, HeartPulse, Shirt, Sword
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const ranks = [
    { name: 'Ferro', color: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-900', shadow: 'shadow-gray-900/50' },
    { name: 'Bronze', color: 'text-orange-700', border: 'border-orange-700', bg: 'bg-orange-950', shadow: 'shadow-orange-900/50' },
    { name: 'Prata', color: 'text-slate-300', border: 'border-slate-400', bg: 'bg-slate-800', shadow: 'shadow-slate-700/50' },
    { name: 'Ouro', color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-950', shadow: 'shadow-yellow-900/50' },
    { name: 'Platina', color: 'text-cyan-300', border: 'border-cyan-400', bg: 'bg-cyan-950', shadow: 'shadow-cyan-900/50' },
    { name: 'Diamante', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-950', shadow: 'shadow-blue-900/50' },
    { name: 'GOAT', color: 'text-red-500', border: 'border-red-600', bg: 'bg-red-950', unique: true, shadow: 'shadow-red-600/50' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {/* ESTILOS GLOBAIS INLINE
          Garante que as animações e patterns funcionem sem config extra 
      */}
      <style jsx global>{`
        /* Pattern de fundo */
        .bg-grid-pattern {
            background-image: radial-gradient(#334155 1px, transparent 1px);
            background-size: 32px 32px;
        }
        
        /* Remove setas padrão do details */
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }

        /* ANIMAÇÃO DO CARROSSEL INFINITO */
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }
        .animate-scroll {
            animation: scroll 30s linear infinite;
        }
        /* Pausa a animação ao passar o mouse (opcional, para UX) */
        .group:hover .animate-scroll {
            animation-play-state: paused;
        }
      `}</style>

      {/* Hero Section */}
      <header className="relative py-20 lg:py-32 overflow-hidden border-b border-slate-900">
        
        {/* Botão de Login (Absoluto no Desktop / Ajustado no Mobile) */}
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-6">
            <Link href="/login" className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-colors bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 hover:border-red-500/50 backdrop-blur-sm text-sm md:text-base">
                <LogIn className="w-4 h-4" /> Entrar
            </Link>
        </div>

        {/* Efeitos de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] bg-red-600/10 rounded-full blur-[80px] md:blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] md:w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs md:text-sm mb-6 md:mb-8 animate-fade-in-up shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            A plataforma #1 para Carreira de Lutadores
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-6 md:mb-8 leading-[1.1] animate-fade-in-up">
            Transforme Suor em <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x">
              Patrocínio e Legado
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
            Conecte-se com marcas, suba de elo completando missões, vença duelos virtuais e gerencie sua carreira como um verdadeiro profissional. 
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
            <Link href="/cadastro" className="group relative px-8 py-4 bg-red-600 text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 shadow-xl shadow-red-900/30 ring-offset-2 ring-offset-slate-950 focus:ring-2 focus:ring-red-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="flex items-center gap-2">
                Começar Jornada <ChevronRight className="w-5 h-5" />
              </span>
            </Link>
            <Link href="/busca" className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all hover:border-slate-500 flex items-center justify-center gap-2 shadow-lg">
              <Search className="w-5 h-5 text-slate-400" />
              Buscar Atletas
            </Link>
          </div>
          
          <p className="mt-6 text-[10px] md:text-xs text-slate-500 uppercase tracking-widest animate-fade-in-up flex justify-center items-center gap-1" style={{ animationDelay: '0.6s' }}>
             <CheckCircle className="w-3 h-3 text-green-500" /> Sem cartão de crédito necessário
          </p>
        </div>
      </header>

      {/* Stats Strip - Grid Responsivo */}
      <div className="bg-slate-900 border-y border-slate-800 relative z-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { val: '+15k', label: 'Atletas' },
              { val: '+50k', label: 'Duelos' },
              { val: 'R$ 2M', label: 'Patrocínios' },
              { val: '+850', label: 'Academias' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">{stat.val}</div>
                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* CTA Disfarçado */}
          <div className="text-center mt-8">
                <Link href="/cadastro" className="text-xs text-slate-400 hover:text-white border-b border-dashed border-slate-600 hover:border-white transition-colors pb-0.5">
                    Quer fazer parte dessas estatísticas? Crie seu perfil.
                </Link>
            </div>
        </div>
      </div>

      {/* =======================================
          PARCEIROS CARROSSEL (RESPONSIVO + ANIMADO)
         ======================================= */}
      <section className="py-10 bg-slate-950 border-b border-slate-900 overflow-hidden group">
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Empresas e Marcas Parceiras</p>
        
        {/* Contêiner do Carrossel com Máscara de Gradiente para suavizar as bordas */}
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            
            {/* Lista 1 - Animada */}
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 md:[&_li]:mx-8 [&_img]:max-w-none animate-scroll">
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Dumbbell className="text-red-600 w-5 h-5 md:w-6 md:h-6" /> IRON GYM</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Zap className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" /> ENERGIZE</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><ShieldCheck className="text-blue-500 w-5 h-5 md:w-6 md:h-6" /> SAFEGUARD</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><HeartPulse className="text-green-500 w-5 h-5 md:w-6 md:h-6" /> VITALITY</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Shirt className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> FIGHTWEAR</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Sword className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> WARRIOR</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Trophy className="text-cyan-500 w-5 h-5 md:w-6 md:h-6" /> CHAMPION</li>
            </ul>
            
            {/* Lista 2 (Duplicada para o efeito infinito perfeito) */}
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 md:[&_li]:mx-8 [&_img]:max-w-none animate-scroll" aria-hidden="true">
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Dumbbell className="text-red-600 w-5 h-5 md:w-6 md:h-6" /> IRON GYM</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Zap className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" /> ENERGIZE</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><ShieldCheck className="text-blue-500 w-5 h-5 md:w-6 md:h-6" /> SAFEGUARD</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><HeartPulse className="text-green-500 w-5 h-5 md:w-6 md:h-6" /> VITALITY</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Shirt className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> FIGHTWEAR</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Sword className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> WARRIOR</li>
                <li className="flex items-center gap-2 text-slate-400 font-bold text-lg md:text-xl min-w-max"><Trophy className="text-cyan-500 w-5 h-5 md:w-6 md:h-6" /> CHAMPION</li>
            </ul>
        </div>
      </section>

      {/* Gamification Section */}
      <section id="elos" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-red-500 font-bold mb-4 uppercase tracking-wider text-xs md:text-sm">
                <Medal className="w-5 h-5" /> Sistema de Progressão
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Sua Jornada do Ferro ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">GOAT</span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Cada elo conquistado desbloqueia novas visibilidades, descontos exclusivos e atenção de grandes marcas. Você começa no Ferro, mas seu destino é o topo.
              </p>
            </div>
            
            {/* XP Box */}
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-xl w-full md:w-auto">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 flex-shrink-0">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-400 uppercase font-bold">Próximo Nível</div>
                <div className="font-bold text-white text-lg">2.450 / 3.000 XP</div>
                <div className="w-full md:w-48 h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 w-[80%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ELO CARDS GRID - Scroll Horizontal no Mobile */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-7 gap-4 pb-4 md:pb-0 snap-x">
            {ranks.map((rank, idx) => (
              <div key={idx} className="relative group min-w-[140px] md:min-w-0 snap-center">
                <div className={`
                  h-full p-4 rounded-2xl border ${rank.border} ${rank.bg} bg-opacity-10 
                  flex flex-col items-center justify-center gap-3 transition-all duration-500
                  hover:scale-105 hover:bg-opacity-30 cursor-pointer hover:shadow-2xl ${rank.shadow}
                `}>
                  {rank.unique && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest shadow-lg shadow-red-900/50 whitespace-nowrap">
                      Rank Único
                    </div>
                  )}
                  
                  <div className={`
                    p-3 rounded-full bg-slate-950 ${rank.border} border-2 
                    group-hover:scale-110 transition-transform duration-300 relative
                  `}>
                    <div className={`absolute inset-0 blur-md opacity-0 group-hover:opacity-50 transition-opacity ${rank.unique ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                    
                    {rank.unique ? 
                      <Trophy className={`w-6 h-6 ${rank.color} relative z-10`} /> : 
                      <Shield className={`w-6 h-6 ${rank.color} relative z-10`} />
                    }
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`font-black ${rank.color} text-lg tracking-tight`}>{rank.name}</h3>
                    {!rank.unique && <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">Div. I • II • III</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated Missions Section */}
      <section id="missoes" className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-500 font-bold mb-4 uppercase tracking-wider text-sm">
                <Target className="w-5 h-5" /> Missões & Recompensas
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Como subir de Elo?</h2>
            <p className="text-slate-400 text-base md:text-lg">
              A consistência é a chave. Nossa plataforma gera missões automáticas para manter você ativo, engajado e em constante evolução.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card Missão Diária */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-blue-500/30 transition-all hover:-translate-y-2 group flex flex-col">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Calendar className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Missões Diárias</h3>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed flex-1">
                Tarefas rápidas para criar hábito. Atualizar status, postar treino, interagir com a comunidade.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Postar foto do treino (+50 XP)
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Login diário (+10 XP)
                </li>
              </ul>
            </div>

            {/* Card Missão Semanal */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-purple-500/30 transition-all hover:-translate-y-2 group relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                 + XP Bônus
               </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Crosshair className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Metas Semanais</h3>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed flex-1">
                Objetivos de médio prazo. Vencer duelos, alcançar metas de seguidores ou engajamento.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Vencer 3 Duelos (+500 XP)
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Ganhar 50 seguidores (+300 XP)
                </li>
              </ul>
            </div>

            {/* Card Desafios Únicos */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-yellow-500/30 transition-all hover:-translate-y-2 group flex flex-col">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                <Flame className="w-7 h-7 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Desafios Épicos</h3>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed flex-1">
                Conquistas únicas que marcam sua carreira. Campeonatos, cinturões e graduações.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-yellow-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Vencer Campeonato Oficial (+2k XP)
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-yellow-500/50 cursor-pointer transition-colors">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Graduação de Faixa (+5k XP)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Duelos Section - Reordenado Texto primeiro, Card depois */}
      <section id="duelos" className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Conteúdo Texto */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-2 text-red-500 font-bold mb-4 uppercase tracking-wider text-sm">
                <Swords className="w-5 h-5" /> Arena Virtual
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white leading-tight">
                Vença Duelos e Ganhe <br/>Visibilidade Real
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed border-l-4 border-red-600 pl-6">
                Desafie outros atletas na plataforma. Uma página exclusiva de votação é criada para cada duelo. Compartilhe nas redes sociais, engaje sua torcida para votar e o vencedor ganha XP massivo.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       Cards Automáticos
                    </div>
                    <p className="text-sm text-slate-500 pl-4">Geramos a arte do confronto para você postar.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       Link Viral
                    </div>
                    <p className="text-sm text-slate-500 pl-4">Sua torcida vota sem precisar de cadastro.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       Rankings Semanais
                    </div>
                    <p className="text-sm text-slate-500 pl-4">Os mais votados aparecem na home.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       Premiações
                    </div>
                    <p className="text-sm text-slate-500 pl-4">Vencedores ganham destaque para marcas.</p>
                </div>
              </div>
            </div>

            {/* Mockup Visual */}
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-center group cursor-pointer w-1/3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800 rounded-full mb-3 overflow-hidden border-4 border-red-500 relative shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center mx-auto">
                        <span className="text-xs text-slate-500 font-bold">FOTO A</span>
                    </div>
                    <p className="font-bold text-lg text-white truncate">Anderson</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-yellow-500 font-bold">
                       <Star className="w-3 h-3 fill-current"/> Ouro III
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center z-10 w-1/3">
                    <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 italic drop-shadow-lg">VS</span>
                    <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full mt-2 border border-red-500/20 animate-pulse whitespace-nowrap">Ao Vivo</span>
                  </div>
                  
                  <div className="text-center group cursor-pointer w-1/3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800 rounded-full mb-3 overflow-hidden border-4 border-blue-500 relative shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center mx-auto">
                        <span className="text-xs text-slate-500 font-bold">FOTO B</span>
                    </div>
                    <p className="font-bold text-lg text-white truncate">José Aldo</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-cyan-400 font-bold">
                       <Star className="w-3 h-3 fill-current"/> Platina I
                    </div>
                  </div>
                </div>
                
                {/* Voting UI */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                        <span>650 Votos</span>
                        <span>350 Votos</span>
                    </div>
                    <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div className="w-[65%] bg-gradient-to-r from-red-700 to-red-500 flex items-center justify-start px-3 text-[10px] font-bold text-white shadow-[2px_0_5px_rgba(0,0,0,0.3)] z-10">65%</div>
                    <div className="w-[35%] bg-slate-700 flex items-center justify-end px-3 text-[10px] font-bold text-slate-400">35%</div>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <Link href="/duelos" className="block w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-black rounded-xl transition-colors shadow-lg shadow-white/10 uppercase tracking-widest text-sm text-center">
                        Votar Agora
                    </Link>
                    <p className="text-xs text-slate-500 mt-4">A votação encerra em 2 horas e 15 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Showcase */}
      <section id="perfil" className="py-32 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Seu Cartão de Visitas Digital</h2>
            <p className="text-slate-400 text-lg">
                Esqueça PDFs e planilhas. Seu perfil no FightNexus reúne seus dados físicos, cartel, redes sociais e vídeos em um link profissional e compartilhável.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-w-6xl mx-auto ring-1 ring-slate-800 relative">
            
            {/* Fake Browser UI */}
            <div className="bg-slate-900 px-6 py-4 flex gap-2 border-b border-slate-800 items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto bg-slate-950 border border-slate-800 px-6 py-1.5 rounded-md text-xs text-slate-500 font-mono flex items-center gap-2 w-1/2 justify-center opacity-70 overflow-hidden text-ellipsis whitespace-nowrap">
                  <Shield className="w-3 h-3" /> fightnexus.com/u/the_beast
              </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[500px]">
              {/* Sidebar do Perfil */}
              <div className="lg:w-1/3 bg-slate-900/30 p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-yellow-500 mb-6 relative shadow-lg">
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-max bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">OURO II</div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-1 text-white">Carlos "The Beast"</h3>
                <p className="text-slate-400 text-center text-sm mb-8">Jiu-Jitsu & MMA • Profissional</p>

                <div className="w-full space-y-4 mb-8">
                    <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-800/50">
                        <span className="text-sm text-slate-400">Peso</span>
                        <span className="font-bold text-white">77kg</span>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-800/50">
                        <span className="text-sm text-slate-400">Altura</span>
                        <span className="font-bold text-white">1.82m</span>
                    </div>
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="lg:w-2/3 p-6 md:p-10 bg-slate-950">
                {/* Stats Grid */}
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Activity className="text-red-500 w-5 h-5" /> Analytics
                    </h4>
                    <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">Perfil Verificado</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:bg-slate-900 transition-colors">
                        <Instagram className="w-5 h-5 text-pink-500 mb-2" />
                        <div className="text-xl md:text-2xl font-bold text-white">45.2k</div>
                        <div className="text-xs text-slate-500">Seguidores</div>
                    </div>
                    <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:bg-slate-900 transition-colors">
                        <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                        <div className="text-xl md:text-2xl font-bold text-white">8.5%</div>
                        <div className="text-xs text-slate-500">Engajamento</div>
                    </div>
                    <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:bg-slate-900 transition-colors">
                        <Share2 className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-xl md:text-2xl font-bold text-white">12k</div>
                        <div className="text-xs text-slate-500">Alcance</div>
                    </div>
                    <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:bg-slate-900 transition-colors">
                        <Star className="w-5 h-5 text-yellow-500 mb-2" />
                        <div className="text-xl md:text-2xl font-bold text-white">2.4k</div>
                        <div className="text-xs text-slate-500">Votos</div>
                    </div>
                </div>

                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <Award className="text-yellow-500 w-5 h-5" /> Últimas Lutas
                </h4>
                <div className="space-y-4">
                    {[
                        { result: 'VITÓRIA', event: 'Jungle Fight 123', method: 'TKO (Soco)', round: 'R2 2:45' },
                        { result: 'VITÓRIA', event: 'Open BJJ Rio', method: 'Finalização (Armbar)', round: '-' },
                        { result: 'DERROTA', event: 'Regional MMA', method: 'Decisão Unânime', round: 'R3 5:00' }
                    ].map((fight, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-900/30 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors group">
                            <div className="flex items-center gap-5">
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded tracking-wider ${fight.result === 'VITÓRIA' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {fight.result}
                                </span>
                                <div>
                                    <p className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">{fight.event}</p>
                                    <p className="text-xs text-slate-500">{fight.method}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono text-slate-600 group-hover:text-slate-400">{fight.round}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Search Section - Clean Background */}
      <section id="empresas" className="py-32 bg-slate-950 relative">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/3">
                 <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Encontre o Talento Certo</h2>
                 <p className="text-slate-400 mb-8 text-lg">
                   Empresários e marcas usam nosso filtro avançado para encontrar atletas promissores baseados em dados reais, não apenas hype.
                 </p>
                 
                 <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 flex-shrink-0">
                           <Users className="text-blue-500 w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Ecossistema Familiar</h4>
                           <p className="text-sm text-slate-500">Veja quem treina o atleta. A linhagem importa.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 flex-shrink-0">
                           <Target className="text-red-500 w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Engajamento Real</h4>
                           <p className="text-sm text-slate-500">Métricas de Instagram e Facebook verificadas via API.</p>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="md:w-2/3 w-full">
                  <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-blue-900/10">
                      <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-5 py-4 mb-4">
                          <Search className="text-slate-400 w-5 h-5" />
                          <input type="text" placeholder="Busque por nome, modalidade..." className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400 text-lg" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <div className="relative">
                            <select className="w-full bg-slate-100 text-slate-700 rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-slate-200 appearance-none">
                                <option>Modalidade</option>
                                <option>MMA</option>
                                <option>Jiu-Jitsu</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                          
                          <div className="relative">
                            <select className="w-full bg-slate-100 text-slate-700 rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-slate-200 appearance-none">
                                <option>Rank Mínimo</option>
                                <option>Diamante +</option>
                                <option>Ouro +</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>

                          <div className="relative">
                            <select className="w-full bg-slate-100 text-slate-700 rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-slate-200 appearance-none">
                                <option>Região</option>
                                <option>São Paulo</option>
                                <option>Rio de Janeiro</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                      </div>
                      <Link href="/busca" className="w-full bg-red-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg text-lg flex items-center justify-center">
                          Buscar Atletas
                      </Link>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Plans Section (Free vs Premium) */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Comece Grátis, Evolua para Lenda</h2>
                <p className="text-slate-400 text-lg">
                    O FightNexus é 100% gratuito para começar. Mas se você quer acelerar sua carreira, nosso plano premium te coloca no radar das maiores empresas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 flex flex-col">
                    <div className="mb-4">
                        <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Iniciante</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Atleta Grátis</h3>
                    <p className="text-slate-400 mb-8">Tudo o que você precisa para criar seu perfil e começar a competir.</p>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-green-500" /> Perfil Profissional Completo</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-green-500" /> Participação em Duelos</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-green-500" /> Sistema de Missões Básico</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-green-500" /> Conexão com Treinadores</li>
                    </ul>
                    <Link href="/cadastro" className="w-full text-center py-4 rounded-xl font-bold border border-slate-700 text-white hover:bg-slate-900 transition-colors">
                        Começar Grátis
                    </Link>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 border border-red-600/50 flex flex-col relative overflow-hidden shadow-2xl shadow-red-900/20">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">Recomendado</div>
                    <div className="mb-4">
                        <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-600/30">Pro Fighter</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Premium</h3>
                    <p className="text-slate-400 mb-8">Desbloqueie 100% do potencial da ferramenta e destaque-se.</p>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-white font-medium"><CheckCircle className="w-5 h-5 text-red-500" /> <strong>Destaque nas Buscas</strong> de Patrocinadores</li>
                        <li className="flex items-center gap-3 text-white font-medium"><CheckCircle className="w-5 h-5 text-red-500" /> Acesso a Missões Exclusivas (XP em Dobro)</li>
                        <li className="flex items-center gap-3 text-white font-medium"><CheckCircle className="w-5 h-5 text-red-500" /> Analytics Avançado de Redes Sociais</li>
                        <li className="flex items-center gap-3 text-white font-medium"><CheckCircle className="w-5 h-5 text-red-500" /> Contato Direto com Marcas</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30">
                        Seja Premium
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section Final */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-red-900/20">
                {/* Texture overlay simulated */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")"}}></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-6xl font-black text-white mb-8 tracking-tight">Pronto para entrar no cage?</h2>
                    <p className="text-red-100 text-lg md:text-2xl mb-12 font-light">
                        Crie seu perfil gratuito hoje. As marcas estão procurando o próximo GOAT.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-5">
                        <Link href="/cadastro" className="bg-white text-red-600 px-10 py-5 rounded-xl font-black text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-xl flex items-center justify-center">
                            CRIAR CONTA DE ATLETA
                        </Link>
                        <Link href="/cadastro" className="bg-red-800/50 backdrop-blur text-white px-10 py-5 rounded-xl font-bold text-lg border border-red-500 hover:bg-red-800 transition-all flex items-center justify-center">
                            Sou Treinador / Empresa
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-sm text-slate-600">
        <div className="container mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-400">
                <Swords className="text-red-900 w-6 h-6" /> FIGHTNEXUS
            </div>
            <p>&copy; 2024 FightNexus. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};