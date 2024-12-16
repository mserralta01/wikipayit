import { useState } from 'react'
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

export default function MerchantApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const navigate = useNavigate()
  const leadId = "temporary-lead-id" // Replace with actual lead ID generation/fetching

  const handleStepComplete = async (stepData: any, step: number) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    
    // If this is the final step, show the success dialog
    if (step === 5) { // Adjust this number based on your total steps
      setShowSuccessDialog(true)
    }
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleReturnHome = () => {
    navigate('/')
  }

  return (
    <>
      <div className="container py-8">
        <MerchantApplicationForm
          initialData={formData}
          currentStep={currentStep}
          leadId={leadId}
          onStepComplete={handleStepComplete}
          onStepChange={handleStepChange}
        />
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold">
                Application Submitted Successfully!
              </DialogTitle>
            </div>
            <DialogDescription className="text-center space-y-2 pt-4">
              <p>
                Thank you for submitting your merchant application. Our team will review
                your information and contact you shortly via phone or email.
              </p>
              <p className="font-medium text-primary">
                What happens next?
              </p>
              <ul className="text-sm text-left space-y-2 mt-2">
                <li className="flex items-start">
                  1. Our team will review your application within 1-2 business days
                </li>
                <li className="flex items-start">
                  2. A representative will contact you to discuss your application
                </li>
                <li className="flex items-start">
                  3. We'll guide you through any additional requirements or documentation needed
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={handleReturnHome}
              className="w-full sm:w-auto"
            >
              Return to Homepage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
