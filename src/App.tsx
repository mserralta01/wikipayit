import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import IndustriesSection from './components/IndustriesSection';
import POSSection from './components/POSSection';
import GatewaySection from './components/GatewaySection';
import PricingSection from './components/PricingSection';
import ACHSection from './components/ACHSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <IndustriesSection />
        <GatewaySection />
        <POSSection />
        <PricingSection />
        <ACHSection />
        <TestimonialsSection />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
