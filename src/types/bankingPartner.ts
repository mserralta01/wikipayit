import { Timestamp } from 'firebase/firestore';

export interface BankingPartner {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  website?: string;
  contacts: BankContact[];
  agreements: BankAgreement[];
  createdAt: any;
  updatedAt: any;
}

export interface BankContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
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