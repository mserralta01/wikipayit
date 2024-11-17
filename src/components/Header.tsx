import React from 'react';
import { Menu, Zap, PhoneCall } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-20 px-6">
          <div className="flex items-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-2xl font-bold gradient-text">WikiPayIt</span>
            </div>
            
            <nav className="hidden md:flex items-center ml-16">
              <div className="flex items-center space-x-10">
                <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Services
                </a>
                <a href="#industries" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Industries
                </a>
                <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Solutions
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Contact
                </a>
              </div>
            </nav>
          </div>

          <div className="flex items-center">
            <a 
              href="tel:+13053961226" 
              className="hidden md:flex items-center btn btn-primary shadow-md hover:shadow-lg"
            >
              <PhoneCall className="h-5 w-5 mr-2" />
              +1 (305) 396-1226
            </a>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2 ml-4 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute w-full left-0 top-full bg-white shadow-lg">
            <nav className="px-6 py-4 space-y-3">
              <a href="#services" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Services
              </a>
              <a href="#industries" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Industries
              </a>
              <a href="#solutions" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Solutions
              </a>
              <a href="#contact" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
