import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithCredential,
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '../firebase/config';

export const GOOGLE_OAUTH_CLIENT_ID =
  import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID ||
  '685227848111-lv5mkcpgrkltn4k4pc8gpqgbe76lktvb.apps.googleusercontent.com';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  signInWithDemoAccount: (customEmail?: string, customName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'flocker_demo_authenticated_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Run connectivity test on boot
    testFirestoreConnection().catch(console.warn);

    // Check if user previously logged in via Homestead Demo session
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.uid) {
          setUser(parsed);
          setLoading(false);
        }
      } catch (e) {
        console.warn('Error reading stored demo session', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Firebase user authenticated
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isDemo: false,
        });

        // Sync or register user profile doc in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              email: currentUser.email || 'user@example.com',
              displayName: currentUser.displayName || 'Homesteader',
              photoUrl: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Profile sync note:', err);
        }
      } else {
        // If no firebase user, only clear user if they weren't in a demo session
        const currentSavedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (!currentSavedDemo) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogleCredential = async (idToken: string) => {
    try {
      setError(null);
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      await signInWithCredential(auth, credential);
    } catch (err: any) {
      console.warn('Google Credential Sign-In error:', err?.message || err);
      setError(err?.message || 'Failed to authenticate with Google ID token.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      // Clear demo session when explicitly initiating Google login
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        message.includes('popup-closed-by-user')
      ) {
        console.info('Google sign-in popup was closed.');
        setError('Google sign-in window was closed. If popups are blocked by your browser, use the Instant Sign-In button below.');
        return;
      }

      if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
        console.warn('Google sign-in popup blocked by browser.');
        setError('The Google sign-in popup was blocked by your browser or frame. Use the Instant Sign-In button below.');
        return;
      }

      if (
        code === 'auth/unauthorized-domain' ||
        message.includes('unauthorized domain') ||
        message.includes('auth/unauthorized-domain')
      ) {
        console.warn('Firebase unauthorized domain.');
        setError(
          'This domain is not authorized in Firebase Auth yet. Use the Instant Homestead Sign-In below, or add this domain in Firebase Console.'
        );
        return;
      }

      console.warn('Google Sign-In note:', message);
      setError('Google popup could not load in this frame. Use the Instant Homestead Sign-In below for immediate access.');
    }
  };

  const signInWithDemoAccount = async (
    customEmail = 'Mike.Schairer@gmail.com',
    customName = 'Mike Schairer'
  ) => {
    setError(null);
    const demoUser: AppUser = {
      uid: 'homestead-owner-mike',
      email: customEmail,
      displayName: customName,
      photoURL: null,
      isDemo: true,
    };
    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    } catch (e) {
      console.warn('Could not save demo session to localStorage', e);
    }
    setUser(demoUser);
  };

  const signOut = async () => {
    try {
      setError(null);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setUser(null);
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (err: any) {
      console.warn('Sign Out note:', err?.message || err);
      setError(err?.message || 'Failed to sign out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGoogleCredential,
        signInWithDemoAccount,
        signOut,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
