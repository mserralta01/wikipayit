import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Merchant, BeneficialOwner } from "@/types/merchant"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Activity } from "@/types/activity"
import { Skeleton } from "@/components/ui/skeleton"
import { EmailEditor } from "./EmailEditor"
import { merchantCommunication } from "@/services/merchantCommunication"
import { ChevronDown, ChevronUp, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmailThreadsProps {
  merchant: Merchant
}

export function EmailThreads({ merchant }: EmailThreadsProps) {
  const [emailThreads, setEmailThreads] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({})
  const [showEmailEditor, setShowEmailEditor] = useState(false)
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
    (merchant.beneficialOwners as BeneficialOwner[] | undefined)?.forEach((owner: BeneficialOwner) => {
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
      console.log('EmailThreads.handleSendEmail - Starting:', {
        merchantId: merchant.id,
        recipient,
        subject,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      const success = await merchantCommunication.sendEmail(merchant.id, {
        recipientEmail: recipient,
        subject,
        content
      });
      
      console.log('EmailThreads.handleSendEmail - Result:', {
        success,
        timestamp: new Date().toISOString()
      });

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

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Email Communications</h2>
          {!loading && emailThreads.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {emailThreads.length} {emailThreads.length === 1 ? 'email' : 'emails'} sent
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowEmailEditor(!showEmailEditor)}
          className="gap-2 shadow-sm"
          variant={showEmailEditor ? "secondary" : "default"}
          size="lg"
        >
          <Send className="h-4 w-4" />
          {showEmailEditor ? "Cancel" : "Send New Email"}
        </Button>
      </div>

      {showEmailEditor && (
        <Card className="shadow-md border-muted">
          <CardContent className="pt-6">
            <EmailEditor
              onSend={(content, recipient, subject) => {
                handleSendEmail(content, recipient, subject);
                setShowEmailEditor(false);
              }}
              recipientOptions={getRecipientOptions()}
              placeholder="Compose new email..."
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
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
            <Card 
              key={thread.id} 
              className={cn(
                "transition-all duration-200 shadow-sm hover:shadow-md",
                expandedThreads[thread.id] ? "bg-accent/5" : "hover:bg-accent/5"
              )}
            >
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{thread.metadata?.subject || 'No Subject'}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(thread.timestamp.toDate(), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">To: {thread.metadata?.recipientEmail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleThread(thread.id)}
                    className={cn(
                      "ml-2 transition-transform duration-200",
                      expandedThreads[thread.id] ? "rotate-180" : ""
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                {expandedThreads[thread.id] && thread.metadata?.content && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div 
                      className="text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: thread.metadata.content }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center">
              <Mail className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No email communications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
