import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { interchangeService } from '@/services/interchangeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  visaMastercardDiscover: z.object({
    percentage: z.number().min(0).max(100),
    transactionFee: z.number().min(0).max(10),
  }),
  americanExpress: z.object({
    percentage: z.number().min(0).max(100),
    transactionFee: z.number().min(0).max(10),
  }),
});

export default function InterchangePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visaMastercardDiscover: {
        percentage: 1.65,
        transactionFee: 0.10,
      },
      americanExpress: {
        percentage: 2.30,
        transactionFee: 0.10,
      },
    },
  });

  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await interchangeService.getInterchangeRates();
        if (rates) {
          form.reset({
            visaMastercardDiscover: rates.visaMastercardDiscover,
            americanExpress: rates.americanExpress,
          });
        }
      } catch (error) {
        toast({
          title: "Error loading rates",
          description: "Failed to load interchange rates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await interchangeService.updateInterchangeRates(values, user?.uid || '');
      toast({
        title: "Success",
        description: "Interchange rates updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interchange rates",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Interchange Rates Management</CardTitle>
          <CardDescription>
            Set base processing costs for merchant profitability calculations.
            These rates are from 2023 and are used for estimation purposes only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visa / Mastercard / Discover</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visaMastercardDiscover.percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visaMastercardDiscover.transactionFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">American Express</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="americanExpress.percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="americanExpress.transactionFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export { InterchangePage }; 