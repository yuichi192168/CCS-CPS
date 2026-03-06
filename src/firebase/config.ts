'use client';

/**
 * Firebase configuration object.
 * This file pulls values from environment variables.
 * Ensure your .env file contains these keys starting with NEXT_PUBLIC_.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log a warning in development if keys are missing
if (typeof window !== 'undefined' && !config.apiKey && process.env.NODE_ENV === 'development') {
  console.warn(
    'Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env file.'
  );
}

export const firebaseConfig = config;
