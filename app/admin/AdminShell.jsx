'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Shield,
  Video,
  Mail
} from 'lucide-react'
import { t } from '@/lib/translations'

export default function AdminShell({ children, user, profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState('cs')
  const [hasNewInquiries, setHasNewInquiries] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'cs'
    setLanguage(savedLanguage)

    const handleLanguageChange = (e) => {
      if (e.detail) setLanguage(e.detail)
      else if (e.newValue) setLanguage(e.newValue)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadNewInquiries = async () => {
      try {
        const response = await fetch('/api/inquiries', { cache: 'no-store' })
        if (!response.ok) return

        const inquiries = await response.json()
        const propertyInquiries = Array.isArray(inquiries)
          ? inquiries.filter((inquiry) => !inquiry?.type || inquiry.type === 'property')
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
        console.error('Failed to load new inquiries indicator:', error)
      }
    }

    loadNewInquiries()
    const intervalId = window.setInterval(loadNewInquiries, 60000)
    window.addEventListener('focus', loadNewInquiries)
    window.addEventListener('adminInquiriesSeen', loadNewInquiries)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', loadNewInquiries)
      window.removeEventListener('adminInquiriesSeen', loadNewInquiries)
    }
  }, [])

  const adminMenuItems = [
    {
      titleKey: 'admin.menu.dashboard',
      descKey: 'admin.menu.dashboardDesc',
      href: '/admin',
      icon: BarChart3
    },
    {
      titleKey: 'admin.menu.userManagement',
      descKey: 'admin.menu.userManagementDesc',
      href: '/admin/users',
      icon: Users
    },
    {
      titleKey: 'admin.menu.inquiries',
      descKey: 'admin.menu.inquiriesDesc',
      href: '/admin/inquiries',
      icon: MessageSquare
    },
    {
      titleKey: 'admin.menu.intakeForms',
      descKey: 'admin.menu.intakeFormsDesc',
      href: '/admin/intake-forms',
      icon: FileText
    },
    {
      titleKey: 'admin.menu.documents',
      descKey: 'admin.menu.documentsDesc',
      href: '/admin/documents',
      icon: FileText
    },
    {
      titleKey: 'admin.menu.content',
      descKey: 'admin.menu.contentDesc',
      href: '/admin/content',
      icon: Settings
    },
    {
      titleKey: 'admin.menu.clubContent',
      descKey: 'admin.menu.clubContentDesc',
      href: '/admin/club-content',
      icon: Video
    },
    {
      titleKey: 'admin.menu.emailSystem',
      descKey: 'admin.menu.emailSystemDesc',
      href: '/admin/email-test',
      icon: Mail
    }
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      window.location.assign('/')
    }
  }

  const switchLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
    document.documentElement.lang = lang
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">{t('admin.layout.adminPanel', language)}</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-2 mx-4 mb-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-700" />
              <span className="text-xs font-medium text-green-800">Admin access enforced</span>
            </div>
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchLanguage('cs')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === 'cs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                CS
              </button>
              <button
                onClick={() => switchLanguage('en')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{t(item.titleKey, language)}</span>
                      {item.href === '/admin/inquiries' && hasNewInquiries && (
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                          aria-label="Nové žádosti o nemovitost"
                          title="Nové žádosti o nemovitost"
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{t(item.descKey, language)}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.name || user?.user_metadata?.name || user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {t('admin.layout.admin', language)}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Link href="/" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  {t('admin.layout.viewSite', language)}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('admin.layout.logout', language)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">{t('admin.layout.adminPanel', language)}</h1>
          <div className="w-6" />
        </div>

        <main className="min-h-screen lg:min-h-0 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
