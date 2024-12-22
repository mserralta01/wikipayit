import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PipelineMerchant, ServiceMerchant, PipelineStatus } from "@/types/pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface MerchantCardProps {
  merchant: PipelineMerchant | (Omit<ServiceMerchant, 'pipelineStatus'> & { pipelineStatus: PipelineStatus });
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
  const navigate = useNavigate();
  const displayName = merchant.formData?.businessName || merchant.businessName || merchant.email;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: merchant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click from interfering with drag operations
    if (!transform) {
      navigate(`/admin/pipeline/${merchant.id}`);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500">{merchant.email}</p>
        </div>
        <Badge>{merchant.pipelineStatus}</Badge>
      </div>
    </Card>
  );
}; 