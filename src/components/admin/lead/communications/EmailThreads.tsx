import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "@/types/activity"
import { Skeleton } from "@/components/ui/skeleton"
import { EmailEditor } from "./EmailEditor"
import { merchantCommunication } from "@/services/merchantCommunication"

interface EmailThreadsProps {
  merchant: PipelineMerchant
}

export function EmailThreads({ merchant }: EmailThreadsProps) {
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

  const getRecipientOptions = () => {
    const options: Array<{ email: string; label: string }> = []

    // Add main contact email
    if (merchant.email) {
      options.push({
        email: merchant.email,
        label: `${merchant.businessName} (Primary)`
      })
    }

    // Add beneficial owner emails
    merchant.beneficialOwners?.forEach((owner) => {
      if (owner.email) {
        options.push({
          email: owner.email,
          label: `${owner.firstName} ${owner.lastName} (Owner)`
        })
      }
    })

    return options
  }

  const handleSendEmail = async (content: string, recipient: string, subject: string) => {
    try {
      const success = await merchantCommunication.sendEmail(merchant.id, {
        recipientEmail: recipient,
        subject,
        content
      })

      if (success) {
        toast({
          title: "Email sent successfully",
          variant: "default"
        })
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
          <EmailEditor
            onSend={handleSendEmail}
            recipientOptions={getRecipientOptions()}
            placeholder="Compose new email..."
          />
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
