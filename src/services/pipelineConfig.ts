import { PipelineStatus } from '../types/pipeline'

export const statusConfig = {
  lead: {
    label: 'Leads',
    color: '#2196f3'
  },
  phone: {
    label: 'Phone Calls',
    color: '#9c27b0'
  },
  offer: {
    label: 'Offer Sent',
    color: '#ff9800'
  },
  underwriting: {
    label: 'Underwriting',
    color: '#f44336'
  },
  documents: {
    label: 'Documents',
    color: '#3f51b5'
  },
  approved: {
    label: 'Approved',
    color: '#4caf50'
  }
} as const

export const getStatusColor = (status: PipelineStatus): string => {
  return statusConfig[status].color
}

export const getStatusLabel = (status: PipelineStatus): string => {
  return statusConfig[status].label
}
