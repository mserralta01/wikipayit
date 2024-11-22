import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import WebsiteManagement from './components/admin/WebsiteManagement'
import MainLayout from './components/layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { QueryProvider } from './lib/providers/QueryProvider'
import MerchantList from './components/admin/MerchantList'
import Pipeline from './components/admin/Pipeline'
import Applications from './components/admin/Applications'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user || (user.email !== 'mserralta@gmail.com' && user.email !== 'Mpilotg6@gmail.com')) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'website',
        element: <WebsiteManagement />,
      },
      {
        path: 'merchants',
        element: <MerchantList />,
      },
      {
        path: 'pipeline',
        element: <Pipeline />,
      },
      {
        path: 'applications',
        element: <Applications />,
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  )
}