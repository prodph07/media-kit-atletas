import './globals.css';
import Navbar from '../components/Navbar'; // <--- IMPORTANTE

export const metadata = {
  title: 'Nocaute Pages - O Mídia Kit do Lutador',
  description: 'Plataforma profissional para atletas de combate.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0a0c] text-white"> {/* Adicionei classes globais aqui */}
        <Navbar /> {/* <--- AQUI ESTÁ A MÁGICA */}
        <main>
            {children}
        </main>
      </body>
    </html>
  );
}