import React from 'react';
import { Mail, Phone, MapPin, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-2xl font-bold">
                <span className="text-white">Wiki </span>
                <span className="gradient-text">PayIt</span>
                <span className="text-white text-sm">, LLC</span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-1" />
                <p>15815 Boeing Ct,<br />Wellington, FL, 33414</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-2" />
                <a href="tel:+13053961226">+1 (305) 396-1226</a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-2" />
                <a href="mailto:contact@wikipayit.com">contact@wikipayit.com</a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-blue-400">Payment Processing</a></li>
              <li><a href="#pos" className="hover:text-blue-400">POS Systems</a></li>
              <li><a href="#ach" className="hover:text-blue-400">ACH Payments</a></li>
              <li><a href="#chargeback" className="hover:text-blue-400">Chargeback Protection</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Industries</h3>
            <ul className="space-y-2">
              <li><a href="#industries" className="hover:text-blue-400">Restaurants</a></li>
              <li><a href="#industries" className="hover:text-blue-400">Professional Services</a></li>
              <li><a href="#industries" className="hover:text-blue-400">Travel</a></li>
              <li><a href="#high-risk" className="hover:text-blue-400">High Risk</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/terms" className="hover:text-blue-400">Terms & Conditions</a></li>
              <li><a href="/privacy" className="hover:text-blue-400">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} WikiPayIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}