"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LeadInformation from "./LeadInformation";
import PricingSection from "./PricingSection";
import CommunicationCenter from "./CommunicationCenter";
import { Skeleton } from "@/components/ui/skeleton";

interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  notes: string[];
  pricing?: {
    rate: number;
    monthlyFee: number;
    setupFee: number;
  };
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const leadDoc = await getDoc(doc(db, "leads", id as string));
        if (leadDoc.exists()) {
          setLead({ id: leadDoc.id, ...leadDoc.data() } as Lead);
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return <div className="p-6">Lead not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{lead.businessName}</h1>
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <Tabs defaultValue="information" className="w-full">
            <TabsList>
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            <TabsContent value="information">
              <LeadInformation lead={lead} />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingSection lead={lead} />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <CommunicationCenter lead={lead} />
        </Card>
      </div>
    </div>
  );
} 