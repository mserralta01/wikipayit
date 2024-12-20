import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PipelineMerchant, ServiceMerchant, PipelineStatus } from "@/types/pipeline"

type MerchantType = PipelineMerchant | (Omit<ServiceMerchant, 'pipelineStatus'> & { pipelineStatus: PipelineStatus })

// These will be implemented in subsequent steps
const LeadDetails: React.FC<{ merchant: MerchantType }> = ({ merchant }) => (
  <div>Lead Details Placeholder</div>
)

const PricingSection: React.FC<{ merchant: MerchantType }> = ({ merchant }) => (
  <div>Pricing Section Placeholder</div>
)

const CommunicationsSection: React.FC<{ merchant: MerchantType }> = ({ merchant }) => (
  <div>Communications Section Placeholder</div>
)

interface LeadDetailViewProps {
  merchant: MerchantType
  open: boolean
  onClose: () => void
}

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({ merchant, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left column */}
          <div className="col-span-4 overflow-y-auto">
            <LeadDetails merchant={merchant} />
            <PricingSection merchant={merchant} />
          </div>
          {/* Right column */}
          <div className="col-span-8 overflow-y-auto">
            <CommunicationsSection merchant={merchant} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
