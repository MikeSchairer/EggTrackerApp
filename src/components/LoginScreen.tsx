import React, { useState } from 'react';
import { 
  Egg, 
  ShieldCheck, 
  LogIn, 
  Sparkles, 
  Cloud, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  UserCheck,
  Mail,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const { 
    signInWithGoogle, 
    signInWithDemoAccount, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  const [showCustomEmail, setShowCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState('Mike.Schairer@gmail.com');
  const [customName, setCustomName] = useState('Mike Schairer');

  const handleCustomSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    await signInWithDemoAccount(customEmail.trim(), customName.trim() || 'Homesteader');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--theme-bg-canvas,#fafaf9)] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 sm:p-6 selection:bg-amber-200 selection:text-amber-950 font-sans">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Card Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/20 ring-4 ring-amber-500/10 mb-1">
            <Egg className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Homestead Poultry & Egg Management</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            Flocker
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            Please sign in to access your chickens, daily egg logs, coop schedules, and health records.
          </p>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 dark:shadow-none space-y-5">
          
          {error && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 leading-relaxed">
                  <strong className="block font-semibold mb-0.5">Authentication Note</strong>
                  {error}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={clearError}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* 1. Primary One-Click Homestead Login */}
            <button
              onClick={async () => {
                await signInWithDemoAccount('Mike.Schairer@gmail.com', 'Mike Schairer');
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-md shadow-amber-700/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-5 h-5" />
              <span>Sign In as Mike Schairer</span>
            </button>
            <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
              Authenticated with email <span className="font-medium text-stone-700 dark:text-stone-300">Mike.Schairer@gmail.com</span>
            </p>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold tracking-wider text-stone-400">
                Other Sign-In Options
              </span>
              <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
            </div>

            {/* Custom Email Form Toggle */}
            <button
              type="button"
              onClick={() => setShowCustomEmail(!showCustomEmail)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>Sign in with another email address</span>
              </div>
              {showCustomEmail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCustomEmail && (
              <form onSubmit={handleCustomSignIn} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700/60 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Homestead Owner"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="you@homestead.org"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Enter Flocker
                </button>
              </form>
            )}

            {/* Google OAuth Popup (Optional) */}
            <button
              onClick={async () => {
                await signInWithGoogle();
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-400" />
              <span>Connect with Google Account (External OAuth)</span>
            </button>

            {/* Guest / Offline Mode */}
            <button
              onClick={onContinueAsGuest}
              className="w-full py-2 px-4 text-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Continue in Guest / Offline Mode
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Protected Flock Benefits
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    Private Zero-Trust Cloud Storage
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Your records are locked to your user account via Firebase security rules.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
                <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    Anywhere Coop Sync
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Log eggs at the nest boxes from mobile; review analytics from desktop.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
                <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    Permanent Flock History
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Never lose laying records or medical logs when clearing your browser.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-stone-400 dark:text-stone-500 flex items-center justify-center gap-2">
          <span>Flocker v2.0</span>
          <span>·</span>
          <span>End-to-End Poultry Records</span>
        </div>

      </div>
    </div>
  );
};
