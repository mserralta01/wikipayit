import { useState, useEffect } from 'react';
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

interface MerchantPricing {
  pricingType: 'interchangePlus' | 'surcharge' | 'tiered' | 'flatRate';
  riskType: 'highRisk' | 'lowRisk';
  pricing: {
    [key: string]: number;
  };
}

interface PricingFormProps {
  costs: BankCosts;
  initialPricing: MerchantPricing | null;
  onSave: (pricing: MerchantPricing | null) => Promise<void>;
}

export const PricingForm = ({ costs, initialPricing, onSave }: PricingFormProps) => {
  const [pricingType, setPricingType] = useState('');
  const [riskType, setRiskType] = useState<'highRisk' | 'lowRisk'>('highRisk');
  interface FeeStructure {
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
  }

  type NestedFees = {
    [key: string]: number;
  };

  interface PricingStructure {
    avsFee?: number;
    binFee?: number;
    chargebackFee?: number;
    monthlyFee?: number;
    monthlyMinimumFee?: number;
    pciFee?: number;
    processingFees?: NestedFees;
    retrievalFee?: number;
    revenueSharePercentage?: number;
    sponsorFee?: number;
    transactionFees?: NestedFees;
  }
  
  // Type predicate for nested fee objects
  function isNestedFeeObject(obj: unknown): obj is NestedFees {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return false;
    }
    return Object.values(obj).every(value => typeof value === 'number');
  }

  // Type guard for number values
  function isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  const [pricing, setPricing] = useState<PricingStructure>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentCosts = costs[riskType];

  useEffect(() => {
    // Initialize pricing with default values
    const initialPricing: PricingStructure = {
      avsFee: currentCosts.avsFee,
      binFee: currentCosts.binFee,
      chargebackFee: currentCosts.chargebackFee,
      monthlyFee: currentCosts.monthlyFee,
      monthlyMinimumFee: currentCosts.monthlyMinimumFee,
      pciFee: currentCosts.pciFee,
      processingFees: currentCosts.processingFees,
      retrievalFee: currentCosts.retrievalFee,
      revenueSharePercentage: currentCosts.revenueSharePercentage,
      sponsorFee: currentCosts.sponsorFee,
      transactionFees: currentCosts.transactionFees
    };
    setPricing(initialPricing);
  }, [riskType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!pricingType) {
      newErrors.pricingType = 'Pricing type is required';
    }
    
    Object.entries(pricing).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'number' && (isNaN(subValue) || subValue < 0)) {
            newErrors[`${key}-${subKey}`] = 'Must be a positive number';
          }
        });
      } else if (typeof value === 'number') {
        if (isNaN(value) || value < 0) {
          newErrors[key] = 'Must be a positive number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    try {
      onSave({
        pricingType,
        riskType,
        pricing
      });
    } catch (error) {
      console.error('Failed to save pricing:', error);
      setErrors({ form: 'Failed to save pricing. Please try again.' });
    }
  };

  const handleCancel = () => {
    onSave(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Pricing Type</Label>
          <Select onValueChange={setPricingType} value={pricingType}>
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
          {errors.pricingType && (
            <span className="text-sm text-red-500">{errors.pricingType}</span>
          )}
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
            <Label>Amex</Label>
            <Input
              type="number"
              value={pricing.processingFees?.amex || ''}
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
            <span className="text-sm text-gray-500">Cost: {currentCosts.processingFees.amex}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Visa/Master/Discover</Label>
            <Input
              type="number"
              value={pricing.processingFees?.visaMasterDiscover || ''}
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
            <span className="text-sm text-gray-500">Cost: {currentCosts.processingFees.visaMasterDiscover}</span>
          </div>
        </div>

        {/* Transaction Fees */}
        <div className="space-y-4">
          <h3 className="font-medium">Transaction Fees</h3>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Amex</Label>
            <Input
              type="number"
              value={pricing.transactionFees?.amex || ''}
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
            <span className="text-sm text-gray-500">Cost: {currentCosts.transactionFees.amex}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Visa/Master/Discover</Label>
            <Input
              type="number"
              value={pricing.transactionFees?.visaMasterDiscover || ''}
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
            <span className="text-sm text-gray-500">Cost: {currentCosts.transactionFees.visaMasterDiscover}</span>
          </div>
        </div>

        {/* Other Fees */}
        <div className="space-y-4">
          <h3 className="font-medium">Other Fees</h3>
          {[
            { key: 'avsFee', label: 'AVS Fee' },
            { key: 'binFee', label: 'BIN Fee' },
            { key: 'chargebackFee', label: 'Chargeback Fee' },
            { key: 'monthlyFee', label: 'Monthly Fee' },
            { key: 'monthlyMinimumFee', label: 'Monthly Minimum Fee' },
            { key: 'pciFee', label: 'PCI Fee' },
            { key: 'retrievalFee', label: 'Retrieval Fee' },
            { key: 'revenueSharePercentage', label: 'Revenue Share Percentage' },
            { key: 'sponsorFee', label: 'Sponsor Fee' }
          ].map(({ key, label }) => (
            <div key={key} className="grid grid-cols-3 gap-4 items-center">
              <Label>{label}</Label>
              <Input
                type="number"
                value={typeof pricing[key as keyof PricingStructure] === 'number' ? pricing[key as keyof PricingStructure] as number : ''}
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
              <span className="text-sm text-gray-500">Cost: {String(currentCosts[key as keyof typeof currentCosts])}</span>
            </div>
          ))}
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
