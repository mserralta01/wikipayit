import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  loginWithEmail: async () => {},
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user)
      setLoading(false)
      setIsAdmin(user?.email === 'mserralta@gmail.com' || user?.email === 'Mpilotg6@gmail.com')
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      if (result.user?.email === 'mserralta@gmail.com' || result.user?.email === 'Mpilotg6@gmail.com' || result.user?.email === 'serralta@outlook.com') {
        window.location.href = '/admin/website'
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update the user's display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      })
    } catch (error) {
      console.error('Email sign in error:', error)
      throw error
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      if (result.user?.email === 'mserralta@gmail.com' ||
          result.user?.email === 'Mpilotg6@gmail.com' ||
          result.user?.email === 'serralta@outlook.com') {
        window.location.href = '/admin/website'
      }
    } catch (error) {
      console.error('Email login error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      signInWithGoogle,
      signInWithEmail,
      loginWithEmail,
      signOut
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)         