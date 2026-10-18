import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Cloud, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  AlertCircle,
  Database,
  Smartphone,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, loading, signInWithGoogle, signInWithDemoAccount, signOut, error, clearError } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {user ? 'Account & Security' : 'Secure Your Flock Data'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {user ? 'Cloud Database Synced' : 'Sign in to protect and sync your records'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button onClick={clearError} className="text-rose-500 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* If user is logged in */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-stone-300 dark:border-stone-600 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold text-base flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="truncate flex-1">
                <span className="font-bold text-stone-900 dark:text-stone-100 block text-sm truncate">
                  {user.displayName || 'Flock Master'}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 truncate block">
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authenticated & Encrypted</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <Database className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Cloud Protection Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                Your coops, birds, egg collections, and finance records are backed up to your personal Firestore database. Other users cannot access your data.
              </p>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* If user is not logged in */
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Sign in with your Google account to enable permanent cloud backup and multi-device synchronization for Flocker.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 dark:text-stone-200 block text-xs">Private Zero-Trust Storage</strong>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Strict Firebase security rules ensure only you can access your flock records.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 dark:text-stone-200 block text-xs">Multi-Device Access</strong>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Log eggs at the coop on your phone, inspect growth charts on tablet or laptop.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <Cloud className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 dark:text-stone-200 block text-xs">Safe from Browser Clearing</strong>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Never lose history or records when clearing browser cookies or history.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={async () => {
                  await signInWithDemoAccount('Mike.Schairer@gmail.com', 'Mike Schairer');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-md shadow-amber-700/20 transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In as Mike Schairer</span>
              </button>

              <button
                onClick={async () => {
                  await signInWithGoogle();
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-stone-500" />
                <span>Sign in with Google (OAuth)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors cursor-pointer"
              >
                Continue in Guest Offline Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
