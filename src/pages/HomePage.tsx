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

const defaultSections = [
  { id: 'hero', name: 'Hero Section', enabled: true, order: 0 },
  { id: 'industries', name: 'Industries Section', enabled: true, order: 1 },
  { id: 'entrepreneur', name: 'Entrepreneur Section', enabled: true, order: 2 },
  { id: 'pos', name: 'POS Section', enabled: true, order: 3 },
  { id: 'gateway', name: 'Gateway Section', enabled: true, order: 4 },
  { id: 'highRisk', name: 'High Risk Section', enabled: true, order: 5 },
  { id: 'pricing', name: 'Pricing Section', enabled: true, order: 6 },
  { id: 'ach', name: 'ACH Section', enabled: true, order: 7 },
  { id: 'testimonials', name: 'Testimonials Section', enabled: true, order: 8 },
  { id: 'contact', name: 'Contact Form', enabled: true, order: 9 },
]

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const loadSections = async () => {
      try {
        setLoading(true)
        // First, try to get sections from Firestore
        const data = await websiteService.getSections()
        
        if (mounted) {
          if (data.length === 0) {
            // If no sections exist in Firestore, initialize with default sections
            await websiteService.initializeSections(defaultSections)
            setSections(defaultSections)
          } else {
            setSections(data)
          }
        }
      } catch (error) {
        console.error('Error loading sections:', error)
        if (mounted) {
          // Fallback to default sections if there's an error
          setSections(defaultSections)
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

  return (
    <div className="relative">
      {sections
        .filter((section) => section.enabled)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const Component = sectionComponents[section.id as keyof typeof sectionComponents]
          return Component ? <Component key={section.id} /> : null
        })}
    </div>
  )
}
