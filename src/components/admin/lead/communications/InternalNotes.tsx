import React from "react"
import { Card, CardContent } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Merchant as PipelineMerchant } from "../../../../types/merchant"

interface InternalNotesProps {
  merchant: PipelineMerchant
}

export function InternalNotes({ merchant }: InternalNotesProps) {
  return (
    <div className="space-y-4">
      {/* Note creation form */}
      <Card>
        <CardContent className="pt-6">
          <textarea
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Add a note..."
          />
          <div className="mt-2 flex justify-end">
            <Button>Add Note</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes list */}
      <div className="space-y-2">
        {/* Placeholder for notes */}
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">Initial contact made with merchant</p>
                <p className="text-xs text-gray-500">Added by Admin</p>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
