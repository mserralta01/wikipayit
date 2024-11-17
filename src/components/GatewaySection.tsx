import React from 'react';
import { Shield, Lock, Zap, Globe, Rocket, Monitor } from 'lucide-react';
import AuthorizeNetLogo from './icons/AuthorizeNetLogo';

export default function GatewaySection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900" id="gateways">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Transform Transactions with Next-Gen Payment Gateways
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-4">
            Elevate your business with cutting-edge payment solutions that are fast, secure, and globally connected.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="feature-card text-center bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-lg shadow-lg transform hover:-translate-y-2 transition duration-500">
            <AuthorizeNetLogo />
            <h3 className="text-xl font-semibold mb-3 text-white">Authorize.Net</h3>
            <div className="space-y-3">
              <p className="text-gray-400">
                Empower your transactions with state-of-the-art fraud prevention and seamless recurring payments.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-400 mr-2" />
                  Advanced Fraud Detection
                </li>
                <li className="flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-400 mr-2" />
                  Tokenization &amp; Encryption
                </li>
              </ul>
            </div>
          </div>

          <div className="feature-card text-center bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-lg shadow-lg transform hover:-translate-y-2 transition duration-500">
            <img
              src="https://appfrontier.com/wp-content/uploads/2022/01/nmi-logo-600x193.png"
              alt="NMI Gateway"
              className="h-16 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-3 text-white">NMI Gateway</h3>
            <div className="space-y-3">
              <p className="text-gray-400">
                Unified commerce platform offering a seamless omnichannel experience.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-400 mr-2" />
                  Global Payment Processing
                </li>
                <li className="flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-400 mr-2" />
                  Real-time Transaction Monitoring
                </li>
              </ul>
            </div>
          </div>

          <div className="feature-card text-center bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-lg shadow-lg transform hover:-translate-y-2 transition duration-500">
            <img
              src="https://www.fluidpay.com/images/general/logo.svg"
              alt="Fluidpay Gateway"
              className="h-16 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-3 text-white">Fluidpay</h3>
            <div className="space-y-3">
              <p className="text-gray-400">
                Modern payment technology tailored for high-risk merchants.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-blue-400 mr-2" />
                  High-Risk Specialist
                </li>
                <li className="flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-blue-400 mr-2" />
                  Advanced Security Features
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-300">
            Experience unparalleled support and seamless integration with our 24/7 technical assistance.
          </p>
          <a
            href="#contact"
            className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition duration-500"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
