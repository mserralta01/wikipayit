import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { BankContact } from '@/types/bankingPartner';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Contact name must be at least 2 characters.',
  }),
  role: z.string().min(2, {
    message: 'Role must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  department: z.enum(['sales', 'support', 'underwriting', 'management', 'other'], {
    required_error: 'Please select a department.',
  }),
  isMainContact: z.boolean().default(false),
});

interface BankContactFormProps {
  bankingPartnerId: string;
  initialData?: BankContact;
  onSuccess?: (contact: BankContact) => void;
}

export function BankContactForm({ bankingPartnerId, initialData, onSuccess }: BankContactFormProps) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      department: initialData?.department || 'other',
      isMainContact: initialData?.isMainContact || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const contactData = {
        ...values,
        bankingPartnerId,
      };

      if (initialData) {
        await bankingPartnerService.updateContact(initialData.id, contactData);
        toast({
          title: 'Success',
          description: 'Contact updated successfully',
        });
      } else {
        await bankingPartnerService.addContact(contactData);
        toast({
          title: 'Success',
          description: 'Contact added successfully',
        });
      }

      if (onSuccess) {
        onSuccess({
          id: initialData?.id || '',
          ...contactData,
        });
      }

      navigate(`/admin/banking-partners/${bankingPartnerId}`);
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact',
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
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Enter role" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="underwriting">Underwriting</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isMainContact"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Main Contact</FormLabel>
                <FormDescription>
                  Designate this person as the main contact for this banking partner
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/banking-partners/${bankingPartnerId}`)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 