import React from 'react';
import { Building2, Building } from 'lucide-react';
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
    <Card className="w-full">
      <CardContent className="pt-6">
        {formData.bankName && (
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900">
              {formData.bankName}
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {formData.routingNumber && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Routing Number
              </label>
              <div className="text-base font-medium text-gray-900">
                {formData.routingNumber}
              </div>
            </div>
          )}
          
          {formData.accountNumber && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Account Number
              </label>
              <div className="text-base font-medium text-gray-900">
                {formData.accountNumber}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 