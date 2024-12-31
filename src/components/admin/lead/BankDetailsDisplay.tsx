import React, { useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { Button } from "@/components/ui/button";
import { PricingForm } from './PricingForm';
import { useToast } from "@/hooks/use-toast";
import { MerchantPricing } from '@/types/merchant';

interface BankDetailsDisplayProps {
  formData?: {
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
        if (pricing) {
          // Convert service pricing to component pricing if needed
          const convertedPricing: MerchantPricing = {
            pricingType: pricing.pricingType,
            riskType: pricing.riskType,
            pricing: {
              processingFees: {
                amex: pricing.pricing['amex'] || 0,
                visaMasterDiscover: pricing.pricing['visaMasterDiscover'] || 0
              },
              transactionFees: {
                amex: pricing.pricing['amexTransaction'] || 0,
                visaMasterDiscover: pricing.pricing['visaMasterDiscoverTransaction'] || 0
              },
              avsFee: pricing.pricing['avsFee'] || 0,
              binFee: pricing.pricing['binFee'] || 0,
              chargebackFee: pricing.pricing['chargebackFee'] || 0,
              monthlyFee: pricing.pricing['monthlyFee'] || 0,
              monthlyMinimumFee: pricing.pricing['monthlyMinimumFee'] || 0,
              pciFee: pricing.pricing['pciFee'] || 0,
              retrievalFee: pricing.pricing['retrievalFee'] || 0,
              revenueSharePercentage: pricing.pricing['revenueSharePercentage'] || 0,
              sponsorFee: pricing.pricing['sponsorFee'] || 0
            }
          };
          setExistingPricing(convertedPricing);
        }
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

  if (!formData?.bankName || !formData?.bankingPartnerId) {
    return null;
  }

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
            if (pricing && formData.bankingPartnerId) {
              try {
                // Convert component pricing back to service pricing
                const servicePricing = {
                  pricingType: pricing.pricingType,
                  riskType: pricing.riskType,
                  pricing: {
                    amex: pricing.pricing.processingFees.amex,
                    visaMasterDiscover: pricing.pricing.processingFees.visaMasterDiscover,
                    amexTransaction: pricing.pricing.transactionFees.amex,
                    visaMasterDiscoverTransaction: pricing.pricing.transactionFees.visaMasterDiscover,
                    avsFee: pricing.pricing.avsFee || 0,
                    binFee: pricing.pricing.binFee || 0,
                    chargebackFee: pricing.pricing.chargebackFee || 0,
                    monthlyFee: pricing.pricing.monthlyFee || 0,
                    monthlyMinimumFee: pricing.pricing.monthlyMinimumFee || 0,
                    pciFee: pricing.pricing.pciFee || 0,
                    retrievalFee: pricing.pricing.retrievalFee || 0,
                    revenueSharePercentage: pricing.pricing.revenueSharePercentage || 0,
                    sponsorFee: pricing.pricing.sponsorFee || 0
                  }
                };
                await bankingPartnerService.saveMerchantPricing(
                  formData.bankingPartnerId,
                  servicePricing
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
