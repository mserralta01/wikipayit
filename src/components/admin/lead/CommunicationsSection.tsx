import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { EmailThreads } from "./communications/EmailThreads"
import { InternalNotes } from "./communications/InternalNotes"
import { PhoneCalls } from "./communications/PhoneCalls"

interface CommunicationsSectionProps {
  merchant: PipelineMerchant;
  tab?: string;
}

export function CommunicationsSection({ merchant, tab = "emails" }: CommunicationsSectionProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="phone">Phone Calls</TabsTrigger>
          <TabsTrigger value="notes">Internal Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="emails" className="mt-6">
          <EmailThreads merchant={merchant} />
        </TabsContent>
        <TabsContent value="phone" className="mt-6">
          <PhoneCalls merchant={merchant} />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <InternalNotes merchant={merchant} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
