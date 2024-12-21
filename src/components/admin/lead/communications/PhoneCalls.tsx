import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Timestamp, collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { merchantCommunication } from "@/services/merchantCommunication"
import { db } from "@/lib/firebase"
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
  const [activities, setActivities] = useState<Activity[]>([])
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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities')
        const q = query(
          activitiesRef,
          where('merchantId', '==', merchant.id),
          where('type', '==', 'phone_call'),
          orderBy('timestamp', 'desc')
        )

        const snapshot = await getDocs(q)
        setActivities(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[])
      } catch (error) {
        console.error('Error fetching phone call activities:', error)
        toast({
          title: "Error loading phone calls",
          description: "There was an error loading the phone call history.",
          variant: "destructive",
        })
      }
    }

    fetchActivities()
  }, [merchant.id, toast])

  const onSubmit = async (values: PhoneCallFormValues) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await merchantCommunication.addPhoneCall(merchant.id, {
        duration: values.duration,
        outcome: values.outcome,
        notes: values.notes,
        agentId: user.uid,
        agentName: user.displayName || user.email || "Unknown Agent"
      })

      form.reset()
      toast({
        title: "Phone call logged successfully",
        description: "The phone call has been recorded.",
      })
    } catch (error) {
      console.error("Error logging phone call:", error)
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
          {activities?.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{activity.metadata?.agentName || "Unknown Agent"}</p>
                  <p className="text-sm text-gray-500">
                    {format(activity.timestamp instanceof Timestamp ? activity.timestamp.toDate() : new Date(activity.timestamp), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Duration: {activity.metadata?.duration} minutes</p>
                  <p className="text-sm capitalize">Outcome: {activity.metadata?.outcome}</p>
                </div>
              </div>
              {activity.metadata?.notes && (
                <p className="mt-2 text-sm text-gray-700">{activity.metadata.notes}</p>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
