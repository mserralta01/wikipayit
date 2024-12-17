import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MerchantApplicationForm } from '../components/merchant/MerchantApplicationForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { merchantService } from "../services/merchantService"

export default function MerchantApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const initializeLead = async () => {
      if (user?.email) {
        try {
          // Try to get existing lead or create new one
          const existingLead = await merchantService.getLeadByEmail(user.email)
          if (existingLead) {
            setLeadId(existingLead.id)
            setFormData(existingLead.formData || {})
            setCurrentStep(existingLead.currentStep || 1)
          } else {
            // Create new lead with user info
            const newLeadId = await merchantService.createLead(user.email, {
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            })
            setLeadId(newLeadId)
            // Initialize form data with user info
            setFormData({
              email: user.email,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            })
          }
        } catch (error) {
          console.error('Error initializing lead:', error)
        }
      }
    }

    initializeLead()
  }, [user])

  const handleStepComplete = async (stepData: any, step: number) => {
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
    
    // Update lead in database
    if (leadId) {
      try {
        await merchantService.updateLead(leadId, {
          formData: updatedData,
          currentStep: step,
          status: step === 6 ? 'completed' : 'in_progress',
          pipelineStatus: step === 6 ? 'documents' : 'lead'
        })
      } catch (error) {
        console.error('Error updating lead:', error)
      }
    }
    
    // Show success dialog only after completing the Documentation step (step 6)
    if (step === 6) {
      setShowSuccessDialog(true)
    }
  }

  const handleStepChange = async (step: number) => {
    setCurrentStep(step)
    if (leadId) {
      try {
        await merchantService.updateLead(leadId, {
          currentStep: step
        })
      } catch (error) {
        console.error('Error updating lead step:', error)
      }
    }
  }

  const handleReturnHome = () => {
    setShowSuccessDialog(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <MerchantApplicationForm
        initialData={formData}
        currentStep={currentStep}
        leadId={leadId}
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
