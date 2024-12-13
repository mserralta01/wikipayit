import { useEffect, useState } from 'react'
import { merchantService } from '../services/merchantService'
import { MerchantApplicationForm } from '../components/merchant/MerchantApplicationForm'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { Alert } from '../components/ui/alert'
import { useAuth } from '../contexts/AuthContext'
import { AuthenticationStep } from '../components/merchant/AuthenticationStep'

export function MerchantApplicationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const { user } = useAuth()

  const handleSignInSuccess = async ({ leadId, applicationId }: { leadId: string; applicationId: string }) => {
    setApplicationId(applicationId)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      </div>
    )
  }

  // If no application ID yet, show authentication step
  if (!applicationId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Merchant Application</h2>
          <AuthenticationStep
            onSave={() => {}}
            initialData={{}}
            onSignInSuccess={handleSignInSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MerchantApplicationForm applicationId={applicationId} />
    </div>
  )
}
