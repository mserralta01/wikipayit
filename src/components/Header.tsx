import React from 'react';
import { Menu, X, Zap, Shield, Clock, PhoneCall } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold gradient-text">WikiPayIt</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
            <a href="#industries" className="text-gray-700 hover:text-blue-600 transition-colors">Industries</a>
            <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            <a href="tel:+13053961226" className="flex items-center btn btn-primary">
              <PhoneCall className="h-5 w-5 mr-2" />
              +1 (305) 396-1226
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute w-full left-0 bg-white/90 backdrop-blur-md shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#services" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Services</a>
              <a href="#industries" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Industries</a>
              <a href="#solutions" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Solutions</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">Contact</a>
              <a href="tel:+13053961226" className="block px-3 py-2 text-blue-600 font-semibold">
                +1 (305) 396-1226
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}