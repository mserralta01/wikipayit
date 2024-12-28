'use client';

import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import HomePage from "./pages/HomePage"
import MerchantApplicationPage from './pages/MerchantApplicationPage'
import MainLayout from "./components/layouts/MainLayout"
import { AdminLayout } from "./components/admin/AdminLayout"
import Dashboard from "./components/admin/Dashboard"
import Applications from "./components/admin/Applications"
import Pipeline from "./components/admin/Pipeline"
import MerchantList from "./components/admin/MerchantList"
import WebsiteManagement from "./components/admin/WebsiteManagement"
import SuperAdmin from "./components/admin/SuperAdmin"
import EmailTemplates from "./components/admin/settings/EmailTemplates"
import TeamManagement from "./components/admin/settings/TeamManagement"
import { LoginModal } from "./components/auth/LoginModal"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { LeadDetailView } from "./components/admin/LeadDetailView"
import TermsPage from "./pages/TermsPage"
import { Toaster } from "./components/ui/toaster"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginModal standalone={true} />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/apply" element={<MerchantApplicationPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Outlet />
                  </AdminLayout>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="pipeline/:id" element={<LeadDetailView />} />
              <Route path="merchants" element={<MerchantList />} />
              <Route path="website" element={<WebsiteManagement />} />
              <Route path="super" element={<SuperAdmin />} />
              <Route path="settings">
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="team" element={<TeamManagement />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
