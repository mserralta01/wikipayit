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
import { BankingPartner } from '@/types/bankingPartner';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Partner name must be at least 2 characters.',
  }),
  status: z.enum(['active', 'inactive', 'pending'], {
    required_error: 'Please select a status.',
  }),
});

interface BankingPartnerFormProps {
  initialData?: BankingPartner;
  onSuccess?: (partner: BankingPartner) => void;
}

export function BankingPartnerForm({ initialData, onSuccess }: BankingPartnerFormProps) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'pending',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await bankingPartnerService.updateBankingPartner(initialData.id, values);
        toast({
          title: 'Success',
          description: 'Banking partner updated successfully',
        });
      } else {
        const id = await bankingPartnerService.createBankingPartner(values);
        toast({
          title: 'Success',
          description: 'Banking partner created successfully',
        });
        navigate(`/admin/banking-partners/${id}`);
      }

      if (onSuccess) {
        onSuccess({
          id: initialData?.id || '',
          ...values,
          createdAt: initialData?.createdAt || Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    } catch (error) {
      console.error('Error saving banking partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to save banking partner',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter partner name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the banking partner organization.
              </FormDescription>
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
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current status of the partnership.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/banking-partners')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Partner' : 'Create Partner'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 