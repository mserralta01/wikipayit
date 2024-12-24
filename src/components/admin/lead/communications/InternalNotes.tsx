import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { merchantCommunication } from "@/services/merchantCommunication"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Timestamp } from "firebase/firestore"
import { Activity } from "@/types/activity"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Pin, PinOff } from "lucide-react"

interface InternalNotesProps {
  merchant: PipelineMerchant
}

export function InternalNotes({ merchant }: InternalNotesProps) {
  const [noteContent, setNoteContent] = useState("")
  const [notes, setNotes] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await merchantCommunication.getActivities(merchant.id, 'note')
        setNotes(fetchedNotes)
      } catch (error) {
        console.error("Error loading notes:", error)
        toast({
          title: "Failed to load notes",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [merchant.id, toast])

  const handleAddNote = async () => {
    if (!noteContent.trim() || !user) return

    setIsSubmitting(true)
    try {
      await merchantCommunication.addNote(merchant.id, {
        content: noteContent.trim(),
        createdAt: Timestamp.now(),
        createdBy: user.uid,
        agentName: user.displayName || user.email || "Unknown Staff Member",
        isPinned: false
      })

      // Refresh notes after adding
      const updatedNotes = await merchantCommunication.getActivities(merchant.id, 'note')
      setNotes(updatedNotes)
      setNoteContent("")

      toast({
        title: "Note added successfully",
        description: "Your note has been saved.",
      })
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Failed to add note",
        description: "There was an error saving your note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only administrators can view and manage internal notes.
        </AlertDescription>
      </Alert>
    )
  }

  const handlePinToggle = async (note: Activity) => {
    if (!user) return
    setIsPinning(true)
    try {
      const updatedNote = {
        ...note,
        metadata: {
          ...note.metadata,
          isPinned: !note.metadata?.isPinned,
          pinnedAt: !note.metadata?.isPinned ? Timestamp.now() : undefined
        }
      }
      
      // Update the note in Firestore
      await merchantCommunication.updateNote(merchant.id, note.id, updatedNote)
      
      // Refresh notes
      const updatedNotes = await merchantCommunication.getActivities(merchant.id, 'note')
      setNotes(updatedNotes)
      
      toast({
        title: updatedNote.metadata.isPinned ? "Note pinned" : "Note unpinned",
        description: "Note status updated successfully.",
      })
    } catch (error) {
      console.error("Error toggling pin status:", error)
      toast({
        title: "Failed to update note",
        description: "There was an error updating the note status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPinning(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Note creation form */}
      <Card>
        <CardContent className="pt-6">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Add a note..."
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={handleAddNote}
              disabled={!noteContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <Card 
                key={note.id} 
                className={`transition-all duration-200 ${
                  note.metadata?.isPinned 
                    ? "border-2 border-blue-500 bg-blue-50/50 shadow-md" 
                    : "hover:shadow-sm"
                }`}
              >
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      {note.metadata?.isPinned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{note.metadata?.noteContent}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Added by {note.metadata?.agentName || "Unknown Staff Member"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant={note.metadata?.isPinned ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handlePinToggle(note)}
                      disabled={isPinning}
                      className="p-2 hover:bg-blue-100/50"
                    >
                      {note.metadata?.isPinned ? (
                        <PinOff className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex flex-col items-end text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(note.timestamp.toDate(), { addSuffix: true })}
                      </span>
                      {note.metadata?.isPinned && note.metadata?.pinnedAt && (
                        <span className="text-blue-600">
                          Pinned {formatDistanceToNow(note.metadata.pinnedAt.toDate(), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-4 text-center text-gray-500">
              No notes found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
