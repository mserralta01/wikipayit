import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { applicationFormSchema } from "@/lib/validations/applicationSchema";

interface ApplicationFormData {
  isCurrentlyProcessing: boolean;
  currentProcessor?: {
    name?: string;
    monthlyVolume?: string;
    reasonForLeaving?: string;
  };
  hasBeenTerminated: boolean;
  terminationDetails?: {
    previousProcessor?: string;
    terminationReason?: string;
    date?: string;
  };
}

export function ApplicationForm() {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      isCurrentlyProcessing: false,
      hasBeenTerminated: false,
    },
    mode: "onChange",
  });

  const isCurrentlyProcessing = form.watch("isCurrentlyProcessing");
  const hasBeenTerminated = form.watch("hasBeenTerminated");

  useEffect(() => {
    if (!isCurrentlyProcessing) {
      form.setValue('currentProcessor', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isCurrentlyProcessing, form]);

  useEffect(() => {
    if (!hasBeenTerminated) {
      form.setValue('terminationDetails', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [hasBeenTerminated, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      console.log('Form submitted:', data);
      // Handle form submission
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="isCurrentlyProcessing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you currently processing?</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('currentProcessor', undefined);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCurrentlyProcessing && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium">Current Processor Details</h3>
            <FormField
              control={form.control}
              name="currentProcessor.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Processor Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter processor name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentProcessor.monthlyVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Processing Volume</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter monthly volume" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentProcessor.reasonForLeaving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leaving</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter reason for leaving" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="hasBeenTerminated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Have you ever been terminated?</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('terminationDetails', undefined);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasBeenTerminated && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium">Termination Details</h3>
            <FormField
              control={form.control}
              name="terminationDetails.previousProcessor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Processor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter previous processor name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terminationDetails.terminationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Termination</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter termination reason" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terminationDetails.date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termination Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit">Next</Button>
      </form>
    </Form>
  );
} 