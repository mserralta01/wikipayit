import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { merchantCommunication } from "@/services/merchantCommunication"
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
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { Phone, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

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

const formatOutcome = (outcome: string) => {
  return outcome
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const outcomeColors = {
  successful: "bg-green-500",
  no_answer: "bg-red-500",
  follow_up_required: "bg-yellow-500",
  voicemail: "bg-blue-500",
  other: "bg-gray-500",
} as const

const fetchPhoneCalls = async (merchantId: string): Promise<Activity[]> => {
  return await merchantCommunication.getActivities(merchantId, 'phone_call');
};

export function PhoneCalls({ merchant }: PhoneCallsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const form = useForm<PhoneCallFormValues>({
    resolver: zodResolver(phoneCallSchema),
    defaultValues: {
      duration: "",
      outcome: undefined,
      notes: "",
    },
  })

  const { data: activities, isLoading, error } = useQuery<
    Activity[],
    Error,
    Activity[],
    [string, string]
  >({
    queryKey: ['phone-calls', merchant.id] as const,
    queryFn: () => fetchPhoneCalls(merchant.id),
    retry: 1,
    throwOnError: true
  });

  // Handle error in effect
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading phone calls",
        description: "There was a problem loading the phone calls. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

      await queryClient.invalidateQueries({
        queryKey: ['phone-calls', merchant.id] as const
      });
      
      form.reset()
      toast({
        title: "Success",
        description: "Phone call logged successfully.",
      })
    } catch (error) {
      console.error("Error logging phone call:", error)
      toast({
        title: "Error",
        description: "Failed to log phone call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (phoneCallId: string) => {
    try {
      await merchantCommunication.deletePhoneCall(merchant.id, phoneCallId)
      await queryClient.invalidateQueries({
        queryKey: ['phone-calls', merchant.id] as const
      });
      toast({
        title: "Success",
        description: "Phone call record deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting phone call:", error)
      toast({
        title: "Error",
        description: "Failed to delete phone call record.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
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
                render={({ field }) => (
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
                render={({ field }) => (
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
                render={({ field }) => (
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

      <ScrollArea className="h-[400px] pr-4">
        {!activities?.length ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
            <Phone className="h-12 w-12 mb-2 opacity-50" />
            <p>No phone calls logged yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="p-4 relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Phone Call Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this phone call record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(activity.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{activity.metadata?.agentName || "Unknown Agent"}</p>
                      <Badge className={`${outcomeColors[activity.metadata?.outcome || 'other']} text-white`}>
                        {formatOutcome(activity.metadata?.outcome || 'other')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(activity.timestamp instanceof Timestamp ? activity.timestamp.toDate() : new Date(activity.timestamp), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Duration: {activity.metadata?.duration} minutes</p>
                  </div>
                </div>
                {activity.metadata?.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{activity.metadata.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
