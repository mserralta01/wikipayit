import React, { useEffect, useState } from 'react'
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

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSections = async () => {
      try {
        const loadedSections = await websiteService.getSections()
        // Sort sections by order
        const sortedSections = [...loadedSections].sort((a, b) => a.order - b.order)
        setSections(sortedSections)
      } catch (error) {
        console.error('Error loading sections:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSections()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  // Component map for rendering sections
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    industries: <IndustriesSection />,
    entrepreneur: <EntrepreneurSection />,
    pos: <POSSection />,
    gateway: <GatewaySection />,
    highRisk: <HighRiskSection />,
    pricing: <PricingSection />,
    ach: <ACHSection />,
    testimonials: <TestimonialsSection />,
    contact: <ContactForm />
  }

  return (
    <div className="relative">
      {sections
        .filter(section => section.enabled)
        .map(section => (
          <React.Fragment key={section.id}>
            {sectionComponents[section.id]}
          </React.Fragment>
        ))}
    </div>
  )
} 