import React from "react"
import { Card, CardContent } from "../../../../components/ui/card"
import { Merchant as PipelineMerchant } from "../../../../types/merchant"
import { Button } from "../../../../components/ui/button"

interface EmailThreadsProps {
  merchant: PipelineMerchant
}

export function EmailThreads({ merchant }: EmailThreadsProps) {
  return (
    <div className="space-y-4">
      {/* Email composition form */}
      <Card>
        <CardContent className="pt-6">
          <textarea
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Compose new email..."
          />
          <div className="mt-2 flex justify-end">
            <Button>Send Email</Button>
          </div>
        </CardContent>
      </Card>

      {/* Email threads list */}
      <div className="space-y-2">
        {/* Placeholder for email threads */}
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Subject: Welcome to WikiPayIt</h4>
                <p className="text-sm text-gray-500">From: support@wikipayit.com</p>
              </div>
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
