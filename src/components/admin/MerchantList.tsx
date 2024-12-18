import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '../../components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { 
  MoreVertical, 
  Search, 
  Plus,
  Mail,
  FileText,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { merchantService } from '../../services/merchantService'
import { Merchant, timestampToString } from '../../types/merchant'
import { PipelineStatus } from '../../types/pipeline'

const statusColors: Record<PipelineStatus, string> = {
  lead: 'bg-blue-100 text-blue-800',
  phone: 'bg-purple-100 text-purple-800',
  offer: 'bg-yellow-100 text-yellow-800',
  underwriting: 'bg-orange-100 text-orange-800',
  documents: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800'
}

export default function MerchantList() {
  const { data: merchants, isLoading } = useQuery<Merchant[], Error>({
    queryKey: ['merchants'],
    queryFn: () => merchantService.getMerchants()
  })

  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return 'N/A'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const getContactName = (merchant: Merchant) => {
    if (merchant.beneficialOwners?.[0]) {
      const owner = merchant.beneficialOwners[0]
      return `${owner.firstName} ${owner.lastName}`
    }
    return 'N/A'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2">Loading merchants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Merchants</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search merchants..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processing Volume</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants?.map((merchant: Merchant) => {
              const status = merchant.pipelineStatus || merchant.status || 'lead'
              const statusColor = statusColors[status as PipelineStatus] || 'bg-gray-100 text-gray-800'
              const createdDate = timestampToString(merchant.createdAt)
              const contactName = getContactName(merchant)
              
              return (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">
                    {merchant.businessName}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{contactName}</div>
                      <div className="text-sm text-gray-500">{merchant.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(merchant.formData?.monthlyVolume)}
                  </TableCell>
                  <TableCell>
                    {formatDate(createdDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
