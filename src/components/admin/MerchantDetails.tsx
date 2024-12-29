'use client'

import { useState } from 'react'
import { ApplicationData, merchantService } from '@/services/merchantService'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/useToast'

interface MerchantDetailsProps {
  merchant: ApplicationData
  onUpdate?: () => void
}

export function MerchantDetails({ merchant, onUpdate }: MerchantDetailsProps) {
  const [status, setStatus] = useState<ApplicationData['status']>(merchant.status)
  const { toast } = useToast()

  const handleStatusUpdate = async () => {
    try {
      await merchantService.updateMerchantStatus(merchant.id, status)
      toast({
        title: 'Success',
        description: 'Merchant status updated successfully',
      })
      onUpdate?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update merchant status',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={(value) => setStatus(value as ApplicationData['status'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Phone Calls">Phone Calls</SelectItem>
            <SelectItem value="Offer Sent">Offer Sent</SelectItem>
            <SelectItem value="Underwriting">Underwriting</SelectItem>
            <SelectItem value="Documents">Documents</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleStatusUpdate}>Update Status</Button>
      </div>
    </div>
  )
}
