import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TestimonialCard from './TestimonialCard';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const testimonials = [
    {
      quote: "WikiPayIt revolutionized our payment infrastructure with their cutting-edge solutions. Their AI-powered fraud prevention saved us millions and increased our approval rates by 35%.",
      author: "Michael Chen",
      position: "Chief Technology Officer",
      company: "Global Travel Solutions",
      location: "Miami, FL",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200",
      rating: 5
    },
    {
      quote: "Switching to WikiPayIt was transformative for our business. Their next-gen payment gateway and real-time analytics gave us insights we never had before. Customer satisfaction increased by 40%.",
      author: "Sarah Rodriguez",
      position: "Director of Operations",
      company: "Digital Marketing Agency",
      location: "New York, NY",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200",
      rating: 5
    },
    {
      quote: "The integration was seamless, and their 24/7 support team is exceptional. WikiPayIt's innovative POS solutions helped us reduce transaction times by 65% during peak hours.",
      author: "David Thompson",
      position: "Executive Chef & Owner",
      company: "Fine Dining Group",
      location: "Los Angeles, CA",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200",
      rating: 5
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top center+=100",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 relative overflow-hidden"
      id="testimonials"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 100%, #7C3AED 0%, transparent 50%),
            radial-gradient(circle at 0% 0%, #06B6D4 0%, transparent 50%)
          `,
          opacity,
          y: backgroundY
        }}
      />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.5
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
            Success Stories
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            Join thousands of businesses transforming their payment infrastructure with WikiPayIt's next-generation solutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <motion.a
            href="#contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-clash font-bold rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Start Your Success Story
          </motion.a>
        </motion.div>

        {/* Stats section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            { label: "Processing Volume", value: "$2B+", suffix: "Annually" },
            { label: "Customer Satisfaction", value: "98%", suffix: "Rating" },
            { label: "Global Merchants", value: "10K+", suffix: "and Growing" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm"
            >
              <motion.div
                className="text-4xl font-clash font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent"
                whileInView={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {stat.value}
              </motion.div>
              <p className="text-[#1E293B] font-inter mt-2">{stat.label}</p>
              <p className="text-[#475569] text-sm">{stat.suffix}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
