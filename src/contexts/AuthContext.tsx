import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { signOut as firebaseSignOut } from 'firebase/auth'

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser)
      setIsAdmin(
        currentUser?.email === 'mserralta@gmail.com' || 
        currentUser?.email === 'Mpilotg6@gmail.com'
      )
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 