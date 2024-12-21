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
import { useAuth } from '@/contexts/AuthContext'

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>
type LoginFormData = z.infer<typeof loginSchema>

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
  if (error?.code === 'auth/invalid-credential') {
    return 'Invalid email or password. Please try again.'
  }
  return error?.message || 'An error occurred. Please try again.'
}

export function LoginModal({ isOpen = true, onClose = () => {}, standalone = false }: LoginModalProps) {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, loginWithEmail } = useAuth()

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()

      if (!standalone) {
        onClose()
      }

      resetSignup()
      resetLogin()
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

  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      setError(null)
      setLoading(true)
      await loginWithEmail(data.email, data.password)
      onClose()
      resetLogin()
    } catch (error: any) {
      console.error('Login error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const toggleSignup = () => {
    setIsSignup(!isSignup)
    setError(null)
    resetSignup()
    resetLogin()
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
            <form onSubmit={handleSubmitSignup(handleEmailSignup)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...registerSignup('firstName')}
                    disabled={loading}
                  />
                  {signupErrors.firstName && (
                    <p className="text-sm text-destructive">{signupErrors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...registerSignup('lastName')}
                    disabled={loading}
                  />
                  {signupErrors.lastName && (
                    <p className="text-sm text-destructive">{signupErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  {...registerSignup('email')}
                  disabled={loading}
                />
                {signupErrors.email && (
                  <p className="text-sm text-destructive">{signupErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  {...registerSignup('password')}
                  disabled={loading}
                />
                {signupErrors.password && (
                  <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitLogin(handleEmailLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  {...registerLogin('email')}
                  disabled={loading}
                />
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  {...registerLogin('password')}
                  disabled={loading}
                />
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={toggleSignup}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}                     