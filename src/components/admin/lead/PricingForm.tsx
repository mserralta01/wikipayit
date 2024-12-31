import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interchangeService } from '@/services/interchangeService';
import type { InterchangeRates } from '@/types/interchange';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface ProcessingFees {
  amex: number;
  visaMasterDiscover: number;
}

interface BankCosts {
  highRisk: {
    avsFee: number;
    binFee: number;
    chargebackFee: number;
    monthlyFee: number;
    monthlyMinimumFee: number;
    pciFee: number;
    processingFees: ProcessingFees;
    retrievalFee: number;
    revenueSharePercentage: number;
    sponsorFee: number;
    transactionFees: ProcessingFees;
  };
  lowRisk: {
    avsFee: number;
    binFee: number;
    chargebackFee: number;
    monthlyFee: number;
    monthlyMinimumFee: number;
    pciFee: number;
    processingFees: ProcessingFees;
    retrievalFee: number;
    revenueSharePercentage: number;
    sponsorFee: number;
    transactionFees: ProcessingFees;
  };
}

interface MerchantPricing {
  pricingType: 'interchangePlus' | 'surcharge' | 'tiered' | 'flatRate';
  riskType: 'highRisk' | 'lowRisk';
  pricing: {
    avsFee?: number;
    binFee?: number;
    chargebackFee?: number;
    monthlyFee?: number;
    monthlyMinimumFee?: number;
    pciFee?: number;
    processingFees: ProcessingFees;
    retrievalFee?: number;
    revenueSharePercentage?: number;
    sponsorFee?: number;
    transactionFees: ProcessingFees;
  };
}

interface PricingFormProps {
  costs: BankCosts;
  initialPricing: MerchantPricing | null;
  onSave: (pricing: MerchantPricing | null) => Promise<void>;
}

export const PricingForm = ({ costs, initialPricing, onSave }: PricingFormProps) => {
  const [pricingType, setPricingType] = useState<MerchantPricing['pricingType']>(
    initialPricing?.pricingType || 'interchangePlus'
  );
  const [riskType, setRiskType] = useState<'highRisk' | 'lowRisk'>(
    initialPricing?.riskType || 'highRisk'
  );
  const [pricing, setPricing] = useState<MerchantPricing['pricing']>({
    processingFees: {
      visaMasterDiscover: initialPricing?.pricing.processingFees?.visaMasterDiscover || 0,
      amex: initialPricing?.pricing.processingFees?.amex || 0
    },
    transactionFees: {
      visaMasterDiscover: initialPricing?.pricing.transactionFees?.visaMasterDiscover || 0,
      amex: initialPricing?.pricing.transactionFees?.amex || 0
    }
  });
  const [errors, setErrors] = useState<{form?: string}>({});

  // Fetch interchange rates
  const { data: interchangeRates, isLoading } = useQuery({
    queryKey: ['interchange-rates'],
    queryFn: async () => {
      const rates = await interchangeService.getInterchangeRates();
      if (!rates) throw new Error('Failed to fetch interchange rates');
      return rates;
    }
  });

  const currentCosts = costs[riskType];

  const handleSave = async () => {
    if (!pricingType) {
      setErrors({ form: 'Please select a pricing type' });
      return;
    }

    const newPricing: MerchantPricing = {
      pricingType,
      riskType,
      pricing: {
        ...pricing,
        processingFees: {
          visaMasterDiscover: pricing.processingFees.visaMasterDiscover,
          amex: pricing.processingFees.amex
        },
        transactionFees: {
          visaMasterDiscover: pricing.transactionFees.visaMasterDiscover,
          amex: pricing.transactionFees.amex
        }
      }
    };

    try {
      await onSave(newPricing);
    } catch (error) {
      setErrors({ form: 'Failed to save pricing' });
    }
  };

  const handleCancel = () => {
    onSave(null);
  };

  // Get base cost with null check
  const getBaseCost = (type: 'visaMasterDiscover' | 'amex'): number => {
    if (!interchangeRates) return 0;
    
    if (type === 'visaMasterDiscover') {
      return interchangeRates.visaMastercardDiscover?.percentage || 0;
    }
    return interchangeRates.americanExpress?.percentage || 0;
  };

  if (isLoading) {
    return <div>Loading interchange rates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Pricing Type</Label>
          <Select 
            onValueChange={(value: MerchantPricing['pricingType']) => setPricingType(value)} 
            value={pricingType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pricing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interchangePlus">Interchange Plus</SelectItem>
              <SelectItem value="surcharge">Surcharge</SelectItem>
              <SelectItem value="tiered">Tiered Pricing</SelectItem>
              <SelectItem value="flatRate">Flat Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Risk Type</Label>
          <Select onValueChange={(value: 'highRisk' | 'lowRisk') => setRiskType(value)} value={riskType}>
            <SelectTrigger>
              <SelectValue placeholder="Select risk type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highRisk">High Risk</SelectItem>
              <SelectItem value="lowRisk">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Processing Fees */}
        <div className="space-y-4">
          <h3 className="font-medium">Processing Fees</h3>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Visa/Master/Discover</Label>
            <Input
              type="number"
              value={pricing.processingFees.visaMasterDiscover}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  setPricing(prev => ({
                    ...prev,
                    processingFees: {
                      ...prev.processingFees,
                      visaMasterDiscover: newValue
                    }
                  }));
                }
              }}
            />
            <span className="text-sm text-gray-500">
              Base Cost: {getBaseCost('visaMasterDiscover')}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Amex</Label>
            <Input
              type="number"
              value={pricing.processingFees.amex}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  setPricing(prev => ({
                    ...prev,
                    processingFees: {
                      ...prev.processingFees,
                      amex: newValue
                    }
                  }));
                }
              }}
            />
            <span className="text-sm text-gray-500">
              Base Cost: {getBaseCost('amex')}%
            </span>
          </div>
        </div>

        {/* Transaction Fees */}
        <div className="space-y-4">
          <h3 className="font-medium">Transaction Fees</h3>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Visa/Master/Discover</Label>
            <Input
              type="number"
              value={pricing.transactionFees.visaMasterDiscover}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  setPricing(prev => ({
                    ...prev,
                    transactionFees: {
                      ...prev.transactionFees,
                      visaMasterDiscover: newValue
                    }
                  }));
                }
              }}
            />
            <span className="text-sm text-gray-500">
              Base Cost: {getBaseCost('visaMasterDiscover')}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Amex</Label>
            <Input
              type="number"
              value={pricing.transactionFees.amex}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  setPricing(prev => ({
                    ...prev,
                    transactionFees: {
                      ...prev.transactionFees,
                      amex: newValue
                    }
                  }));
                }
              }}
            />
            <span className="text-sm text-gray-500">
              Base Cost: {getBaseCost('amex')}%
            </span>
          </div>
        </div>

        {/* Other Fees */}
        <div className="space-y-4">
          <h3 className="font-medium">Other Fees</h3>
          {[
            { key: 'avsFee', label: 'AVS Fee', isPercentage: false },
            { key: 'binFee', label: 'BIN Fee', isPercentage: true },
            { key: 'chargebackFee', label: 'Chargeback Fee', isPercentage: false },
            { key: 'monthlyFee', label: 'Monthly Fee', isPercentage: false },
            { key: 'monthlyMinimumFee', label: 'Monthly Minimum Fee', isPercentage: false },
            { key: 'pciFee', label: 'PCI Fee', isPercentage: false },
            { key: 'retrievalFee', label: 'Retrieval Fee', isPercentage: false },
            { key: 'sponsorFee', label: 'Sponsor Fee', isPercentage: true }
          ].map(({ key, label, isPercentage }) => {
            const costValue = currentCosts[key as keyof typeof currentCosts];
            const cost = typeof costValue === 'number' ? costValue : 0;
            const feeValue = pricing[key as keyof Omit<MerchantPricing['pricing'], 'processingFees' | 'transactionFees'>];
            const fee = typeof feeValue === 'number' ? feeValue : 0;
            const profit = fee - cost;
            const isNegative = profit < 0;
            
            return (
              <div key={key} className="grid grid-cols-3 gap-4 items-center">
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={fee}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    if (!isNaN(newValue)) {
                      setPricing(prev => ({
                        ...prev,
                        [key]: newValue
                      }));
                    }
                  }}
                />
                <div className="flex flex-col text-sm">
                  <span className="text-gray-500">
                    Cost: {isPercentage ? `${cost}%` : `$${cost.toFixed(2)}`}
                  </span>
                  <span className={`${isNegative ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                    Profit: {isPercentage ? `${profit}%` : `$${profit.toFixed(2)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="w-full"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="w-full"
        >
          Save Pricing
        </Button>
      </div>

      {errors.form && (
        <div className="text-sm text-red-500 mt-2">
          {errors.form}
        </div>
      )}
    </div>
  );
};
