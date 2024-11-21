import React, { useState } from 'react';
import { Menu, Zap, PhoneCall, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './auth/LoginModal';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as HeadlessMenu } from '@headlessui/react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md shadow-lg z-50 h-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-20 px-6">
          <div className="flex items-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-2xl font-bold">
                <span className="text-black">Wiki</span>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">PayIt</span>
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

            <div className="hidden md:block relative">
              {user ? (
                <HeadlessMenu>
                  <HeadlessMenu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.photoURL || 'https://via.placeholder.com/40'}
                      alt="User avatar"
                    />
                  </HeadlessMenu.Button>
                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {isAdmin && (
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleAdminDashboard}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    )}
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </HeadlessMenu.Items>
                </HeadlessMenu>
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
