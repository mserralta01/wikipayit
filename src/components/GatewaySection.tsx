import React, { useEffect, useRef } from 'react';
import { Shield, Lock, Zap, Globe, Rocket, Monitor } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import authorizeNetLogo from "../assets/authorize.png.webp";

gsap.registerPlugin(ScrollTrigger);

type FeatureCardProps = {
  logo: React.ReactNode;
  title: string;
  description: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  delay: number;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ logo, title, description, features, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(card, {
        duration: 0.5,
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        duration: 0.5,
        rotateX: 0,
        rotateY: 0,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="feature-card relative text-center bg-gradient-to-br from-[#1E3A8A] to-[#7C3AED] p-8 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-black/10 rounded-2xl backdrop-blur-sm" />
      <div className="relative z-10">
        <div className="mb-6 transform transition-transform duration-300 hover:scale-110">
          {logo}
        </div>
        <h3 className="text-2xl font-clash font-bold mb-4 text-[#F8FAFC]">{title}</h3>
        <div className="space-y-4">
          <p className="text-[#F1F5F9] text-lg font-inter">
            {description}
          </p>
          <ul className="text-md space-y-3">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-center justify-center text-[#F1F5F9]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="mr-3 text-[#06B6D4]">{feature.icon}</span>
                {feature.text}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default function GatewaySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".morphing-grid", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".morphing-grid",
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      id="gateways"
    >
      {/* Morphing Background */}
      <motion.div
        className="absolute inset-0 morphing-grid"
        style={{
          background: `radial-gradient(circle at 50% ${backgroundY}, #7C3AED 0%, #1E3A8A 100%)`,
          opacity,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-clash font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] mb-6">
            Revolutionize Your Payment Experience
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto mt-4 font-inter">
            Unlock unprecedented growth with our next-generation payment solutions that transform transactions into seamless experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            delay={0.2}
            logo={
              <img 
                src={authorizeNetLogo}
                alt="Authorize.Net"
                className="h-16 mx-auto"
              />
            }
            title="Authorize.Net Integration"
            description="Power your business with enterprise-grade payment processing and industry-leading fraud prevention."
            features={[
              { icon: <Shield className="h-5 w-5" />, text: "Military-grade Security" },
              { icon: <Lock className="h-5 w-5" />, text: "Advanced Encryption" },
            ]}
          />

          <FeatureCard
            delay={0.4}
            logo={
              <img
                src="https://appfrontier.com/wp-content/uploads/2022/01/nmi-logo-600x193.png"
                alt="NMI Gateway"
                className="h-16 mx-auto"
              />
            }
            title="NMI Unified Commerce"
            description="Seamlessly integrate payments across all channels with our omnichannel solution."
            features={[
              { icon: <Globe className="h-5 w-5" />, text: "Global Processing Network" },
              { icon: <Zap className="h-5 w-5" />, text: "Real-time Analytics" },
            ]}
          />

          <FeatureCard
            delay={0.6}
            logo={
              <img
                src="https://www.fluidpay.com/images/general/logo.svg"
                alt="Fluidpay Gateway"
                className="h-16 mx-auto"
              />
            }
            title="Fluidpay Solutions"
            description="Specialized payment processing designed for high-risk industries and complex needs."
            features={[
              { icon: <Rocket className="h-5 w-5" />, text: "High-Risk Expertise" },
              { icon: <Monitor className="h-5 w-5" />, text: "Advanced Monitoring" },
            ]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-[#F1F5F9] font-inter mb-8">
            Join thousands of businesses transforming their payment infrastructure with WikiPayIt
          </p>
          <motion.a
            href="#contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-clash font-bold rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Transform Your Payments
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
