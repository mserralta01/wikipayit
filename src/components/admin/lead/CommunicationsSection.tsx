import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { EmailThreads } from "./communications/EmailThreads"
import { InternalNotes } from "./communications/InternalNotes"
import { PhoneCalls } from "./communications/PhoneCalls"
import { DocumentsTab } from "./communications/DocumentsTab"

interface CommunicationsSectionProps {
  merchant: PipelineMerchant & { formData?: any };
  tab?: string;
}

export function CommunicationsSection({ merchant, tab = "emails" }: CommunicationsSectionProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="phone">Phone Calls</TabsTrigger>
          <TabsTrigger value="notes">Internal Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
        <TabsContent value="documents" className="mt-6">
          {(() => {
            const merchantWithFormData = {
              ...merchant,
              formData: {
                ...merchant.formData,
                bank_statements: merchant.formData?.bank_statements || merchant.bank_statements || [],
                drivers_license: merchant.formData?.drivers_license || merchant.drivers_license || '',
                voided_check: merchant.formData?.voided_check || merchant.voided_check || []
              }
            };
            console.log('CommunicationsSection - Passing merchant to DocumentsTab:', merchantWithFormData);
            return <DocumentsTab merchant={merchantWithFormData} />;
          })()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
