import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PipelineFormData } from '@/types/pipeline';

interface BankDetailsDisplayProps {
  formData?: PipelineFormData;
}

export function BankDetailsDisplay({ formData }: BankDetailsDisplayProps) {
  if (!formData?.bankName && !formData?.routingNumber && !formData?.accountNumber) {
    return null;
  }

  return (
    <Card className="w-full border-l-4 hover:bg-gray-50/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Bank Details</h3>
        </div>

        {formData?.bankName && (
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium text-gray-500">Bank Name</p>
            <p className="text-sm">{formData.bankName}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {formData?.routingNumber && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Routing Number</p>
              <p className="text-sm">{formData.routingNumber}</p>
            </div>
          )}

          {formData?.accountNumber && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Account Number</p>
              <p className="text-sm">{formData.accountNumber}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
