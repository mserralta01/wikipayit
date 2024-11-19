import React from 'react'
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Settings, LayoutTemplate } from 'lucide-react'

export default function AdminLayout() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/')
    }
  }, [user, isAdmin, navigate])

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              location.pathname === '/admin' ? 'bg-gray-100' : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              location.pathname === '/admin/settings' ? 'bg-gray-100' : ''
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          <Link
            to="/admin/homepage-features"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              location.pathname === '/admin/homepage-features' ? 'bg-gray-100' : ''
            }`}
          >
            <LayoutTemplate className="w-5 h-5 mr-3" />
            Homepage Features
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 