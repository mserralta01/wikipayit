export type MerchantStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'

export type Merchant = {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  status: MerchantStatus
  processingVolume?: number
  rate?: number
  businessType?: string
  createdAt: Date
  updatedAt: Date
}

export type Activity = {
  id: string
  type: 'status_change' | 'document_upload' | 'new_application' | 'note_added' | 'email_sent'
  merchantId: string
  description: string
  performedBy: string
  timestamp: Date
} 