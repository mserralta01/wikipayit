import { useDroppable } from "@dnd-kit/core";
import { MerchantCard } from "./MerchantCard";
import { PipelineMerchant, Column } from "@/types/merchant";

interface PipelineColumnProps {
  column: Column;
  merchants: PipelineMerchant[];
}

export function PipelineColumn({ column, merchants }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="w-80 bg-gray-50 rounded-lg p-4"
    >
      <h2 className="font-semibold mb-4">
        {column.title}
        <span className="ml-2 text-gray-500 text-sm">
          ({merchants.length})
        </span>
      </h2>
      <div className="space-y-2">
        {merchants.map((merchant) => (
          <MerchantCard
            key={merchant.id}
            merchant={merchant}
          />
        ))}
      </div>
    </div>
  );
} 