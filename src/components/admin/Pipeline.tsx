import React from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { 
  Users, Phone, Send, FileText, 
  CheckCircle, MoreVertical, Mail, 
  MessageSquare, Clock, DollarSign,
  Plus 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { merchantService } from '../../services/merchantService'
import { Merchant, MerchantStatus } from '../../types/merchant'

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

type MerchantCardProps = {
  merchant: Merchant
  onStatusChange: (merchantId: string, newStatus: MerchantStatus) => void
}

const MerchantCard = ({ merchant, onStatusChange }: MerchantCardProps) => {
  const StatusIcon = statusConfig[merchant.status].icon

  return (
    <Card className="mb-4">
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
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(merchant.id, status as MerchantStatus)}
                  disabled={status === merchant.status}
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            {merchant.email}
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            {merchant.phone}
          </div>
          {merchant.processingVolume && (
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              ${merchant.processingVolume.toLocaleString()}
            </div>
          )}
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {new Date(merchant.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary" className={statusConfig[merchant.status].color}>
            {statusConfig[merchant.status].label}
          </Badge>
          {merchant.processingVolume && merchant.processingVolume > 100000 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              High Value
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Pipeline() {
  const { data: merchants, isLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: () => merchantService.getAllMerchants()
  })

  const handleStatusChange = async (merchantId: string, newStatus: MerchantStatus) => {
    try {
      await merchantService.updateMerchantStatus(merchantId, newStatus)
      // React Query will automatically refetch the merchants
    } catch (error) {
      console.error('Error updating merchant status:', error)
      // Add toast notification here
    }
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

  const columns = Object.entries(statusConfig).map(([status, config]) => {
    const columnMerchants = merchants?.filter(m => m.status === status) || []
    
    return (
      <div key={status} className="flex-1 min-w-[300px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <config.icon className="h-5 w-5 mr-2" />
            <h2 className="font-semibold">{config.label}</h2>
          </div>
          <Badge variant="secondary">{columnMerchants.length}</Badge>
        </div>
        
        <div className="space-y-4">
          {columnMerchants.map(merchant => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    )
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8">
        {columns}
      </div>
    </div>
  )
} 