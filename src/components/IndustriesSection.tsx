import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, CheckCircle, Briefcase, Plane, Shield, Building, Rocket, Star, Zap, TrendingUp, Globe, Megaphone, Gift, Users, Building2 } from 'lucide-react';

export default function IndustriesSection() {
  const industries = [
    {
      icon: Coffee,
      title: "Retail & Hospitality",
      items: [
        "Full-service restaurants",
        "Quick-service establishments",
        "Retail stores",
        "Hotels & Lodging"
      ]
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      items: [
        "Business consultants",
        "Healthcare providers",
        "Legal services",
        "Financial advisors"
      ]
    },
    {
      icon: Globe,
      title: "Global Commerce",
      items: [
        "E-commerce platforms",
        "Digital services",
        "International trade",
        "Cross-border payments"
      ]
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" id="industries">
      {/* Animated background pattern */}
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
            Banking Solutions for Every Business
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            Our expert banking team matches you with the perfect financial partner for your unique business needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5" />
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] p-4 rounded-2xl inline-block">
                    <industry.icon className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-clash font-bold text-[#1E293B] mb-4">{industry.title}</h3>
                
                <ul className="space-y-3">
                  {industry.items.map((item, itemIndex) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + itemIndex * 0.1 }}
                      className="flex items-center text-[#475569]"
                    >
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Banking Partnership Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] p-1">
            <div className="bg-white rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-8 w-8 text-[#7C3AED]" />
                      <h3 className="text-3xl font-clash font-bold bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] bg-clip-text text-transparent">
                        Expert Banking Network
                      </h3>
                    </div>
                    <p className="text-lg text-[#475569]">
                      Our extensive network of banking partners allows us to find the perfect match for your business, regardless of industry or transaction volume. With decades of combined experience, our team ensures:
                    </p>
                    <ul className="space-y-4">
                      {[
                        "Personalized banking partnerships",
                        "Optimized approval rates",
                        "Competitive processing rates",
                        "Seamless onboarding process"
                      ].map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                          className="flex items-center text-[#475569]"
                        >
                          <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5">
                      <div className="flex items-center space-x-4 mb-4">
                        <Shield className="h-8 w-8 text-[#7C3AED]" />
                        <h5 className="text-xl font-clash font-bold">Dedicated Banking Experts</h5>
                      </div>
                      <p className="text-[#475569]">
                        Our team of banking specialists works directly with financial institutions to ensure your business gets the best possible partnership and terms.
                      </p>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5">
                      <div className="flex items-center space-x-4 mb-4">
                        <Building className="h-8 w-8 text-[#7C3AED]" />
                        <h5 className="text-xl font-clash font-bold">Multiple Banking Partners</h5>
                      </div>
                      <p className="text-[#475569]">
                        Access to diverse banking relationships means we can accommodate businesses of all sizes and industries, ensuring the right fit for your specific needs.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}