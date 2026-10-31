import React, { useState } from 'react';
import { 
  Egg, 
  ShieldCheck, 
  Cloud, 
  Smartphone, 
  AlertCircle,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const { 
    signInWithGoogle, 
    signInWithDemoAccount, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await signInWithDemoAccount(email.trim(), name.trim() || 'Homesteader');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--theme-bg-canvas,#fafaf9)] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 sm:p-6 selection:bg-amber-200 selection:text-amber-950 font-sans">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Card Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-4 ring-amber-500/10 mb-1">
            <Egg className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Homestead Poultry & Egg Manager</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            Welcome to Flocker
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
            Manage your flock, track daily egg production, and keep your records safe in one place.
          </p>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-stone-200/40 dark:shadow-none space-y-5">
          
          {error && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/80 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold block mb-0.5">Notice</span>
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

          {/* Primary Action: Google Styled Button */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                await signInWithGoogle();
              }}
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-100 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50/90 dark:hover:bg-stone-750 hover:border-stone-400 dark:hover:border-stone-600 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Subtle Divider */}
            <div className="relative flex py-1.5 items-center">
              <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
            </div>

            {/* Email Sign-In Option */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100/90 hover:bg-stone-200/80 dark:bg-stone-800/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span>Sign in with Email</span>
                </div>
                {showEmailForm ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {showEmailForm && (
                <form 
                  onSubmit={handleEmailSignIn} 
                  className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700/60 space-y-3 animate-in fade-in duration-150"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Your Name <span className="font-normal text-stone-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Miller"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Signing in...' : 'Continue with Email'}
                  </button>
                </form>
              )}
            </div>

            {/* Guest / Offline Mode */}
            <button
              onClick={onContinueAsGuest}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer group"
            >
              <span>Continue as Guest (Offline Mode)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Clean Feature Highlights */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block">
                  Private
                </span>
                <span className="text-[10px] text-stone-400">Encrypted</span>
              </div>

              <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800/60">
                <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block">
                  Coop Sync
                </span>
                <span className="text-[10px] text-stone-400">Any Device</span>
              </div>

              <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800/60">
                <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block">
                  Cloud Safe
                </span>
                <span className="text-[10px] text-stone-400">Never Lost</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-stone-400 dark:text-stone-500">
          <span>Flocker v2.0 · End-to-End Poultry Records</span>
        </div>

      </div>
    </div>
  );
};

