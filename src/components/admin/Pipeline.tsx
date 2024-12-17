import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { Mail, Building2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { merchantService } from '../../services/merchantService'
import { CardModal } from './CardModal'
import {
  PipelineStatus,
  PipelineItem,
  PipelineLead,
  PipelineMerchant,
  Column,
  PIPELINE_STATUSES,
  COLUMN_CONFIGS,
  isPipelineLead,
  isPipelineMerchant
} from '../../types/pipeline'
import { Lead, Merchant } from '../../types/merchant'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Define section types
interface BaseSection {
  weight: number;
  required: boolean;
}

interface FieldSection extends BaseSection {
  fields: Array<keyof BasePipelineItem>;
  customCheck?: never;
}

interface CustomCheckSection extends BaseSection {
  fields?: never;
  customCheck: (data: PipelineFormData | undefined) => boolean;
}

type Section = FieldSection | CustomCheckSection;

// Update Progress component usage
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  className?: string;
}

const getProgressColor = (progress: number): string => {
  // Define more granular color stops for a smoother gradient from dark to light
  if (progress <= 5) {
    return 'bg-green-900'       // Darkest green
  } else if (progress <= 15) {
    return 'bg-green-800'       // Darker green
  } else if (progress <= 25) {
    return 'bg-green-700'       // Dark green
  } else if (progress <= 35) {
    return 'bg-green-600'       // Medium dark green
  } else if (progress <= 45) {
    return 'bg-green-500'       // Medium green
  } else if (progress <= 55) {
    return 'bg-green-400'       // Light medium green
  } else if (progress <= 65) {
    return 'bg-green-300'       // Lighter green
  } else if (progress <= 75) {
    return 'bg-green-200'       // Light green
  } else if (progress <= 85) {
    return 'bg-green-100'       // Very light green
  } else if (progress <= 95) {
    return 'bg-gray-200'        // Very light gray
  } else {
    return 'bg-gray-100'        // Almost white
  }
}

// Add these type definitions at the top of the file
interface PipelineFormData {
  beneficialOwners?: {
    owners: Array<{
      firstName: string;
      lastName: string;
      phone?: string;
    }>;
  };
  businessName?: string;
  dba?: string;
  phone?: string;
  email?: string;
}

// Update the PipelineMerchant interface to include formData
interface ExtendedPipelineMerchant extends PipelineMerchant {
  formData?: PipelineFormData;
}

// Add this after the ExtendedPipelineMerchant interface
const sections: Record<string, Section> = {
  basicInfo: {
    fields: ['email'] as Array<keyof BasePipelineItem>,
    weight: 10,
    required: true
  },
  businessDetails: {
    fields: ['formData'] as Array<keyof BasePipelineItem>,
    weight: 20,
    required: true
  },
  beneficialOwners: {
    weight: 30,
    required: true,
    customCheck: (data: PipelineFormData | undefined) => 
      Boolean(data?.beneficialOwners?.owners?.length)
  },
  processingInfo: {
    fields: ['formData'],
    weight: 20,
    required: true
  },
  bankDetails: {
    fields: ['formData'],
    weight: 20,
    required: true
  }
}

// Update the base interface for both types
interface BasePipelineItem {
  id: string;
  email: string;
  phone?: string;
  formData?: PipelineFormData;
  pipelineStatus: PipelineStatus;
  createdAt: string;
  updatedAt: string;
}

function hasPipelineFormData(item: any): item is { formData: PipelineFormData } {
  return 'formData' in item;
}

function hasPhone(item: PipelineMerchant | PipelineLead): item is PipelineMerchant | PipelineLead & { phone: string } {
  return 'phone' in item && typeof item.phone === 'string';
}

const calculateProgress = (item: PipelineMerchant | PipelineLead): { value: number; color: string } => {
  let completedSections = 0
  let totalWeight = 0

  Object.entries(sections).forEach(([, section]) => {
    totalWeight += section.weight

    if ('fields' in section && section.fields) {
      const hasAllFields = section.fields.every(
        field => {
          if (field === 'formData') {
            return hasPipelineFormData(item);
          }
          // Handle each field explicitly
          switch (field) {
            case 'id':
            case 'email':
            case 'pipelineStatus':
            case 'createdAt':
            case 'updatedAt':
              return Boolean(item[field]);
            case 'phone':
              return hasPhone(item);
            default:
              return false;
          }
        }
      )
      if (hasAllFields) {
        completedSections += section.weight
      }
    } else if ('customCheck' in section) {
      if (hasPipelineFormData(item) && section.customCheck(item.formData)) {
        completedSections += section.weight
      }
    }
  })

  const value = Math.round((completedSections / totalWeight) * 100)
  return {
    value,
    color: getProgressColor(value)
  }
}

const getAgingInfo = (updatedAt: string) => {
  const lastUpdate = new Date(updatedAt)
  const now = new Date()
  
  // Calculate the difference in milliseconds
  const diffInMs = now.getTime() - lastUpdate.getTime()
  
  // Convert to hours for more precise aging
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    // Less than 1 day
    return {
      color: 'text-green-500',
      text: diffInHours === 0 ? 'Just now' : `${diffInHours}h old`,
      animate: false
    }
  }
  
  // Calculate days
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays <= 2) {
    return {
      color: 'text-green-500',
      text: `${diffInDays} day${diffInDays === 1 ? '' : 's'} old`,
      animate: false
    }
  } else if (diffInDays <= 4) {
    return {
      color: 'text-orange-500',
      text: `${diffInDays} days old`,
      animate: false
    }
  } else {
    return {
      color: 'text-red-500',
      text: `${diffInDays} days old`,
      animate: true
    }
  }
}

const Pipeline: React.FC = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null)
  const [columns, setColumns] = useState<Column[]>([])

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['pipeline-items'],
    queryFn: async () => {
      const [leads, merchants] = await Promise.all([
        merchantService.getLeads(),
        merchantService.getMerchants()
      ])
      
      // Initialize columns with empty arrays
      const initialColumns: Column[] = PIPELINE_STATUSES.map(status => ({
        ...COLUMN_CONFIGS[status],
        id: status,
        items: [] as PipelineItem[]
      }))

      // Transform leads into pipeline items
      const pipelineLeads = leads.map((lead: Lead): PipelineLead => ({
        ...lead,
        kind: 'lead' as const,
        type: 'lead' as const,
        pipelineStatus: 'lead', // Always start as lead
        companyName: lead.companyName || lead.formData?.businessName || lead.formData?.dba || lead.email,
        id: lead.id || crypto.randomUUID(),
      }))

      // Transform merchants into pipeline items
      const pipelineMerchants = merchants.map((merchant: Merchant): ExtendedPipelineMerchant => ({
        ...merchant,
        kind: 'merchant' as const,
        type: 'merchant' as const,
        pipelineStatus: merchant.pipelineStatus || 'lead', // Default to lead if not set
        id: merchant.id || crypto.randomUUID(),
      }))

      // Distribute items to columns
      const allItems = [...pipelineLeads, ...pipelineMerchants]
      allItems.forEach(item => {
        const column = initialColumns.find(col => col.id === item.pipelineStatus)
        if (column) {
          column.items.push(item)
        } else {
          // If no pipeline status or invalid status, put in leads column
          initialColumns[0].items.push({ ...item, pipelineStatus: 'lead' })
        }
      })

      return initialColumns
    }
  })

  useEffect(() => {
    if (items) {
      setColumns(items)
    }
  }, [items])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    
    const { source, destination, draggableId } = result

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const item = sourceColumn.items.find(i => i.id === draggableId)
    if (!item) return

    try {
      // Create new columns array to maintain immutability
      const newColumns = columns.map(col => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            items: col.items.filter(i => i.id !== draggableId)
          }
        }
        if (col.id === destColumn.id) {
          const updatedItem = { ...item, pipelineStatus: destColumn.id as PipelineStatus }
          return {
            ...col,
            items: [
              ...col.items.slice(0, destination.index),
              updatedItem,
              ...col.items.slice(destination.index)
            ]
          }
        }
        return col
      })

      setColumns(newColumns)

      // Update in database
      if (isPipelineMerchant(item)) {
        await merchantService.updateMerchantStatus(
          item.id,
          item.status || 'pending',
          destColumn.id as PipelineStatus
        )
      } else {
        await merchantService.updateLeadStatus(
          item.id,
          destColumn.id as PipelineStatus
        )
      }

      // Send email notification
      await fetch('/api/notify-status-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          itemType: item.kind,
          newStatus: destColumn.id,
          oldStatus: sourceColumn.id,
          name: isPipelineMerchant(item) ? item.businessName : item.companyName
        }),
      })

      toast({
        title: 'Status Updated',
        description: `${isPipelineMerchant(item) ? item.businessName : item.companyName} moved to ${destColumn.title}`,
      })

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })

      // Revert columns on error
      if (items) {
        setColumns(items)
      }
    }
  }

  const handleItemClick = (item: PipelineItem) => {
    setSelectedItem(item)
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex p-2 overflow-auto">
          {columns.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 bg-white rounded-lg p-4 m-2 min-h-[calc(100vh-200px)] shadow-sm"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {column.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {column.items.length} items
                    </p>
                  </div>
                  {column.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleItemClick(item)}
                          className="bg-white rounded-lg p-4 mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow"
                        >
                          {isPipelineLead(item) ? (
                            <LeadCard item={item} />
                          ) : (
                            <MerchantCard item={item} />
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedItem && (
        <CardModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStatusChange={async (newStatus: PipelineStatus) => {
            try {
              if (isPipelineMerchant(selectedItem)) {
                await merchantService.updateMerchantStatus(
                  selectedItem.id,
                  selectedItem.status || 'pending',
                  newStatus
                )
              } else {
                await merchantService.updateLeadStatus(
                  selectedItem.id,
                  newStatus
                )
              }
              queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
              setSelectedItem(null)
            } catch (error) {
              console.error('Error updating status:', error)
              toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
              })
            }
          }}
        />
      )}
    </div>
  )
}

const LeadCard: React.FC<{ item: PipelineLead }> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  // Get the display name in order of preference: DBA > Company Name > Email
  const displayName = item.formData?.dba || item.companyName || item.email
  
  // Get the beneficial owner information from the correct path
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null

  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''

  // Get phone number from the correct path in beneficial owners
  const phoneNumber = beneficialOwner?.phone || item.formData?.phone

  const agingInfo = getAgingInfo(item.updatedAt || new Date().toISOString())

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
          className="truncate max-w-[200px]"
        >
          {displayName}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>
      
      {/* Beneficial Owner Name */}
      {fullName && (
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm font-medium">{fullName}</span>
        </div>
      )}

      {/* Company Name */}
      {item.companyName && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-700">{item.companyName}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">{item.email}</span>
      </div>

      {/* Phone Number */}
      {phoneNumber && (
        <div className="flex items-center gap-2">
          <svg 
            className="h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-sm text-gray-600">{phoneNumber}</span>
        </div>
      )}

      <Progress 
        value={progress.value} 
        className={cn("h-2", progress.color)}
      />
      
      {/* Aging Indicator */}
      <div className="flex items-center justify-end">
        <span 
          className={cn(
            "text-xs font-medium",
            agingInfo.color,
            agingInfo.animate && "animate-pulse"
          )}
        >
          {agingInfo.text}
        </span>
      </div>
    </div>
  )
}

// Update the MerchantCard component props type
interface MerchantCardProps {
  item: (PipelineMerchant | PipelineLead) & {
    formData?: PipelineFormData;
    dba?: string;
    businessName?: string;
  };
}

const MerchantCard: React.FC<MerchantCardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  // Get the display name in order of preference: DBA > Business Name > Email
  const displayName = item.dba || item.businessName || item.email

  // Get the beneficial owner information from the correct path
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null

  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''

  // Get phone number from the correct path in beneficial owners
  const phoneNumber = beneficialOwner?.phone || (hasPhone(item) ? item.phone : undefined);

  const agingInfo = getAgingInfo(item.updatedAt || new Date().toISOString())

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
          className="truncate max-w-[200px]"
        >
          {displayName}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>

      {/* Beneficial Owner Name */}
      {fullName && (
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm font-medium">{fullName}</span>
        </div>
      )}

      {/* Company Name */}
      {item.businessName && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-700">{item.businessName}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">{item.email}</span>
      </div>

      {/* Phone Number */}
      {phoneNumber && (
        <div className="flex items-center gap-2">
          <svg 
            className="h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-sm text-gray-600">{phoneNumber}</span>
        </div>
      )}

      <Progress 
        value={progress.value} 
        className={cn("h-2", progress.color)}
      />
      
      {/* Aging Indicator */}
      <div className="flex items-center justify-end">
        <span 
          className={cn(
            "text-xs font-medium",
            agingInfo.color,
            agingInfo.animate && "animate-pulse"
          )}
        >
          {agingInfo.text}
        </span>
      </div>
    </div>
  )
}

export default Pipeline
