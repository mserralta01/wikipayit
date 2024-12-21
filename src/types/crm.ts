import { Activity, ActivityType } from './activity';

export type { Activity, ActivityType };

export type MerchantStatus = 'lead' | 'phone_calls' | 'offer_sent' | 'underwriting' | 'documents' | 'approved';

export interface Merchant {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: MerchantStatus;
  createdAt: Date;
  updatedAt: Date;
  activities: Activity[];
} 