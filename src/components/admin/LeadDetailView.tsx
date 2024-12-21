import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Merchant as PipelineMerchant, Lead } from "@/types/merchant"
import { merchantService } from "@/services/merchantService"
import { LeadDetails } from "./lead/LeadDetails"
import { PricingSection } from "./lead/PricingSection"
import { CommunicationsSection } from "./lead/CommunicationsSection"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

type PipelineItemData = PipelineMerchant | Lead

export function LeadDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: item, isLoading, error } = useQuery<PipelineItemData>({
    queryKey: ['pipeline-item', id],
    queryFn: async () => {
      if (!id) return null
      // Try to get merchant first
      const merchant = await merchantService.getMerchant(id)
      if (merchant) return merchant

      // If not found in merchants, try leads
      const leads = await merchantService.getLeads()
      const lead = leads.find(l => l.id === id)
      if (lead) return lead

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
      <div className="flex gap-8">
        <div className="w-[35%]">
          <LeadDetails merchant={item} />
          <div className="mt-8">
            <PricingSection merchant={item} />
          </div>
        </div>
        <div className="w-[65%]">
          <CommunicationsSection merchant={item} />
        </div>
      </div>
    </div>
  )
}
