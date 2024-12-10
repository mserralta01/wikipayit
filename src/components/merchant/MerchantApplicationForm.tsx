import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { BusinessInformationStep } from "./BusinessInformationStep"
import { ProcessingHistoryStep } from "./ProcessingHistoryStep"
import { BeneficialOwnerStep } from "./BeneficialOwnerStep"
import { DocumentationStep } from "./DocumentationStep"

type Step = {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Basic details about your business",
  },
  {
    id: 2,
    title: "Processing History",
    description: "Your payment processing experience",
  },
  {
    id: 3,
    title: "Beneficial Owners",
    description: "Information about owners with 25% or greater ownership",
  },
  {
    id: 4,
    title: "Documentation",
    description: "Required business documents",
  },
  {
    id: 5,
    title: "Bank Details",
    description: "Your settlement account information",
  },
]

export type MerchantApplicationFormProps = {
  onSubmit: (data: any) => void
  className?: string
}

export function MerchantApplicationForm({
  onSubmit,
  className = "",
}: MerchantApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const progress = (currentStep / steps.length) * 100

  const handleStepSubmit = (stepData: any) => {
    const updatedFormData = { ...formData, ...stepData }
    setFormData(updatedFormData)

    if (currentStep === steps.length) {
      onSubmit(updatedFormData)
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    const form = document.querySelector("form")
    if (form) {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      })
      form.dispatchEvent(submitEvent)
    }
  }

  const renderStep = () => {
    const stepProps = {
      onSave: handleStepSubmit,
      initialData: formData,
    }

    switch (currentStep) {
      case 1:
        return <BusinessInformationStep {...stepProps} />
      case 2:
        return <ProcessingHistoryStep {...stepProps} />
      case 3:
        return <BeneficialOwnerStep {...stepProps} />
      case 4:
        return <DocumentationStep {...stepProps} />
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

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-8 ${className}`}>
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
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50"
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
            ))}
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
            <Button onClick={handleNext}>
              {currentStep === steps.length ? "Submit Application" : "Next Step"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
