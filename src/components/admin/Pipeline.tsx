import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { Mail, Building2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { writeBatch, doc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { merchantService } from '../../services/merchantService'
import { CardModal } from './CardModal'
import {
  PipelineStatus,
  PipelineItem,
  PipelineLead,
  PipelineMerchant,
  PIPELINE_STATUSES,
  COLUMN_CONFIGS,
  isPipelineLead,
  isPipelineMerchant
} from '../../types/pipeline'
import { Lead, Merchant, timestampToString } from '../../types/merchant'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { cn } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'

interface PipelineFormData {
  beneficialOwners?: {
    owners: Array<{
      firstName: string
      lastName: string
      phone?: string
    }>
  }
  businessName?: string
  dba?: string
  phone?: string
  email?: string
}

interface Column {
  id: PipelineStatus
  title: string
  items: PipelineItem[]
  color: string
}

const sections = {
  basicInfo: {
    fields: ['email', 'formData'] as Array<'email' | 'formData'>,
    weight: 10,
    required: true
  },
  businessDetails: {
    fields: ['formData'] as const,
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
    fields: ['formData'] as const,
    weight: 20,
    required: true
  },
  bankDetails: {
    fields: ['formData'] as const,
    weight: 20,
    required: true
  }
} as const

function hasPipelineFormData(item: any): item is { formData: PipelineFormData } {
  return 'formData' in item
}

function getProgressColor(progress: number): string {
  if (progress <= 5) return 'bg-green-900'
  if (progress <= 15) return 'bg-green-800'
  if (progress <= 25) return 'bg-green-700'
  if (progress <= 35) return 'bg-green-600'
  if (progress <= 45) return 'bg-green-500'
  if (progress <= 55) return 'bg-green-400'
  if (progress <= 65) return 'bg-green-300'
  if (progress <= 75) return 'bg-green-200'
  if (progress <= 85) return 'bg-green-100'
  if (progress <= 95) return 'bg-gray-200'
  return 'bg-gray-100'
}

function calculateProgress(item: PipelineMerchant | PipelineLead): { value: number; color: string } {
  let completedSections = 0
  let totalWeight = 0

  Object.values(sections).forEach(section => {
    totalWeight += section.weight

    if ('fields' in section && section.fields) {
      const hasAllFields = section.fields.every(field => {
        if (field === 'formData') {
          return hasPipelineFormData(item)
        }
        if (field === 'email') {
          return Boolean(item.email)
        }
        return false
      })

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

function getAgingInfo(updatedAt: string) {
  const lastUpdate = new Date(updatedAt)
  const now = new Date()
  const diffInMs = now.getTime() - lastUpdate.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return {
      color: 'text-green-500',
      text: diffInHours === 0 ? 'Just now' : `${diffInHours}h old`,
      animate: false
    }
  }

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
  }
  return {
    color: 'text-red-500',
    text: `${diffInDays} days old`,
    animate: true
  }
}

export function Pipeline() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleItemClick = (item: PipelineItem) => {
    window.location.href = `/admin/pipeline/${item.id}`
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
    setIsModalOpen(false)
  }

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['pipeline-items'],
    queryFn: async () => {
      const [leads, merchants] = await Promise.all([
        merchantService.getLeads(),
        merchantService.getMerchants()
      ])

      const initialColumns: Column[] = PIPELINE_STATUSES.map(status => ({
        ...COLUMN_CONFIGS[status],
        id: status,
        items: []
      }))

      // Convert leads to pipeline items, ensuring dates are strings
      const pipelineLeads = leads.map((lead: Lead): PipelineLead => ({
        id: lead.id || crypto.randomUUID(),
        kind: 'lead',
        type: 'lead',
        email: lead.email,
        pipelineStatus: (lead.pipelineStatus || 'lead') as PipelineStatus,
        createdAt: timestampToString(lead.createdAt),
        updatedAt: timestampToString(lead.updatedAt),
        phone: lead.phone,
        companyName: lead.companyName || 
          lead.formData?.businessName || 
          lead.formData?.dba || 
          lead.email,
        formData: lead.formData,
        position: lead.position ?? 0
      }))

      // Convert merchants to pipeline items, ensuring dates are strings
      const pipelineMerchants = merchants.map((m: Merchant): PipelineMerchant => ({
        id: m.id || crypto.randomUUID(),
        kind: 'merchant',
        type: 'merchant',
        email: m.email,
        pipelineStatus: (m.pipelineStatus || 'lead') as PipelineStatus,
        createdAt: timestampToString(m.createdAt),
        updatedAt: timestampToString(m.updatedAt),
        phone: m.phone,
        businessName: m.businessName || m.email,
        status: m.status,
        position: m.position ?? 0,
        formData: m.formData
          ? m.formData
          : {
              businessName: m.businessName,
              dba: m.dba,
              phone: m.phone,
              beneficialOwners: m.beneficialOwners
                ? {
                    owners: m.beneficialOwners.map(owner => ({
                      firstName: owner.firstName,
                      lastName: owner.lastName,
                      phone: owner.phone
                    }))
                  }
                : undefined
            }
      }))

      const allItems = [...pipelineLeads, ...pipelineMerchants]
      allItems.forEach(item => {
        const column = initialColumns.find(col => col.id === item.pipelineStatus)
        if (column) {
          column.items.push(item)
        } else {
          initialColumns[0].items.push({ ...item, pipelineStatus: 'lead' })
        }
      })

      // Sort items by position
      initialColumns.forEach(col => {
        col.items.sort((a: PipelineItem, b: PipelineItem) => (a.position ?? 0) - (b.position ?? 0))
      })

      return initialColumns
    }
  })

  // Initialize columns once when items are loaded
  useEffect(() => {
    if (items && items.length > 0 && columns.length === 0) {
      setColumns(items)
    }
  }, [items, columns.length])

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    // Return if dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    try {
      const sourceColumn = columns.find(col => col.id === source.droppableId)
      const destinationColumn = columns.find(col => col.id === destination.droppableId)
      if (!sourceColumn || !destinationColumn) {
        console.error('Source or destination column not found')
        return
      }

      const sourceItems = [...sourceColumn.items]
      const [movedItem] = sourceItems.splice(source.index, 1)
      const destinationItems = [...destinationColumn.items]

      // Update the item's status to match the destination column
      const updatedItem = {
        ...movedItem,
        pipelineStatus: destination.droppableId as PipelineStatus
      }

      // Insert item at new position
      destinationItems.splice(destination.index, 0, updatedItem)

      // Update positions for affected items
      destinationItems.forEach((it, idx) => {
        it.position = idx
      })

      // Update columns state
      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return {
            ...col,
            items: sourceItems
          }
        }
        if (col.id === destination.droppableId) {
          return {
            ...col,
            items: destinationItems
          }
        }
        return col
      })

      // Update state first
      setColumns(newColumns)

      // Then persist changes to Firestore
      const updates = {
        position: destination.index,
        ...(source.droppableId !== destination.droppableId && {
          pipelineStatus: destination.droppableId as PipelineStatus
        })
      }

      if (isPipelineMerchant(updatedItem)) {
        await merchantService.updateMerchant(updatedItem.id, updates)
      } else {
        await merchantService.updateLead(updatedItem.id, updates)
      }

      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive'
      })
    }
  }


  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }
  
  if (isError) {
    return <div className="p-4 text-red-500">Error loading pipeline items</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex p-2 overflow-auto">
          {columns.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-48 bg-white rounded-lg p-4 m-2 min-h-[calc(100vh-200px)] shadow-sm ${
                    snapshot.isDraggingOver ? 'bg-gray-50' : ''
                  }`}
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
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => handleItemClick(item)}
                          className={`bg-white rounded-lg p-4 mb-2 cursor-move shadow-sm transition-shadow ${
                            dragSnapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                          }`}
                        >
                          {isPipelineLead(item)
                            ? <LeadCard item={item} />
                            : <MerchantCard item={item} />}
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
      {/* Card details are now handled by LeadDetailView via React Router */}
    </div>
  )
}



const LeadCard: React.FC<{ item: PipelineLead }> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)
  const displayName = item.formData?.dba || item.companyName || item.email
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null
  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''
  const phoneNumber = beneficialOwner?.phone || item.phone
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
      {item.companyName && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-700">{item.companyName}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">{item.email}</span>
      </div>
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
      <Progress value={progress.value} className={cn("h-2", progress.color)} />
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

interface MerchantCardProps {
  item: PipelineMerchant
}

const MerchantCard: React.FC<MerchantCardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  const displayName = item.formData?.dba || item.businessName || item.email
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null
  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''
  const phoneNumber = beneficialOwner?.phone || item.phone
  const agingInfo = getAgingInfo(item.updatedAt)

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
      {item.businessName && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-700">{item.businessName}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">{item.email}</span>
      </div>

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
      <Progress value={progress.value} className={cn("h-2", progress.color)} />

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
