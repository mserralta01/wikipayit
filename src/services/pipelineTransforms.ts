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

const VALID_STATUSES = ['lead', 'phone', 'offer', 'underwriting', 'documents', 'approved'] as const;

export const validateServiceItem = (item: ServiceResponse): item is ServiceResponse & { id: string; pipelineStatus: PipelineStatus } => {
  return Boolean(item.id) && 
    Boolean(item.pipelineStatus) && 
    VALID_STATUSES.includes(item.pipelineStatus as PipelineStatus)
}

export const createServiceItem = (item: ServiceResponse & { id: string; pipelineStatus: PipelineStatus }): ServiceItem => {
  const { id, pipelineStatus, ...rest } = item;
  if ('formData' in item) {
    return {
      ...rest,
      id,
      kind: 'lead',
      pipelineStatus: pipelineStatus as PipelineStatus,
      position: item.position || 0
    } as ServiceLead;
  }
  return {
    ...rest,
    id,
    kind: 'merchant',
    pipelineStatus: pipelineStatus as PipelineStatus,
    position: item.position || 0
  } as ServiceMerchant;
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
  const defaultStatus: PipelineStatus = 'lead';
  
  if (item.kind === 'lead') {
    return {
      ...item,
      type: 'lead',
      pipelineStatus: item.pipelineStatus || defaultStatus,
      position: typeof item.position === 'number' ? item.position : 0
    } as PipelineLead;
  }
  return {
    ...item,
    type: 'merchant',
    pipelineStatus: item.pipelineStatus || defaultStatus,
    position: typeof item.position === 'number' ? item.position : 0
  } as PipelineMerchant;
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
