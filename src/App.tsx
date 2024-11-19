import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import WebsiteManagement from './components/admin/WebsiteManagement'
import MainLayout from './components/layouts/MainLayout'
import HomePage from './pages/HomePage'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          </Route>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<div>Dashboard</div>} />
            <Route path="settings" element={<div>Settings</div>} />
            <Route path="homepage-features" element={<WebsiteManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;