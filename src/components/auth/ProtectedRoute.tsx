import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute State:', { user, isAdmin, loading, path: location.pathname })

  if (loading) {
    console.log('ProtectedRoute: Loading state...')
    return <div>Loading...</div>
  }

  if (!user || !isAdmin) {
    console.log('ProtectedRoute: Access denied, redirecting to login', { user, isAdmin })
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('ProtectedRoute: Access granted')
  return <>{children}</>
}
