import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from './auth/LoginModal'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Settings, 
  LogOut,
  User,
  Menu,
  X,
  PhoneCall
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

export default function Header() {
  const { user, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()

  const handleAdminDashboard = () => {
    navigate('/admin')
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Link to="/" className="text-2xl font-bold">
              <span className="text-black">Wiki</span>
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                PayIt
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#services" className="text-gray-700 hover:text-blue-600">
              Services
            </a>
            <a href="#industries" className="text-gray-700 hover:text-blue-600">
              Industries
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </a>
          </nav>

          {/* Phone Number, Apply Now, and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a 
              href="tel:+13053961226" 
              className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
            >
              <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">+1 (305) 396-1226</span>
            </a>

            <a 
              href="tel:+13053961226"
              className="sm:hidden flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors w-10 h-10 rounded-md hover:bg-blue-50"
            >
              <PhoneCall className="h-5 w-5" />
            </a>

            <Link to="/apply">
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:opacity-90 hidden sm:block">
                Apply Now
              </Button>
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:opacity-90 sm:hidden px-3">
                Apply
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={handleAdminDashboard}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
            )}

            <div className="md:hidden ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="h-9 w-9"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="tel:+13053961226" 
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                +1 (305) 396-1226
              </a>
              <a href="#services" className="text-gray-700 hover:text-blue-600">
                Services
              </a>
              <a href="#industries" className="text-gray-700 hover:text-blue-600">
                Industries
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">
                Pricing
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </a>
              <Link to="/apply" className="text-gray-700 hover:text-blue-600">
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  )
}
