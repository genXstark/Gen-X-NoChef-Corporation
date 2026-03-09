/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, browserPopupRedirectResolver, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// NOTE: Ensure 'pandapanel.tv' and 'www.pandapanel.tv' are added to 
// Firebase Auth -> Settings -> Authorized Domains in the Firebase Console.
const firebaseConfig = {
  apiKey: 'AIzaSyDFfgoXOK96TCI8Rgwz4nCSUFewCBFbQBo',
  authDomain: 'panda-tv-d685f.firebaseapp.com',
  projectId: 'panda-tv-d685f',
  storageBucket: 'panda-tv-d685f.firebasestorage.app',
  messagingSenderId: '554686804071',
  appId: '1:554686804071:web:05dae18e2687acfc8be4c2',
  measurementId: 'G-GQ8KCEPTXN'
};

// Check if the config is valid
export const isFirebaseConfigured = true;

export const getFirebaseDiagnostics = () => ({
  hasApiKey: true,
  apiKeyLength: firebaseConfig.apiKey.length,
  apiKeyPrefix: firebaseConfig.apiKey.substring(0, 6),
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isConfigured: true
});

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
  app = initializeApp(firebaseConfig);
  
  // Use initializeAuth to bypass visibility check issues in iframes
  auth = initializeAuth(app, {
    persistence: [browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver
  });

  db = getFirestore(app);

  // Connect to emulator if running in development mode
  if (import.meta.env.DEV && (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true')) {
    connectAuthEmulator(auth, "http://localhost:9099");
  }

  console.log("Firebase initialized successfully");
} catch (error: any) {
  console.error("CRITICAL: Firebase initialization failed:", error);
}

export { auth, db };
