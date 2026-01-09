import './globals.css';
import Navbar from '../components/Navbar';
import ReferralListener from '../components/ReferralListener'; // <--- IMPORTANTE: O Rastreador

export const metadata = {
  title: 'Nocaute Pages - O Mídia Kit do Lutador',
  description: 'Plataforma profissional para atletas de combate.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0a0c] text-white">
        
        {/* Componente Invisível que captura o link de indicação */}
        <ReferralListener />
        
        <Navbar />
        <main>
            {children}
        </main>
      </body>
    </html>
  );
}