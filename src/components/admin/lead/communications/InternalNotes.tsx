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
import { Activity } from "@/types/activity"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2, StickyNote, Pin, PlusCircle, ScrollText } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface InternalNotesProps {
  merchant: PipelineMerchant
}

const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  isPinned: z.boolean().default(false),
})

type NoteFormValues = z.infer<typeof noteSchema>

export function InternalNotes({ merchant }: InternalNotesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
      isPinned: false,
    },
  })

  const { data: activities, isLoading } = useQuery({
    queryKey: ['notes', merchant.id],
    queryFn: async () => {
      const notes = await merchantCommunication.getActivities(merchant.id, 'note')
      return notes.sort((a, b) => {
        if (a.metadata?.isPinned && !b.metadata?.isPinned) return -1
        if (!a.metadata?.isPinned && b.metadata?.isPinned) return 1
        return b.timestamp.toMillis() - a.timestamp.toMillis()
      })
    },
    onError: (error) => {
      console.error('Error fetching notes:', error)
      toast({
        title: "Error loading notes",
        description: "There was an error loading the notes.",
        variant: "destructive",
      })
    }
  })

  const handleDelete = async (noteId: string) => {
    try {
      await merchantCommunication.deleteNote(merchant.id, noteId)
      await queryClient.invalidateQueries(['notes', merchant.id])
      toast({
        title: "Success",
        description: "Note deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      })
    }
  }

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      await merchantCommunication.updateNote(merchant.id, noteId, {
        metadata: {
          isPinned: !currentPinned,
          pinnedAt: !currentPinned ? new Date() : null
        }
      })
      await queryClient.invalidateQueries(['notes', merchant.id])
      toast({
        title: "Success",
        description: `Note ${!currentPinned ? 'pinned' : 'unpinned'} successfully.`,
      })
    } catch (error) {
      console.error("Error toggling pin:", error)
      toast({
        title: "Error",
        description: "Failed to update note pin status.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (values: NoteFormValues) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await merchantCommunication.addNote(merchant.id, {
        content: values.content,
        createdBy: user.uid,
        agentName: user.displayName || user.email || "Unknown Agent",
        isPinned: values.isPinned,
      })

      await queryClient.invalidateQueries(['notes', merchant.id])
      
      form.reset()
      toast({
        title: "Success",
        description: "Note added successfully.",
      })
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add Note
          </CardTitle>
          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-2 hover:bg-gray-100",
                    field.value && "text-yellow-600"
                  )}
                  onClick={() => field.onChange(!field.value)}
                >
                  <Pin className={cn(
                    "h-4 w-4",
                    field.value && "fill-current"
                  )} />
                </Button>
              </FormItem>
            )}
          />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter note content" className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  Add Note
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Notes History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {!activities?.length ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <StickyNote className="h-12 w-12 mb-2 opacity-50" />
                <p>No notes added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-4 relative group">
                    <div className="absolute right-2 top-2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          activity.metadata?.isPinned 
                            ? "text-yellow-600" 
                            : "text-gray-300 hover:text-yellow-600"
                        )}
                        onClick={() => handleTogglePin(activity.id, !!activity.metadata?.isPinned)}
                      >
                        <Pin className={cn(
                          "h-4 w-4",
                          activity.metadata?.isPinned && "fill-current"
                        )} />
                      </Button>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this note? This action cannot be undone.
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
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{activity.metadata?.agentName || "Unknown Agent"}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(activity.timestamp instanceof Timestamp ? activity.timestamp.toDate() : new Date(activity.timestamp), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        {activity.metadata?.content || activity.metadata?.noteContent}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
