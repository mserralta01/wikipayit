import React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { FormLabel } from "@/components/ui/form"
import { Merchant as PipelineMerchant } from "@/types/merchant"

interface LeadDetailsProps {
  merchant: PipelineMerchant
}

export function LeadDetails({ merchant }: LeadDetailsProps) {
  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return '[Complex Object]'
    }
    return value?.toString() || ''
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Lead Details</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(merchant.formData || {}).map(([key, value]) => (
            <div key={key}>
              <FormLabel>{key}</FormLabel>
              <div className="text-sm">{renderValue(value)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
