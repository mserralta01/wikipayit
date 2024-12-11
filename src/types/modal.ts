import { PipelineStatus } from './pipeline'

// Simple types for modal display
export type ModalMerchantData = {
  kind: 'merchant'
  id: string
  businessName: string
  businessType: string
  dba?: string | null
  monthlyVolume?: string | null
  pipelineStatus: PipelineStatus
}

export type ModalLeadData = {
  kind: 'lead'
  id: string
  email: string
  pipelineStatus: PipelineStatus
  formData?: {
    firstName?: string
    lastName?: string
    businessName?: string
  } | null
}

export type ModalData = ModalMerchantData | ModalLeadData
