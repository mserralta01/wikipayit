import React from 'react';
import { DollarSign, Percent, BarChart, CreditCard, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';

export default function PricingSection() {
  React.useEffect(() => {
    gsap.fromTo('.feature-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 0.5 });
  }, []);

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Flexible Pricing Plans</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the pricing structure that best fits your business needs with our competitive low monthly fees
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4 mx-auto">
              <Percent className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Interchange Plus</h3>
            <p className="text-gray-600 text-center mb-4">Transparent pricing with direct interchange rates plus a small markup</p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Most transparent pricing model
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Pass-through interchange rates
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Low fixed markup
              </li>
            </ul>
          </div>

          <div className="feature-card bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4 mx-auto">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Surcharge</h3>
            <p className="text-gray-600 text-center mb-4">Eliminate processing fees by passing costs to card-paying customers</p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Zero processing costs
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Compliant with card brand rules
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Automated fee calculation
              </li>
            </ul>
          </div>

          <div className="feature-card bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4 mx-auto">
              <BarChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Tiered Pricing</h3>
            <p className="text-gray-600 text-center mb-4">Simple rates categorized by transaction type</p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Predictable pricing
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Qualified rate discounts
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Easy to understand
              </li>
            </ul>
          </div>

          <div className="feature-card bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4 mx-auto">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Flat Rate</h3>
            <p className="text-gray-600 text-center mb-4">One simple rate for all transaction types</p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Simple flat rate pricing
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No hidden fees
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Predictable costs
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-6">
            All pricing plans include low monthly fees and no long-term contracts
          </p>
          <a href="#contact" className="btn btn-primary">
            Get Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
}
