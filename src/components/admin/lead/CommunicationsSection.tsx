import React from "react"
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
  // Render content directly based on tab prop
  switch (tab) {
    case "emails":
      return <EmailThreads merchant={merchant} />;
    case "phone":
      return <PhoneCalls merchant={merchant} />;
    case "notes":
      return <InternalNotes merchant={merchant} />;
    case "documents":
      return <DocumentsTab merchant={{
        ...merchant,
        formData: {
          ...merchant.formData,
          bank_statements: merchant.formData?.bank_statements || merchant.bank_statements || [],
          drivers_license: merchant.formData?.drivers_license || merchant.drivers_license || '',
          voided_check: merchant.formData?.voided_check || merchant.voided_check || []
        }
      }} />;
    default:
      return null;
  }
}
