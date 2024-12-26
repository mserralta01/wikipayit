import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Settings,
  Globe,
  LogOut,
  ChevronDown,
  User,
  Bell,
  ChevronRight,
  Store,
  Users,
  FileText,
  GitBranch,
  BarChart,
  DollarSign,
  TrendingUp,
  Mail,
  Plus
} from 'lucide-react'
import { auth } from '../../lib/firebase'
import { signOut } from 'firebase/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { merchantService } from '../../services/merchantService'
import { Merchant as PipelineMerchant } from '../../types/merchant'

type AdminLayoutProps = {
  children: React.ReactNode
}

type MenuItem = {
  title: string
  icon: React.ReactNode
  href?: string
  submenu?: MenuItem[]
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(auth.currentUser)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Extract merchant ID from URL if we're on a pipeline detail page
  const merchantId = location.pathname.match(/\/admin\/pipeline\/([^\/]+)/)?.[1]

  // Fetch merchant data if we're on a detail page
  const { data: merchant } = useQuery<PipelineMerchant>({
    queryKey: ['merchant', merchantId],
    queryFn: async () => {
      const data = await merchantService.getMerchant(merchantId as string)
      return data as PipelineMerchant
    },
    enabled: !!merchantId,
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth)
        navigate('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin',
    },
    {
      title: 'Merchants',
      icon: <Store className="w-5 h-5" />,
      submenu: [
        {
          title: 'All Merchants',
          icon: <Users className="w-5 h-5" />,
          href: '/admin/merchants',
        },
        {
          title: 'Applications',
          icon: <FileText className="w-5 h-5" />,
          href: '/admin/applications',
        },
        {
          title: 'Pipeline',
          icon: <GitBranch className="w-5 h-5" />,
          href: '/admin/pipeline',
        }
      ]
    },
    {
      title: 'Reports',
      icon: <BarChart className="w-5 h-5" />,
      submenu: [
        {
          title: 'Processing Volume',
          icon: <DollarSign className="w-5 h-5" />,
          href: '/admin/reports/volume',
        },
        {
          title: 'Sales Analytics',
          icon: <TrendingUp className="w-5 h-5" />,
          href: '/admin/reports/sales',
        }
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      submenu: [
        {
          title: 'Website',
          icon: <Globe className="w-5 h-5" />,
          href: '/admin/website',
        },
        {
          title: 'Email Templates',
          icon: <Mail className="w-5 h-5" />,
          href: '/admin/settings/email-templates',
        },
        {
          title: 'Team',
          icon: <Users className="w-5 h-5" />,
          href: '/admin/settings/team',
        }
      ]
    },
  ]

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  const renderMenuItem = (item: MenuItem) => {
    if (item.submenu) {
      const isOpen = openSubmenu === item.title
      const isActive = item.submenu.some(subitem => subitem.href === location.pathname)

      return (
        <div key={item.title}>
          <button
            onClick={() => toggleSubmenu(item.title)}
            className={cn(
              'w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
              isActive && 'bg-gray-100 text-gray-900 font-medium'
            )}
          >
            {item.icon}
            <span className="ml-3 flex-1 text-left">{item.title}</span>
            <ChevronRight className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'transform rotate-90'
            )} />
          </button>
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.submenu.map(subitem => (
                <Link
                  key={subitem.title}
                  to={subitem.href!}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
                    location.pathname === subitem.href && 'bg-gray-100 text-gray-900 font-medium'
                  )}
                >
                  {subitem.icon}
                  <span className="ml-3">{subitem.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.title}
        to={item.href!}
        className={cn(
          'flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
          location.pathname === item.href && 'bg-gray-100 text-gray-900 font-medium'
        )}
      >
        {item.icon}
        <span className="ml-3">{item.title}</span>
      </Link>
    )
  }

  const getPageTitle = (pathname: string): React.ReactNode => {
    switch (true) {
      case pathname === '/admin':
        return 'Dashboard'
      case pathname.includes('/admin/pipeline/'):
        return (
          <div className="flex items-center gap-2">
            <Link to="/admin/pipeline" className="text-gray-500 hover:text-gray-700">
              Pipeline
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span>{merchant?.formData?.businessName || merchant?.businessName || 'Lead Details'}</span>
          </div>
        )
      case pathname.includes('/admin/merchants'):
        return 'Merchant Management'
      case pathname.includes('/admin/applications'):
        return 'Application Pipeline'
      case pathname.includes('/admin/reports/volume'):
        return 'Processing Volume'
      case pathname.includes('/admin/reports/sales'):
        return 'Sales Analytics'
      case pathname === '/admin/website':
        return 'Website Settings'
      case pathname === '/admin/settings/email-templates':
        return 'Email Templates'
      case pathname === '/admin/settings/team':
        return 'Team Management'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-screen flex flex-col">
        <div className="flex-1">
          <div className="p-6">
            <h1 className="text-2xl font-bold">
              <span className="text-black">Wiki</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PayIt
              </span>
            </h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              {menuItems.map(item => (
                <li key={item.title}>
                  {renderMenuItem(item)}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 relative">
        <div className="flex flex-col min-h-screen">
          {/* Top Navigation */}
          <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {getPageTitle(location.pathname)}
              </h2>
              {/* Add quick action buttons based on current page */}
              {location.pathname.includes('/admin/merchants') && (
                <Button variant="outline" size="sm" className="ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Merchant
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications with badge */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Add notification items */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 pt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}   