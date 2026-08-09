import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PwaInstallBanner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install GatePass on your phone: Tap your browser settings button and select "Add to Home Screen" / "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top duration-300 ${
      isDark ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-100' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold flex items-center gap-1.5">
            <span>Install GatePass App on Phone</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-indigo-500 text-white">PWA</span>
          </div>
          <p className="text-[11px] text-slate-300">Add to home screen for fast camera scanning and offline access</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Download className="w-3.5 h-3.5" /> Install App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
