import { Merchant, Lead } from './merchant'

export type PipelineStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'
export type ServiceStatus = 'lead' | 'approved'

// Base types with discriminators
export interface BaseMerchant extends Omit<Merchant, 'id'> {
  id: string
  kind: 'merchant'
  type: 'merchant'
}

export interface BaseLead extends Omit<Lead, 'id'> {
  id: string
  kind: 'lead'
  type: 'lead'
}

// Pipeline types
export interface PipelineMerchant extends BaseMerchant {
  pipelineStatus: PipelineStatus
}

export interface PipelineLead extends BaseLead {
  pipelineStatus: PipelineStatus
}

export type PipelineItem = PipelineMerchant | PipelineLead

// Service types
export interface ServiceMerchant extends BaseMerchant {
  pipelineStatus: ServiceStatus
}

export interface ServiceLead extends BaseLead {
  pipelineStatus: ServiceStatus
}

export type ServiceItem = ServiceMerchant | ServiceLead

// Response type
export type ServiceResponse = (
  | (Omit<Merchant, 'id'> & { id?: string; pipelineStatus?: ServiceStatus })
  | (Omit<Lead, 'id'> & { id?: string; pipelineStatus?: ServiceStatus })
)

// Column types
export interface Column {
  id: PipelineStatus
  title: string
  color: string
  items: PipelineItem[]
}

// Constants
export const PIPELINE_STATUSES: readonly PipelineStatus[] = [
  'lead',
  'phone',
  'offer',
  'underwriting',
  'documents',
  'approved'
] as const

export const COLUMN_CONFIGS: Record<PipelineStatus, Omit<ColumnConfig, 'id'>> = {
  lead: {
    title: 'Leads',
    color: '#2196f3'
  },
  phone: {
    title: 'Phone Calls',
    color: '#9c27b0'
  },
  offer: {
    title: 'Offer Sent',
    color: '#ff9800'
  },
  underwriting: {
    title: 'Underwriting',
    color: '#f44336'
  },
  documents: {
    title: 'Documents',
    color: '#3f51b5'
  },
  approved: {
    title: 'Approved',
    color: '#4caf50'
  }
} as const

// Type guards
export const isPipelineMerchant = (item: PipelineItem): item is PipelineMerchant => {
  return item.kind === 'merchant'
}

export const isPipelineLead = (item: PipelineItem): item is PipelineLead => {
  return item.kind === 'lead'
}

export const isServiceMerchant = (item: ServiceItem): item is ServiceMerchant => {
  return item.kind === 'merchant'
}

export const isServiceLead = (item: ServiceItem): item is ServiceLead => {
  return item.kind === 'lead'
}
