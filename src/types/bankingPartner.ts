import { Timestamp } from 'firebase/firestore';

export interface BankingPartner {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  color?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BankContact {
  id: string;
  bankingPartnerId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  department: string;
  isMainContact: boolean;
}

interface RiskTerms {
  revenueSharePercentage: number;
  monthlyMinimumFee: number;
  transactionFees: {
    creditCard: number;
    debit: number;
    ach: number;
  };
}

export interface BankAgreement {
  id: string;
  bankingPartnerId: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  lowRisk: RiskTerms;
  highRisk: RiskTerms;
  supportedHighRiskIndustries: string[];
  documentUrls?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BankingPartnerNote {
  id: string;
  bankingPartnerId: string;
  content: string;
  createdAt: Timestamp;
  createdBy: string;
} 