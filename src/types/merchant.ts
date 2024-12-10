export type BeneficialOwner = {
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
}

export type Merchant = {
  id?: string
  businessName: string
  dba?: string
  taxId: string
  businessType: string
  yearEstablished: string
  website?: string
  isCurrentlyProcessing: string
  currentProcessor?: string
  hasBeenTerminated: string
  terminationExplanation?: string
  monthlyVolume: string
  averageTicket: string
  highTicket: string
  cardPresentPercentage: string
  ecommercePercentage: string
  motoPercentage: string
  beneficialOwners: BeneficialOwner[]
  documents: {
    businessLicense?: File[]
    voidedCheck?: File[]
    bankStatements?: File[]
  }
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: string
  updatedAt?: string
}
