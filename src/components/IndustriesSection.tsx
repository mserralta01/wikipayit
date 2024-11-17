import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, CheckCircle, Briefcase, Plane, Shield, Building } from 'lucide-react';

export default function IndustriesSection() {
  const industries = [
    {
      icon: Coffee,
      title: "Restaurants & Hospitality",
      items: [
        "Full-service restaurants",
        "Quick-service establishments",
        "Food delivery services"
      ]
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      items: [
        "Business coaches",
        "Web agencies",
        "Consulting firms"
      ]
    },
    {
      icon: Plane,
      title: "Travel & Tourism",
      items: [
        "Travel agencies",
        "Tour operators",
        "Booking services"
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
            Industries We Serve
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            From traditional to high-risk industries, we deliver tailored payment solutions for every business
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

        {/* High Risk Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED]" />
          <div className="relative p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-3xl font-clash font-bold mb-6">High-Risk Industry Specialists</h3>
                <p className="text-lg mb-6 text-gray-100">We specialize in helping businesses that others turn away:</p>
                <ul className="space-y-4">
                  {[
                    "Previously shut down by other processors",
                    "MATCH/TMF listed merchants",
                    "High-volume processors",
                    "International merchants"
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 text-[#06B6D4] mr-3" />
                      <span className="text-gray-100">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h4 className="text-2xl font-clash font-bold mb-6">Our Advantage</h4>
                <ul className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: "Thorough Underwriting",
                      description: "Prevent unexpected shutdowns with proper upfront assessment"
                    },
                    {
                      icon: Building,
                      title: "Multiple Banking Partners",
                      description: "We match you with the right bank for your specific needs"
                    }
                  ].map((advantage, index) => (
                    <motion.li
                      key={advantage.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="bg-white/10 p-3 rounded-lg mr-4">
                        <advantage.icon className="h-6 w-6 text-[#06B6D4]" />
                      </div>
                      <div>
                        <p className="font-clash font-bold text-lg mb-1">{advantage.title}</p>
                        <p className="text-gray-200">{advantage.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
