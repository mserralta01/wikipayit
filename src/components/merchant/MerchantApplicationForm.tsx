import { useState, useRef } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { AuthenticationStep } from "./AuthenticationStep"
import { BusinessInformationStep, BusinessInformationStepHandle } from "./BusinessInformationStep"
import { ProcessingHistoryStep } from "./ProcessingHistoryStep"
import { BeneficialOwnerStep } from "./BeneficialOwnerStep"
import { DocumentationStep } from "./DocumentationStep"
import { BankDetailsStep } from "./BankDetailsStep"
import { useAuth } from "../../contexts/AuthContext"

type Step = {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: "Authentication",
    description: "Sign in to continue your application",
  },
  {
    id: 2,
    title: "Business Information",
    description: "Basic details about your business",
  },
  {
    id: 3,
    title: "Processing History",
    description: "Your payment processing experience",
  },
  {
    id: 4,
    title: "Beneficial Owners",
    description: "Information about owners with 25% or greater ownership",
  },
  {
    id: 5,
    title: "Bank Details",
    description: "Your settlement account information",
  },
  {
    id: 6,
    title: "Documentation",
    description: "Required business documents",
  },
]

export type MerchantApplicationFormProps = {
  initialData: any
  currentStep: number
  leadId: string
  onStepComplete: (stepData: any, step: number) => void
  onStepChange: (step: number) => void
}

export function MerchantApplicationForm({
  initialData,
  currentStep,
  leadId,
  onStepComplete,
  onStepChange,
}: MerchantApplicationFormProps) {
  const { user } = useAuth()
  const progress = (currentStep / steps.length) * 100
  const businessInfoRef = useRef<BusinessInformationStepHandle>(null)

  const handleStepSubmit = (stepData: any) => {
    onStepComplete(stepData, currentStep)
  }

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1)
    onStepChange(prevStep)
  }

  const handleNext = async () => {
    if (currentStep === 2) {
      try {
        // Business Information Step
        await businessInfoRef.current?.submit()
        const nextStep = currentStep + 1
        onStepChange(nextStep)
      } catch (error) {
        console.error('Error submitting business information:', error)
      }
    } else {
      // Handle other steps
      const nextStep = currentStep + 1
      onStepChange(nextStep)
    }
  }

  const handleStepClick = (stepId: number) => {
    // Allow navigation to any step if user is authenticated and has completed authentication step
    if (user && initialData.email) {
      onStepChange(stepId)
    }
  }

  const renderStep = () => {
    const stepProps = {
      onSave: handleStepSubmit,
      initialData,
    }

    switch (currentStep) {
      case 1:
        return <AuthenticationStep {...stepProps} />
      case 2:
        return <BusinessInformationStep {...stepProps} ref={businessInfoRef} />
      case 3:
        return <ProcessingHistoryStep {...stepProps} />
      case 4:
        return <BeneficialOwnerStep {...stepProps} leadId={leadId} />
      case 5:
        return <BankDetailsStep {...stepProps} />
      case 6:
        return <DocumentationStep {...stepProps} leadId={leadId} />
      default:
        return (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <span className="text-muted-foreground">
              Step {currentStep} content coming soon
            </span>
          </div>
        )
    }
  }

  // Check if step is accessible
  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true // Authentication step is always accessible
    return user && initialData.email // Other steps require authentication
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Merchant Application</h2>
        <p className="text-muted-foreground">
          Complete your application to start accepting payments
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex gap-8">
        <div className="hidden md:block w-64 shrink-0">
          <nav className="space-y-2">
            {steps.map((step) => {
              const isAccessible = isStepAccessible(step.id)
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => isAccessible && handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-secondary/50"
                  } ${
                    !isAccessible
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                  <div
                    className={`text-sm ${
                      currentStep === step.id
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.description}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <Card className="flex-1 p-6">
          <div className="md:hidden mb-6">
            <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={currentStep === steps.length}
            >
              {currentStep === steps.length ? "Submit Application" : "Next Step"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
