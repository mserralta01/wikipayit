import { Timestamp } from 'firebase/firestore';

export type ActivityType =
  | 'note'
  | 'status_change'
  | 'email_sent'
  | 'document_upload'
  | 'new_application'
  | 'phone_call';

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
    duration?: string;
    outcome?: 'successful' | 'no_answer' | 'follow_up_required' | 'voicemail' | 'other';
    notes?: string;
    agentId?: string;
    agentName?: string;
  };
} 