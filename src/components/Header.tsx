import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from './auth/LoginModal'
import { Menu, Transition } from '@headlessui/react'
import { auth } from '../config/firebase'

type MenuItemProps = {
  active: boolean
}

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user, isAdmin } = useAuth()

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center">
                  <img
                    src={user.photoURL || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {isAdmin && (
                        <Menu.Item>
                          {({ active }: MenuItemProps) => (
                            <a
                              href="/admin"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Admin Dashboard
                            </a>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }: MenuItemProps) => (
                          <a
                            href="/profile"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            My Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }: MenuItemProps) => (
                          <button
                            onClick={handleSignOut}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  )
}

export default Header
