import { useState, useEffect } from "react";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import { MerchantCard } from "./MerchantCard";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineMerchant, Column, MerchantStatus } from "@/types/merchant";
import { db } from "@/lib/firebase";
import { 
  collection,
  doc,
  writeBatch,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

const COLUMN_TITLES: MerchantStatus[] = [
  'Lead',
  'Phone Calls',
  'Offer Sent',
  'Underwriting',
  'Documents',
  'Approved'
];

export function MerchantPipeline() {
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<PipelineMerchant[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Initialize columns
    const initialColumns = COLUMN_TITLES.map((title) => ({
      id: title.toLowerCase().replace(' ', '-'),
      title,
      merchantIds: [],
    }));
    setColumns(initialColumns);

    // Subscribe to merchants collection
    const merchantsQuery = query(
      collection(db, 'merchants'),
      orderBy('position')
    );

    const unsubscribe = onSnapshot(merchantsQuery, (snapshot) => {
      const merchantsList: PipelineMerchant[] = [];
      snapshot.forEach((doc) => {
        merchantsList.push({ id: doc.id, ...doc.data() } as PipelineMerchant);
      });
      setMerchants(merchantsList);
      
      // Update columns with merchant IDs
      setColumns(initialColumns.map(column => ({
        ...column,
        merchantIds: merchantsList
          .filter(m => m.status === column.title)
          .map(m => m.id)
      })));
    });

    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeMerchant = merchants.find(m => m.id === active.id);
    const overColumn = columns.find(c => c.id === over.id);

    if (!activeMerchant || !overColumn) return;

    try {
      const batch = writeBatch(db);
      const merchantRef = doc(db, 'merchants', activeMerchant.id);

      // Update merchant status and position
      const updatedMerchant: Partial<PipelineMerchant> = {
        status: overColumn.title,
        position: overColumn.merchantIds.length,
        updatedAt: new Date(),
      };

      batch.update(merchantRef, updatedMerchant);
      await batch.commit();

      // Send email notification
      await fetch('/api/notify-status-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: activeMerchant.id,
          newStatus: overColumn.title,
          oldStatus: activeMerchant.status,
        }),
      });

      toast({
        title: "Status updated",
        description: `${activeMerchant.name} moved to ${overColumn.title}`,
      });
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast({
        title: "Error",
        description: "Failed to update merchant status",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = columns.find(c => 
      c.merchantIds.includes(active.id as string)
    );
    const overColumn = columns.find(c => c.id === over.id);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumns(columns.map(col => {
      if (col.id === activeColumn.id) {
        return {
          ...col,
          merchantIds: col.merchantIds.filter((id: string) => id !== active.id),
        };
      }
      if (col.id === overColumn.id) {
        return {
          ...col,
          merchantIds: [...col.merchantIds, active.id as string],
        };
      }
      return col;
    }));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-screen">
        {columns.map((column) => (
          <PipelineColumn
            key={column.id}
            column={column}
            merchants={merchants.filter(m => 
              column.merchantIds.includes(m.id)
            )}
          />
        ))}
      </div>
    </DndContext>
  );
} 