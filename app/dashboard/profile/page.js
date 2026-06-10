'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'

export default function ProfileManagement() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    preferences: {
      propertyTypes: [],
      priceRange: { min: '', max: '' },
      preferredRegions: [],
      emailNotifications: true,
      propertyAlerts: true
    }
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    loadProfile()
    
    // Load language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
    
    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadProfile = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }

      setUser(user)

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          preferences: {
            propertyTypes: profileData.preferences?.propertyTypes || [],
            priceRange: profileData.preferences?.priceRange || { min: '', max: '' },
            preferredRegions: profileData.preferences?.preferredRegions || [],
            emailNotifications: profileData.preferences?.emailNotifications ?? true,
            propertyAlerts: profileData.preferences?.propertyAlerts ?? true
          }
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (!supabase) return
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          preferences: profile.preferences,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: t('club.profile.successMessage', language) })
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: t('club.profile.errorMessage', language) })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!supabase) return
    setSaving(true)
    setMessage({ type: '', text: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: t('club.profile.passwordMismatch', language) })
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('club.profile.passwordLength', language) })
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: t('club.profile.passwordSuccess', language) })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: t('club.profile.passwordError', language) })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferenceChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const togglePropertyType = (type) => {
    const currentTypes = profile.preferences.propertyTypes
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    handlePreferenceChange('propertyTypes', newTypes)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('club.profile.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('club.profile.subtitle', language)}</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="min-h-[44px] text-xs sm:text-sm px-1 sm:px-3">
            <span className="truncate">{t('club.profile.personalInfo', language)}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="min-h-[44px] text-xs sm:text-sm px-1 sm:px-3">
            <span className="truncate">{t('club.profile.preferences', language)}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="min-h-[44px] text-xs sm:text-sm px-1 sm:px-3">
            <span className="truncate">{t('club.profile.security', language)}</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('club.profile.personalInformation', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('club.profile.fullName', language)}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('club.profile.fullNamePlaceholder', language)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('club.profile.emailAddress', language)}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('club.profile.emailCannotChange', language)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">{t('club.profile.phoneNumber', language)}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="location">{t('club.profile.location', language)}</Label>
                  <Input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('club.profile.locationPlaceholder', language)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">{t('club.profile.aboutMe', language)}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('club.profile.aboutMePlaceholder', language)}
                  rows={4}
                />
              </div>
              
              <Button onClick={handleProfileSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('club.profile.saving', language) : t('club.profile.saveChanges', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t('club.profile.propertyPreferences', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Types */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.preferredPropertyTypes', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.selectPropertyTypes', language)}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['villa', 'house', 'apartment', 'commercial'].map((type) => (
                    <button
                      key={type}
                      onClick={() => togglePropertyType(type)}
                      className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        profile.preferences.propertyTypes.includes(type)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.priceRange', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.setBudget', language)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice">{t('club.profile.minPrice', language)}</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={profile.preferences.priceRange.min}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...profile.preferences.priceRange,
                        min: e.target.value
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">{t('club.profile.maxPrice', language)}</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={profile.preferences.priceRange.max}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...profile.preferences.priceRange,
                        max: e.target.value
                      })}
                      placeholder={t('club.profile.noLimit', language)}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.notificationPreferences', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.chooseNotifications', language)}</p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{t('club.profile.emailNotifications', language)}</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.propertyAlerts}
                      onChange={(e) => handlePreferenceChange('propertyAlerts', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{t('club.profile.propertyAlerts', language)}</span>
                  </label>
                </div>
              </div>
              
              <Button onClick={handleProfileSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('club.profile.saving', language) : t('club.profile.savePreferences', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>{t('club.profile.changePassword', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t('club.profile.currentPassword', language)}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder={t('club.profile.currentPasswordPlaceholder', language)}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center min-w-[44px] text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">{t('club.profile.newPassword', language)}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder={t('club.profile.newPasswordPlaceholder', language)}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center min-w-[44px] text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">{t('club.profile.confirmPassword', language)}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder={t('club.profile.confirmPasswordPlaceholder', language)}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center min-w-[44px] text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={saving || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                <Lock className="h-4 w-4 mr-2" />
                {saving ? t('club.profile.updating', language) : t('club.profile.updatePassword', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
