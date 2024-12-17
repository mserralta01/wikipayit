"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

const STATUSES = [
  "Lead",
  "Phone Calls",
  "Offer Sent",
  "Underwriting",
  "Documents",
  "Approved",
] as const;

type Status = typeof STATUSES[number];

export default function Pipeline() {
  const router = useRouter();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadData: Lead[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Lead, "id">;
        leadData.push({ id: doc.id, ...data });
      });
      setLeads(leadData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try refreshing the page.",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = STATUSES[parseInt(destination.droppableId)] as Status;

    try {
      await updateDoc(doc(db, "leads", draggableId), {
        status: newStatus,
      });

      toast({
        title: "Status Updated",
        description: `Lead moved to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleLeadClick = (leadId: string) => {
    router.push(`/admin/leads/${leadId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-6 gap-4">
          {STATUSES.map((_, index) => (
            <Card
              key={index}
              className="h-[100px] animate-pulse bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-6">
        <div className="grid grid-cols-6 gap-4">
          {STATUSES.map((status, statusIndex) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{status}</h3>
                <span className="text-sm text-gray-500">
                  {leads.filter((lead) => lead.status === status).length}
                </span>
              </div>
              <Droppable droppableId={statusIndex.toString()}>
                {(provided: DroppableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 min-h-[500px]"
                  >
                    {leads
                      .filter((lead) => lead.status === status)
                      .map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided: DraggableProvided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleLeadClick(lead.id)}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  {lead.businessName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {lead.contactName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {lead.email}
                                </p>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
} 