import { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      return;
    }

    // Check iOS Safari
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);

    if (isSafari) {
      setIsIOS(true);
      if (!localStorage.getItem('hm_pwa_dismissed')) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Check Android / Desktop Chrome PWA prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('hm_pwa_dismissed')) {
        setShowPrompt(true);
      }
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('hm_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-white shadow-2xl rounded-2xl p-4 border border-stone-200 z-50 animate-in slide-in-from-bottom-5">
      <button onClick={handleDismiss} className="absolute right-3 top-3 text-stone-400 hover:text-stone-600">
        <X size={18} />
      </button>
      
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-[#5A5A40] rounded-xl flex items-center justify-center shrink-0">
          <img src="/pwa-192x192.png" alt="App Icon" className="w-8 h-8 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800 text-sm mb-1">{t('pwa.title')}</h3>
          
          {isIOS ? (
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('pwa.tapShare')} <Share size={12} className="inline mx-0.5" /> <br/>
              {t('pwa.addToHome')} <PlusSquare size={12} className="inline mx-0.5" />
            </p>
          ) : (
            <>
              <p className="text-xs text-stone-500 leading-relaxed mb-2">{t('pwa.desc')}</p>
              <button 
                onClick={handleInstallClick}
                className="bg-[#5A5A40] text-white text-xs px-4 py-1.5 rounded-lg font-medium"
              >
                {t('pwa.install')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
