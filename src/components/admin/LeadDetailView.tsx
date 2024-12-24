import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Merchant as PipelineMerchant, Lead, timestampToString } from "@/types/merchant"
import { merchantService } from "@/services/merchantService"
import { LeadDetails } from "./lead/LeadDetails"
// Components are now rendered inside LeadDetails
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../../components/ui/breadcrumb"

type PipelineItemData = PipelineMerchant | Lead

export function LeadDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: item, isLoading, error } = useQuery<PipelineItemData, Error>({
    queryKey: ['pipeline-item', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided')

      // Try to get merchant first
      const merchant = await merchantService.getMerchant(id)
      if (merchant) return merchant as PipelineItemData

      // If not found in merchants, try leads
      const leads = await merchantService.getLeads()
      const lead = leads.find(l => l.id === id)
      if (lead) return lead as PipelineItemData

      throw new Error('Item not found')
    },
    enabled: !!id,
  })

  const handleBack = () => {
    navigate('/admin/pipeline')
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex gap-8">
          <div className="w-[35%] space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="w-[65%]">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading details. Please try again.
      </div>
    )
  }

  const isPipelineMerchant = (item: PipelineItemData): item is PipelineMerchant => {
    return 'email' in item && 'createdAt' in item && 'updatedAt' in item
  }

  console.log('Raw item data:', JSON.stringify(item, null, 2));
  
  const merchantData: Lead = {
    id: item.id,
    email: item.email || '',
    createdAt: timestampToString(item.createdAt),
    updatedAt: timestampToString(item.updatedAt),
    status: item.status || 'lead',
    pipelineStatus: item.pipelineStatus || 'lead',
    position: item.position || 0,
    formData: {
      // First spread the base formData
      ...item.formData,
      // Then override with document fields to ensure they're not lost
      bank_statements: item.formData?.bank_statements || item.bank_statements || [],
      drivers_license: item.formData?.drivers_license || item.drivers_license || '',
      voided_check: item.formData?.voided_check || item.voided_check || [],
      // Finally override specific fields
      businessName: item.formData?.businessName || item.companyName || '',
      phone: item.formData?.phone || item.phone || '',
    },
    companyName: item.companyName || item.formData?.businessName || '',
    phone: item.phone || item.formData?.phone || '',
  } as Lead;
  
  console.log('Transformed merchantData:', JSON.stringify(merchantData, null, 2));

  return (
    <div className="p-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink to="/admin">Admin</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink to="/admin/pipeline">Pipeline</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span className="text-muted-foreground">
            {item?.formData?.businessName || item?.businessName || 'Details'}
          </span>
        </BreadcrumbItem>
      </Breadcrumb>
      <div>
        <LeadDetails merchant={merchantData} />
      </div>
    </div>
  )
}
