import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { auth } from "../../lib/firebase"
import { GoogleAuthProvider, signInWithPopup, signInWithEmailLink, sendSignInLinkToEmail } from "firebase/auth"
import { useAuth } from "../../contexts/AuthContext"
import { merchantService } from "../../services/merchantService"

type AuthenticationStepProps = {
  onSave: (data: { email: string }) => void
  initialData?: { email?: string }
  onSignInSuccess: ({ leadId, applicationId }: { leadId: string; applicationId: string }) => Promise<void>
}

// Define EmailFormData
type EmailFormData = {
  email: string
}

export function AuthenticationStep({ onSave, initialData, onSignInSuccess }: AuthenticationStepProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState(initialData?.email || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [serverError, setServerError] = useState("")

  // If user is already authenticated, proceed with their email
  useEffect(() => {
    if (user?.email && !initialData?.email) {
      // Small delay to ensure Firebase auth state is fully updated
      const timer = setTimeout(() => {
        onSave({ email: user.email! })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, initialData, onSave])

  // Helper function for Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    return await signInWithPopup(auth, provider)
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (!result) return

      const user = result.user
      const email = user.email!
      const firstName = user.displayName?.split(' ')[0] || ''
      const lastName = user.displayName?.split(' ').slice(1).join(' ') || ''

      // Check if a lead already exists for this user
      let lead = await merchantService.getLeadByEmail(email)
      let leadId: string

      if (lead) {
        leadId = lead.id!
        // Update the existing lead with name information
        await merchantService.updateLead(leadId, { firstName, lastName })
      } else {
        // Create a new lead with email, first name, and last name
        leadId = await merchantService.createLead(email, firstName, lastName)
      }

      // Check if the lead has an associated application
      if (lead?.applicationId) {
        // Resume the existing application
        await onSignInSuccess({ leadId, applicationId: lead.applicationId })
      } else {
        // Create a new application and link it to the lead
        const applicationId = await merchantService.createApplication({
          businessInfo: {} as any, // Provide initial values
          processingHistory: {} as any, // Provide initial values
          beneficialOwners: [],
          bankDetails: {} as any,
          documents: {} as any,
          status: 'draft'
        })
        await merchantService.linkLeadToApplication(leadId, applicationId)
        await onSignInSuccess({ leadId, applicationId })
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error)
      setServerError('Failed to sign in with Google.')
    }
  }

  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      const email = data.email.toLowerCase()

      // Check if a lead already exists for this user
      let lead = await merchantService.getLeadByEmail(email)
      let leadId: string

      if (lead) {
        leadId = lead.id!
      } else {
        // Create a new lead
        leadId = await merchantService.createLead(email)
      }

      // Check if the lead has an associated application
      if (lead?.applicationId) {
        // Resume the existing application
        await onSignInSuccess({ leadId, applicationId: lead.applicationId })
      } else {
        // Create a new application and link it to the lead
        const applicationId = await merchantService.createApplication({
          businessInfo: {} as any, // Provide initial values
          processingHistory: {} as any, // Provide initial values
          beneficialOwners: [],
          bankDetails: {} as any,
          documents: {} as any,
          status: 'draft'
        })
        await merchantService.linkLeadToApplication(leadId, applicationId)
        await onSignInSuccess({ leadId, applicationId })
      }
    } catch (error) {
      console.error('Error during email sign-in:', error)
      setServerError('Failed to sign in with email.')
    }
  }

  // If user is already authenticated and we have their email in initialData,
  // show the signed-in state
  if (user?.email && initialData?.email === user.email) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Signed In</h3>
          <p className="text-sm text-muted-foreground">
            Continuing application with {user.email}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Sign In to Continue</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you would like to continue with your application
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          Continue with Email
        </Button>
      </form>
    </div>
  )
}
