export type MerchantStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'

export type Priority = 'high' | 'medium' | 'low'

export type AssignedUser = {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
}

export type Note = {
  id: string
  content: string
  createdBy: string
  createdAt: Date
}

export type Document = {
  id: string
  name: string
  url: string
  type: string
  uploadedBy: string
  uploadedAt: Date
}

export type Merchant = {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  status: MerchantStatus
  priority: Priority
  processingVolume?: number
  businessType?: string
  assignedTo?: AssignedUser
  notes: Note[]
  documents: Document[]
  createdAt: Date
  lastUpdated: Date
}

export type Activity = {
  id: string
  type: 'status_change' | 'note_added' | 'document_uploaded' | 'email_sent'
  merchantId: string
  description: string
  performedBy: string
  timestamp: Date
} 