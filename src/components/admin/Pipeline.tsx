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

const calculateProgress = (item: PipelineItem): number => {
  if (isPipelineLead(item)) {
    const formData = item.formData || {}
    const totalFields = 20
    const filledFields = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
    ).length
    return Math.round((filledFields / totalFields) * 100)
  } else {
    const requiredFields = [
      'businessName',
      'taxId',
      'businessType',
      'yearEstablished',
      'monthlyVolume',
      'averageTicket',
      'beneficialOwners',
      'bankDetails'
    ]
    const filledFields = requiredFields.filter(field => {
      const value = item[field as keyof PipelineMerchant]
      return value !== undefined && value !== null && value !== ''
    }).length
    return Math.round((filledFields / requiredFields.length) * 100)
  }
}

const Pipeline: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null)
  const queryClient = useQueryClient()

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['pipeline'],
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
        pipelineStatus: lead.pipelineStatus || 'lead',
        companyName: lead.companyName,
        id: lead.id || crypto.randomUUID(), // Ensure id is always defined
      }))

      // Transform merchants into pipeline items
      const pipelineMerchants = merchants.map((merchant: Merchant): PipelineMerchant => ({
        ...merchant,
        kind: 'merchant' as const,
        type: 'merchant' as const,
        pipelineStatus: merchant.pipelineStatus || 'lead',
        id: merchant.id || crypto.randomUUID(), // Ensure id is always defined
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
    if (pipelineData) {
      setColumns(pipelineData)
    }
  }, [pipelineData])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result

    if (!destination || !columns) return

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const newColumns = [...columns]
    const sourceItems = [...sourceColumn.items]
    const destItems = sourceColumn === destColumn ? sourceItems : [...destColumn.items]

    const [removed] = sourceItems.splice(source.index, 1)
    const updatedItem = {
      ...removed,
      pipelineStatus: destColumn.id as PipelineStatus
    }

    destItems.splice(destination.index, 0, updatedItem)

    newColumns.forEach(col => {
      if (col.id === source.droppableId) {
        col.items = sourceItems
      }
      if (col.id === destination.droppableId) {
        col.items = destItems
      }
    })

    setColumns(newColumns)

    try {
      if (isPipelineLead(updatedItem)) {
        await merchantService.updateLead(updatedItem.id, {
          pipelineStatus: destColumn.id as PipelineStatus
        })
      } else if (isPipelineMerchant(updatedItem)) {
        await merchantService.updateMerchant(updatedItem.id, {
          pipelineStatus: destColumn.id as PipelineStatus
        })
      }
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    } catch (error) {
      console.error('Error updating item status:', error)
      // Revert the UI state on error
      if (pipelineData) {
        setColumns(pipelineData)
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
          open={true}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </div>
  )
}

interface CardProps {
  item: PipelineLead | PipelineMerchant
}

const LeadCard: React.FC<CardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
        >
          {item.pipelineStatus}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="text-sm">{item.email}</span>
      </div>
      {isPipelineLead(item) && item.formData?.businessName && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {item.formData.businessName}
          </span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  )
}

const MerchantCard: React.FC<CardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
        >
          {item.pipelineStatus}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-500" />
        <span className="text-sm">
          {isPipelineMerchant(item) ? item.businessName : 'N/A'}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

export default Pipeline
