'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  Trophy, Users, Share2, CheckCircle, ChevronDown, ChevronUp, 
  ArrowRight, Star, Quote
} from 'lucide-react';

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- SUB-COMPONENTES VISUAIS ---

// Atualizei o Button para usar o Link do Next.js (Navegação rápida sem recarregar)
const Button = ({ children, primary, className, href }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold tracking-wide";
  const primaryClasses = "text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25";
  const secondaryClasses = "text-blue-400 bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white";

  return (
    <Link href={href || '/cadastro'} className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${className}`}>
      {children}
    </Link>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors backdrop-blur-sm">
    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const AthleteCard = ({ athlete }) => (
  <Link href={`/${athlete.slug || athlete.id}`} className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 block">
    <div className="aspect-[4/5] w-full overflow-hidden">
      <img 
        src={athlete.foto_url || "https://placehold.co/600x800/1e293b/FFF?text=FOTO"} 
        alt={athlete.nome} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
        {athlete.categoria || "Atleta"}
      </span>
      <h3 className="text-2xl font-black italic text-white mb-1 uppercase">{athlete.nome}</h3>
      <p className="text-slate-300 text-sm mb-4 font-bold text-blue-400">{athlete.apelido}</p>
      
      <div className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-slate-500 group-hover:text-white transition-colors">
        Ver Mídia Kit <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </div>
  </Link>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 relative">
    <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/20" />
    <p className="text-slate-300 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
    <div className="flex items-center gap-4">
      <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"/>
      <div>
        <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
        <p className="text-blue-400 text-xs">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button className="w-full py-6 flex items-center justify-between text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-lg font-medium text-slate-300 group-hover:text-white transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}`}>
        <p className="text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// DADOS ESTÁTICOS
const TESTIMONIALS = [
  { id: 1, name: "Gabriela Martins", role: "Natação", content: "Fechei 2 novos apoios só por ter um link profissional.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80" },
  { id: 2, name: "Rafael Souza", role: "Jiu-Jitsu", content: "A facilidade de atualizar minhas medalhas pelo celular é incrível.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80" },
  { id: 3, name: "Fernanda Lima", role: "Triatleta", content: "Simples, direto e eficiente. Exatamente o que eu precisava.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" }
];

const FAQ_ITEMS = [
  { question: "O que é um Mídia Kit Digital?", answer: "É o seu currículo de atleta online. Um site profissional que reúne suas estatísticas, fotos e vídeos." },
  { question: "Como envio minhas informações?", answer: "Após criar sua conta grátis, você terá acesso ao nosso painel administrativo para preencher tudo." },
  { question: "É gratuito?", answer: "Sim! Você pode criar seu perfil gratuitamente. Temos um plano Premium com mais funcionalidades se você precisar." }
];

// --- APP PRINCIPAL (HOME PAGE) ---

export default function Home() {
  const [atletas, setAtletas] = useState([]);

  useEffect(() => {
    async function fetchAtletas() {
      const { data, error } = await supabase
        .from('atletas')
        .select('id, nome, apelido, categoria, foto_url, slug')
        .order('created_at', { ascending: false }) // Pega os mais recentes
        .limit(3); 
      
      if (error) console.error("Erro Supabase:", error);
      else setAtletas(data || []);
    }
    fetchAtletas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-blue-500 selection:text-white">
      
      {/* NOTA: O <header> foi removido daqui porque já existe a Navbar Global 
          no arquivo app/layout.js. Isso evita ter dois menus na tela.
      */}

      {/* HERO SECTION COM VÍDEO */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden text-center">
        {/* Luzes de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
             <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]" />
             <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center px-4 py-2 bg-slate-900 border border-slate-700 rounded-full mb-8 animate-fade-in-up">
            <Star className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" />
            <span className="text-sm font-medium text-slate-300">A ferramenta nº 1 para atletas profissionais</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Eleve seu jogo. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Conquiste Patrocínios.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed">
            Transforme sua carreira com um Mídia Kit Digital profissional. Mostre suas estatísticas, vídeos e alcance social em um só lugar.
          </p>
          
          {/* BOTÕES DE AÇÃO PRINCIPAIS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button primary href="/cadastro">Criar Perfil Grátis <ArrowRight className="ml-2 w-5 h-5" /></Button>
            <Button href="/busca">Buscar Atletas</Button>
          </div>

          {/* PLAYER DE VÍDEO (Exemplo genérico mantido) */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 group">
             <div className="aspect-video relative">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=DemoVideo" 
                    title="Vídeo de Apresentação" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                ></iframe>
             </div>
             <div className="bg-slate-900 py-3 px-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veja como funciona</span>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* BENEFÍCIOS SECTION */}
      <section id="beneficios" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Por que você precisa disso?</h2>
            <p className="text-lg text-slate-400">Sua imagem é tão importante quanto sua performance.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={Share2} title="Link Único" description="Um link profissional para colocar na bio do Instagram e enviar no WhatsApp." />
            <FeatureCard icon={Users} title="Atraia Patrocinadores" description="Mostre seus números de engajamento e conquistas de forma convincente." />
            <FeatureCard icon={CheckCircle} title="Atualização Rápida" description="Ganhou medalha? Atualize pelo celular em segundos, sem depender de designer." />
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section id="exemplos" className="py-24 bg-slate-900 relative border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Atletas em Destaque</h2>
              <p className="text-lg text-slate-400">Veja quem já está usando a plataforma.</p>
            </div>
            <Button href="/busca" className="py-2 px-4 text-sm">Ver Todos</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {atletas.length > 0 ? (
              atletas.map(athlete => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))
            ) : (
              <p className="text-slate-500 col-span-3 text-center py-10 border border-dashed border-slate-800 rounded-xl">
                Nenhum atleta encontrado. Seja o primeiro!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-16 text-center">Quem usa e aprova</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => <TestimonialCard key={t.id} testimonial={t} />)}
          </div>
        </div>
      </section>

      {/* PREÇOS / VALORES (Adaptado para Freemium) */}
      <section id="planos" className="py-24 relative overflow-hidden bg-slate-900 border-t border-slate-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic">Comece <span className="text-blue-500">Grátis</span></h2>
             <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                Crie seu perfil agora, preencha seus dados e profissionalize sua carreira.
             </p>

             <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recomendado</div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">Plano Inicial</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl font-black text-white">R$ 0</span>
                            <span className="text-slate-500">/hoje</span>
                        </div>
                        <p className="text-slate-400 text-sm">Upgrade para Premium disponível dentro do painel.</p>
                    </div>

                    <ul className="text-left space-y-3">
                        <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Site Profissional</li>
                        <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Link na Bio</li>
                        <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Apareça nas Buscas</li>
                    </ul>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-900">
                    <Button primary href="/cadastro" className="w-full py-4 text-lg shadow-blue-900/20">
                        CRIAR MINHA CONTA AGORA
                    </Button>
                    <p className="mt-4 text-xs text-slate-500">Não precisa de cartão de crédito para começar.</p>
                </div>
             </div>
          </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Perguntas Frequentes</h2>
          <div className="space-y-2">{FAQ_ITEMS.map((item, i) => <FaqItem key={i} {...item} />)}</div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 text-center text-slate-600">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2025 Nocaute Pages. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}