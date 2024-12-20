import React, { useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>

type LoginModalProps = {
  isOpen?: boolean
  onClose?: () => void
  standalone?: boolean
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

export function LoginModal({ isOpen = true, onClose = () => {}, standalone = false }: LoginModalProps) {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        onClose()
        if (result.user.email === 'mserralta@gmail.com' || result.user.email === 'Mpilotg6@gmail.com') {
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
      reset()
      
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

  const toggleSignup = () => {
    setIsSignup(!isSignup)
    setError(null)
    reset()
  }

  return (
    <Dialog open={standalone || isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${standalone ? 'relative' : ''}`}>
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
            </form>
          ) : (
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={toggleSignup}
              disabled={loading}
            >
              Don't have an account? Sign up
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}   