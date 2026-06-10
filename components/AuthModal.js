'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { t } from '@/lib/translations'

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  title = '',
  message = '',
  defaultTab = 'login',
  language = 'cs'
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab)
  }, [isOpen, defaultTab])

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const tr = (key) => t(`auth.${key}`, language)

  const loginViaServer = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Server login failed'
      }
    }

    return {
      ok: true,
      user: payload?.user || null
    }
  }

  const signupViaServer = async (name, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Server signup failed'
      }
    }

    return {
      ok: true,
      hasSession: Boolean(payload?.hasSession),
      user: payload?.user || null
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!loginForm.email || !loginForm.password) {
      setError(tr('fillAllFields'))
      setIsLoading(false)
      return
    }

    try {
      const result = await loginViaServer(loginForm.email, loginForm.password)
      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess(tr('loginSuccess'))

      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }

      setTimeout(() => {
        onAuthSuccess?.(result.user)
        onClose()
      }, 1000)
    } catch (err) {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError(tr('fillAllFields'))
      setIsLoading(false)
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError(tr('passwordsDoNotMatch'))
      setIsLoading(false)
      return
    }

    if (signupForm.password.length < 6) {
      setError(tr('passwordTooShort'))
      setIsLoading(false)
      return
    }

    try {
      const result = await signupViaServer(
        signupForm.name,
        signupForm.email,
        signupForm.password
      )

      if (!result.ok) {
        setError(result.error)
        return
      }

      const hasSession = Boolean(result.hasSession)
      setSuccess(hasSession ? tr('accountCreatedSession') : tr('accountCreatedEmail'))

      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Manual profile creation failed:', profileError)
      }

      if (hasSession) {
        setTimeout(() => {
          onAuthSuccess?.(result.user)
          onClose()
        }, 1000)
      } else {
        setTimeout(() => {
          setActiveTab('login')
          setSuccess('')
        }, 3000)
      }
    } catch (err) {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError('')

    if (!loginForm.email) {
      setError(tr('fillAllFields'))
      setIsLoading(false)
      return
    }

    setError(tr('magicLinkUnavailable'))
    setIsLoading(false)
  }

  const resetForm = () => {
    setLoginForm({ email: '', password: '' })
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const displayTitle = title || tr('login')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} data-testid="auth-modal">
      <DialogContent
        className="sm:max-w-sm w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-4 gap-2"
        data-testid="auth-modal-content"
      >
        <DialogHeader data-testid="auth-modal-header">
          <div className="text-center space-y-1" data-testid="auth-modal-title">
            <Image
              src="/logo domy.svg"
              alt="Domy v Itálii"
              width={40}
              height={38}
              className="h-10 w-auto mx-auto"
              data-testid="auth-modal-logo"
            />
            <DialogTitle className="text-base font-bold">
              {displayTitle}
            </DialogTitle>
            {message && (
              <p className="text-xs text-slate-600 leading-snug">
                {message}
              </p>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="auth-tabs">
          <TabsList className="grid w-full grid-cols-2" data-testid="auth-tabs-list">
            <TabsTrigger value="login" data-testid="login-tab">{tr('login')}</TabsTrigger>
            <TabsTrigger value="signup" data-testid="signup-tab">{tr('signup')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-2 mt-2" data-testid="login-tab-content">
            <form onSubmit={handleLogin} className="space-y-2" data-testid="login-form">
              <div className="space-y-1" data-testid="login-email-field">
                <Label htmlFor="login-email" className="text-sm" data-testid="login-email-label">{tr('email')}</Label>
                <div className="relative" data-testid="login-email-input-container">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={tr('emailPlaceholder')}
                    className="pl-10 h-9 text-sm"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div className="space-y-1" data-testid="login-password-field">
                <Label htmlFor="login-password" className="text-sm" data-testid="login-password-label">{tr('password')}</Label>
                <div className="relative" data-testid="login-password-input-container">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={tr('passwordPlaceholder')}
                    className="pl-10 pr-10 h-9 text-sm"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="login-password-toggle"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="py-2">
                  <AlertDescription className="text-xs text-slate-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-9 text-sm" disabled={isLoading}>
                {isLoading ? tr('signingIn') : tr('signIn')}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{tr('or')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-sm"
                onClick={handleMagicLink}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                {tr('sendMagicLink')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-2 mt-2">
            <form onSubmit={handleSignup} className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="signup-name" className="text-sm">{tr('fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={tr('fullNamePlaceholder')}
                    className="pl-10 h-9 text-sm"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-sm">{tr('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={tr('emailPlaceholder')}
                    className="pl-10 h-9 text-sm"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-sm">{tr('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={tr('passwordMinLength')}
                    className="pl-10 pr-10 h-9 text-sm"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-confirm" className="text-sm">{tr('confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder={tr('confirmPasswordPlaceholder')}
                    className="pl-10 h-9 text-sm"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="py-2">
                  <AlertDescription className="text-xs text-slate-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-9 text-sm" disabled={isLoading}>
                {isLoading ? tr('creatingAccount') : tr('createAccount')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-[11px] text-gray-600 leading-snug mt-2">
          {tr('termsText')}{' '}
          <Link href="/terms" className="underline">
            {tr('termsLink')}
          </Link>
          , {' '}
          <Link href="/gdpr" className="underline">
            {tr('privacyLink')}
          </Link>
          {' '}{tr('and')}{' '}
          <Link href="/cookies" className="underline">
            {tr('cookiePolicy')}
          </Link>
          .
        </div>
      </DialogContent>
    </Dialog>
  )
}
