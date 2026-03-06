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
          setLoading(false);
        } else {
          // Determine role based on default emails for the prototype
          let role: UserRole = 'student';
          const email = authUser.email?.toLowerCase() || '';
          
          if (email === 'admin@ccs.edu.ph') {
            role = 'admin';
          } else if (email === 'faculty@ccs.edu.ph') {
            role = 'faculty';
          }

          const newProfile: UserProfile = {
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || email.split('@')[0],
            role: role,
            photoURL: authUser.photoURL || '',
            createdAt: serverTimestamp(),
          };
          
          setDoc(userDocRef, newProfile).then(() => {
            setProfile(newProfile);
            setLoading(false);
          }).catch(err => {
            console.error("Error creating profile:", err);
            setLoading(false);
          });
        }
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
