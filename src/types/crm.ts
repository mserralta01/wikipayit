export type ActivityType = 'note' | 'status_change' | 'email_sent' | 'document_upload' | 'new_application';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  userId: string;
  merchantId: string;
  merchant: {
    businessName: string;
  };
}

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