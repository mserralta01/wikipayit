import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-20">
      <div className="fixed inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5 pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="relative">
          <div className="absolute inset-0 bg-[url('/src/assets/textures/gradient.png')] bg-cover opacity-10 pointer-events-none" />
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  )
} 