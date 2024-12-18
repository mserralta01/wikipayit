import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MerchantCard } from "./MerchantCard";
import { PipelineMerchant, Column } from "@/types/pipeline";

interface PipelineColumnProps {
  column: Column;
  merchants: Array<PipelineMerchant>;
}

export function PipelineColumn({ column, merchants }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });

  return (
    <div
      ref={setNodeRef}
      className="w-80 rounded-lg p-4 min-h-[200px] bg-gray-50"
    >
      <h2 className="font-semibold mb-4 flex items-center justify-between">
        <span>{column.title}</span>
        <span className="text-gray-500 text-sm">({merchants.length})</span>
      </h2>
      <SortableContext 
        items={merchants.map(m => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[100px]">
          {merchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
} 