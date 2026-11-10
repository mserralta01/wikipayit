import { Route, Routes, useParams } from "react-router-dom"
import { AdminLayout } from "../components/admin/AdminLayout"
import Dashboard from "../components/admin/Dashboard"
import { Applications } from "../components/admin/Applications"
import Pipeline from "../components/admin/Pipeline"
import MerchantList from "../components/admin/MerchantList"
import WebsiteManagement from "../components/admin/WebsiteManagement"
import SuperAdmin from "../components/admin/SuperAdmin"
import EmailTemplates from "../components/admin/settings/EmailTemplates"
import TeamManagement from "../components/admin/settings/TeamManagement"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { LeadDetailView } from "../components/admin/LeadDetailView"
import { BankingPartnersList } from "../components/admin/banking-partners/BankingPartnersList"
import { BankingPartnerDetail } from "../components/admin/banking-partners/BankingPartnerDetail"
import { BankingPartnerForm } from "../components/admin/banking-partners/BankingPartnerForm"
import { BankContactForm } from "../components/admin/banking-partners/BankContactForm"
import { BankAgreementForm } from "../components/admin/banking-partners/BankAgreementForm"
import { EditAgreement } from "../components/admin/banking-partners/EditAgreement"
import InterchangePage from "../components/admin/settings/InterchangePage"

// Wrapper components for forms that need params
const BankContactFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankContactForm bankingPartnerId={id!} />;
};

const BankAgreementFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankAgreementForm bankingPartnerId={id!} />;
};

/** The admin back office, loaded on its own so the public pages stay light. */
export default function AdminApp() {
  return (
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
  )
}
