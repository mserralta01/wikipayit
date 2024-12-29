'use client';

import { BrowserRouter as Router, Routes, Route, Outlet, useParams } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import HomePage from "./pages/HomePage"
import MerchantApplicationPage from './pages/MerchantApplicationPage'
import MainLayout from "./components/layouts/MainLayout"
import { AdminLayout } from "./components/admin/AdminLayout"
import Dashboard from "./components/admin/Dashboard"
import { Applications } from "./components/admin/Applications"
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
import { BankingPartnersList } from "./components/admin/banking-partners/BankingPartnersList"
import { BankingPartnerDetail } from "./components/admin/banking-partners/BankingPartnerDetail"
import { BankingPartnerForm } from "./components/admin/banking-partners/BankingPartnerForm"
import { BankContactForm } from "./components/admin/banking-partners/BankContactForm"
import { BankAgreementForm } from "./components/admin/banking-partners/BankAgreementForm"
import { EditAgreement } from "./components/admin/banking-partners/EditAgreement"
import InterchangePage from "./components/admin/settings/InterchangePage"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Wrapper components for forms that need params
const BankContactFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankContactForm bankingPartnerId={id!} />;
};

const BankAgreementFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankAgreementForm bankingPartnerId={id!} />;
};

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
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="applications" element={<Applications />} />
                      <Route path="pipeline" element={<Pipeline />} />
                      <Route path="pipeline/:id" element={<LeadDetailView />} />
                      <Route path="merchants" element={<MerchantList />} />
                      <Route path="website" element={<WebsiteManagement />} />
                      <Route path="super" element={<SuperAdmin />} />
                      
                      {/* Settings Routes */}
                      <Route path="settings">
                        <Route path="email-templates" element={<EmailTemplates />} />
                        <Route path="team" element={<TeamManagement />} />
                        <Route path="interchange" element={<InterchangePage />} />
                      </Route>
                      
                      {/* Banking Partners Routes */}
                      <Route path="banking-partners">
                        <Route index element={<BankingPartnersList />} />
                        <Route path="new" element={<BankingPartnerForm />} />
                        <Route path=":id" element={<BankingPartnerDetail />} />
                        <Route path=":id/contacts/new" element={<BankContactFormWrapper />} />
                        <Route path=":id/agreements/new" element={<BankAgreementFormWrapper />} />
                        <Route path=":id/agreements/:agreementId/edit" element={<EditAgreement />} />
                      </Route>
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
