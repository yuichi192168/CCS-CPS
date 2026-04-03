'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, getMissingFirebaseEnvVars, isFirebaseConfigValid } from './config';

export function initializeFirebase() {
  if (!isFirebaseConfigValid()) {
    const missingVars = getMissingFirebaseEnvVars();
    throw new Error(
      `Missing Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Add them to .env.local (local) or your hosting provider environment settings.'
    );
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  return { app, db, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
