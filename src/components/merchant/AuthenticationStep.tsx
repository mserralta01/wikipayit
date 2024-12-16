import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { auth } from "../../lib/firebase"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useAuth } from "../../contexts/AuthContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"

type AuthenticationStepProps = {
  onSave: (data: { email: string; firstName: string; lastName: string }) => void
  initialData?: { email?: string; firstName?: string; lastName?: string }
}

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>

const getErrorMessage = (error: any): string => {
  if (error?.code === 'auth/email-already-in-use') {
    return 'This email address is already registered. Please sign in instead.'
  }
  if (error?.code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }
  if (error?.code === 'auth/weak-password') {
    return 'Please choose a stronger password. It should be at least 6 characters long.'
  }
  return error?.message || 'An error occurred. Please try again.'
}

export function AuthenticationStep({ onSave, initialData }: AuthenticationStepProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEmailSignup, setIsEmailSignup] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      password: '',
    },
  })

  // If user is already authenticated, proceed with their email and name
  useEffect(() => {
    if (user?.email && !initialData?.email) {
      const names = user.displayName?.split(' ') || ['', '']
      const timer = setTimeout(() => {
        onSave({
          email: user.email!,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, initialData, onSave])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      const provider = new GoogleAuthProvider()
      
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const result = await signInWithPopup(auth, provider)
      
      if (result.user?.email) {
        const names = result.user.displayName?.split(' ') || []
        onSave({
          email: result.user.email,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
        })
      }
      
    } catch (err: any) {
      if (err.message?.includes('Cross-Origin-Opener-Policy')) {
        if (auth.currentUser?.email) {
          const names = auth.currentUser.displayName?.split(' ') || []
          onSave({
            email: auth.currentUser.email,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
          })
          return
        }
      }
      setError(getErrorMessage(err))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async (data: SignupFormData) => {
    try {
      setLoading(true)
      setError("")
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      })

      onSave({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      
      reset()
    } catch (err: any) {
      setError(getErrorMessage(err))
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      {isEmailSignup ? (
        <form onSubmit={handleSubmit(handleEmailSignup)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => setIsEmailSignup(false)}
            disabled={loading}
          >
            Already have an account? Sign in
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="link"
          className="w-full"
          onClick={() => setIsEmailSignup(true)}
          disabled={loading}
        >
          Don't have an account? Sign up
        </Button>
      )}
    </div>
  )
}
