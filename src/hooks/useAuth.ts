import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import type { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context as AuthContextType
} 