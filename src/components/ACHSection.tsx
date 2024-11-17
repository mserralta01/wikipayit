import React from 'react';
import { Building2 as Bank, Shield, Clock, DollarSign, CheckCircle } from 'lucide-react';

export default function ACHSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="ach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-clash font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] mb-6">
            ACH Payment Solutions
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            Streamline your payment collection with secure, cost-effective ACH processing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-6">Why Choose ACH Payments?</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <DollarSign className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Lower Processing Costs</h4>
                  <p className="text-gray-600">Save significantly compared to credit card processing fees</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Faster Settlement</h4>
                  <p className="text-gray-600">Predictable payment cycles with direct bank transfers</p>
                </div>
              </div>
              <div className="flex items-start">
                <Bank className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Bank-Level Security</h4>
                  <p className="text-gray-600">Secure, encrypted transactions through the ACH network</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Reduced Risk</h4>
                  <p className="text-gray-600">Lower risk of chargebacks compared to card payments</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold">ACH Processing Features</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Same-day ACH processing available
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Recurring billing automation
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Account validation services
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Custom integration options
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Detailed reporting and analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}