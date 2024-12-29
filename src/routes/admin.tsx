import { RouteObject } from 'react-router-dom';
import { BankingPartnersList } from '@/components/admin/banking-partners/BankingPartnersList';
import { BankingPartnerDetail } from '@/components/admin/banking-partners/BankingPartnerDetail';
import { BankingPartnerForm } from '@/components/admin/banking-partners/BankingPartnerForm';
import { BankContactForm } from '@/components/admin/banking-partners/BankContactForm';
import { BankAgreementForm } from '@/components/admin/banking-partners/BankAgreementForm';
import { EditAgreement } from '@/components/admin/banking-partners/EditAgreement';
import { useParams } from 'react-router-dom';

const BankContactFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankContactForm bankingPartnerId={id!} />;
};

const BankAgreementFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <BankAgreementForm bankingPartnerId={id!} />;
};

export const adminRoutes: RouteObject[] = [
  // Banking Partners Routes
  {
    path: 'banking-partners',
    children: [
      {
        index: true,
        element: <BankingPartnersList />,
      },
      {
        path: 'new',
        element: <BankingPartnerForm />,
      },
      {
        path: ':id',
        element: <BankingPartnerDetail />,
      },
      {
        path: ':id/contacts/new',
        element: <BankContactFormWrapper />,
      },
      {
        path: ':id/agreements/new',
        element: <BankAgreementFormWrapper />,
      },
      {
        path: ':id/agreements/:agreementId/edit',
        element: <EditAgreement />,
      },
    ],
  },
]; 