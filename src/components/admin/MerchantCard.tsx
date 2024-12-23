import { Card } from "@/components/ui/card";
import { PipelineMerchant } from "@/types/pipeline";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MerchantCardProps {
  merchant: PipelineMerchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: merchant.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate progress based on current status
  const statusProgress = {
    lead: 17,
    phone: 33,
    offer: 50,
    underwriting: 67,
    documents: 83,
    approved: 100,
  };

  const progress = statusProgress[merchant.pipelineStatus] || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-full bg-blue-500 rounded-full h-2 mb-2">
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: `${100 - progress}%`,
            marginLeft: 'auto',
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
      
      <h3 className="font-medium text-sm">
        {merchant.businessName || merchant.email}
      </h3>
      
      <div className="text-sm text-gray-500 mt-1">
        {merchant.email}
      </div>
      
      {merchant.phone && (
        <div className="text-sm text-gray-500">
          {merchant.phone}
        </div>
      )}
    </Card>
  );
} 