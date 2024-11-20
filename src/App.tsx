import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import WebsiteManagement from './components/admin/WebsiteManagement'
import MainLayout from './components/layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'
import { useToast } from './hooks/useToast'

function App() {
  const { ToastContainer } = useToast()

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            <Route index element={<div>Dashboard</div>} />
            <Route path="website" element={<WebsiteManagement />} />
          </Route>
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  )
}

export default App;