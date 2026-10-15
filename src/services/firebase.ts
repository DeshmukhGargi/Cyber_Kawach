import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import localFirebaseConfig from '../../firebase-applet-config.json';

// Support runtime environment variables with fallback to configuration file
const activeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localFirebaseConfig?.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig?.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig?.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localFirebaseConfig?.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localFirebaseConfig?.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localFirebaseConfig?.appId || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localFirebaseConfig?.firestoreDatabaseId || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (activeConfig.apiKey && activeConfig.projectId) {
    app = !getApps().length ? initializeApp(activeConfig) : getApp();
    auth = getAuth(app);
    db = activeConfig.firestoreDatabaseId
      ? getFirestore(app, activeConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase initialization skipped or failed:', err);
}

export { auth, db };
export default app;

