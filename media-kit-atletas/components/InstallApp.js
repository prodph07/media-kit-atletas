'use client';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Escuta o evento do navegador que diz "Ei, esse site pode ser instalado!"
    const handler = (e) => {
      e.preventDefault(); // Impede o navegador de mostrar a barra feia padrão
      setDeferredPrompt(e); // Guarda o evento pra usar no nosso botão
      setShowButton(true); // Mostra nosso botão bonitão
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Dispara o prompt nativo do celular
    deferredPrompt.prompt();

    // Espera o usuário aceitar ou recusar
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowButton(false); // Esconde o botão se ele instalou
    }
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-20 right-4 z-50 bg-yellow-500 text-black px-4 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 animate-bounce border-2 border-yellow-300"
    >
      <Download size={20} />
      Instalar App
    </button>
  );
}