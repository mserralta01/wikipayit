import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { BankAgreement, ProcessingFees, RiskTerms, TransactionFees } from '@/types/bankingPartner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

const HIGH_RISK_INDUSTRIES = [
  { id: 'adult', label: 'Adult Content' },
  { id: 'gambling', label: 'Gambling & Gaming' },
  { id: 'crypto', label: 'Cryptocurrency' },
  { id: 'nutra', label: 'Nutraceuticals' },
  { id: 'cbd', label: 'CBD/Hemp Products' },
  { id: 'forex', label: 'Forex Trading' },
  { id: 'pharma', label: 'Online Pharmacy' },
  { id: 'tobacco', label: 'Tobacco/Vaping' },
  { id: 'debt', label: 'Debt Collection' },
  { id: 'dating', label: 'Dating Services' },
  { id: 'travel', label: 'Travel Services' },
  { id: 'mlm', label: 'MLM/Direct Marketing' },
] as const;

const processingFeesSchema = z.object({
  visaMasterDiscover: z.number().min(0).max(15),
  amex: z.number().min(0).max(15),
});

const transactionFeesSchema = z.object({
  visaMasterDiscover: z.number().min(0).max(1),
  amex: z.number().min(0).max(1),
});

const riskTermsSchema = z.object({
  revenueSharePercentage: z.number().min(0).max(100),
  processingFees: processingFeesSchema,
  transactionFees: transactionFeesSchema,
  monthlyFee: z.number().min(0),
  chargebackFee: z.number().min(0),
  retrievalFee: z.number().min(0),
  avsFee: z.number().min(0),
  binFee: z.number().min(0),
  sponsorFee: z.number().min(0),
  pciFee: z.number().min(0),
});

const formSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'expired', 'terminated']),
  lowRisk: riskTermsSchema,
  highRisk: riskTermsSchema,
  supportedHighRiskIndustries: z.array(z.string()).default([]),
  documentUrls: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface BankAgreementFormProps {
  bankingPartnerId: string;
  initialData?: Partial<BankAgreement>;
  onSuccess?: (agreement: BankAgreement) => void;
}

export function BankAgreementForm({ bankingPartnerId, initialData, onSuccess }: BankAgreementFormProps) {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: initialData?.startDate?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate?.toDate?.()?.toISOString?.()?.split('T')[0] || '',
      status: initialData?.status || 'draft',
      lowRisk: {
        revenueSharePercentage: initialData?.lowRisk?.revenueSharePercentage || 0,
        processingFees: {
          visaMasterDiscover: initialData?.lowRisk?.processingFees?.visaMasterDiscover || 0,
          amex: initialData?.lowRisk?.processingFees?.amex || 0,
        },
        transactionFees: {
          visaMasterDiscover: initialData?.lowRisk?.transactionFees?.visaMasterDiscover || 0,
          amex: initialData?.lowRisk?.transactionFees?.amex || 0,
        },
        monthlyFee: initialData?.lowRisk?.monthlyFee || 0,
        chargebackFee: initialData?.lowRisk?.chargebackFee || 0,
        retrievalFee: initialData?.lowRisk?.retrievalFee || 0,
        avsFee: initialData?.lowRisk?.avsFee || 0,
        binFee: initialData?.lowRisk?.binFee || 0,
        sponsorFee: initialData?.lowRisk?.sponsorFee || 0,
        pciFee: initialData?.lowRisk?.pciFee || 0,
      },
      highRisk: {
        revenueSharePercentage: initialData?.highRisk?.revenueSharePercentage || 0,
        processingFees: {
          visaMasterDiscover: initialData?.highRisk?.processingFees?.visaMasterDiscover || 0,
          amex: initialData?.highRisk?.processingFees?.amex || 0,
        },
        transactionFees: {
          visaMasterDiscover: initialData?.highRisk?.transactionFees?.visaMasterDiscover || 0,
          amex: initialData?.highRisk?.transactionFees?.amex || 0,
        },
        monthlyFee: initialData?.highRisk?.monthlyFee || 0,
        chargebackFee: initialData?.highRisk?.chargebackFee || 0,
        retrievalFee: initialData?.highRisk?.retrievalFee || 0,
        avsFee: initialData?.highRisk?.avsFee || 0,
        binFee: initialData?.highRisk?.binFee || 0,
        sponsorFee: initialData?.highRisk?.sponsorFee || 0,
        pciFee: initialData?.highRisk?.pciFee || 0,
      },
      supportedHighRiskIndustries: initialData?.supportedHighRiskIndustries || [],
      documentUrls: initialData?.documentUrls || [],
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const agreement: Omit<BankAgreement, 'id'> = {
        bankingPartnerId,
        startDate: serverTimestamp(),
        endDate: data.endDate ? serverTimestamp() : null,
        status: data.status,
        lowRisk: data.lowRisk,
        highRisk: data.highRisk,
        supportedHighRiskIndustries: data.supportedHighRiskIndustries,
        documentUrls: data.documentUrls,
        updatedAt: serverTimestamp(),
        createdAt: initialData?.createdAt || serverTimestamp(),
      };

      if (initialData?.id) {
        await bankingPartnerService.updateAgreement(initialData.id, agreement);
        toast({
          title: 'Agreement updated',
          description: 'The agreement has been updated successfully.',
        });
      } else {
        await bankingPartnerService.addAgreement(agreement);
        toast({
          title: 'Agreement created',
          description: 'The agreement has been created successfully.',
        });
      }

      if (onSuccess) {
        onSuccess({ id: initialData?.id || '', ...agreement } as BankAgreement);
      } else {
        navigate(`/admin/banking-partners/${bankingPartnerId}`);
      }
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the agreement. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const renderFeeField = (
    name: keyof FormValues | `${keyof FormValues}.${string}`,
    label: string,
    options?: {
      step?: string;
      min?: number;
      max?: number;
    }
  ) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem className="grid grid-cols-2 items-center gap-2">
          <FormLabel className="text-sm">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={options?.step || "0.01"}
              min={options?.min || 0}
              max={options?.max}
              value={typeof value === 'number' ? value : 0}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="h-8"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderRiskSection = (type: 'lowRisk' | 'highRisk', title: string) => (
    <Card className="w-full">
      <CardHeader className="py-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            {renderFeeField(
              `${type}.revenueSharePercentage`,
              'Revenue Share %',
              { max: 100 }
            )}

            <Separator className="my-2" />
            <h4 className="text-sm font-medium mb-2">Processing Fees (%)</h4>
            <div className="space-y-2">
              {renderFeeField(
                `${type}.processingFees.visaMasterDiscover`,
                'V/M/D Processing Fee',
                { step: '0.001', max: 15 }
              )}
              {renderFeeField(
                `${type}.processingFees.amex`,
                'AMEX Processing Fee',
                { step: '0.001', max: 15 }
              )}
            </div>

            <Separator className="my-2" />
            <h4 className="text-sm font-medium mb-2">Transaction Fees ($)</h4>
            <div className="space-y-2">
              {renderFeeField(
                `${type}.transactionFees.visaMasterDiscover`,
                'V/M/D Transaction Fee',
                { max: 1 }
              )}
              {renderFeeField(
                `${type}.transactionFees.amex`,
                'AMEX Transaction Fee',
                { max: 1 }
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-2">Additional Fees</h4>
            <div className="space-y-2">
              {renderFeeField(`${type}.monthlyFee`, 'Monthly Fee')}
              {renderFeeField(`${type}.chargebackFee`, 'Chargeback Fee')}
              {renderFeeField(`${type}.retrievalFee`, 'Retrieval Fee')}
              {renderFeeField(`${type}.avsFee`, 'AVS Fee')}
              {renderFeeField(`${type}.binFee`, 'BIN Fee')}
              {renderFeeField(`${type}.sponsorFee`, 'Sponsor Fee')}
              {renderFeeField(`${type}.pciFee`, 'PCI Fee')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold">Agreement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {renderRiskSection('lowRisk', 'Low Risk Terms')}
          {renderRiskSection('highRisk', 'High Risk Terms')}
        </div>

        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="industries">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-semibold">Supported High-Risk Industries</CardTitle>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-3 gap-4">
                  {HIGH_RISK_INDUSTRIES.map((industry) => (
                    <FormField
                      key={industry.id}
                      control={form.control}
                      name="supportedHighRiskIndustries"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={industry.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(industry.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, industry.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== industry.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {industry.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="w-[200px]">
            {initialData?.id ? 'Update Agreement' : 'Create Agreement'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 