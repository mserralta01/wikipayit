import React from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { 
  FileText, 
  MoreVertical, 
  Mail, 
  MessageSquare, 
  Clock,
  DollarSign,
  Phone,
  Building,
  Download
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
import { Merchant } from '../../types/merchant'

export default function Applications() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => merchantService.getApplications()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Applications</h1>
      </div>

      <div className="grid gap-6">
        {applications?.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{application.businessName}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{application.contactName}</p>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Building className="h-4 w-4 mr-2" />
                    Business Type
                  </div>
                  <p className="text-sm font-medium">{application.businessType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Monthly Volume
                  </div>
                  <p className="text-sm font-medium">
                    ${application.processingVolume?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </div>
                  <p className="text-sm font-medium">{application.phone}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    Submitted
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-4">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Documents
                </Button>
                <Button size="sm">
                  Process Application
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 