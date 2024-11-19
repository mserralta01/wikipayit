import React from 'react'
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

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <IndustriesSection />
      <EntrepreneurSection />
      <GatewaySection />
      <POSSection />
      <HighRiskSection />
      <ACHSection />
      <PricingSection />
      <TestimonialsSection />
      <ContactForm />
    </div>
  )
} 