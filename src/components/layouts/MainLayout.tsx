import React, { Suspense, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading content...</p>
    </div>
  </div>
)

export default function MainLayout() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="pt-20">
        <main className="relative min-h-[calc(100vh-20rem)]">
          <div className="absolute inset-0 bg-[url('/src/assets/textures/gradient.png')] bg-cover opacity-10 pointer-events-none" />
          <Suspense fallback={<LoadingSpinner />}>
            {isLoading ? <LoadingSpinner /> : <Outlet />}
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </div>
  )
} 