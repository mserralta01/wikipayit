import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { MerchantApplicationForm } from "../components/merchant/MerchantApplicationForm"
import { merchantService } from "../services/merchantService"

type ApplicationState = {
  leadId?: string
  currentStep: number
  formData: any
}

const STEPS = {
  AUTHENTICATION: 1,
  BUSINESS_INFO: 2,
  PROCESSING_HISTORY: 3,
  BENEFICIAL_OWNERS: 4,
  DOCUMENTATION: 5,
  BANK_DETAILS: 6,
}

export function MerchantApplicationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    currentStep: STEPS.AUTHENTICATION,
    formData: {},
  })

  // Load application data whenever the step changes or user changes
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        setLoading(true)
        if (user?.email) {
          const lead = await merchantService.getLeadByEmail(user.email)
          if (lead) {
            setApplicationState({
              leadId: lead.id,
              currentStep: lead.currentStep || STEPS.AUTHENTICATION,
              formData: {
                ...lead.formData,
                email: user.email,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              },
            })
          } else {
            const leadId = await merchantService.createLead(user.email, {
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            })
            setApplicationState({
              leadId,
              currentStep: STEPS.AUTHENTICATION,
              formData: {
                email: user.email,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              },
            })
          }
        }
      } catch (error) {
        console.error("Error loading application data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadApplicationData()
  }, [user?.email, user?.displayName])

  const handleStepComplete = async (stepData: any, step: number) => {
    try {
      const updatedFormData = {
        ...applicationState.formData,
        ...stepData,
      }

      let nextStep = step + 1
      let newState = {
        ...applicationState,
        currentStep: nextStep,
        formData: updatedFormData,
      }

      if (step === STEPS.AUTHENTICATION) {
        const email = stepData.email
        if (!email) throw new Error("Email is required")

        let existingLead = await merchantService.getLeadByEmail(email)
        let leadId = applicationState.leadId

        if (existingLead) {
          leadId = existingLead.id
          newState = {
            leadId: existingLead.id,
            currentStep: nextStep,
            formData: {
              ...existingLead.formData,
              ...updatedFormData,
            },
          }
        } else if (!leadId) {
          leadId = await merchantService.createLead(email)
          newState = {
            leadId,
            currentStep: nextStep,
            formData: updatedFormData,
          }
        }

        if (leadId) {
          await merchantService.updateLead(leadId, {
            formData: newState.formData,
            currentStep: nextStep,
            status: "in_progress",
          })
        }
      } else {
        if (applicationState.leadId) {
          await merchantService.updateLead(applicationState.leadId, {
            formData: updatedFormData,
            currentStep: nextStep,
            status: step === STEPS.BANK_DETAILS ? "completed" : "in_progress",
          })
        }
      }

      if (step === STEPS.BANK_DETAILS) {
        await merchantService.createMerchant({
          ...updatedFormData,
          userId: user?.uid,
          email: user?.email,
        })
        navigate("/dashboard")
        return
      }

      setApplicationState(newState)
    } catch (error) {
      console.error("Error handling step completion:", error)
    }
  }

  const handleStepChange = async (newStep: number) => {
    try {
      if (applicationState.leadId) {
        await merchantService.updateLead(applicationState.leadId, {
          currentStep: newStep,
        })
        
        // Reload the lead data to ensure we have the latest state
        const lead = await merchantService.getLeadByEmail(user?.email || '')
        if (lead) {
          setApplicationState({
            leadId: lead.id,
            currentStep: newStep,
            formData: lead.formData || {},
          })
        }
      }
    } catch (error) {
      console.error("Error changing step:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!applicationState.leadId && applicationState.currentStep > STEPS.AUTHENTICATION) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <div className="text-center">Error: No lead ID found. Please start over.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <MerchantApplicationForm
          initialData={applicationState.formData}
          currentStep={applicationState.currentStep}
          leadId={applicationState.leadId || ""}
          onStepComplete={handleStepComplete}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  )
}
