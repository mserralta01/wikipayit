import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PipelineMerchant, ServiceMerchant, PipelineStatus } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MerchantCardProps {
  merchant: PipelineMerchant | (Omit<ServiceMerchant, 'pipelineStatus'> & { pipelineStatus: PipelineStatus });
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
  const displayName = merchant.formData?.businessName || merchant.businessName || merchant.email;
  
  return (
    <div>
      {displayName}
      {/* Rest of the component */}
    </div>
  );
}; 