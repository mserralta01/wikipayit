import { Timestamp } from 'firebase/firestore';

export type ActivityType = 'note' | 'status_change' | 'email_sent' | 'document_upload' | 'new_application';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Timestamp;
  userId: string;
  merchantId: string;
  merchant: {
    businessName: string;
  };
  metadata?: {
    subject?: string;
    recipientEmail?: string;
    content?: string;
  };
} 