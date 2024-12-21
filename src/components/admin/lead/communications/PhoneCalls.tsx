import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity } from "@/types/activity"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Merchant as PipelineMerchant } from "@/types/merchant"

interface PhoneCallsProps {
  merchant: PipelineMerchant
}

const phoneCallSchema = z.object({
  duration: z.string().min(1, "Duration is required"),
  outcome: z.enum(["successful", "no_answer", "follow_up_required", "voicemail", "other"], {
    required_error: "Please select an outcome",
  }),
  notes: z.string().min(1, "Notes are required"),
})

type PhoneCallFormValues = z.infer<typeof phoneCallSchema>

export function PhoneCalls({ merchant }: PhoneCallsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<PhoneCallFormValues>({
    resolver: zodResolver(phoneCallSchema),
    defaultValues: {
      duration: "",
      outcome: undefined,
      notes: "",
    },
  })

  const onSubmit = async (values: PhoneCallFormValues) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const newActivity: Omit<Activity, "id"> = {
        type: "phone_call",
        description: `Phone call - ${values.outcome}`,
        timestamp: Timestamp.now(),
        userId: user.uid,
        merchantId: merchant.id,
        merchant: {
          businessName: merchant.businessName || "",
        },
        metadata: {
          duration: values.duration,
          outcome: values.outcome,
          notes: values.notes,
          agentId: user.uid,
          agentName: user.displayName || user.email || "Unknown Agent",
        },
      }

      // TODO: Add activity through merchant service
      form.reset()
      toast({
        title: "Phone call logged successfully",
        description: "The phone call has been recorded.",
      })
    } catch (error) {
      toast({
        title: "Error logging phone call",
        description: "There was an error recording the phone call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" placeholder="Enter call duration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcome"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Outcome</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="successful">Successful</SelectItem>
                        <SelectItem value="no_answer">No Answer</SelectItem>
                        <SelectItem value="follow_up_required">Follow Up Required</SelectItem>
                        <SelectItem value="voicemail">Left Voicemail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter call notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                Log Phone Call
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {/* TODO: Add phone call activity list */}
        </div>
      </ScrollArea>
    </div>
  )
}
