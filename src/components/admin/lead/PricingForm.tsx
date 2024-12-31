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
import { CircleDollarSign } from 'lucide-react';

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

  // Add helper function to calculate adjusted profit
  const calculateAdjustedProfit = (profit: number): number => {
    const revenueShare = riskType === 'highRisk' 
      ? costs.highRisk.revenueSharePercentage / 100
      : costs.lowRisk.revenueSharePercentage / 100;
    return profit * revenueShare;
  };

  // Modify the profit display sections throughout the component
  // For Visa/Master/Discover processing fees:
  const vmdProcessingProfit = pricingType === 'interchangePlus' 
    ? pricing.processingFees.visaMasterDiscover
    : (pricing.processingFees.visaMasterDiscover - getBaseCost('visaMasterDiscover'));
  
  const vmdTransactionProfit = pricing.transactionFees.visaMasterDiscover - 
    (interchangeRates?.visaMastercardDiscover?.transactionFee || 0);

  // For Amex processing fees:
  const amexProcessingProfit = pricingType === 'interchangePlus'
    ? pricing.processingFees.amex
    : (pricing.processingFees.amex - getBaseCost('amex'));
    
  const amexTransactionProfit = pricing.transactionFees.amex - 
    (interchangeRates?.americanExpress?.transactionFee || 0);

  if (isLoading) {
    return <div>Loading interchange rates...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Section with Revenue Share Blocks */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure processing fees and additional charges for this merchant
          </p>
        </div>
        
        <div className="flex gap-4">
          {/* High Risk Revenue Share */}
          <div className="bg-red-500/90 rounded-lg p-3 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign className="h-4 w-4 text-white" />
              <span className="text-xs font-medium text-white/90">High Risk</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {costs.highRisk.revenueSharePercentage}% Share
            </div>
          </div>

          {/* Low Risk Revenue Share */}
          <div className="bg-green-500/90 rounded-lg p-3 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign className="h-4 w-4 text-white" />
              <span className="text-xs font-medium text-white/90">Low Risk</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {costs.lowRisk.revenueSharePercentage}% Share
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Type and Risk Type Selection */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Pricing Type</Label>
          <Select 
            onValueChange={(value: MerchantPricing['pricingType']) => setPricingType(value)} 
            value={pricingType}
          >
            <SelectTrigger className="h-9">
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">Risk Type</Label>
          <Select 
            onValueChange={(value: 'highRisk' | 'lowRisk') => setRiskType(value)} 
            value={riskType}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select risk type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highRisk">High Risk</SelectItem>
              <SelectItem value="lowRisk">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Processing Fees Section */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Processing Fees</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <h4 className="text-sm font-medium text-muted-foreground">Card Type</h4>
              </div>
              <div className="col-span-4">
                <h4 className="text-sm font-medium text-muted-foreground">Processing Fee (%)</h4>
              </div>
              <div className="col-span-5">
                <h4 className="text-sm font-medium text-muted-foreground">Transaction Fee ($)</h4>
              </div>
            </div>

            {/* Visa/Master/Discover Row */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 pt-2">Visa/Master/Discover</Label>
              
              <div className="col-span-4 space-y-2">
                <Input
                  type="number"
                  value={pricing.processingFees.visaMasterDiscover}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setPricing(prev => ({
                        ...prev,
                        processingFees: {
                          ...prev.processingFees,
                          visaMasterDiscover: 0
                        }
                      }));
                      return;
                    }
                    const newValue = parseFloat(value);
                    if (!isNaN(newValue) && (pricingType !== 'surcharge' || newValue <= 3.0)) {
                      setPricing(prev => ({
                        ...prev,
                        processingFees: {
                          ...prev.processingFees,
                          visaMasterDiscover: newValue
                        }
                      }));
                    }
                  }}
                  className="h-9"
                />
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">Cost: {getBaseCost('visaMasterDiscover')}%</p>
                  <p>
                    Profit: <span className={`${vmdProcessingProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {pricingType === 'interchangePlus' ? 
                        `${vmdProcessingProfit.toFixed(2)}% (${calculateAdjustedProfit(vmdProcessingProfit).toFixed(2)}%)` :
                        `${vmdProcessingProfit.toFixed(2)}% (${calculateAdjustedProfit(vmdProcessingProfit).toFixed(2)}%)`
                      }
                    </span>
                  </p>
                </div>
              </div>

              <div className="col-span-5 space-y-2">
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
                  className="h-9"
                />
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">
                    Cost: ${interchangeRates?.visaMastercardDiscover?.transactionFee?.toFixed(2) || '0.00'}
                  </p>
                  <p>
                    Profit: <span className={`${vmdTransactionProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${vmdTransactionProfit.toFixed(2)} (${calculateAdjustedProfit(vmdTransactionProfit).toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* American Express Row */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 pt-2">American Express</Label>
              
              <div className="col-span-4 space-y-2">
                <Input
                  type="number"
                  value={pricing.processingFees.amex}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setPricing(prev => ({
                        ...prev,
                        processingFees: {
                          ...prev.processingFees,
                          amex: 0
                        }
                      }));
                      return;
                    }
                    const newValue = parseFloat(value);
                    if (!isNaN(newValue) && (pricingType !== 'surcharge' || newValue <= 3.0)) {
                      setPricing(prev => ({
                        ...prev,
                        processingFees: {
                          ...prev.processingFees,
                          amex: newValue
                        }
                      }));
                    }
                  }}
                  className="h-9"
                />
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">Cost: {getBaseCost('amex')}%</p>
                  <p>
                    Profit: <span className={`${amexProcessingProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {pricingType === 'interchangePlus' ? 
                        `${amexProcessingProfit.toFixed(2)}% (${calculateAdjustedProfit(amexProcessingProfit).toFixed(2)}%)` :
                        `${amexProcessingProfit.toFixed(2)}% (${calculateAdjustedProfit(amexProcessingProfit).toFixed(2)}%)`
                      }
                    </span>
                  </p>
                </div>
              </div>

              <div className="col-span-5 space-y-2">
                <Input
                  type="number"
                  value={pricing.transactionFees.amex}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setPricing(prev => ({
                        ...prev,
                        transactionFees: {
                          ...prev.transactionFees,
                          amex: 0
                        }
                      }));
                      return;
                    }
                    const newValue = parseFloat(value);
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
                  className="h-9"
                />
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">
                    Cost: ${interchangeRates?.americanExpress?.transactionFee?.toFixed(2) || '0.00'}
                  </p>
                  <p>
                    Profit: <span className={`${amexTransactionProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${amexTransactionProfit.toFixed(2)} (${calculateAdjustedProfit(amexTransactionProfit).toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Fees Section */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Other Fees</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
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
                const adjustedProfit = calculateAdjustedProfit(profit);
                const isNegative = profit < 0;
                
                return (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-medium">{label}</Label>
                    <div className="grid grid-cols-2 gap-4 items-start">
                      <Input
                        type="number"
                        value={fee}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setPricing(prev => ({
                              ...prev,
                              [key]: 0
                            }));
                            return;
                          }
                          const newValue = parseFloat(value);
                          if (!isNaN(newValue)) {
                            setPricing(prev => ({
                              ...prev,
                              [key]: newValue
                            }));
                          }
                        }}
                        className="h-9"
                      />
                      <div className="text-xs space-y-1 pt-2">
                        <p className="text-muted-foreground">
                          Cost: {isPercentage ? `${cost}%` : `$${cost.toFixed(2)}`}
                        </p>
                        <p>
                          Profit: <span className={`${isNegative ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {isPercentage 
                              ? `${profit.toFixed(2)}% (${adjustedProfit.toFixed(2)}%)`
                              : `$${profit.toFixed(2)} ($${adjustedProfit.toFixed(2)})`
                            }
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="w-32"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="w-32"
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
