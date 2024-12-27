import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { 
  Building,
  History,
  Landmark,
  Users,
  DollarSign,
  ListTodo,
  Mail,
  Phone,
  StickyNote,
  FileText 
} from "lucide-react"
import { BusinessDetails } from "./sections/BusinessDetails"
import { ProcessingHistory } from "./sections/ProcessingHistory"
import { BankDetails } from "./sections/BankDetails"
import { OwnersDetails } from "./sections/OwnersDetails"
import { PricingDetails } from "./sections/PricingDetails"
import { StatusAndStage } from "./sections/StatusAndStage"
import { EmailThreads } from "./communications/EmailThreads"
import { PhoneCalls } from "./communications/PhoneCalls"
import { InternalNotes } from "./communications/InternalNotes"
import { Documents } from "./communications/Documents"
import { Merchant } from "@/types/merchant"

interface LeadDetailViewProps {
  merchant: Merchant
}

export function LeadDetailView({ merchant }: LeadDetailViewProps) {
  const tabs = [
    {
      value: "business",
      label: "Business",
      icon: <Building className="h-4 w-4" />,
      content: <BusinessDetails merchant={merchant} />,
    },
    {
      value: "processing",
      label: "Processing History",
      icon: <History className="h-4 w-4" />,
      content: <ProcessingHistory merchant={merchant} />,
    },
    {
      value: "bank",
      label: "Bank Details",
      icon: <Landmark className="h-4 w-4" />,
      content: <BankDetails merchant={merchant} />,
    },
    {
      value: "owners",
      label: "Owners",
      icon: <Users className="h-4 w-4" />,
      content: <OwnersDetails merchant={merchant} />,
    },
    {
      value: "pricing",
      label: "Pricing",
      icon: <DollarSign className="h-4 w-4" />,
      content: <PricingDetails merchant={merchant} />,
    },
    {
      value: "status",
      label: "Status and Stage",
      icon: <ListTodo className="h-4 w-4" />,
      content: <StatusAndStage merchant={merchant} />,
    },
    {
      value: "emails",
      label: "Emails",
      icon: <Mail className="h-4 w-4" />,
      content: <EmailThreads merchant={merchant} />,
    },
    {
      value: "phone_calls",
      label: "Phone Calls",
      icon: <Phone className="h-4 w-4" />,
      content: <PhoneCalls merchant={merchant} />,
    },
    {
      value: "notes",
      label: "Internal Notes",
      icon: <StickyNote className="h-4 w-4" />,
      content: <InternalNotes merchant={merchant} />,
    },
    {
      value: "documents",
      label: "Documents",
      icon: <FileText className="h-4 w-4" />,
      content: <Documents merchant={merchant} />,
    },
  ]

  return (
    <Card className="flex-1">
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid grid-cols-5 gap-4 p-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="p-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
} 