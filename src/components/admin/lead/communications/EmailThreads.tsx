import React, { useState, useEffect } from "react"
import { Card, CardContent } from "../../../../components/ui/card"
import { Merchant as PipelineMerchant } from "../../../../types/merchant"
import { Button } from "../../../../components/ui/button"
import { merchantCommunication } from "../../../../services/merchantCommunication"
import { useToast } from "../../../../hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "../../../../types/crm"
import { Skeleton } from "../../../../components/ui/skeleton"

interface EmailThreadsProps {
  merchant: PipelineMerchant
}

export function EmailThreads({ merchant }: EmailThreadsProps) {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [emailThreads, setEmailThreads] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadEmailThreads = async () => {
      try {
        const threads = await merchantCommunication.getEmailThreads(merchant.id)
        setEmailThreads(threads)
      } catch (error) {
        console.error("Error loading email threads:", error)
        toast({
          title: "Failed to load email threads",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadEmailThreads()
  }, [merchant.id, toast])

  const handleSendEmail = async () => {
    try {
      const success = await merchantCommunication.sendEmail(merchant.id, {
        subject,
        content
      })

      if (success) {
        toast({
          title: "Email sent successfully",
          variant: "default"
        })
        setSubject("")
        setContent("")
        const threads = await merchantCommunication.getEmailThreads(merchant.id)
        setEmailThreads(threads)
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded-md"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Compose new email..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={handleSendEmail}
              disabled={!subject.trim() || !content.trim()}
            >
              Send Email
            </Button>
          </div>
        </CardContent>
      </Card>

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
        ) : emailThreads.length > 0 ? (
          emailThreads.map((thread) => (
            <Card key={thread.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{thread.metadata?.subject || 'No Subject'}</h4>
                    <p className="text-sm text-gray-500">To: {thread.metadata?.recipientEmail}</p>
                    {thread.metadata?.content && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {thread.metadata.content}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(thread.timestamp.toDate(), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-4 text-center text-gray-500">
              No email threads found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
