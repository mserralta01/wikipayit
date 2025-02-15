import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AuthenticationStep } from "./AuthenticationStep"
import { BusinessInformationStep, BusinessInformationStepHandle } from "./BusinessInformationStep"
import { ProcessingHistoryStep, ProcessingHistoryStepHandle } from "./ProcessingHistoryStep"
import { BeneficialOwnerStep, BeneficialOwnerStepHandle } from "./BeneficialOwnerStep"
import { DocumentationStep } from "./DocumentationStep"
import { BankDetailsStep, BankDetailsStepHandle } from "./BankDetailsStep"
import { useAuth } from "@/contexts/AuthContext"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useToast } from "@/hooks/useToast"
import { merchantService } from "@/services/merchantService"
import { Merchant, MerchantStatus } from "@/types/merchant"

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
  leadId: string | null
  onStepComplete: (stepData: any, step: number) => void
  onStepChange: (step: number) => void
}

export function MerchantApplicationForm({
  initialData,
  currentStep = 1,
  leadId,
  onStepComplete,
  onStepChange,
}: MerchantApplicationFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const validatedStep = Math.max(1, Math.min(currentStep, steps.length))
  const progress = (validatedStep / steps.length) * 100
  const businessInfoRef = useRef<BusinessInformationStepHandle>(null)
  const processingHistoryRef = useRef<ProcessingHistoryStepHandle>(null)
  const beneficialOwnersRef = useRef<BeneficialOwnerStepHandle>(null)
  const bankDetailsRef = useRef<BankDetailsStepHandle>(null)
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleStepSubmit = async (stepData: any): Promise<void> => {
    try {
      const updatedData = {
        ...formData,
        ...stepData,
      }
      setFormData(updatedData)

      // For authentication step, create user and save lead data
      if (currentStep === 1) {
        try {
          if (!stepData.password) {
            // User is already authenticated, just save lead data
            await onStepComplete(stepData, currentStep)
          } else {
            // Create new Firebase user
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              stepData.email,
              stepData.password
            )

            // Prepare lead data with user information
            const leadData = {
              firstName: stepData.firstName,
              lastName: stepData.lastName,
              email: stepData.email,
              uid: userCredential.user.uid,
              status: "Lead",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              currentStep: 1,
            }

            await onStepComplete(leadData, currentStep)

            toast({
              title: "Account created",
              description: "Your account has been created successfully!",
            })
          }

          // Always proceed to next step after authentication
          const nextStep = currentStep + 1
          if (nextStep <= steps.length) {
            onStepChange(nextStep)
          }
        } catch (error: any) {
          console.error('Error creating user:', error)
          toast({
            title: "Error",
            description: error.message || "There was a problem creating your account",
            variant: "destructive",
          })
          throw error
        }
      } else {
        await onStepComplete(stepData, currentStep)
        
        // After completing the step, move to the next one
        const nextStep = currentStep + 1
        if (nextStep <= steps.length) {
          onStepChange(nextStep)
        }
      }
    } catch (error) {
      console.error('Error submitting step:', error)
    }
  }

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1)
    onStepChange(prevStep)
  }

  const handleNext = async () => {
    try {
      switch (currentStep) {
        case 1: // Authentication Step
          if (user) {
            const nextStep = currentStep + 1
            onStepChange(nextStep)
          }
          return

        case 2: // Business Information Step
          if (businessInfoRef.current) {
            await businessInfoRef.current.submit()
          }
          return
        
        case 3: // Processing History Step
          if (processingHistoryRef.current) {
            await processingHistoryRef.current.submit()
          }
          return

        case 4: // Beneficial Owners Step
          if (beneficialOwnersRef.current) {
            await beneficialOwnersRef.current.submit()
          }
          return

        case 5: // Bank Details Step
          if (bankDetailsRef.current) {
            await bankDetailsRef.current.submit()
          }
          return

        case 6: // Documentation Step
          // Final step - no next step
          return

        default:
          const nextStep = currentStep + 1
          onStepChange(nextStep)
      }
    } catch (error) {
      console.error('Error handling next step:', error)
    }
  }

  const handleStepClick = (stepId: number) => {
    if (user && formData.email) {
      onStepChange(stepId)
    }
  }

  const renderStep = () => {
    if (!leadId && currentStep >= 4) {
      return (
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
          <span className="text-muted-foreground">
            Please complete previous steps first
          </span>
        </div>
      )
    }

    const stepProps = {
      onSave: handleStepSubmit,
      initialData: formData,
      leadId: leadId || '',
    }

    switch (currentStep) {
      case 1:
        return <AuthenticationStep onComplete={handleStepSubmit} />
      case 2:
        return <BusinessInformationStep {...stepProps} ref={businessInfoRef} />
      case 3:
        return <ProcessingHistoryStep {...stepProps} ref={processingHistoryRef} />
      case 4:
        if (!leadId) return null
        return (
          <BeneficialOwnerStep
            {...stepProps}
            ref={beneficialOwnersRef}
            initialData={{
              beneficialOwners: formData.beneficialOwners || {
                owners: [],
                updatedAt: new Date().toISOString()
              }
            }}
            leadId={leadId}
          />
        )
      case 5:
        return <BankDetailsStep {...stepProps} ref={bankDetailsRef} />
      case 6:
        if (!leadId) return null
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

  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true
    return user && formData.email
  }

  const currentStepData = steps[validatedStep - 1]

  const handleSubmit = async (data: FormData) => {
    try {
      if (!leadId) {
        toast({
          title: "Error",
          description: "No lead ID found. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      const merchantData: Partial<Merchant> = {
        ...data,
        pipelineStatus: "lead" as MerchantStatus,
        status: "lead" as MerchantStatus,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await merchantService.createMerchant(leadId, merchantData);
      
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
  };

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
            Step {validatedStep} of {steps.length}
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
                    validatedStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : validatedStep > step.id
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
                      validatedStep === step.id
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
          {currentStepData && (
            <div className="md:hidden mb-6">
              <h3 className="font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>
          )}

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={validatedStep === 1}
            >
              Previous
            </Button>
            {validatedStep !== 1 && validatedStep !== steps.length && (
              <Button 
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={validatedStep === steps.length}
              >
                Next Step
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
