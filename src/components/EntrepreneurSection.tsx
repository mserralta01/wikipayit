import React from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Globe, 
  Megaphone, 
  Gift, 
  CheckCircle 
} from 'lucide-react'

const EntrepreneurSection: React.FC = () => {
  return (
    <section className="py-20" id="entrepreneur">
      {/* Startup & Entrepreneur Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
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
                    <Rocket className="h-8 w-8 text-[#7C3AED]" />
                    <h3 className="text-3xl font-clash font-bold bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] bg-clip-text text-transparent">
                      Startups & Entrepreneurs
                    </h3>
                  </div>
                  <p className="text-xl text-[#1E293B] leading-relaxed">
                    Ready to launch your dream? We're not just a payment processor – we're your growth partner. Get exclusive rates and expert guidance tailored for visionaries like you.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white px-8 py-4 rounded-full font-bold shadow-lg"
                  >
                    Start Your Journey
                  </motion.button>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    icon: Star,
                    title: "Exclusive Startup Rates",
                    description: "Special pricing packages designed for new businesses"
                  },
                  {
                    icon: Zap,
                    title: "Quick Setup",
                    description: "Get up and running in as little as 24 hours"
                  },
                  {
                    icon: Shield,
                    title: "Guided Support",
                    description: "Expert consultation on payment optimization"
                  },
                  {
                    icon: TrendingUp,
                    title: "Scale With You",
                    description: "Flexible solutions that grow with your business"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5"
                  >
                    <feature.icon className="h-8 w-8 text-[#7C3AED] mb-4" />
                    <h4 className="font-clash font-bold text-lg mb-2">{feature.title}</h4>
                    <p className="text-[#475569]">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Startup Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 pt-12 border-t border-gray-100"
            >
              <h4 className="text-2xl font-clash font-bold text-center mb-8 bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] bg-clip-text text-transparent">
                Exclusive Startup Benefits
              </h4>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Free Website */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <Globe className="h-8 w-8 text-[#7C3AED]" />
                    <h5 className="text-xl font-clash font-bold">Free Business Website</h5>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Professional design templates
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Mobile-responsive layouts
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Built-in payment integration
                    </li>
                  </ul>
                </motion.div>

                {/* Marketing Kit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <Megaphone className="h-8 w-8 text-[#7C3AED]" />
                    <h5 className="text-xl font-clash font-bold">Local Marketing Ideas</h5>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Social media strategy guide
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Local SEO best practices
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Community engagement tips
                    </li>
                  </ul>
                </motion.div>

                {/* Bonus Features */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <Gift className="h-8 w-8 text-[#7C3AED]" />
                    <h5 className="text-xl font-clash font-bold">Bonus Features</h5>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Free business email setup
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Customer analytics dashboard
                    </li>
                    <li className="flex items-center text-[#475569]">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mr-3" />
                      Monthly strategy sessions
                    </li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default EntrepreneurSection 