import React from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { auth } from '../../lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        onClose()
        if (result.user.email === 'mserralta@gmail.com' || result.user.email === 'Mpilotg6@gmail.com') {
          navigate('/admin')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to access your account
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full"
            variant="outline"
          >
            Sign in with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 