export type CustomerStatus = 
  | 'lead'
  | 'phone_call'
  | 'offer_sent'
  | 'underwriting'
  | 'documents'
  | 'approved'
  | 'declined'
  | 'inactive';

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  attachments?: string[];
}

export interface CustomerDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface ProcessingInfo {
  monthlyVolume: number;
  averageTicket: number;
  cardPresentPercentage: number;
  ecommercePercentage: number;
  currentProcessor?: string;
  previousProcessors?: string[];
  terminationHistory?: {
    processor: string;
    date: Date;
    reason: string;
  }[];
}

export interface BusinessInfo {
  legalName: string;
  dba?: string;
  ein: string;
  businessType: 'sole_proprietorship' | 'llc' | 'corporation' | 'partnership';
  startDate: Date;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  customerServiceEmail?: string;
  customerServicePhone?: string;
}

export interface Customer {
  id: string;
  status: CustomerStatus;
  businessInfo: BusinessInfo;
  contacts: CustomerContact[];
  processingInfo?: ProcessingInfo;
  documents: CustomerDocument[];
  notes: CustomerNote[];
  assignedTo?: string;
  tags: string[];
  leadSource?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: {
    status: CustomerStatus;
    timestamp: Date;
    changedBy: string;
    notes?: string;
  }[];
  nextFollowUp?: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  customFields?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: 'status_change' | 'follow_up' | 'document_request' | 'general';
}

export interface CustomerFilter {
  status?: CustomerStatus[];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  riskLevel?: ('low' | 'medium' | 'high')[];
} 