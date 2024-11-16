import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  location: string;
  imageUrl: string;
}

export default function TestimonialCard({ quote, author, position, company, location, imageUrl }: TestimonialProps) {
  return (
    <div className="feature-card flex flex-col h-full relative overflow-hidden">
      <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-600/20" />
      <div className="flex items-center mb-6">
        <img 
          src={imageUrl} 
          alt={author} 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 shadow-lg"
        />
        <div className="ml-4">
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{position}</p>
          <p className="text-sm text-blue-600">{company}</p>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
      <p className="text-gray-600 flex-grow italic">{quote}</p>
    </div>
  );
}