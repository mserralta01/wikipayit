import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import WebsiteManagement from './components/admin/WebsiteManagement'
import MainLayout from './components/layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'
import { useToast } from './hooks/useToast'

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
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    ),
    children: [
      {
        index: true,
        element: <div>Dashboard</div>,
      },
      {
        path: 'website',
        element: <WebsiteManagement />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})

function App() {
  const { ToastContainer } = useToast()

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  )
}

export default App