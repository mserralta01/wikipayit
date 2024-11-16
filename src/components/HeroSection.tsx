import React from 'react';
import { Shield, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Secure Payment Processing for 
              <span className="gradient-text block">Every Business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Specialized solutions for high-risk and traditional merchants. Fast approvals, next-day deposits, and dedicated support to help your business grow.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="btn btn-primary">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a href="tel:+13053961226" className="btn btn-secondary">
                <CreditCard className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="feature-card transform hover:scale-105 transition-transform">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">High-Risk Specialists</h3>
                  <p className="text-gray-600">Expert solutions for challenging industries with thorough upfront underwriting</p>
                </div>
              </div>
            </div>

            <div className="feature-card transform hover:scale-105 transition-transform">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">Next-Day Deposits</h3>
                  <p className="text-gray-600">Fast settlement times to keep your business cash flow healthy</p>
                </div>
              </div>
            </div>

            <div className="feature-card transform hover:scale-105 transition-transform">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">Multiple Solutions</h3>
                  <p className="text-gray-600">Tailored payment solutions with competitive rates and flexible terms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}