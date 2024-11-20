import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await websiteService.getSections()
        setSections(data)
      } catch (error) {
        console.error('Error loading sections:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSections()
  }, [])

  if (loading) {
    return null // or a loading spinner
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