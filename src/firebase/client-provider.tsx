'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const initialized = initializeFirebase();
      setFirebase(initialized);
      setInitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize Firebase.';
      console.error(message);
      setInitError(message);
    }
  }, []);

  if (initError) {
    return (
      <div className="mx-auto mt-8 w-full max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-semibold">Firebase configuration error</p>
        <p className="mt-1">{initError}</p>
      </div>
    );
  }

  if (!firebase) return null;

  return (
    <FirebaseProvider app={firebase.app} db={firebase.db} auth={firebase.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
