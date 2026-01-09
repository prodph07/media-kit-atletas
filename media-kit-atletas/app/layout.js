import './globals.css';
import Navbar from '../components/Navbar';
import ReferralListener from '../components/ReferralListener';
import { Suspense } from 'react'; // <--- IMPORTANTE: Importar Suspense

export const metadata = {
  title: 'Nocaute Pages - O Mídia Kit do Lutador',
  description: 'Plataforma profissional para atletas de combate.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0a0c] text-white">
        
        {/* ENVOLVEMOS O REFERRAL LISTENER COM SUSPENSE 
            Isso corrige o erro de "useSearchParams" no build
        */}
        <Suspense fallback={null}>
            <ReferralListener />
        </Suspense>
        
        <Navbar />
        
        <main>
            {children}
        </main>
      </body>
    </html>
  );
}