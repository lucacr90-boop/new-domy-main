'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Crown, Lock, Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })

function isProtectedArticlePath(pathname) {
  if (!pathname) return false
  if (pathname === '/regions') return false
  if (pathname.startsWith('/regions/')) return true

  if (pathname === '/články/průvodce-italii') return false
  if (pathname.startsWith('/články/průvodce-italii/')) return true

  if (pathname.startsWith('/blog/regions/')) return true

  if (pathname === '/guides') return false
  if (pathname.startsWith('/guides/')) return true

  return false
}

const COPY = {
  cs: {
    badge: 'Klub pro klienty',
    free: 'Zdarma',
    title: 'Pokračujte ve čtení v našem klubu',
    subtitle:
      'Kompletní článek, regionální průvodci a exkluzivní analýzy jsou zdarma pro registrované členy klubu.',
    benefits: [
      'Bezplatná registrace, bez platební karty',
      'Přístup ke všem prémiovým článkům a průvodcům',
      'Aktualizace o italském realitním trhu'
    ],
    register: 'Registrovat zdarma',
    login: 'Přihlásit se',
    close: 'Zavřít a vrátit se'
  },
  en: {
    badge: 'Klub pro klienty',
    free: 'Free',
    title: 'Continue reading in our free Klub',
    subtitle:
      'Get full access to this article, regional guides and exclusive analyses — free for Klub members.',
    benefits: [
      'Free registration, no credit card',
      'Access to all premium articles and guides',
      'Italian property market updates'
    ],
    register: 'Register for free',
    login: 'Log in',
    close: 'Close and go back'
  },
  it: {
    badge: 'Klub pro klienty',
    free: 'Gratuito',
    title: 'Continua a leggere nel nostro Klub gratuito',
    subtitle:
      "Accesso completo all'articolo, alle guide regionali e ai contenuti esclusivi, gratuito per i membri del Klub.",
    benefits: [
      'Registrazione gratuita, senza carta',
      'Accesso a tutti gli articoli e le guide premium',
      'Aggiornamenti sul mercato immobiliare italiano'
    ],
    register: 'Registrati gratis',
    login: 'Accedi',
    close: 'Chiudi e torna indietro'
  }
}

export default function ArticlePaywallGate() {
  const pathname = usePathname()
  const isProtected = isProtectedArticlePath(pathname)

  const [language, setLanguage] = useState('cs')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('signup')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('preferred-language')
    if (saved) setLanguage(saved)
    const handleLanguageChange = (event) => {
      if (event?.detail) setLanguage(event.detail)
    }
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    if (!isProtected) {
      setAuthChecked(true)
      setIsAuthenticated(false)
      return
    }

    let mounted = true
    setAuthChecked(false)

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted) setIsAuthenticated(Boolean(payload?.authenticated))
      })
      .catch(() => {
        if (mounted) setIsAuthenticated(false)
      })
      .finally(() => {
        if (mounted) setAuthChecked(true)
      })

    return () => {
      mounted = false
    }
  }, [isProtected, pathname])

  const isLocked = isProtected && authChecked && !isAuthenticated

  // Lock scroll and tag the document so global CSS can apply scroll-lock styles.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isLocked) return

    document.body.dataset.paywall = 'active'
    document.documentElement.dataset.paywall = 'active'

    // Defensive scroll lock — works even if a smooth-scroll library (Lenis,
    // locomotive, etc.) is hijacking native scroll. We pin the page at the
    // top and intercept wheel/touch/key inputs that would scroll the article.
    window.scrollTo(0, 0)

    const preventScrollEvent = (event) => {
      // Allow scroll inside the paywall card itself (so on tiny screens the
      // visitor can still reach the buttons if the card overflows).
      const target = event.target
      if (target && typeof target.closest === 'function') {
        if (target.closest('[data-paywall-scrollable="true"]')) return
        if (target.closest('[role="dialog"]')) return
      }
      event.preventDefault()
    }

    const preventScrollKeys = (event) => {
      const blockedKeys = [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' '
      ]
      if (blockedKeys.includes(event.key)) {
        const target = event.target
        if (target && typeof target.closest === 'function') {
          if (target.closest('[role="dialog"]')) return
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        }
        event.preventDefault()
      }
    }

    const enforceScrollTop = () => {
      if (window.scrollY > 0) window.scrollTo(0, 0)
    }

    window.addEventListener('wheel', preventScrollEvent, { passive: false })
    window.addEventListener('touchmove', preventScrollEvent, { passive: false })
    window.addEventListener('keydown', preventScrollKeys)
    window.addEventListener('scroll', enforceScrollTop, { passive: true })

    return () => {
      delete document.body.dataset.paywall
      delete document.documentElement.dataset.paywall
      window.removeEventListener('wheel', preventScrollEvent)
      window.removeEventListener('touchmove', preventScrollEvent)
      window.removeEventListener('keydown', preventScrollKeys)
      window.removeEventListener('scroll', enforceScrollTop)
    }
  }, [isLocked])

  if (!isLocked && !authOpen) return null

  const copy = COPY[language] || COPY.en

  const handleOpenLogin = () => {
    setAuthTab('login')
    setAuthOpen(true)
  }
  const handleOpenSignup = () => {
    setAuthTab('signup')
    setAuthOpen(true)
  }
  const handleAuthSuccess = () => {
    setAuthOpen(false)
    setIsAuthenticated(true)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
  const handleClose = () => {
    if (typeof window === 'undefined') return
    // Try to navigate to the previous page within our own site. If there's no
    // valid history entry (direct link, new tab, external referrer), fall back
    // to a safe landing page so the user never sees the gated article.
    const sameOriginReferrer =
      typeof document !== 'undefined' &&
      document.referrer &&
      document.referrer.startsWith(window.location.origin) &&
      document.referrer !== window.location.href

    if (sameOriginReferrer && window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.href = '/'
  }

  return (
    <>
      {isLocked && (
        <>
          {/* Blur + fade overlay sitting over the article content. */}
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
            style={{ height: '60vh' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(247,244,237,0) 0%, rgba(247,244,237,0.65) 30%, rgba(247,244,237,0.95) 65%, rgba(247,244,237,1) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 100%)'
              }}
            />
          </div>

          {/* CTA card pinned to the bottom of the viewport. */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-4 pb-4 sm:pb-6"
            data-paywall-scrollable="true"
          >
            <div className="container mx-auto">
              <div className="max-w-xl mx-auto pointer-events-auto">
                <div
                  className="rounded-2xl bg-white border border-amber-200/70 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] p-5 sm:p-6 max-h-[80vh] overflow-y-auto"
                  data-paywall-scrollable="true"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1">
                        <Crown className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold">
                          {copy.badge}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Lock className="h-3 w-3" />
                        {copy.free}
                      </span>
                    </div>
                    <button
                      onClick={handleClose}
                      aria-label="Close"
                      className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 text-slate-800">
                    {copy.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {copy.subtitle}
                  </p>

                  <ul className="space-y-1.5 mb-4 sm:mb-5">
                    {copy.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button
                      onClick={handleOpenSignup}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold flex-1 h-11 shadow-sm"
                      data-testid="paywall-register-button"
                    >
                      {copy.register}
                    </Button>
                    <Button
                      onClick={handleOpenLogin}
                      variant="outline"
                      className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex-1 h-11"
                      data-testid="paywall-login-button"
                    >
                      {copy.login}
                    </Button>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    data-testid="paywall-close-button"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {copy.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <AuthModal
        isOpen={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
      />
    </>
  )
}
