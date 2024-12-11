import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { PipelineMerchant } from "@/types/merchant";

interface MerchantCardProps {
  merchant: PipelineMerchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: merchant.id,
    data: merchant,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 cursor-move"
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold">{merchant.name}</h3>
        <p className="text-sm text-gray-500">{merchant.email}</p>
        <p className="text-sm text-gray-500">{merchant.phone}</p>
      </CardContent>
    </Card>
  );
} 