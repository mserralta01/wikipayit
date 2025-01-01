import { Timestamp } from 'firebase/firestore';

export interface BankingPartner {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  processingStatus?: 'Pre-Application' | 'Need Application' | 'Need Documents' | 'Need Signature' | 'Submitted' | 'Approved' | 'Processing';
  color?: string;
  description?: string;
  website?: string;
  contacts: BankContact[];
  agreements: BankAgreement[];
  createdAt: any;
  updatedAt: any;
}

export interface BankContact {
  id: string;
  bankingPartnerId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  isMainContact: boolean;
  isMain: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ProcessingFees {
  visaMasterDiscover: number;
  amex: number;
}

export interface TransactionFees {
  visaMasterDiscover: number;
  amex: number;
}

export interface RiskTerms {
  revenueSharePercentage: number;
  processingFees: ProcessingFees;
  transactionFees: TransactionFees;
  monthlyFee: number;
  monthlyMinimumFee: number;
  chargebackFee: number;
  retrievalFee: number;
  avsFee: number;
  binFee: number;
  sponsorFee: number;
  pciFee: number;
}

export interface BankAgreement {
  id: string;
  bankingPartnerId: string;
  startDate: any;
  endDate: any | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  lowRisk: RiskTerms;
  highRisk: RiskTerms;
  supportedHighRiskIndustries: string[];
  documentUrls?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface BankingPartnerNote {
  id: string;
  bankingPartnerId: string;
  content: string;
  createdAt: Timestamp;
  createdBy: string;
}
