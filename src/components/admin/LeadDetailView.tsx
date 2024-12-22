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

  const merchantData: PipelineMerchant = isPipelineMerchant(item) ? item : {
    id: item.id,
    email: item.email || '',
    createdAt: timestampToString(item.createdAt),
    updatedAt: timestampToString(item.updatedAt),
    status: item.status || 'lead',
    pipelineStatus: item.pipelineStatus || 'lead',
    position: item.position || 0,
    formData: {
      ...item.formData,
      businessName: item.formData?.businessName || item.companyName || '',
      phone: item.formData?.phone || item.phone || '',
    },
    companyName: item.companyName || item.formData?.businessName || '',
    phone: item.phone || item.formData?.phone || '',
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Pipeline
      </Button>
      <div>
        <LeadDetails merchant={merchantData} />
      </div>
    </div>
  )
}
