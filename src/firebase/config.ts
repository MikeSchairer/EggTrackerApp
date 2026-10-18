import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Default configuration provisioned for this project
const DEFAULT_CONFIG = {
  projectId: 'adept-transformer-s2sm5',
  appId: '1:685227848111:web:0a5ee29ca0c905af06bf5a',
  apiKey: 'AIzaSyBU-95NZ0oUjTwqbN5IzbOopxXFJPDboFc',
  authDomain: 'adept-transformer-s2sm5.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-b062230c-704e-4e1f-8fa0-faf1a0bdc57a',
  storageBucket: 'adept-transformer-s2sm5.firebasestorage.app',
  messagingSenderId: '685227848111',
  measurementId: '',
  oAuthClientId: '685227848111-lv5mkcpgrkltn4k4pc8gpqgbe76lktvb.apps.googleusercontent.com',
  recaptchaSiteKey: '',
};

// Priority: Environment variables (VITE_FIREBASE_*) -> DEFAULT_CONFIG
const resolvedConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_CONFIG.firestoreDatabaseId || '(default)',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_CONFIG.measurementId || '',
  oAuthClientId:
    import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || DEFAULT_CONFIG.oAuthClientId || '',
  recaptchaSiteKey:
    import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || DEFAULT_CONFIG.recaptchaSiteKey || '',
};

export const isFirebaseConfigured = Boolean(
  resolvedConfig.apiKey && resolvedConfig.projectId
);

// Initialize Firebase App singleton safely without duplicate or crash
const app = getApps().length > 0 ? getApp() : initializeApp(resolvedConfig);

// Initialize Firestore with specific database ID as required
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Firestore connectivity on boot as per guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Please check network/configuration.');
    }
    return false;
  }
}
