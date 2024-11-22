import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, Phone, Send, FileText, 
  CheckCircle, MoreVertical, Mail, 
  MessageSquare, Clock, DollarSign,
  Building, Download, Plus 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { merchantService } from '@/services/merchantService'

type MerchantStatus = 'lead' | 'phone' | 'offer' | 'underwriting' | 'documents' | 'approved'

type Merchant = {
  id: string
  businessName: string
  contactName: string
  status: MerchantStatus
  businessType?: string
  processingVolume?: number
  phone?: string
  createdAt: Date
  updatedAt: Date
}

type Column = {
  id: MerchantStatus
  title: string
  items: Merchant[]
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

export default function Pipeline() {
  const queryClient = useQueryClient()
  
  const { data: merchants, isLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: () => merchantService.getMerchants()
  })

  const updateMerchantStatus = useMutation({
    mutationFn: (variables: { merchantId: string; status: MerchantStatus }) =>
      merchantService.updateMerchantStatus(variables.merchantId, variables.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
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
    id: status as MerchantStatus,
    title: statusConfig[status as MerchantStatus].label,
    items: merchants?.filter(m => m.status === status) || []
  }))

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as MerchantStatus

    await updateMerchantStatus.mutateAsync({
      merchantId: draggableId,
      status: newStatus
    })
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
                    {column.items.map((merchant, index) => (
                      <Draggable
                        key={merchant.id}
                        draggableId={merchant.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">{merchant.businessName}</h3>
                                    <p className="text-sm text-gray-500">{merchant.contactName}</p>
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