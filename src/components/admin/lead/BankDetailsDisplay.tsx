import React, { useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { Button } from "@/components/ui/button";
import { PricingForm } from './PricingForm';
import { useToast } from "@/hooks/use-toast";

interface BankDetailsDisplayProps {
  formData: {
    bankName: string;
    bankingPartnerId: string;
    color?: string;
  };
  onDelete?: () => Promise<void>;
}

interface BankCosts {
  highRisk: {
    avsFee: number;
    binFee: number;
    chargebackFee: number;
    monthlyFee: number;
    monthlyMinimumFee: number;
    pciFee: number;
    processingFees: {
      amex: number;
      visaMasterDiscover: number;
    };
    retrievalFee: number;
    revenueSharePercentage: number;
    sponsorFee: number;
    transactionFees: {
      amex: number;
      visaMasterDiscover: number;
    };
  };
  lowRisk: {
    avsFee: number;
    binFee: number;
    chargebackFee: number;
    monthlyFee: number;
    monthlyMinimumFee: number;
    pciFee: number;
    processingFees: {
      amex: number;
      visaMasterDiscover: number;
    };
    retrievalFee: number;
    revenueSharePercentage: number;
    sponsorFee: number;
    transactionFees: {
      amex: number;
      visaMasterDiscover: number;
    };
  };
}

export function BankDetailsDisplay({ formData, onDelete }: BankDetailsDisplayProps) {
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [bankCosts, setBankCosts] = useState<BankCosts | null>(null);
  const [existingPricing, setExistingPricing] = useState<MerchantPricing | null>(null);
  const { toast } = useToast();

  const handlePricingClick = async () => {
    if (formData?.bankingPartnerId) {
      try {
        const costs = await bankingPartnerService.getBankCosts(formData.bankingPartnerId);
        const pricing = await bankingPartnerService.getMerchantPricing(formData.bankingPartnerId);
        setBankCosts(costs);
        setExistingPricing(pricing);
        setShowPricingForm(true);
      } catch (error) {
        console.error('Failed to fetch bank costs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bank pricing information',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <>
      <Card className="w-full border-l-4 hover:bg-gray-50/50 transition-colors" 
            style={{ borderLeftColor: formData.color || '#000000' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 
                className="h-5 w-5" 
                style={{ color: formData.color || '#000000' }}
              />
              <span 
                className="text-lg font-semibold"
                style={{ color: formData.color || '#000000' }}
              >
                {formData.bankName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePricingClick}
                className="flex items-center gap-2"
              >
                {existingPricing ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit Pricing
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Set Pricing
                  </>
                )}
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showPricingForm && bankCosts && (
        <PricingForm
          costs={bankCosts}
          initialPricing={existingPricing}
          onSave={async (pricing) => {
            if (pricing) {
              try {
                await bankingPartnerService.saveMerchantPricing(
                  formData.bankingPartnerId,
                  pricing
                );
                toast({
                  title: 'Success',
                  description: 'Pricing saved successfully',
                });
              } catch (error) {
                console.error('Failed to save pricing:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to save pricing',
                  variant: 'destructive'
                });
              }
            }
            setShowPricingForm(false);
          }}
        />
      )}
    </>
  );
}
