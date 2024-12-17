export type LeadStatus = 
  | "Lead" 
  | "Phone Calls" 
  | "Offer Sent" 
  | "Underwriting" 
  | "Documents" 
  | "Approved"

export type PipelineStatus = "lead" | "merchant" | "declined"

export interface Lead {
  id: string
  email: string
  currentStep: number
  formData: {
    email: string
    businessName?: string
    contactName?: string
    phone?: string
    [key: string]: any
  }
  status: LeadStatus
  pipelineStatus: PipelineStatus
  createdAt: string
  updatedAt: string
  
  // Optional fields that may be added during the application process
  businessInformation?: {
    businessName: string
    dbaName?: string
    businessType: string
    taxId: string
    businessAddress: string
    businessCity: string
    businessState: string
    businessZip: string
    businessPhone: string
    websiteUrl?: string
    monthlyVolume: string
    averageTicket: string
    highTicket: string
    mcc: string
  }
  
  processingHistory?: {
    currentProcessor?: string
    monthlyVolume?: string
    reasonForLeaving?: string
    hasChargebacks?: boolean
    chargebackVolume?: string
  }
  
  beneficialOwners?: {
    owners: {
      firstName: string
      lastName: string
      title: string
      ownershipPercentage: string
      email: string
      phone: string
      address: string
      city: string
      state: string
      zipCode: string
      ssn: string
      dateOfBirth: string
    }[]
    updatedAt: string
  }
  
  bankDetails?: {
    accountType: string
    routingNumber: string
    accountNumber: string
    bankName: string
    accountHolderName: string
  }
  
  documents?: {
    businessLicense?: string
    voicedCheck?: string
    bankStatement?: string
    processingStatements?: string[]
    articles?: string
    updatedAt: string
  }
  
  pricing?: {
    rate?: number
    monthlyFee?: number
    setupFee?: number
    updatedAt: string
  }
  
  notes?: {
    id: string
    content: string
    createdBy: string
    createdAt: string
  }[]
} 