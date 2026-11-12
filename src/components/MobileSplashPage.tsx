import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MobileSplashPageProps {
  onDismiss?: () => void;
  forceShow?: boolean;
}

export const MobileSplashPage: React.FC<MobileSplashPageProps> = ({ onDismiss, forceShow = false }) => {
  const [visible, setVisible] = useState(forceShow);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only auto-show once per session if in standalone PWA / Home Screen mode or if forced
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const hasShownInSession = sessionStorage.getItem('flocker_splash_shown');

    if (forceShow || (isStandalone && !hasShownInSession)) {
      setVisible(true);
      sessionStorage.setItem('flocker_splash_shown', 'true');

      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, 500);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [forceShow, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 bg-stone-950 text-stone-100 transition-opacity duration-500 selection:bg-none pointer-events-auto ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 38%, rgba(217, 119, 6, 0.15) 0%, rgba(28, 25, 23, 0.95) 60%, #0c0a09 100%)',
      }}
    >
      {/* Top spacer */}
      <div className="w-full flex items-center justify-center pt-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-900/60 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Homestead Poultry Records</span>
        </span>
      </div>

      {/* Center Hero Icon & Brand */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto animate-in zoom-in-95 duration-300">
        <div className="relative">
          {/* Subtle pulsating aura */}
          <div className="absolute -inset-4 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />

          {/* Home Screen App Icon */}
          <img
            src="/pwa-192x192.png"
            alt="Flocker Icon"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-2xl relative border-2 border-amber-500/30 ring-4 ring-amber-500/10"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Flocker
          </h1>
          <p className="text-xs sm:text-sm font-medium text-stone-400 tracking-wide uppercase">
            Smart Daily Egg &amp; Flock Manager
          </p>
        </div>

        {/* Minimal loading bar */}
        <div className="w-36 h-1 rounded-full bg-stone-800 overflow-hidden mt-3">
          <div className="w-full h-full bg-gradient-to-r from-amber-600 to-amber-400 animate-[shimmer_1.2s_infinite]" />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center pb-6 space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold block">
          Bookmarked to Home Screen
        </span>
        <span className="text-[11px] text-stone-600 font-mono">
          Ready for Offline &amp; Coop Logging
        </span>
      </div>
    </div>
  );
};
