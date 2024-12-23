import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function EmailLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { loginWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await loginWithEmail(email, password)
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.')
      console.error('Login error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  )
}
