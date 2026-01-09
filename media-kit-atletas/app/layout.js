import './globals.css';
import Navbar from '../components/Navbar';
import ReferralListener from '../components/ReferralListener';
import InstallApp from '../components/InstallApp'; // <--- IMPORTAMOS O BOTÃO
import { Suspense } from 'react';

export const metadata = {
  title: 'Nocaute Pages',
  description: 'Plataforma profissional para atletas.',
  manifest: '/manifest.json', // <--- IMPORTANTE: Link pro manifesto
  themeColor: '#0a0a0c',
};

// Adiciona o viewport separadamente (Padrão novo do Next.js)
export const viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Fallback para navegadores antigos */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-[#0a0a0c] text-white">
        
        <Suspense fallback={null}>
            <ReferralListener />
        </Suspense>
        
        <Navbar />
        
        <main>
            {children}
        </main>

        {/* Botão Flutuante de Instalar */}
        <InstallApp />
        
      </body>
    </html>
  );
}