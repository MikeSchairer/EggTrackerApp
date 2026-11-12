import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone on home screen, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
        title="Add Flocker to your mobile phone Home Screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add to Home Screen</span>
        <span className="sm:hidden">Install App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit beforeinstallprompt is not fired)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 transition-colors cursor-pointer"
          title="Add Flocker to your iPhone/iPad Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Add to Home Screen</span>
          <span className="sm:hidden">Bookmark</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3.5 right-3.5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="Flocker Icon"
                  className="w-12 h-12 rounded-xl shadow-md border border-amber-500/20"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Add to iPhone Home Screen
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Bookmark Flocker for instant full-screen access
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-stone-900 dark:text-stone-100 inline-flex items-center gap-1 font-semibold"><Share2 className="w-3.5 h-3.5 inline text-blue-500" /> Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong className="text-stone-900 dark:text-stone-100 inline-flex items-center gap-1 font-semibold"><PlusSquare className="w-3.5 h-3.5 inline text-stone-700 dark:text-stone-200" /> Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-stone-900 dark:text-stone-100 font-semibold">Add</strong> in the top-right corner to finish.
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
