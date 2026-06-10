'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User, 
  Heart, 
  Search, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Settings,
  Crown,
  Home, 
  LogOut,
  Menu,
  X,
  Bell,
  FileText,
  Calendar,
  Briefcase,
  Video,
  MessageCircle
} from 'lucide-react'
import Navigation from '../../components/Navigation'
import { t } from '../../lib/translations'

const getDashboardMenuItems = (language) => [
  {
    title: language === 'cs' ? 'Přehled' : (language === 'it' ? 'Panoramica' : 'Overview'),
    href: '/dashboard',
    icon: Activity,
    description: language === 'cs' ? 'Přehled nástěnky' : (language === 'it' ? 'Panoramica dashboard' : 'Dashboard overview')
  },
  {
    title: language === 'cs' ? 'Profil' : (language === 'it' ? 'Profilo' : 'Profile'),
    href: '/dashboard/profile',
    icon: User,
    description: language === 'cs' ? 'Spravovat profil' : (language === 'it' ? 'Gestisci profilo' : 'Manage your profile')
  },
  {
    title: language === 'cs' ? 'Oblíbené' : (language === 'it' ? 'Preferiti' : 'My Favorites'),
    href: '/dashboard/favorites',
    icon: Heart,
    description: language === 'cs' ? 'Uložené nemovitostí' : (language === 'it' ? 'Proprietà salvate' : 'Saved properties')
  },
  {
    title: language === 'cs' ? 'Dotazy' : (language === 'it' ? 'Richieste' : 'My Inquiries'),
    href: '/dashboard/inquiries',
    icon: MessageSquare,
    description: language === 'cs' ? 'Dotazy na nemovitostí' : (language === 'it' ? 'Richieste proprietà' : 'Property inquiries')
  },
  /*
  {
    title: language === 'cs' ? 'Doporučení' : (language === 'it' ? 'Raccomandazioni' : 'Recommendations'),
    href: '/dashboard/recommendations',
    icon: TrendingUp,
    description: language === 'cs' ? 'Navržené nemovitostí' : (language === 'it' ? 'Proprietà suggerite' : 'Suggested properties')
  },
  */
  {
    title: language === 'cs' ? 'Uložená hledání' : (language === 'it' ? 'Ricerche salvate' : 'Saved Searches'),
    href: '/dashboard/searches',
    icon: Search,
    description: language === 'cs' ? 'Vaše preference' : (language === 'it' ? 'Le tue preferenze' : 'Your search preferences')
  },
  {
    title: language === 'cs' ? 'Upozornění' : (language === 'it' ? 'Notifiche' : 'Notifications'),
    href: '/dashboard/notifications',
    icon: Bell,
    description: language === 'cs' ? 'Emailové preference' : (language === 'it' ? 'Preferenze email' : 'Email preferences')
  },
  {
    title: language === 'cs' ? 'Zákaznický formulář' : (language === 'it' ? 'Modulo cliente' : 'Client Form'),
    href: '/dashboard/intake-form',
    icon: FileText,
    description: language === 'cs' ? 'Osobní informace' : (language === 'it' ? 'Informazioni personali' : 'Personal information')
  },
  {
    title: language === 'cs' ? 'Webináře' : (language === 'it' ? 'Webinar' : 'Webinars'),
    href: '/dashboard/webinars',
    icon: Calendar,
    description: language === 'cs' ? 'Události a relace' : (language === 'it' ? 'Eventi e sessioni' : 'Events & sessions')
  },
  {
    title: language === 'cs' ? 'Dokumenty' : (language === 'it' ? 'Documenti' : 'Documents'),
    href: '/dashboard/documents',
    icon: Briefcase,
    description: language === 'cs' ? 'Soubory a smlouvy' : (language === 'it' ? 'File e contratti' : 'Files & contracts')
  },
  {
    title: language === 'cs' ? 'Concierge' : (language === 'it' ? 'Concierge' : 'Concierge'),
    href: '/dashboard/concierge',
    icon: MessageCircle,
    description: language === 'cs' ? 'Prémiová podpora' : (language === 'it' ? 'Supporto premium' : 'Premium support')
  },
  {
    title: language === 'cs' ? 'Exkluzivní obsah' : (language === 'it' ? 'Contenuto esclusivo' : 'Exclusive Content'),
    href: '/dashboard/content',
    icon: Video,
    description: language === 'cs' ? 'Videa a průvodci' : (language === 'it' ? 'Video e guide' : 'Videos & guides')
  }
]

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [hasNewInquiries, setHasNewInquiries] = useState(false)
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const savedLanguage = localStorage.getItem('preferred-language')
    return savedLanguage || 'cs'
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAccess()
  }, [])

  useEffect(() => {
    let cancelled = false
    let intervalId = null

    const loadPendingInquiries = async () => {
      try {
        const adminResponse = await fetch('/api/admin/me', { cache: 'no-store' })
        const adminPayload = await adminResponse.json().catch(() => ({}))

        if (!adminResponse.ok || adminPayload.admin !== true) {
          if (!cancelled) setHasNewInquiries(false)
          return
        }

        const response = await fetch('/api/inquiries', { cache: 'no-store' })
        if (!response.ok) return

        const data = await response.json()
        const propertyInquiries = Array.isArray(data)
          ? data.filter((inquiry) => !inquiry?.type || inquiry.type === 'property')
          : []

        const latestInquiryDate = propertyInquiries.length > 0
          ? propertyInquiries.reduce((latest, inquiry) => {
              const createdAt = inquiry?.createdAt || inquiry?.created_at
              if (!createdAt) return latest
              return !latest || new Date(createdAt) > new Date(latest) ? createdAt : latest
            }, null)
          : null

        const lastSeenDate = localStorage.getItem('admin-inquiries-last-seen-at')
        const hasNew = latestInquiryDate && (!lastSeenDate || new Date(latestInquiryDate) > new Date(lastSeenDate))

        if (!cancelled) {
          setHasNewInquiries(Boolean(hasNew))
        }
      } catch (error) {
        console.error('Failed to load dashboard inquiry notifications:', error)
      }
    }

    loadPendingInquiries()
    intervalId = window.setInterval(loadPendingInquiries, 60000)
    window.addEventListener('focus', loadPendingInquiries)
    window.addEventListener('adminInquiriesSeen', loadPendingInquiries)

    return () => {
      cancelled = true
      if (intervalId) window.clearInterval(intervalId)
      window.removeEventListener('focus', loadPendingInquiries)
      window.removeEventListener('adminInquiriesSeen', loadPendingInquiries)
    }
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
  }

  useEffect(() => {
    localStorage.setItem('preferred-language', language)
    document.documentElement.lang = language
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }))
  }, [language])

  const checkUserAccess = async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!sessionResponse.ok) {
        router.push('/login?redirect=/dashboard')
        return
      }

      const sessionPayload = await sessionResponse.json()
      if (!sessionPayload?.authenticated || !sessionPayload?.user) {
        router.push('/login?redirect=/dashboard')
        return
      }

      setUser(sessionPayload.user)

      // Load user profile
      try {
        const profileResponse = await fetch('/api/profile', { cache: 'no-store' })
        if (profileResponse.ok) {
          const profilePayload = await profileResponse.json()
          setUserProfile(profilePayload?.profile || null)
        } else {
          setUserProfile(null)
        }
      } catch (profileError) {
        console.error('Profile load failed:', profileError)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('User access check failed:', error)
      router.push('/login?redirect=/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      window.location.assign('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Login Required</h1>
              <p className="text-gray-600 mb-4">
                Please login to access your dashboard.
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 home-page-custom-border overflow-x-hidden">
      
      <div>
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">My Dashboard</span>
              </Link>
              <button 
                className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100" 
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {getDashboardMenuItems(language).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${item.className || ''}`} />
                    <div className="min-w-0">
                      <div className={`flex items-center gap-2 font-medium ${item.className || ''}`}>
                        <span>{item.title}</span>
                        {item.href === '/dashboard/inquiries' && hasNewInquiries && (
                          <span
                            className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                            aria-label="New property inquiries"
                            title="New property inquiries"
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.name || user?.user_metadata?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Procházet nemovitostí' : (language === 'it' ? 'Sfoglia proprietà' : 'Browse Properties')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'Odhlásit se' : (language === 'it' ? 'Disconnettersi' : 'Logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header (Desktop & Mobile) */}
          <header className="bg-white border-b h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center lg:hidden min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="mr-1 flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="font-semibold text-gray-900 truncate text-sm sm:text-base">Dashboard</h1>
            </div>
            
            <h1 className="hidden lg:block text-gray-900 font-semibold">
              {language === 'cs' ? 'Nástěnka' : (language === 'it' ? 'Cruscotto' : 'Dashboard')}
            </h1>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
              {/* Language Switcher */}
              <div className="flex bg-gray-100 rounded-full p-0.5">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] min-w-[32px] ${
                    language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] min-w-[32px] ${
                    language === 'cs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] min-w-[32px] ${
                    language === 'it' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  IT
                </button>
              </div>
              
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="hidden sm:flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
