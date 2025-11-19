// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '', // Optional: only needed for push notifications
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

// Optional: messagingSenderId is only needed for push notifications (not used in this app)
const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
];

const missingRequiredVars = requiredEnvVars.filter(varName => !process.env[varName]);
const missingOptionalVars = optionalEnvVars.filter(varName => !process.env[varName]);

if (missingRequiredVars.length > 0 && typeof window === 'undefined') {
  console.error('❌ Missing required Firebase environment variables:', missingRequiredVars.join(', '));
  console.error('📝 Please create a .env.local file in the root directory with these variables.');
  console.error('💡 Check ENV_SETUP.md for instructions.');
}

if (missingOptionalVars.length > 0 && typeof window === 'undefined') {
  console.warn('⚠️ Missing optional Firebase environment variables:', missingOptionalVars.join(', '));
  console.warn('💡 These are only needed for push notifications (not used in this app).');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Export project ID for debugging
export const firebaseProjectId = firebaseConfig.projectId;

export { app, db, storage };
