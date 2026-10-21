import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="bg-cyan-50/90 dark:bg-slate-900 border-b border-cyan-200 dark:border-cyan-800/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <img 
            src="/pwa-192x192.png" 
            alt="СтеляПро" 
            className="w-6 h-6 rounded-lg object-cover shadow-xs border border-cyan-300 dark:border-cyan-700/60 shrink-0" 
          />
          <span className="text-slate-800 dark:text-slate-200">
            Встановіть <strong>СтеляПро</strong> на Android для швидкої роботи на замірах офлайн
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Встановити</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="bg-cyan-50/90 dark:bg-slate-900 border-b border-cyan-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-300">
            <img 
              src="/pwa-192x192.png" 
              alt="СтеляПро" 
              className="w-5 h-5 rounded-md object-cover shadow-xs border border-cyan-300 dark:border-cyan-700/60 shrink-0" 
            />
            <span>Додайте додаток на початковий екран iPhone/iPad</span>
          </div>
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="px-2.5 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-400 font-semibold text-[11px] transition"
          >
            Інструкція
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-left">
              <div className="flex items-center gap-3 mb-3">
                <img src="/pwa-192x192.png" alt="СтеляПро" className="w-8 h-8 rounded-lg shadow-sm border border-cyan-400/40 object-cover" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Встановлення на iPhone / iPad</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                1. Натисніть кнопку <strong>«Поділитися»</strong> (Share) внизу Safari.<br />
                2. Прокрутіть вниз і виберіть <strong>«На початковий екран»</strong>.<br />
                3. Натисніть <strong>«Додати»</strong> у правому верхньому кутку.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white transition shadow-sm"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
