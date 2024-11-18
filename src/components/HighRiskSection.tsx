import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Building, CheckCircle, Lock, Globe, Zap, Building2, CreditCard } from 'lucide-react';

export default function HighRiskSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" id="high-risk">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, #1E293B 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.1
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-clash font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] mb-6">
            Versatile Payment Solutions
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            With our extensive network of banking partners, we provide tailored payment solutions for businesses of every size and industry
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-8 rounded-2xl shadow-xl"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-clash font-bold">Strategic Banking Network</h3>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-[#1E293B] leading-relaxed">
                Our extensive network of banking partnerships allows us to match your business with the perfect processing solution, regardless of your industry or requirements:
              </p>
              
              <div className="grid gap-4">
                {[
                  "Multiple domestic and international banks",
                  "Competitive rates across all industries",
                  "Specialized processing solutions",
                  "Flexible underwriting criteria",
                  "Industry-specific optimizations"
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 text-[#10B981] mr-3 flex-shrink-0" />
                    <span className="text-[#475569]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {[
                {
                  icon: CreditCard,
                  title: "Flexible Processing",
                  description: "Customized solutions for retail, e-commerce, subscription services, and specialized industries"
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Process payments worldwide with multi-currency support and international banking relationships"
                },
                {
                  icon: Shield,
                  title: "Risk Management",
                  description: "Advanced fraud prevention and transaction monitoring tailored to your business model"
                },
                {
                  icon: Zap,
                  title: "Fast Onboarding",
                  description: "Streamlined application process with most accounts approved within 24-48 hours"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-[#1E3A8A]/10 to-[#7C3AED]/10 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-[#7C3AED]" />
                    </div>
                    <div>
                      <h4 className="font-clash font-bold text-lg mb-1">{feature.title}</h4>
                      <p className="text-[#475569]">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}