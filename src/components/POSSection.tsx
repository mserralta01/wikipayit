import React from 'react';
import { CreditCard, ShoppingBag, Store, Wifi } from 'lucide-react';

export default function POSSection() {
  return (
    <section className="py-20 bg-white" id="pos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Complete Point of Sale Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wide selection of POS systems to match your specific business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold mb-6">Featured POS Systems</h3>
            <div className="space-y-6">
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Clover POS Family</h4>
                <p className="text-gray-600">Complete business management systems with integrated payments</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Poynt Smart Terminal</h4>
                <p className="text-gray-600">Modern, dual-screen smart payment terminal</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">SwipeSimple Card Readers</h4>
                <p className="text-gray-600">Mobile payment solutions for businesses on the go</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Ingenico & Verifone Terminals</h4>
                <p className="text-gray-600">Traditional countertop payment terminals</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-2xl font-bold">Business Software Solutions</h3>
            <div className="grid gap-6">
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Invoicing Software</h4>
                <p className="text-gray-600">Professional invoicing with payment links, recurring billing, and automated reminders</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Website Payment Integration</h4>
                <p className="text-gray-600">Custom payment pages, shopping carts, and secure checkout solutions</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Restaurant Online Ordering</h4>
                <p className="text-gray-600">Branded ordering platform with menu management and delivery integration</p>
              </div>
              <div className="feature-card">
                <h4 className="font-semibold mb-2">Reputation Management</h4>
                <p className="text-gray-600">Monitor and improve your online presence with review management tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}