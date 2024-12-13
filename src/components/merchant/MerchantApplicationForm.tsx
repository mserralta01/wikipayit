import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { AuthenticationStep } from "./AuthenticationStep"
import { BusinessInformationStep } from "./BusinessInformationStep"
import { ProcessingHistoryStep } from "./ProcessingHistoryStep"
import { BeneficialOwnerStep } from "./BeneficialOwnerStep"
import { DocumentationStep } from "./DocumentationStep"
import { BankDetailsStep } from "./BankDetailsStep"
import { useAuth } from "../../contexts/AuthContext"
import { merchantService } from "../../services/merchantService"
import { Lead, BusinessInformation, ProcessingHistory, BeneficialOwner, BankDetails } from "@/types/merchant"
import { useToast } from "@/hooks/useToast"

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

export interface MerchantApplicationFormProps {
  applicationId: string
}

export function MerchantApplicationForm({ applicationId }: MerchantApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [leadId, setLeadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const progress = (currentStep / steps.length) * 100

  useEffect(() => {
    const loadInitialData = async () => {
      if (applicationId) {
        try {
          setLoading(true)
          const lead = await merchantService.getLeadByApplicationId(applicationId)
          if (lead?.id) {
            setLeadId(lead.id)
            setFormData({
              ...lead,
              status: lead.status || 'new',
              createdAt: lead.createdAt || new Date().toISOString(),
              updatedAt: lead.updatedAt || new Date().toISOString()
            })
            // Set initial step based on lead status
            if (lead.status === 'new') {
              setCurrentStep(1)
            } else if (lead.status === 'in_progress') {
              // Find the last completed step
              if (lead.businessInfo) setCurrentStep(3)
              if (lead.processingHistory) setCurrentStep(4)
              if (lead.beneficialOwners?.length) setCurrentStep(5)
              if (lead.bankDetails) setCurrentStep(6)
            }
          } else {
            console.error('No lead found for application:', applicationId)
          }
        } catch (error) {
          console.error('Error loading application data:', error)
          toast({
            title: "Error",
            description: "Failed to load application data. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadInitialData()
  }, [applicationId, toast])

  const handleStepSubmit = async (stepData: any) => {
    try {
      if (!leadId) {
        console.error('No lead ID available')
        return
      }

      // Update form data based on current step
      const updatedData: Partial<Lead> = { ...formData }
      switch (currentStep) {
        case 2:
          updatedData.businessInfo = stepData as BusinessInformation
          break
        case 3:
          updatedData.processingHistory = stepData as ProcessingHistory
          break
        case 4:
          updatedData.beneficialOwners = [stepData as BeneficialOwner]
          break
        case 5:
          updatedData.bankDetails = stepData as BankDetails
          break
        case 6:
          updatedData.documents = {
            voided_check: stepData.voidedCheck?.map((file: FileWithPreview) => file.preview),
            bank_statements: stepData.bankStatements?.map((file: FileWithPreview) => file.preview)
          }
          break
      }

      // Remove undefined values
      const cleanData = Object.entries(updatedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      setFormData(cleanData)

      // Save step data to lead
      await merchantService.updateLead(leadId, {
        ...cleanData,
        status: currentStep === steps.length ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString()
      })

      // Move to next step
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1)
      }

      toast({
        title: "Success",
        description: "Your information has been saved.",
      })
    } catch (error) {
      console.error('Error saving step data:', error)
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleNext = async () => {
    try {
      let formId = ''
      switch (currentStep) {
        case 1:
          formId = 'auth-form'
          break
        case 2:
          formId = 'business-info-form'
          break
        case 3:
          formId = 'processing-history-form'
          break
        case 4:
          formId = 'beneficial-owner-form'
          break
        case 5:
          formId = 'bank-details-form'
          break
        case 6:
          formId = 'documentation-form'
          break
      }

      const form = document.getElementById(formId)
      if (!form) {
        console.error(`No form found with id: ${formId}`)
        return
      }

      // Create and dispatch submit event
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true
      })
      
      form.dispatchEvent(submitEvent)
    } catch (error) {
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId)
    }
  }

  const isStepAccessible = (stepId: number) => {
    return stepId <= currentStep
  }

  const handleSignInSuccess = async ({ leadId, applicationId }: { leadId: string; applicationId: string }) => {
    setLeadId(leadId)
    setCurrentStep(2)
  }

  const renderStep = () => {
    const baseProps = {
      onSave: handleStepSubmit,
      leadId: leadId || ''
    }

    switch (currentStep) {
      case 1:
        return <AuthenticationStep {...baseProps} onSignInSuccess={handleSignInSuccess} />
      case 2:
        return <BusinessInformationStep {...baseProps} initialData={formData.businessInfo} />
      case 3:
        return <ProcessingHistoryStep {...baseProps} initialData={formData.processingHistory} />
      case 4:
        return <BeneficialOwnerStep {...baseProps} initialData={formData.beneficialOwners?.[0]} />
      case 5:
        return <BankDetailsStep {...baseProps} initialData={formData.bankDetails} />
      case 6:
        return <DocumentationStep {...baseProps} initialData={formData.documents} />
      default:
        return null
    }
  }

  if (loading) {
    return <div className="h-[400px] flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
              const accessible = isStepAccessible(step.id)
              const isCurrent = currentStep === step.id
              const isCompleted = step.id < currentStep
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => accessible && handleStepClick(step.id)}
                  disabled={!accessible}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-secondary text-secondary-foreground"
                      : accessible
                      ? "hover:bg-secondary/50"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                  <div className={`text-sm ${
                    isCurrent
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}>
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
            {currentStep < steps.length && (
              <Button onClick={handleNext}>
                Next Step
              </Button>
            )}
            {currentStep === steps.length && (
              <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                Submit Application
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
