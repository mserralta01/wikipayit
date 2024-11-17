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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5 pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="relative">
          <div className="absolute inset-0 bg-[url('/src/assets/textures/gradient.png')] bg-cover opacity-10 pointer-events-none" />
          
          <div className="relative">
            <HeroSection />
            <IndustriesSection />
            <GatewaySection />
            <POSSection />
            <PricingSection />
            <ACHSection />
            <TestimonialsSection />
            <ContactForm />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
