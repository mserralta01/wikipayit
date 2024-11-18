import React, { useState } from 'react';
import { Menu, Zap, PhoneCall } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './auth/LoginModal';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md shadow-lg z-50 h-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-20 px-6">
          <div className="flex items-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-2xl font-bold">
                <span className="text-black">Wiki</span>
                <span className="gradient-text">PayIt</span>
              </span>
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

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg">
              <PhoneCall className="h-5 w-5 mr-2" />
              +1 (305) 396-1226
            </div>

            {/* Sign In Button / Avatar - Hidden on mobile */}
            <div className="hidden md:block">
              {user ? (
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                />
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
