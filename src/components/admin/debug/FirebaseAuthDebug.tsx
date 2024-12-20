'use client';

import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export const FirebaseAuthDebug = () => {
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Current Firebase Auth State:', {
        user: user ? {
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified,
          metadata: user.metadata
        } : null
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
};
