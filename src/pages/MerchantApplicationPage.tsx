import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { MerchantApplicationForm } from "@/components/merchant/MerchantApplicationForm"
import { useAuth } from "@/contexts/AuthContext"
import { merchantService } from "@/services/merchantService"
import { useToast } from "@/hooks/useToast"
import { LeadStatus } from "@/types/lead"

export default function MerchantApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const initializeLead = async () => {
      try {
        if (user?.email) {
          // Check if lead exists
          const existingLead = await merchantService.getLeadByEmail(user.email)
          if (existingLead) {
            setLeadId(existingLead.id)
            setCurrentStep(existingLead.currentStep)
            setFormData(existingLead.formData)
          } else {
            // Create new lead
            const newLeadId = await merchantService.createLead(user.email)
            setLeadId(newLeadId)
          }
        }
      } catch (error) {
        console.error("Error initializing lead:", error)
        toast({
          title: "Error",
          description: "Failed to initialize application. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeLead()
  }, [user?.email, toast])

  const handleStepComplete = async (stepData: any, step: number) => {
    try {
      if (!leadId) {
        throw new Error("No lead ID available")
      }

      // Update form data locally
      const updatedFormData = { ...formData, ...stepData }
      setFormData(updatedFormData)

      // Save to Firebase
      await merchantService.updateLeadStep(leadId, step, stepData)

      // Show success dialog only after completing the Documentation step (step 6)
      if (step === 6) {
        await merchantService.updateLead(leadId, { status: "Documents" as LeadStatus })
        setShowSuccessDialog(true)
      }
    } catch (error) {
      console.error("Error saving step data:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleReturnHome = () => {
    setShowSuccessDialog(false)
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <MerchantApplicationForm
        initialData={formData}
        currentStep={currentStep}
        leadId={leadId || ""}
        onStepComplete={handleStepComplete}
        onStepChange={handleStepChange}
      />

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Application Submitted Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for submitting your merchant application. Our team will review your information and contact you shortly via phone or email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <h3 className="font-medium text-center">What happens next?</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>Our team will review your application within 1-2 business days</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>A representative will contact you to discuss your application</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>We'll guide you through any additional requirements or documentation needed</span>
              </li>
            </ol>
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={handleReturnHome} className="w-full">
              Return to Homepage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
//great file