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
    console.log('EmailThreads - Initial merchant data:', {
      id: merchant.id,
      email: merchant.email,
      businessName: merchant.businessName,
      formData: merchant.formData,
      beneficialOwners: merchant.beneficialOwners
    })

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

    console.log('Merchant data in getRecipientOptions:', {
      email: merchant.email,
      businessName: merchant.businessName || merchant.formData?.businessName,
      beneficialOwners: merchant.beneficialOwners,
      formDataOwners: merchant.formData?.beneficialOwners?.owners
    })

    // Add main contact email
    if (merchant.email) {
      const businessName = merchant.businessName || merchant.formData?.businessName || 'Unknown Business'
      options.push({
        email: merchant.email,
        label: `${businessName} - Primary Contact`
      })
      console.log('Added primary contact:', merchant.email)
    }

    // Add beneficial owner emails
    merchant.beneficialOwners?.forEach((owner) => {
      if (owner.email) {
        const ownerName = `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
        options.push({
          email: owner.email,
          label: `${ownerName} - Beneficial Owner`
        })
        console.log('Added beneficial owner:', owner.email)
      }
    })

    // Add form data email if different
    if (merchant.formData?.email && merchant.formData.email !== merchant.email) {
      const businessName = merchant.formData.businessName || merchant.businessName || 'Unknown Business'
      options.push({
        email: merchant.formData.email,
        label: `${businessName} - Application Contact`
      })
      console.log('Added form data email:', merchant.formData.email)
    }

    // Add form data beneficial owner emails if different
    merchant.formData?.beneficialOwners?.owners.forEach((owner) => {
      if (owner.email && !options.some(opt => opt.email === owner.email)) {
        const ownerName = `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
        options.push({
          email: owner.email,
          label: `${ownerName} - Application Owner`
        })
        console.log('Added form data owner:', owner.email)
      }
    })

    console.log('Final recipient options:', options)
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
