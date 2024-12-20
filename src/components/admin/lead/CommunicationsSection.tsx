import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Merchant as PipelineMerchant } from "../../../types/merchant"
import { EmailThreads } from "./communications/EmailThreads"
import { InternalNotes } from "./communications/InternalNotes"

interface CommunicationsSectionProps {
  merchant: PipelineMerchant
}

export function CommunicationsSection({ merchant }: CommunicationsSectionProps) {
  return (
    <div className="w-[60%] min-w-[600px]">
      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="notes">Internal Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="emails" className="mt-6">
          <EmailThreads merchant={merchant} />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <InternalNotes merchant={merchant} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
