import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { User } from 'firebase/auth'

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const isAdmin = user?.email === 'mserralta@gmail.com' || user?.email === 'Mpilotg6@gmail.com'

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 