import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { auth } from '../../lib/firebase'
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuth } from '@/contexts/AuthContext'

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>
type SigninFormData = z.infer<typeof signinSchema>

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

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

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const { signInWithGoogle, signInWithEmailPassword } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: errorsSignup },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const {
    register: registerSignin,
    handleSubmit: handleSubmitSignin,
    formState: { errors: errorsSignin },
    reset: resetSignin,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  })

  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        onClose()
        if (result.user.email?.toLowerCase() === 'mserralta@gmail.com' || result.user.email?.toLowerCase() === 'mpilotg6@gmail.com') {
          navigate('/admin')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async (data: SignupFormData) => {
    try {
      setError(null)
      setLoading(true)

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Update the user's display name with first and last name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      })

      onClose()
      resetSignup()

      if (data.email === 'mserralta@gmail.com' || data.email === 'Mpilotg6@gmail.com') {
        navigate('/admin')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (data: SigninFormData) => {
    try {
      setError(null)
      setLoading(true)

      await signInWithEmailPassword(data.email, data.password)
      onClose()
      resetSignin()

      if (data.email.toLowerCase() === 'mserralta@gmail.com' || data.email.toLowerCase() === 'mpilotg6@gmail.com') {
        navigate('/admin')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const toggleSignup = () => {
    setIsSignup(!isSignup)
    setError(null)
    if (isSignup) {
      resetSignin()
    } else {
      resetSignup()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignup ? 'Create Account' : 'Sign In'}</DialogTitle>
          <DialogDescription>
            {isSignup ? 'Create your account to get started' : 'Sign in to access your account'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full"
            variant="outline"
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

          {isSignup ? (
            <form onSubmit={handleSubmitSignup(handleEmailSignup)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...registerSignup('firstName')}
                    disabled={loading}
                  />
                  {errorsSignup.firstName && (
                    <p className="text-sm text-destructive">{errorsSignup.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...registerSignup('lastName')}
                    disabled={loading}
                  />
                  {errorsSignup.lastName && (
                    <p className="text-sm text-destructive">{errorsSignup.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerSignup('email')}
                  disabled={loading}
                />
                {errorsSignup.email && (
                  <p className="text-sm text-destructive">{errorsSignup.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerSignup('password')}
                  disabled={loading}
                />
                {errorsSignup.password && (
                  <p className="text-sm text-destructive">{errorsSignup.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={toggleSignup} disabled={loading}>
                Already have an account? Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitSignin(handleEmailSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...registerSignin('email')} disabled={loading} />
                {errorsSignin.email && <p className="text-sm text-destructive">{errorsSignin.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...registerSignin('password')} disabled={loading} />
                {errorsSignin.password && <p className="text-sm text-destructive">{errorsSignin.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={toggleSignup} disabled={loading}>
                Don't have an account? Sign up
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}   