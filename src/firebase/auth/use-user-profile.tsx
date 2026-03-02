
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { onAuthStateChanged, User } from 'firebase/auth';

export type UserRole = 'admin' | 'faculty' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string;
  createdAt: any;
}

export function useUserProfile() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', authUser.uid);
      
      const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user logic: default to 'student' for now
          // In a real app, this might be handled by an invitation system
          const newProfile: UserProfile = {
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || 'Anonymous',
            role: 'student',
            photoURL: authUser.photoURL || '',
            createdAt: serverTimestamp(),
          };
          setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      });

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  return { user, profile, loading };
}
