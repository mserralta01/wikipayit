import { useState, useEffect } from "react";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragOverlay as DndDragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import { MerchantCard } from "./MerchantCard";
import { PipelineColumn as PipelineColumnComponent } from "./PipelineColumn";
import { PipelineMerchant, PipelineStatus, Column as PipelineColumn, PIPELINE_STATUSES, COLUMN_CONFIGS } from "@/types/pipeline";
import { db } from "@/lib/firebase";
import { 
  collection,
  doc,
  writeBatch,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { MerchantDTO } from "@/types/merchant";
import { Card } from "@/components/ui/card";

interface LocalColumn {
  id: PipelineStatus;
  title: PipelineStatus;
  merchantIds: string[];
  color: string;
  items: PipelineMerchant[];
}

const getValidPipelineStatus = (status: string | undefined): PipelineStatus => {
  const validStatuses: PipelineStatus[] = ['lead', 'phone', 'offer', 'underwriting', 'documents', 'approved'];
  const normalizedStatus = (status || 'lead').toLowerCase() as PipelineStatus;
  return validStatuses.includes(normalizedStatus) ? normalizedStatus : 'lead';
};

interface MerchantPipelineProps {
  merchants: MerchantDTO[];
}

export function MerchantPipeline() {
  const { toast } = useToast();
  const [columns, setColumns] = useState<LocalColumn[]>([]);
  const [merchants, setMerchants] = useState<PipelineMerchant[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMerchant, setActiveMerchant] = useState<PipelineMerchant | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const initialColumns: LocalColumn[] = PIPELINE_STATUSES.map(status => ({
      id: status,
      title: status,
      merchantIds: [],
      color: COLUMN_CONFIGS[status].color,
      items: []
    }));
    setColumns(initialColumns);
  }, []);

  useEffect(() => {
    const merchantsQuery = query(
      collection(db, 'merchants'),
      orderBy('pipelineStatus'),
      orderBy('position')
    );

    const unsubscribe = onSnapshot(merchantsQuery, (snapshot) => {
      const merchantsList: PipelineMerchant[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Use pipelineStatus if available, fallback to status, then default to 'lead'
        const status = data.pipelineStatus || data.status || 'lead';
        const pipelineStatus = getValidPipelineStatus(status);
        
        merchantsList.push({ 
          id: doc.id, 
          ...data,
          kind: 'merchant',
          type: 'merchant',
          pipelineStatus,
          status: pipelineStatus, // Ensure both fields are synchronized
          position: data.position || 0,
          email: data.email,
          displayName: data.businessName || data.email,
        } as PipelineMerchant);
      });

      const sortedMerchants = merchantsList.sort((a, b) => {
        if (a.pipelineStatus === b.pipelineStatus) {
          return (a.position || 0) - (b.position || 0);
        }
        return 0;
      });

      setMerchants(sortedMerchants);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setColumns(prevColumns => 
      prevColumns.map(column => {
        const columnMerchants = merchants.filter(merchant => 
          merchant.pipelineStatus === column.id || 
          (merchant.status === column.id && !merchant.pipelineStatus)
        );
        
        return {
          ...column,
          merchantIds: columnMerchants.map(m => m.id),
          items: columnMerchants
        };
      })
    );
  }, [merchants]);

  const transformMerchant = (merchant: any): PipelineMerchant => ({
    ...merchant,
    kind: 'merchant',
    type: 'merchant',
    pipelineStatus: merchant.pipelineStatus || 'lead',
    position: merchant.position || 0,
    displayName: merchant.businessName || merchant.email,
    email: merchant.email,
    formData: {
      businessName: merchant.businessName,
      dba: merchant.dba,
      phone: merchant.phone,
    }
  });

  const getColumnMerchants = (column: LocalColumn) => {
    return merchants
      .filter(m => column.merchantIds.includes(m.id))
      .map(transformMerchant);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedMerchant = merchants.find(m => m.id === active.id);
    if (draggedMerchant) {
      setActiveId(active.id.toString());
      setActiveMerchant(draggedMerchant);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = columns.find(col => col.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns(prevColumns => {
      const activeItems = [...activeColumn.merchantIds];
      const overItems = [...overColumn.merchantIds];

      const activeIndex = activeItems.indexOf(active.id as string);
      const overIndex = over.id in overItems ? overItems.indexOf(over.id as string) : overItems.length;

      return prevColumns.map(col => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            merchantIds: activeItems.filter(id => id !== active.id)
          };
        }
        if (col.id === overColumn.id) {
          const newMerchantIds = [...overItems];
          newMerchantIds.splice(overIndex, 0, active.id as string);
          return {
            ...col,
            merchantIds: newMerchantIds
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      setActiveId(null);
      setActiveMerchant(null);
      return;
    }

    const activeMerchant = merchants.find(m => m.id === active.id);
    if (!activeMerchant) {
      setActiveId(null);
      setActiveMerchant(null);
      return;
    }

    try {
      const batch = writeBatch(db);
      const oldStatus = activeMerchant.pipelineStatus;
      const targetColumn = columns.find(col => col.id === over.id);
      
      if (!targetColumn) {
        setActiveId(null);
        setActiveMerchant(null);
        return;
      }

      const newStatus = targetColumn.title;
      const sourceColumn = columns.find(col => col.title === oldStatus);
      
      if (!sourceColumn) {
        setActiveId(null);
        setActiveMerchant(null);
        return;
      }

      // Calculate new position
      const overMerchantId = over.id as string;
      const isOverColumn = targetColumn.id === over.id;
      const newPosition = isOverColumn
        ? targetColumn.merchantIds.length
        : targetColumn.merchantIds.indexOf(overMerchantId);

      // Update the active merchant with new status and position
      batch.update(doc(db, 'merchants', activeMerchant.id), {
        pipelineStatus: newStatus,
        status: newStatus,
        position: newPosition,
        updatedAt: new Date()
      });

      // Update positions for all affected merchants
      const sourceUpdates = sourceColumn.merchantIds
        .filter(id => id !== activeMerchant.id)
        .map((id, index) => ({
          id,
          position: index
        }));

      const targetUpdates = targetColumn.merchantIds
        .filter(id => id !== activeMerchant.id)
        .map((id, index) => {
          const position = index >= newPosition ? index + 1 : index;
          return { id, position };
        });

      // Apply all position updates in the batch
      [...sourceUpdates, ...targetUpdates].forEach(update => {
        batch.update(doc(db, 'merchants', update.id), {
          position: update.position,
          updatedAt: new Date()
        });
      });

      await batch.commit();

      if (oldStatus !== newStatus) {
        await fetch('/api/notify-status-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId: activeMerchant.id,
            newStatus,
            oldStatus,
          }),
        });

        toast({
          title: "Status updated",
          description: `${activeMerchant.displayName || activeMerchant.email} moved to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast({
        title: "Error",
        description: "Failed to update merchant status and position",
        variant: "destructive",
      });
    } finally {
      setActiveId(null);
      setActiveMerchant(null);
    }
  };

  // Calculate progress based on current status
  const statusProgress: Record<PipelineStatus, number> = {
    lead: 17,
    phone: 33,
    offer: 50,
    underwriting: 67,
    documents: 83,
    approved: 100,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-screen">
        {columns.map((column) => (
          <div key={column.id} className="w-80 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-700">
                  {column.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {column.items.length} items
                </span>
              </div>
              
              <div className="space-y-2">
                {column.items.map((merchant) => (
                  <Card key={merchant.id} className="p-4">
                    <div className="w-full bg-white rounded-full h-2 mb-2 border border-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${statusProgress[merchant.pipelineStatus] || 0}%`,
                          transition: 'width 0.5s ease-in-out'
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-sm">
                      {merchant.businessName || merchant.email}
                    </h4>
                    {/* Rest of your merchant card content */}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeMerchant ? <MerchantCard merchant={transformMerchant(activeMerchant)} /> : null}
      </DragOverlay>
    </DndContext>
  );
} 