import { 
  ServiceResponse, 
  ServiceItem, 
  PipelineItem, 
  PipelineStatus,
  ServiceMerchant,
  ServiceLead,
  PipelineMerchant,
  PipelineLead
} from '../types/pipeline'

export const validateServiceItem = (item: ServiceResponse): item is ServiceResponse & { id: string; pipelineStatus: 'lead' | 'approved' } => {
  return Boolean(item.id) && 
    Boolean(item.pipelineStatus) && 
    (item.pipelineStatus === 'lead' || item.pipelineStatus === 'approved')
}

export const createServiceItem = (item: ServiceResponse & { id: string; pipelineStatus: 'lead' | 'approved' }): ServiceItem => {
  if ('formData' in item) {
    return {
      ...item,
      kind: 'lead',
      type: 'lead',
      id: item.id,
      pipelineStatus: 'lead'
    } as ServiceLead
  }
  return {
    ...item,
    kind: 'merchant',
    type: 'merchant',
    id: item.id,
    pipelineStatus: 'lead'
  } as ServiceMerchant
}

export const calculatePipelineStatus = (progress: number): PipelineStatus => {
  if (progress >= 80) return 'documents'
  if (progress >= 60) return 'underwriting'
  if (progress >= 40) return 'offer'
  if (progress >= 20) return 'phone'
  return 'lead'
}

export const calculateLeadProgress = (item: ServiceLead | PipelineLead): number => {
  const formData = item.formData || {}
  const totalFields = 20
  const filledFields = Object.keys(formData).filter(key => 
    formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
  ).length
  return Math.round((filledFields / totalFields) * 100)
}

export const calculateMerchantProgress = (item: ServiceMerchant | PipelineMerchant): number => {
  const requiredFields = [
    'businessName',
    'taxId',
    'businessType',
    'yearEstablished',
    'monthlyVolume',
    'averageTicket',
    'beneficialOwners',
    'bankDetails'
  ] as const
  
  const filledFields = requiredFields.filter(field => {
    const value = item[field]
    return value !== undefined && value !== null && value !== ''
  }).length
  
  return Math.round((filledFields / requiredFields.length) * 100)
}

export const calculateProgress = (item: ServiceItem | PipelineItem): number => {
  if (item.kind === 'lead') {
    return calculateLeadProgress(item as PipelineLead | ServiceLead)
  }
  return calculateMerchantProgress(item as PipelineMerchant | ServiceMerchant)
}

export const transformToPipelineItem = (item: ServiceItem): PipelineItem => {
  if (item.kind === 'lead') {
    return { ...item, pipelineStatus: 'lead' } as PipelineLead
  }
  return { ...item, pipelineStatus: 'lead' } as PipelineMerchant
}

export const transformServiceResponse = (items: ServiceResponse[]): PipelineItem[] => {
  return items
    .filter(validateServiceItem)
    .map(createServiceItem)
    .map(transformToPipelineItem)
}
