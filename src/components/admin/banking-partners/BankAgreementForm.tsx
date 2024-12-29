import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import type { BankAgreement } from '@/types/bankingPartner';

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

const formSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'expired', 'terminated']),
  lowRisk: z.object({
    revenueSharePercentage: z.number().min(0).max(100),
    monthlyMinimumFee: z.number().min(0),
    transactionFees: z.object({
      creditCard: z.number().min(0),
      debit: z.number().min(0),
      ach: z.number().min(0),
    }),
  }),
  highRisk: z.object({
    revenueSharePercentage: z.number().min(0).max(100),
    monthlyMinimumFee: z.number().min(0),
    transactionFees: z.object({
      creditCard: z.number().min(0),
      debit: z.number().min(0),
      ach: z.number().min(0),
    }),
  }),
  supportedHighRiskIndustries: z.array(z.string()),
  documentUrls: z.array(z.string()).optional(),
});

interface BankAgreementFormProps {
  bankingPartnerId: string;
  initialData?: any;
  onSuccess?: (agreement: any) => void;
}

export function BankAgreementForm({ bankingPartnerId, initialData, onSuccess }: BankAgreementFormProps) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate || '',
      status: initialData?.status || 'draft',
      lowRisk: {
        revenueSharePercentage: initialData?.lowRisk?.revenueSharePercentage || 0,
        monthlyMinimumFee: initialData?.lowRisk?.monthlyMinimumFee || 0,
        transactionFees: {
          creditCard: initialData?.lowRisk?.transactionFees?.creditCard || 0,
          debit: initialData?.lowRisk?.transactionFees?.debit || 0,
          ach: initialData?.lowRisk?.transactionFees?.ach || 0,
        },
      },
      highRisk: {
        revenueSharePercentage: initialData?.highRisk?.revenueSharePercentage || 0,
        monthlyMinimumFee: initialData?.highRisk?.monthlyMinimumFee || 0,
        transactionFees: {
          creditCard: initialData?.highRisk?.transactionFees?.creditCard || 0,
          debit: initialData?.highRisk?.transactionFees?.debit || 0,
          ach: initialData?.highRisk?.transactionFees?.ach || 0,
        },
      },
      supportedHighRiskIndustries: initialData?.supportedHighRiskIndustries || [],
      documentUrls: initialData?.documentUrls || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const agreementData = {
        ...values,
        bankingPartnerId,
        startDate: Timestamp.fromDate(new Date(values.startDate)),
        endDate: values.endDate ? Timestamp.fromDate(new Date(values.endDate)) : null,
        updatedAt: Timestamp.now(),
        createdAt: initialData ? initialData.createdAt : Timestamp.now(),
      } as BankAgreement;

      if (initialData) {
        const { id, ...updateData } = agreementData;
        await bankingPartnerService.updateAgreement(initialData.id, updateData);
        toast({
          title: 'Success',
          description: 'Agreement updated successfully',
        });
      } else {
        const { id, ...newData } = agreementData;
        await bankingPartnerService.addAgreement(newData);
        toast({
          title: 'Success',
          description: 'Agreement added successfully',
        });
      }

      if (onSuccess) {
        onSuccess(agreementData);
      }

      navigate(`/admin/banking-partners/${bankingPartnerId}`);
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save agreement',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !initialData) return;

    try {
      const downloadUrl = await bankingPartnerService.uploadAgreementDocument(
        bankingPartnerId,
        initialData.id,
        file
      );

      const updatedUrls = [...(initialData.documentUrls || []), downloadUrl];
      await bankingPartnerService.updateAgreement(initialData.id, {
        documentUrls: updatedUrls,
      });

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Agreement Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
          {/* Low Risk Section */}
          <Card>
            <CardHeader>
              <CardTitle>Low Risk Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lowRisk.revenueSharePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Share %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowRisk.monthlyMinimumFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />
              <h4 className="text-sm font-medium">Transaction Fees (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="lowRisk.transactionFees.creditCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Card</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowRisk.transactionFees.debit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowRisk.transactionFees.ach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ACH</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* High Risk Section */}
          <Card>
            <CardHeader>
              <CardTitle>High Risk Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="highRisk.revenueSharePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Share %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highRisk.monthlyMinimumFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />
              <h4 className="text-sm font-medium">Transaction Fees (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="highRisk.transactionFees.creditCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Card</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highRisk.transactionFees.debit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highRisk.transactionFees.ach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ACH</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />
              <FormField
                control={form.control}
                name="supportedHighRiskIndustries"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Supported High-Risk Industries</FormLabel>
                      <FormDescription>
                        Select the high-risk industries this partner can process
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                                    onCheckedChange={(checked: boolean) => {
                                      return checked
                                        ? field.onChange([...field.value, industry.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== industry.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {industry.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {initialData && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
              />
              {initialData.documentUrls && initialData.documentUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
                  <ul className="list-disc pl-5">
                    {initialData.documentUrls.map((url: string, index: number) => (
                      <li key={index}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/banking-partners/${bankingPartnerId}`)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Agreement' : 'Add Agreement'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 