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

  // Try to load existing application data
  useEffect(() => {
    const loadExistingApplication = async () => {
      try {
        // If user is authenticated, try to find or create a lead
        if (user?.email) {
          const lead = await merchantService.getLeadByEmail(user.email)
          if (lead) {
            setApplicationState({
              leadId: lead.id,
              currentStep: lead.currentStep || STEPS.AUTHENTICATION,
              formData: {
                ...lead.formData,
                email: user.email, // Ensure email is always set
              },
            })
          } else {
            // Create a new lead for authenticated user
            const leadId = await merchantService.createLead(user.email)
            setApplicationState({
              leadId,
              currentStep: STEPS.AUTHENTICATION,
              formData: { email: user.email },
            })
          }
        } else {
          // Not authenticated, start at authentication step
          setApplicationState({
            currentStep: STEPS.AUTHENTICATION,
            formData: {},
          })
        }
      } catch (error) {
        console.error("Error loading existing application:", error)
      } finally {
        setLoading(false)
      }
    }

    loadExistingApplication()
  }, [user?.email])

  const handleStepComplete = async (stepData: any, step: number) => {
    try {
      const updatedFormData = {
        ...applicationState.formData,
        ...stepData,
      }

      // If this is the authentication step
      if (step === STEPS.AUTHENTICATION) {
        const email = stepData.email
        
        // Only proceed if we have a valid email
        if (!email) {
          throw new Error("Email is required")
        }

        // Check if lead already exists
        let existingLead = await merchantService.getLeadByEmail(email)
        let leadId = applicationState.leadId

        if (existingLead) {
          leadId = existingLead.id
          setApplicationState({
            leadId: existingLead.id,
            currentStep: existingLead.currentStep || step,
            formData: {
              ...existingLead.formData,
              ...updatedFormData,
            },
          })
        } else if (!leadId) {
          // Create new lead only if we don't have one
          leadId = await merchantService.createLead(email)
          setApplicationState({
            leadId,
            currentStep: step,
            formData: updatedFormData,
          })
        }

        // Update lead with new data
        if (leadId) {
          await merchantService.updateLead(leadId, {
            formData: updatedFormData,
            currentStep: step + 1,
            status: "in_progress",
          })
        }
      } else {
        // For all other steps, just update the lead
        if (applicationState.leadId) {
          await merchantService.updateLead(applicationState.leadId, {
            formData: updatedFormData,
            currentStep: step + 1,
            status: step === STEPS.BANK_DETAILS ? "completed" : "in_progress",
          })
        }
      }

      // If this is the final step, create the merchant record
      if (step === STEPS.BANK_DETAILS) {
        await merchantService.createMerchant({
          ...updatedFormData,
          userId: user?.uid,
          email: user?.email,
        })
        alert("Application submitted successfully!")
        navigate("/dashboard")
        return
      }

      // Move to next step
      setApplicationState((prev) => ({
        ...prev,
        currentStep: step + 1,
        formData: updatedFormData,
      }))
    } catch (error) {
      console.error("Error handling step completion:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const handleStepChange = async (newStep: number) => {
    try {
      if (applicationState.leadId) {
        await merchantService.updateLead(applicationState.leadId, {
          currentStep: newStep,
        })
      }
      setApplicationState((prev) => ({
        ...prev,
        currentStep: newStep,
      }))
    } catch (error) {
      console.error("Error changing step:", error)
      alert("An error occurred while changing steps. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <MerchantApplicationForm
          initialData={applicationState.formData}
          currentStep={applicationState.currentStep}
          onStepComplete={handleStepComplete}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  )
}
