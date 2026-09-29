import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = 'lk_vat_firebase_config';

// Primary configuration with fallback to the fuel-vat-invoice project
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAshqwu825j2tVyMeMw3cil22kBJljc8yA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fuel-vat-invoice.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fuel-vat-invoice',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fuel-vat-invoice.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1072933240510',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1072933240510:web:bbf49ed49b83e7535328ef'
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function loadFirebaseConfig(): FirebaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projectId && parsed.apiKey) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved Firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    initFirebase(config);
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
}

export function isFirebaseConfigured(config: FirebaseConfig = loadFirebaseConfig()): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

export function initFirebase(config: FirebaseConfig = loadFirebaseConfig()): { app: FirebaseApp | null; db: Firestore | null } {
  if (!isFirebaseConfigured(config)) {
    appInstance = null;
    dbInstance = null;
    return { app: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    if (!dbInstance && appInstance) {
      try {
        dbInstance = initializeFirestore(appInstance, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      } catch (e) {
        dbInstance = getFirestore(appInstance);
      }
    }

    return { app: appInstance, db: dbInstance };
  } catch (e) {
    console.error('Firebase initialization error:', e);
    appInstance = null;
    dbInstance = null;
    return { app: null, db: null };
  }
}

// Initialize on module load
initFirebase();

export function getDb(): Firestore | null {
  if (!dbInstance) {
    const res = initFirebase();
    return res.db;
  }
  return dbInstance;
}
