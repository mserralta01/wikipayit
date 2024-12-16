import { useState } from 'react'
import { MerchantApplicationForm } from '../components/merchant/MerchantApplicationForm'

export default function MerchantApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const leadId = "temporary-lead-id" // Replace with actual lead ID generation/fetching

  const handleStepComplete = async (stepData: any, step: number) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    // Add any API calls or data persistence logic here
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="container py-8">
      <MerchantApplicationForm
        initialData={formData}
        currentStep={currentStep}
        leadId={leadId}
        onStepComplete={handleStepComplete}
        onStepChange={handleStepChange}
      />
    </div>
  )
}
