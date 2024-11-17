import React, { useRef, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  location: string;
  imageUrl: string;
  rating?: number;
}

export default function TestimonialCard({
  quote,
  author,
  position,
  company,
  location,
  imageUrl,
  rating = 5
}: TestimonialProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const springConfig = { damping: 20, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className="relative h-full perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
    >
      <div className="relative p-8 h-full bg-gradient-to-br from-[#1E3A8A]/10 to-[#7C3AED]/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl transform-gpu transition-all duration-300 hover:shadow-2xl">
        {/* Animated quote icon */}
        <motion.div
          className="absolute -top-4 -right-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Quote className="h-5 w-5 text-white" />
        </motion.div>

        {/* Rating stars */}
        <div className="flex space-x-1 mb-4">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Star
                className={`h-5 w-5 ${
                  index < rating ? 'text-[#F59E0B]' : 'text-gray-300'
                }`}
                fill={index < rating ? '#F59E0B' : 'none'}
              />
            </motion.div>
          ))}
        </div>

        {/* Avatar and info */}
        <div className="flex items-center mb-6">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full blur-md opacity-50" />
            <img 
              src={imageUrl} 
              alt={author} 
              className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </motion.div>
          <div className="ml-4">
            <motion.p
              className="font-clash font-bold text-[#1E293B]"
              whileHover={{ scale: 1.05 }}
            >
              {author}
            </motion.p>
            <p className="text-sm text-[#475569]">{position}</p>
            <p className="text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              {company}
            </p>
            <p className="text-sm text-[#475569]">{location}</p>
          </div>
        </div>

        {/* Quote text */}
        <motion.p
          className="text-[#1E293B] font-inter leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          "{quote}"
        </motion.p>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent rounded-b-2xl pointer-events-none" />
      </div>
    </motion.div>
  );
}
