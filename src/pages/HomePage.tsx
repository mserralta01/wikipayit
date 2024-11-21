import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import IndustriesSection from '../components/IndustriesSection'
import EntrepreneurSection from '../components/EntrepreneurSection'
import POSSection from '../components/POSSection'
import GatewaySection from '../components/GatewaySection'
import HighRiskSection from '../components/HighRiskSection'
import PricingSection from '../components/PricingSection'
import ACHSection from '../components/ACHSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ContactForm from '../components/ContactForm'
import { websiteService, type Section } from '../services/websiteService'

const sectionComponents = {
  hero: HeroSection,
  industries: IndustriesSection,
  entrepreneur: EntrepreneurSection,
  pos: POSSection,
  gateway: GatewaySection,
  highRisk: HighRiskSection,
  pricing: PricingSection,
  ach: ACHSection,
  testimonials: TestimonialsSection,
  contact: ContactForm,
}

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    const loadSections = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First check DB connection
        const isConnected = await websiteService.checkConnection()
        if (!isConnected) {
          throw new Error('Database connection failed')
        }

        const data = await websiteService.getSections()
        
        // Validate we have the minimum required sections
        if (!data.length) {
          throw new Error('No sections found')
        }

        if (mounted) {
          setSections(data)
        }
      } catch (err) {
        console.error('Error loading sections:', err)
        if (mounted) {
          setError('Failed to load page content. Please refresh.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSections()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {sections
        .filter((section) => section.enabled)
        .map((section) => {
          const Component = sectionComponents[section.id as keyof typeof sectionComponents]
          return Component ? <Component key={section.id} /> : null
        })}
    </div>
  )
} 