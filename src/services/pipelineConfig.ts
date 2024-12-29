import { PipelineStatus } from '../types/pipeline'

export interface ColumnConfig {
  id: PipelineStatus;
  label: string;
  color: string;
  position: number;
}

export const statusConfig: Record<PipelineStatus, Omit<ColumnConfig, 'id' | 'position'>> = {
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
} as const;

export const defaultColumnConfigs: ColumnConfig[] = Object.entries(statusConfig).map(([id, config], index) => ({
  id: id as PipelineStatus,
  ...config,
  position: index
}));

export const getStatusColor = (status: PipelineStatus): string => {
  return statusConfig[status].color;
}

export const getStatusLabel = (status: PipelineStatus): string => {
  return statusConfig[status].label;
}

export const getDefaultColumnConfig = (status: PipelineStatus): ColumnConfig => {
  const config = defaultColumnConfigs.find(c => c.id === status);
  if (!config) {
    throw new Error(`No default configuration found for status: ${status}`);
  }
  return config;
}

export const validateColumnConfig = (config: Partial<ColumnConfig>): boolean => {
  if (!config.id || !Object.keys(statusConfig).includes(config.id)) {
    return false;
  }
  
  if (typeof config.position !== 'number' || config.position < 0) {
    return false;
  }
  
  return true;
};
