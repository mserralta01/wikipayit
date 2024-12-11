import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { 
  Users, Phone, Send, FileText, 
  CheckCircle, MoreVertical, Mail, 
  MessageSquare, Clock, DollarSign,
  Building, Download, Plus,
  User, AtSign, Briefcase
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { merchantService } from '../../services/merchantService'
import { Merchant, Lead } from '../../types/merchant'
import { useNavigate } from 'react-router-dom'

type PipelineStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'
type PipelineItem = (Merchant | Lead) & { pipelineStatus: PipelineStatus }

type Column = {
  id: PipelineStatus
  title: string
  items: PipelineItem[]
}

const statusConfig = {
  lead: {
    label: 'Leads',
    icon: Users,
    color: 'bg-blue-100 text-blue-800'
  },
  phone: {
    label: 'Phone Calls',
    icon: Phone,
    color: 'bg-purple-100 text-purple-800'
  },
  offer: {
    label: 'Offer Sent',
    icon: Send,
    color: 'bg-yellow-100 text-yellow-800'
  },
  underwriting: {
    label: 'Underwriting',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800'
  },
  documents: {
    label: 'Documents',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800'
  }
} as const

const isLead = (item: PipelineItem): item is Lead & { pipelineStatus: PipelineStatus } => {
  return 'formData' in item
}

const isMerchant = (item: PipelineItem): item is Merchant & { pipelineStatus: PipelineStatus } => {
  return 'businessName' in item
}

// Calculate completion percentage based on filled fields
const calculateProgress = (item: PipelineItem): number => {
  if (isLead(item)) {
    // Handle Lead type
    const formData = item.formData || {}
    const totalFields = 20 // Adjust based on your total required fields
    const filledFields = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
    ).length
    return Math.round((filledFields / totalFields) * 100)
  } else if (isMerchant(item)) {
    // Handle Merchant type
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
  return 0
}

const getProgressColor = (progress: number): string => {
  if (progress < 25) return 'bg-red-400'
  if (progress < 50) return 'bg-amber-400'
  if (progress < 75) return 'bg-blue-400'
  return 'bg-emerald-400'
}

export default function Pipeline() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['pipeline-items'],
    queryFn: () => merchantService.getPipelineItems()
  })

  const updateItemStatus = useMutation({
    mutationFn: async (variables: { id: string; status: PipelineStatus }) => {
      // Map pipeline status to merchant status
      const merchantStatus = variables.status === 'approved' ? 'approved' : 'pending'
      await merchantService.updateMerchantStatus(variables.id, merchantStatus)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
    }
  })

  const columns: Column[] = [
    'lead',
    'phone',
    'offer',
    'underwriting',
    'documents',
    'approved'
  ].map(status => ({
    id: status as PipelineStatus,
    title: statusConfig[status as PipelineStatus].label,
    items: items?.filter(item => item.pipelineStatus === status) || []
  }))

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as PipelineStatus

    await updateItemStatus.mutateAsync({
      id: draggableId,
      status: newStatus
    })
  }

  const handleCardClick = (item: PipelineItem) => {
    if (item.id) {
      navigate(`/admin/merchants/${item.id}`)
    }
  }

  const renderCardContent = (item: PipelineItem) => {
    const progress = calculateProgress(item)
    const progressColor = getProgressColor(progress)

    if (isLead(item)) {
      // Lead card
      const { email, formData } = item
      return (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <AtSign className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">{email}</p>
              </div>
              {formData?.businessName && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">{formData.businessName}</p>
                </div>
              )}
              {formData?.firstName && formData?.lastName && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    {`${formData.firstName} ${formData.lastName}`}
                  </p>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Application Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className={progressColor} />
          </div>
        </>
      )
    } else if (isMerchant(item)) {
      // Merchant card
      return (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <h3 className="font-medium">{item.businessName}</h3>
              {item.dba && (
                <p className="text-sm text-gray-500">DBA: {item.dba}</p>
              )}
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">{item.businessType}</p>
              </div>
              {item.monthlyVolume && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    ${Number(item.monthlyVolume).toLocaleString()}/mo
                  </p>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Application Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className={progressColor} />
          </div>
        </>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {React.createElement(statusConfig[column.id].icon, {
                    className: 'h-5 w-5 text-gray-500'
                  })}
                  <h2 className="font-semibold">{column.title}</h2>
                </div>
                <Badge variant="secondary">{column.items.length}</Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id || ''}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(item)}
                            className={`
                              cursor-pointer transform transition-all duration-200
                              ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}
                            `}
                          >
                            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                              <CardContent className="p-4">
                                {renderCardContent(item)}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
