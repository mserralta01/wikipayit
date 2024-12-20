import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'

export function AuthDebug() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div>Loading auth state...</div>

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <pre className="text-xs">
        {JSON.stringify(
          {
            user: user ? {
              email: user.email,
              displayName: user.displayName,
              uid: user.uid
            } : null,
            isAdmin,
            loading
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}
