import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { styled } from '@mui/material/styles'
import {
  Box,
  Chip,
  Typography,
  LinearProgress,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { merchantService } from '../../services/merchantService'
import { CardModal } from './CardModal'
import { format } from 'date-fns'
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

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#f5f5f5'
})

const ColumnContainer = styled(Box)({
  width: 280,
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 16,
  margin: 8,
  minHeight: 'calc(100vh - 200px)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
})

const CardContainer = styled(Box)({
  backgroundColor: '#fff',
  borderRadius: 8,
  margin: '8px 0',
  padding: 16,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
})

const ProgressBar = styled(LinearProgress)({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4
  }
})

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
      const value = item[field as keyof Merchant]
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
      const pipelineLeads = leads.map((lead: Lead) => ({
        ...lead,
        kind: 'lead' as const,
        type: 'lead' as const,
        pipelineStatus: lead.pipelineStatus || 'lead'
      }))

      // Transform merchants into pipeline items
      const pipelineMerchants = merchants.map((merchant: Merchant) => ({
        ...merchant,
        kind: 'merchant' as const,
        type: 'merchant' as const,
        pipelineStatus: merchant.pipelineStatus || 'lead'
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
    return <Box p={4}>Loading...</Box>
  }

  return (
    <Root>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" p={2} overflow="auto">
          {columns.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <ColumnContainer
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <Box mb={2}>
                    <Typography variant="h6" color="textSecondary">
                      {column.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {column.items.length} items
                    </Typography>
                  </Box>
                  {column.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <CardContainer
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleItemClick(item)}
                        >
                          {isPipelineLead(item) ? (
                            <LeadCard item={item} />
                          ) : (
                            <MerchantCard item={item} />
                          )}
                        </CardContainer>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ColumnContainer>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>
      {selectedItem && (
        <CardModal
          open={true}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </Root>
  )
}

interface CardProps {
  item: PipelineLead | PipelineMerchant
}

const LeadCard: React.FC<CardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={1}>
        <Chip
          label={item.pipelineStatus}
          size="small"
          sx={{ backgroundColor: config.color, color: '#fff' }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1}>
        <EmailIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2">{item.email}</Typography>
      </Box>
      {isPipelineLead(item) && item.formData?.businessName && (
        <Box display="flex" alignItems="center" mb={1}>
          <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {item.formData.businessName}
          </Typography>
        </Box>
      )}
      <ProgressBar variant="determinate" value={progress} />
    </Box>
  )
}

const MerchantCard: React.FC<CardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={1}>
        <Chip
          label={item.pipelineStatus}
          size="small"
          sx={{ backgroundColor: config.color, color: '#fff' }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1}>
        <BusinessIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2">
          {isPipelineMerchant(item) ? item.businessName : 'N/A'}
        </Typography>
      </Box>
      <ProgressBar variant="determinate" value={progress} />
    </Box>
  )
}

export default Pipeline
