import React from 'react';
import TestimonialCard from './TestimonialCard';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "WikiPayIt transformed our business by providing reliable payment processing when other providers turned us down. Their understanding of high-risk industries is unmatched.",
      author: "Michael Chen",
      position: "CEO",
      company: "Global Travel Solutions",
      location: "Miami, FL",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200"
    },
    {
      quote: "After being shut down by our previous processor, WikiPayIt stepped in and provided a stable solution. Their customer service is exceptional, and they truly understand our business needs.",
      author: "Sarah Rodriguez",
      position: "Owner",
      company: "Digital Marketing Agency",
      location: "New York, NY",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200"
    },
    {
      quote: "The team at WikiPayIt went above and beyond to find us the perfect processing solution. Their next-day deposits and competitive rates have made a huge difference for our restaurant.",
      author: "David Thompson",
      position: "Managing Director",
      company: "Fine Dining Group",
      location: "Los Angeles, CA",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what business owners across the country have to say about WikiPayIt's payment processing solutions.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}