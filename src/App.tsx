import React from 'react';
import { Coffee, CheckCircle, Briefcase, Plane, Shield, Building } from 'lucide-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import TestimonialsSection from './components/TestimonialsSection';
import POSSection from './components/POSSection';
import GatewaySection from './components/GatewaySection';
import PricingSection from './components/PricingSection';
import ACHSection from './components/ACHSection';
import ContactForm from './components/ContactForm';

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <HeroSection />
        
        {/* Industries Section */}
        <section className="py-20 bg-white" id="industries">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-title">Industries We Serve</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From traditional to high-risk industries, we have tailored solutions for every business type
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card">
                <Coffee className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-center mb-3">Restaurants & Hospitality</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Full-service restaurants
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Quick-service establishments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Food delivery services
                  </li>
                </ul>
              </div>

              <div className="feature-card">
                <Briefcase className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-center mb-3">Professional Services</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Business coaches
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Web agencies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Consulting firms
                  </li>
                </ul>
              </div>

              <div className="feature-card">
                <Plane className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-center mb-3">Travel & Tourism</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Travel agencies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tour operators
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Booking services
                  </li>
                </ul>
              </div>
            </div>

            {/* High Risk Section */}
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">High-Risk Industry Specialists</h3>
                  <p className="mb-6">We specialize in helping businesses that others turn away:</p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                      Previously shut down by other processors
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                      MATCH/TMF listed merchants
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                      High-volume processors
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                      International merchants
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-4">Our Advantage</h4>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Shield className="h-6 w-6 text-blue-300 mr-2 mt-1" />
                      <div>
                        <p className="font-semibold">Thorough Underwriting</p>
                        <p className="text-blue-100">Prevent unexpected shutdowns with proper upfront assessment</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Building className="h-6 w-6 text-blue-300 mr-2 mt-1" />
                      <div>
                        <p className="font-semibold">Multiple Banking Partners</p>
                        <p className="text-blue-100">We match you with the right bank for your specific needs</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <POSSection />
        <GatewaySection />
        <PricingSection />
        <ACHSection />
        <TestimonialsSection />
        
        {/* Contact Section */}
        <section className="py-20 bg-white" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-title">Get Started Today</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to transform your payment processing? Contact us for a free consultation.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default App;