import React from 'react';
import { Shield, Lock, Zap, Globe } from 'lucide-react';

export default function GatewaySection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="gateways">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Enterprise-Grade Payment Gateways</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partner with industry-leading payment gateways for secure and reliable transaction processing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="feature-card text-center">
            <img 
              src="https://www.authorize.net/conf/anet-2021/settings/wcm/templates/en-us-home-page-template/structure/_jcr_content/root/header/logo.img.jpg"
              alt="Authorize.Net"
              className="h-16 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-3">Authorize.Net</h3>
            <div className="space-y-3">
              <p className="text-gray-600">Advanced fraud protection and recurring billing</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  Advanced Fraud Detection
                </li>
                <li className="flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-600 mr-2" />
                  Tokenization & Encryption
                </li>
              </ul>
            </div>
          </div>

          <div className="feature-card text-center">
            <img 
              src="https://www.nmi.com/hubfs/NMI-Logo-2022.svg"
              alt="NMI Gateway"
              className="h-16 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-3">NMI Gateway</h3>
            <div className="space-y-3">
              <p className="text-gray-600">Unified commerce platform with omnichannel capabilities</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-600 mr-2" />
                  Global Payment Processing
                </li>
                <li className="flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600 mr-2" />
                  Real-time Transaction Monitoring
                </li>
              </ul>
            </div>
          </div>

          <div className="feature-card text-center">
            <img 
              src="https://www.fluidpay.com/images/general/logo.svg"
              alt="Fluidpay Gateway"
              className="h-16 mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-3">Fluidpay</h3>
            <div className="space-y-3">
              <p className="text-gray-600">Modern payment technology for high-risk merchants</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  High-Risk Specialist
                </li>
                <li className="flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-600 mr-2" />
                  Advanced Security Features
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600">
            All gateways include 24/7 technical support and seamless integration assistance
          </p>
          <a href="#contact" className="btn btn-primary mt-6">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}