import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from '@/lib/validations/auth'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

const getErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Invalid password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    default:
      return error.message || 'An error occurred'
  }
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle } = useAuth()

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
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        onClose()
        if (result.user.email === 'mserralta@gmail.com' || result.user.email === 'Mpilotg6@gmail.com') {
          navigate('/admin/website')
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, data.email, data.password)
      onClose()
      resetLogin()
    } catch (error: any) {
      console.error('Login error:', error)
      setError(getErrorMessage(error))
      if (error.code === 'auth/user-not-found') {
        setIsSignup(true)
      }
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
    resetSignup()
    resetLogin()
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
            <AlertDescription>
              {error}
              {error.includes('already registered') && (
                <Button
                  type="button"
                  variant="link"
                  className="ml-2 p-0 h-auto font-normal"
                  onClick={() => {
                    setIsSignup(false)
                    setError(null)
                  }}
                >
                  Switch to Login
                </Button>
              )}
            </AlertDescription>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerSignup('email')}
                  disabled={loading}
                />
                {signupErrors.email && (
                  <p className="text-sm text-destructive">{signupErrors.email.message}</p>
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
                {signupErrors.password && (
                  <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={toggleSignup}
                disabled={loading}
              >
                Already have an account? Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitLogin(handleEmailLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerLogin('email')}
                  disabled={loading}
                />
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
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