import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { auth } from "../../lib/firebase"
import { GoogleAuthProvider, signInWithPopup, signInWithEmailLink, sendSignInLinkToEmail } from "firebase/auth"
import { useAuth } from "../../contexts/AuthContext"

type AuthenticationStepProps = {
  onSave: (data: { email: string }) => void
  initialData?: { email?: string }
}

export function AuthenticationStep({ onSave, initialData }: AuthenticationStepProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState(initialData?.email || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      const provider = new GoogleAuthProvider()
      
      // Configure custom parameters for Google sign-in
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const result = await signInWithPopup(auth, provider)
      
      // Wait a bit for auth state to update
      setTimeout(() => {
        if (result.user?.email) {
          onSave({ email: result.user.email })
        }
      }, 500)
      
    } catch (err: any) {
      // Ignore the COOP warning as it doesn't affect functionality
      if (err.message?.includes('Cross-Origin-Opener-Policy')) {
        if (auth.currentUser?.email) {
          onSave({ email: auth.currentUser.email })
          return
        }
      }
      setError("Failed to sign in with Google. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter an email address")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem("emailForSignIn", email)
      onSave({ email })
    } catch (err) {
      setError("Failed to send email link. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
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
