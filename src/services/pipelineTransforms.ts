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

export const calculateLeadProgress = (item: PipelineLead | ServiceLead): number => {
  const formFields = item.formData || {};
  const totalFields = 20;
  const filledFields = Object.keys(formFields).filter(key => 
    formFields[key as keyof typeof formFields] !== undefined && 
    formFields[key as keyof typeof formFields] !== null && 
    formFields[key as keyof typeof formFields] !== ''
  ).length;
  return Math.round((filledFields / totalFields) * 100);
}

interface RequiredMerchantFields {
  businessName?: string;
  taxId?: string;
  businessType?: string;
  yearEstablished?: string;
  monthlyVolume?: string;
  averageTicket?: string;
  beneficialOwners?: any[];
  bankDetails?: any;
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
  ] as const;
  
  const formData = ('formData' in item ? item.formData : {}) as RequiredMerchantFields;
  
  const filledFields = requiredFields.filter(field => {
    const value = formData[field as keyof RequiredMerchantFields];
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  return Math.round((filledFields / requiredFields.length) * 100);
};

export const calculateProgress = (item: ServiceItem | PipelineItem): number => {
  if (item.kind === 'lead') {
    return calculateLeadProgress(item as PipelineLead | ServiceLead)
  }
  return calculateMerchantProgress(item as PipelineMerchant | ServiceMerchant)
}

export const transformToPipelineItem = (item: ServiceItem): PipelineItem => {
  // Preserve the pipelineStatus rather than forcing 'lead'
  if (item.kind === 'lead') {
    return { 
      ...item, 
      pipelineStatus: item.pipelineStatus || 'lead' 
    } as PipelineLead
  }
  return { 
    ...item, 
    pipelineStatus: item.pipelineStatus || 'lead' 
  } as PipelineMerchant
}

export const transformServiceResponse = (items: ServiceResponse[]): PipelineItem[] => {
  return items
    .filter(validateServiceItem)
    .map(createServiceItem)
    .map(transformToPipelineItem)
}

export const validatePipelineItem = (item: PipelineMerchant | ServiceMerchant): boolean => {
  const requiredFields = ['businessName', 'taxId', 'businessType'] as const;
  const formData = ('formData' in item ? item.formData : {}) as RequiredMerchantFields;
  
  return requiredFields.every(field => 
    formData[field as keyof RequiredMerchantFields] !== undefined
  );
};
