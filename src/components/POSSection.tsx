import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CreditCard, ShoppingBag, Store, Wifi, Check, Star } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type POSSystem = {
  name: string;
  image: string;
  features: string[];
  premium: boolean;
};

const posSystems: POSSystem[] = [
  {
    name: "Clover POS Family",
    image: "https://www.clover.com/assets/images/public-site/clover_station.png",
    features: ["Full POS System", "Inventory Management", "Employee Management", "Customer Insights"],
    premium: true
  },
  {
    name: "Poynt Smart Terminal",
    image: "https://poynt.com/wp-content/uploads/2019/03/poynt-5-hero.png",
    features: ["Dual Screen", "Smart Terminal", "Mobile Payments", "Cloud Reporting"],
    premium: true
  },
  {
    name: "SwipeSimple Reader",
    image: "https://swipesimple.com/wp-content/uploads/2019/03/reader-hero.png",
    features: ["Mobile Payments", "Virtual Terminal", "SMS Payments", "Basic Reporting"],
    premium: false
  },
  {
    name: "Ingenico Terminal",
    image: "https://ingenico.com/assets/images/products/desk-5000.png",
    features: ["EMV Chip", "NFC Payments", "Basic Reports", "Receipt Printing"],
    premium: false
  }
];

const Carousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % posSystems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#7C3AED]">
      {posSystems.map((system, index) => (
        <motion.div
          key={system.name}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
          animate={{
            opacity: index === activeIndex ? 1 : 0,
            scale: index === activeIndex ? 1 : 0.8,
            rotateY: index === activeIndex ? 0 : 180,
            zIndex: index === activeIndex ? 1 : 0
          }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="relative">
            <motion.img
              src={system.image}
              alt={system.name}
              className="h-[300px] object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {system.premium && (
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-r from-[#F59E0B] to-[#EF4444] p-2 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {posSystems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-[#06B6D4] w-6' : 'bg-white/50'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureComparison: React.FC = () => {
  const features = [
    "Payment Processing",
    "Inventory Management",
    "Employee Management",
    "Customer Insights",
    "Mobile Access",
    "24/7 Support"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-16 overflow-x-auto"
    >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left text-[#F8FAFC] font-clash">Features</th>
            {posSystems.map(system => (
              <th key={system.name} className="p-4 text-center text-[#F8FAFC] font-clash">
                {system.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <motion.tr
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-t border-[#1E293B]"
            >
              <td className="p-4 text-[#F1F5F9]">{feature}</td>
              {posSystems.map(system => (
                <td key={`${system.name}-${feature}`} className="p-4 text-center">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`inline-flex items-center justify-center ${
                      system.premium ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default function POSSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
      id="pos"
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, #1E293B 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-clash font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] mb-6">
            Next-Generation POS Solutions
          </h2>
          <p className="text-2xl text-[#F1F5F9] max-w-3xl mx-auto font-inter">
            Transform your business with cutting-edge point of sale systems designed for the modern era
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Carousel />
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-clash font-bold text-[#F8FAFC] mb-6">
                Enterprise-Grade Features
              </h3>
              <div className="grid gap-6">
                {["Inventory Management", "Employee Scheduling", "Customer Analytics", "Cloud Integration"].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-[#1E293B]/50 to-[#1E293B]/30 backdrop-blur-sm"
                  >
                    <h4 className="text-xl font-clash font-semibold text-[#F8FAFC] mb-2">{feature}</h4>
                    <p className="text-[#F1F5F9]">
                      Advanced tools designed to streamline your operations and boost efficiency.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <FeatureComparison />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.a
            href="#contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-clash font-bold rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Explore POS Solutions
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
