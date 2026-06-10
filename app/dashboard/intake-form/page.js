'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  User,
  Home,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'

const PROPERTY_TYPES = ['Villa', 'House', 'Apartment', 'Farmhouse', 'Castle', 'Commercial', 'Land']
const ITALIAN_REGIONS = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
]
const BUDGET_RANGES = [
  'Under €250,000',
  '€250,000 - €500,000',
  '€500,000 - €1,000,000',
  '€1,000,000 - €2,000,000',
  'Over €2,000,000'
]
const TIMELINE_OPTIONS = [
  'Immediately (0-3 months)',
  'Short term (3-6 months)',
  'Medium term (6-12 months)',
  'Long term (12+ months)',
  'Just exploring'
]
const DISTANCE_FROM_SEA = [
  'On the beach (0-100m)',
  'Walking distance (100m-1km)',
  'Short drive (1-5km)',
  'Within 10km',
  'Within 20km',
  'Not important'
]
const DISTANCE_FROM_AIRPORT = [
  'Under 30 minutes',
  '30-60 minutes',
  '1-2 hours',
  '2+ hours',
  'Not important'
]
const DISTANCE_FROM_CITY = [
  'In city center',
  'City outskirts (0-5km)',
  'Nearby town (5-15km)',
  'Rural area (15-30km)',
  'Remote location (30km+)',
  'Not important'
]
const PROXIMITY_PREFERENCES = [
  'Beach/Sea',
  'Mountains',
  'Lake',
  'Historic Center',
  'Restaurants',
  'Shopping',
  'Medical Facilities',
  'International Schools',
  'Golf Course',
  'Ski Resort',
  'Airport',
  'Train Station'
]
const PROPERTY_AGE_OPTIONS = [
  'New build (0-5 years)',
  'Modern (5-20 years)',
  'Established (20-50 years)',
  'Historic (50-100 years)',
  'Antique (100+ years)',
  'No preference'
]
const PROPERTY_CONDITION_OPTIONS = [
  'Move-in ready',
  'Light cosmetic work needed',
  'Moderate renovation needed',
  'Major renovation needed',
  'Complete restoration project',
  'No preference'
]
const RENOVATION_WILLINGNESS = [
  'Only move-in ready properties',
  'Minor cosmetic updates acceptable',
  'Willing to do moderate renovation',
  'Interested in major renovation projects',
  'Looking for complete restoration projects'
]
const LAND_SIZE_OPTIONS = [
  'No land needed',
  'Small garden (under 500 sqm)',
  'Medium garden (500-1000 sqm)',
  'Large garden (1000-5000 sqm)',
  'Small plot (5000-10000 sqm)',
  'Large plot (1+ hectare)',
  'Agricultural land (5+ hectares)'
]
const CLIMATE_PREFERENCES = [
  'Mediterranean (hot, dry summers)',
  'Alpine (cooler, mountain climate)',
  'Coastal (mild, sea breezes)',
  'Continental (hot summers, cold winters)',
  'No preference'
]
const TOURIST_AREA_PREFERENCES = [
  'Quiet, off-the-beaten-path',
  'Some tourism but peaceful',
  'Popular tourist area',
  'Major tourist destination',
  'No preference'
]
const PURCHASE_REASONS = [
  'Primary residence',
  'Vacation/Holiday home',
  'Investment/Rental property',
  'Retirement home',
  'Business opportunity',
  'Combination of above'
]
const FINANCING_OPTIONS = [
  'Cash purchase',
  'Mortgage needed (pre-approved)',
  'Mortgage needed (not yet approved)',
  'Exploring financing options',
  'Not yet decided'
]
const HOW_HEARD_OPTIONS = [
  'Google search',
  'Social media',
  'Friend/Family referral',
  'Real estate website',
  'Magazine/Publication',
  'Previous client',
  'Other'
]

// Light mode colors
const cardClass = "bg-white border-gray-200"
const textPrimary = "text-gray-900"
const textSecondary = "text-gray-500"
const inputClass = "bg-white border-gray-200 text-gray-900"

export default function IntakeForm() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showExtendedForm, setShowExtendedForm] = useState(false)
  const [language, setLanguage] = useState('cs')
  const extendedFormRef = useRef(null)

  const handleToggleExtendedForm = () => {
    const opening = !showExtendedForm
    setShowExtendedForm(opening)
    if (opening) {
      setTimeout(() => {
        extendedFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    phone: '',
    email: '',
    nationality: '',
    currentLocation: '',
    
    // Property Preferences
    propertyTypes: [],
    preferredRegions: [],
    budgetRange: '',
    minBedrooms: '',
    minBathrooms: '',
    minSquareMeters: '',
    
    // Location Preferences
    maxDistanceFromSea: '',
    maxDistanceFromAirport: '',
    maxDistanceFromCity: '',
    preferredProximity: [],
    
    // Property Characteristics
    propertyAge: '',
    propertyCondition: '',
    renovationWillingness: '',
    landSize: '',
    
    // Purchase Details
    timeline: '',
    purchaseReason: '',
    financingNeeded: '',
    additionalRequirements: '',
    
    // Special Preferences
    mustHaveFeatures: [],
    lifestylePreferences: '',
    climatePreference: '',
    touristAreaPreference: '',
    
    // Additional Information
    howDidYouHear: '',
    additionalNotes: ''
  })

  useEffect(() => {
    loadFormData()
    
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

  const loadFormData = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      
      setUser(user)
      
      // 1. Try to load from client_intake_forms first (primary source)
      const { data: intakeForm, error: intakeError } = await supabase
        .from('client_intake_forms')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (intakeForm) {
        // Map database fields back to form state
        setFormData(prev => ({
          ...prev,
          fullName: intakeForm.full_name || '',
          email: intakeForm.email || '',
          phone: intakeForm.phone || '',
          nationality: intakeForm.nationality || '',
          currentLocation: intakeForm.current_location || '',
          
          propertyTypes: intakeForm.property_types || [],
          preferredRegions: intakeForm.preferred_regions || [],
          budgetRange: intakeForm.budget_range || '',
          minBedrooms: intakeForm.min_bedrooms?.toString() || '',
          minBathrooms: intakeForm.min_bathrooms?.toString() || '',
          minSquareMeters: intakeForm.min_square_meters?.toString() || '',
          
          timeline: intakeForm.timeline || '',
          purchaseReason: intakeForm.purchase_reason || '',
          financingNeeded: intakeForm.financing_needed || '',
          additionalRequirements: intakeForm.additional_requirements || '',
          
          mustHaveFeatures: intakeForm.must_have_features || [],
          lifestylePreferences: intakeForm.lifestyle_preferences || '',
          
          howDidYouHear: intakeForm.how_did_you_hear || '',
          additionalNotes: intakeForm.additional_notes || '',
          
          // Map extra_data fields if they exist
          maxDistanceFromSea: intakeForm.extra_data?.maxDistanceFromSea || '',
          maxDistanceFromAirport: intakeForm.extra_data?.maxDistanceFromAirport || '',
          maxDistanceFromCity: intakeForm.extra_data?.maxDistanceFromCity || '',
          preferredProximity: intakeForm.extra_data?.preferredProximity || [],
          propertyAge: intakeForm.extra_data?.propertyAge || '',
          propertyCondition: intakeForm.extra_data?.propertyCondition || '',
          renovationWillingness: intakeForm.extra_data?.renovationWillingness || '',
          landSize: intakeForm.extra_data?.landSize || '',
          climatePreference: intakeForm.extra_data?.climatePreference || '',
          touristAreaPreference: intakeForm.extra_data?.touristAreaPreference || ''
        }))
        return // Successfully loaded from primary source
      }

      // 2. Fallback: Load from profiles if no intake form exists yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Check if there are legacy preferences saved in the profile
        const legacyPrefs = profile.preferences || {}
        
        setFormData(prev => ({
          ...prev,
          fullName: profile.name || '',
          email: user.email || '',
          phone: profile.phone || '',
          
          // Try to map any existing preferences found in profile
          propertyTypes: legacyPrefs.propertyTypes || [],
          preferredRegions: legacyPrefs.preferredRegions || [],
          budgetRange: legacyPrefs.budgetRange || '',
          timeline: legacyPrefs.timeline || '',
          // ... map other legacy fields if they existed ...
        }))
      }
      
    } catch (error) {
      console.error('Error loading form data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!supabase) return
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // 1. Update Profile (Name, Phone) - non-blocking for intake form
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.fullName,
          phone: formData.phone,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.warn('Profile update failed (non-critical):', profileError)
      }

      // 2. Save Intake Form
      const { error: intakeError } = await supabase
        .from('client_intake_forms')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality,
          current_location: formData.currentLocation,
          property_types: formData.propertyTypes,
          preferred_regions: formData.preferredRegions,
          budget_range: formData.budgetRange,
          min_bedrooms: parseInt(formData.minBedrooms) || 0,
          min_bathrooms: parseInt(formData.minBathrooms) || 0,
          min_square_meters: parseInt(formData.minSquareMeters) || 0,
          timeline: formData.timeline,
          purchase_reason: formData.purchaseReason,
          financing_needed: formData.financingNeeded,
          additional_requirements: formData.additionalRequirements,
          lifestyle_preferences: formData.lifestylePreferences,
          how_did_you_hear: formData.howDidYouHear,
          additional_notes: formData.additionalNotes,
          // Store extras in extra_data
          extra_data: {
             maxDistanceFromSea: formData.maxDistanceFromSea,
             maxDistanceFromAirport: formData.maxDistanceFromAirport,
             maxDistanceFromCity: formData.maxDistanceFromCity,
             preferredProximity: formData.preferredProximity,
             propertyAge: formData.propertyAge,
             propertyCondition: formData.propertyCondition,
             renovationWillingness: formData.renovationWillingness,
             landSize: formData.landSize,
             climatePreference: formData.climatePreference,
             touristAreaPreference: formData.touristAreaPreference
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (intakeError) {
        // Fallback: If client_intake_forms doesn't exist, try saving to profiles.preferences as originally intended
        // This handles the case where the user hasn't run the SQL migration yet
        console.warn('Client intake form save failed, trying fallback to profiles...', intakeError)
        
        const { error: fallbackError } = await supabase
          .from('profiles')
          .update({
            preferences: {
              ...formData,
              updatedAt: new Date().toISOString()
            }
          })
          .eq('id', user.id)
          
        if (fallbackError) throw fallbackError
      }

      setMessage({ 
        type: 'success', 
        text: t('club.intakeFormPage.successMessage', language)
      })
      
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error saving form full details:', JSON.stringify(error, null, 2))
      setMessage({ 
        type: 'error', 
        text: `Failed to save: ${error.message || error.code || 'Unknown error'}. Check console for details.` 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-1400 mx-auto" data-testid="intake-form-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <FileText className="h-8 w-8 text-copper-600" />
          <span>{t('club.intakeFormPage.title', language)}</span>
        </h1>
        <p className="text-gray-600 mt-2">
          {t('club.intakeFormPage.subtitle', language)}
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : ''}
          data-testid={`intake-form-alert-${message.type}`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" data-testid="intake-form-alert-success-icon" />
          ) : (
            <AlertCircle className="h-4 w-4" data-testid="intake-form-alert-error-icon" />
          )}
          <AlertDescription data-testid={`intake-form-alert-${message.type}-message`}>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="bg-white border-gray-200" data-testid="intake-form-personal-card">
        <CardHeader data-testid="intake-form-personal-header">
          <CardTitle className="flex items-center space-x-2 text-gray-900" data-testid="intake-form-personal-title">
            <User className="h-5 w-5 text-copper-600" data-testid="intake-form-personal-icon" />
            <span data-testid="intake-form-personal-title-text">{t('club.intakeFormPage.personalInfo', language)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-personal-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="intake-form-personal-row1">
            <div data-testid="intake-form-fullname-field">
              <Label htmlFor="fullName" className="text-gray-700" data-testid="intake-form-fullname-label">{t('club.intakeFormPage.fullName', language)} *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Your full name"
                className="bg-white border-gray-200 text-gray-900"
                data-testid="intake-form-fullname-input"
              />
            </div>
            <div data-testid="intake-form-email-field">
              <Label htmlFor="email" className="text-gray-700" data-testid="intake-form-email-label">{t('club.intakeFormPage.email', language)} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="bg-white border-gray-200 text-gray-900"
                data-testid="intake-form-email-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="intake-form-personal-row2">
            <div data-testid="intake-form-phone-field">
              <Label htmlFor="phone" className="text-gray-700" data-testid="intake-form-phone-label">{t('club.intakeFormPage.phone', language)}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-white border-gray-200 text-gray-900"
                data-testid="intake-form-phone-input"
              />
            </div>
            <div data-testid="intake-form-nationality-field">
              <Label htmlFor="nationality" className="text-gray-700" data-testid="intake-form-nationality-label">{t('club.intakeFormPage.nationality', language)}</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                placeholder="Your nationality"
                className="bg-white border-gray-200 text-gray-900"
                data-testid="intake-form-nationality-input"
              />
            </div>
          </div>

          <div data-testid="intake-form-location-field">
            <Label htmlFor="currentLocation" className="text-gray-700" data-testid="intake-form-location-label">{t('club.intakeFormPage.currentLocation', language)}</Label>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) => handleChange('currentLocation', e.target.value)}
              placeholder="City, Country"
              className="bg-white border-gray-200 text-gray-900"
              data-testid="intake-form-location-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Preferences */}
      <Card className="bg-white border-gray-200" data-testid="intake-form-property-card">
        <CardHeader data-testid="intake-form-property-header">
          <CardTitle className="flex items-center space-x-2 text-gray-900" data-testid="intake-form-property-title">
            <Home className="h-5 w-5 text-copper-600" data-testid="intake-form-property-icon" />
            <span data-testid="intake-form-property-title-text">{t('club.intakeFormPage.propertyPreferences', language)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6" data-testid="intake-form-property-content">
          {/* Property Types */}
          <div data-testid="intake-form-property-types-section">
            <Label className="text-gray-700 text-base font-medium" data-testid="intake-form-property-types-label">{t('club.intakeFormPage.propertyTypes', language)} *</Label>
            <p className="text-sm text-gray-500 mb-3" data-testid="intake-form-property-types-description">{t('club.intakeFormPage.selectAll', language)}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="intake-form-property-types-grid">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayField('propertyTypes', type)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.propertyTypes.includes(type)
                      ? 'bg-copper-50 border-copper-600 text-copper-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid={`intake-form-property-type-${type.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Regions */}
          <div data-testid="intake-form-regions-section">
            <Label className="text-gray-700 text-base font-medium" data-testid="intake-form-regions-label">{t('club.intakeFormPage.preferredRegions', language)} *</Label>
            <p className="text-sm text-gray-500 mb-3" data-testid="intake-form-regions-description">{t('club.intakeFormPage.selectUpTo5', language)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" data-testid="intake-form-regions-grid">
              {ITALIAN_REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    if (formData.preferredRegions.includes(region) || formData.preferredRegions.length < 5) {
                      toggleArrayField('preferredRegions', region)
                    }
                  }}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.preferredRegions.includes(region)
                      ? 'bg-copper-50 border-copper-600 text-copper-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!formData.preferredRegions.includes(region) && formData.preferredRegions.length >= 5}
                  data-testid={`intake-form-region-${region.toLowerCase().replace(/\s+/g, '-').replace(/'/, '')}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div data-testid="intake-form-budget-section">
            <Label htmlFor="budgetRange" className="text-gray-700 text-base font-medium" data-testid="intake-form-budget-label">{t('club.intakeFormPage.budgetRange', language)} *</Label>
            <select
              id="budgetRange"
              value={formData.budgetRange}
              onChange={(e) => handleChange('budgetRange', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
              data-testid="intake-form-budget-select"
            >
              <option value="" data-testid="intake-form-budget-placeholder">{t('club.intakeFormPage.selectBudget', language)}</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range} data-testid={`intake-form-budget-${range.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{range}</option>
              ))}
            </select>
          </div>

          {/* Property Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="intake-form-specs-section">
            <div data-testid="intake-form-bedrooms-field">
              <Label htmlFor="minBedrooms" className="text-gray-700" data-testid="intake-form-bedrooms-label">{t('club.intakeFormPage.minBedrooms', language)}</Label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleChange('minBedrooms', String(Math.max(0, parseInt(formData.minBedrooms || 0) - 1)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-xl font-medium transition-colors"
                  data-testid="intake-form-bedrooms-decrement"
                >−</button>
                <Input
                  id="minBedrooms"
                  type="number"
                  value={formData.minBedrooms}
                  onChange={(e) => handleChange('minBedrooms', e.target.value)}
                  placeholder="0"
                  className="bg-white border-gray-200 text-gray-900 text-center"
                  data-testid="intake-form-bedrooms-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('minBedrooms', String(Math.max(0, parseInt(formData.minBedrooms || 0) + 1)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-copper-600 hover:bg-copper-700 text-white rounded-lg text-xl font-medium transition-colors"
                  data-testid="intake-form-bedrooms-increment"
                >+</button>
              </div>
            </div>
            <div data-testid="intake-form-bathrooms-field">
              <Label htmlFor="minBathrooms" className="text-gray-700" data-testid="intake-form-bathrooms-label">{t('club.intakeFormPage.minBathrooms', language)}</Label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleChange('minBathrooms', String(Math.max(0, parseInt(formData.minBathrooms || 0) - 1)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-xl font-medium transition-colors"
                  data-testid="intake-form-bathrooms-decrement"
                >−</button>
                <Input
                  id="minBathrooms"
                  type="number"
                  value={formData.minBathrooms}
                  onChange={(e) => handleChange('minBathrooms', e.target.value)}
                  placeholder="0"
                  className="bg-white border-gray-200 text-gray-900 text-center"
                  data-testid="intake-form-bathrooms-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('minBathrooms', String(Math.max(0, parseInt(formData.minBathrooms || 0) + 1)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-copper-600 hover:bg-copper-700 text-white rounded-lg text-xl font-medium transition-colors"
                  data-testid="intake-form-bathrooms-increment"
                >+</button>
              </div>
            </div>
            <div data-testid="intake-form-size-field">
              <Label htmlFor="minSquareMeters" className="text-gray-700" data-testid="intake-form-size-label">{t('club.intakeFormPage.minSquareMeters', language)}</Label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleChange('minSquareMeters', String(Math.max(0, parseInt(formData.minSquareMeters || 0) - 10)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-xl font-medium transition-colors"
                  data-testid="intake-form-size-decrement"
                >−</button>
                <Input
                  id="minSquareMeters"
                  type="number"
                  value={formData.minSquareMeters}
                  onChange={(e) => handleChange('minSquareMeters', e.target.value)}
                  placeholder="0"
                  className="bg-white border-gray-200 text-gray-900 text-center"
                  data-testid="intake-form-size-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('minSquareMeters', String(Math.max(0, parseInt(formData.minSquareMeters || 0) + 10)))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-copper-600 hover:bg-copper-700 text-white rounded-lg text-xl font-medium transition-colors"
                  data-testid="intake-form-size-increment"
                >+</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extended Form Sections */}
      {showExtendedForm && (
        <>
          {/* Location Preferences */}
          <Card className="bg-white border-gray-200" ref={extendedFormRef}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <MapPin className="h-5 w-5 text-copper-600" />
                <span>{t('club.intakeFormPage.locationPreferences', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Distance from Sea */}
              <div>
                <Label htmlFor="maxDistanceFromSea" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.distanceFromSea', language)}</Label>
                <select
                  id="maxDistanceFromSea"
                  value={formData.maxDistanceFromSea}
                  onChange={(e) => handleChange('maxDistanceFromSea', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectDistance', language)}</option>
                  {DISTANCE_FROM_SEA.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Distance from Airport */}
              <div>
                <Label htmlFor="maxDistanceFromAirport" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.distanceFromAirport', language)}</Label>
                <select
                  id="maxDistanceFromAirport"
                  value={formData.maxDistanceFromAirport}
                  onChange={(e) => handleChange('maxDistanceFromAirport', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectAirportDistance', language)}</option>
                  {DISTANCE_FROM_AIRPORT.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Distance from City */}
              <div>
                <Label htmlFor="maxDistanceFromCity" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.urbanRural', language)}</Label>
                <select
                  id="maxDistanceFromCity"
                  value={formData.maxDistanceFromCity}
                  onChange={(e) => handleChange('maxDistanceFromCity', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectLocationType', language)}</option>
                  {DISTANCE_FROM_CITY.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Proximity Preferences */}
              <div>
                <Label className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.importantProximity', language)}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {PROXIMITY_PREFERENCES.map((proximity) => (
                    <button
                      key={proximity}
                      type="button"
                      onClick={() => toggleArrayField('preferredProximity', proximity)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.preferredProximity.includes(proximity)
                          ? 'bg-copper-50 border-copper-600 text-copper-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {proximity}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Characteristics */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Home className="h-5 w-5 text-copper-600" />
                <span>{t('club.intakeFormPage.propertyCharacteristics', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Age */}
              <div>
                <Label htmlFor="propertyAge" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.propertyAge', language)}</Label>
                <select
                  id="propertyAge"
                  value={formData.propertyAge}
                  onChange={(e) => handleChange('propertyAge', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectAge', language)}</option>
                  {PROPERTY_AGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Property Condition */}
              <div>
                <Label htmlFor="propertyCondition" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.propertyCondition', language)}</Label>
                <select
                  id="propertyCondition"
                  value={formData.propertyCondition}
                  onChange={(e) => handleChange('propertyCondition', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectCondition', language)}</option>
                  {PROPERTY_CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Renovation Willingness */}
              <div>
                <Label htmlFor="renovationWillingness" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.renovationWillingness', language)}</Label>
                <select
                  id="renovationWillingness"
                  value={formData.renovationWillingness}
                  onChange={(e) => handleChange('renovationWillingness', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectRenovation', language)}</option>
                  {RENOVATION_WILLINGNESS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Land Size */}
              <div>
                <Label htmlFor="landSize" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.landSize', language)}</Label>
                <select
                  id="landSize"
                  value={formData.landSize}
                  onChange={(e) => handleChange('landSize', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectLandSize', language)}</option>
                  {LAND_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Climate Preference */}
              <div>
                <Label htmlFor="climatePreference" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.climatePreference', language)}</Label>
                <select
                  id="climatePreference"
                  value={formData.climatePreference}
                  onChange={(e) => handleChange('climatePreference', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectClimate', language)}</option>
                  {CLIMATE_PREFERENCES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Tourist Area Preference */}
              <div>
                <Label htmlFor="touristAreaPreference" className="text-gray-700 text-base font-medium">{t('club.intakeFormPage.touristArea', language)}</Label>
                <select
                  id="touristAreaPreference"
                  value={formData.touristAreaPreference}
                  onChange={(e) => handleChange('touristAreaPreference', e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                >
                  <option value="">{t('club.intakeFormPage.selectTourist', language)}</option>
                  {TOURIST_AREA_PREFERENCES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Purchase Details */}
      <Card className="bg-white border-gray-200" data-testid="intake-form-purchase-card">
        <CardHeader data-testid="intake-form-purchase-header">
          <CardTitle className="flex items-center space-x-2 text-gray-900" data-testid="intake-form-purchase-title">
            <Calendar className="h-5 w-5 text-copper-600" data-testid="intake-form-purchase-icon" />
            <span data-testid="intake-form-purchase-title-text">{t('club.intakeFormPage.purchaseDetails', language)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-purchase-content">
          <div data-testid="intake-form-timeline-field">
            <Label htmlFor="timeline" className="text-gray-700 text-base font-medium" data-testid="intake-form-timeline-label">{t('club.intakeFormPage.timeline', language)} *</Label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleChange('timeline', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
              data-testid="intake-form-timeline-select"
            >
              <option value="" data-testid="intake-form-timeline-placeholder">{t('club.intakeFormPage.selectTimeline', language)}</option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option} data-testid={`intake-form-timeline-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-purpose-field">
            <Label htmlFor="purchaseReason" className="text-gray-700 text-base font-medium" data-testid="intake-form-purpose-label">{t('club.intakeFormPage.purpose', language)} *</Label>
            <select
              id="purchaseReason"
              value={formData.purchaseReason}
              onChange={(e) => handleChange('purchaseReason', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
              data-testid="intake-form-purpose-select"
            >
              <option value="">{t('club.intakeFormPage.selectPurpose', language)}</option>
              {PURCHASE_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-financing-field">
            <Label htmlFor="financingNeeded" className="text-gray-700 text-base font-medium" data-testid="intake-form-financing-label">{t('club.intakeFormPage.financing', language)} *</Label>
            <select
              id="financingNeeded"
              value={formData.financingNeeded}
              onChange={(e) => handleChange('financingNeeded', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
              data-testid="intake-form-financing-select"
            >
              <option value="">{t('club.intakeFormPage.selectFinancing', language)}</option>
              {FINANCING_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-requirements-field">
            <Label htmlFor="additionalRequirements" className="text-gray-700" data-testid="intake-form-requirements-label">{t('club.intakeFormPage.specialRequirements', language)}</Label>
            <Textarea
              id="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={(e) => handleChange('additionalRequirements', e.target.value)}
              placeholder={t('club.intakeFormPage.requirementsPlaceholder', language)}
              rows={3}
              className="bg-white border-gray-200 text-gray-900"
              data-testid="intake-form-requirements-textarea"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white border-gray-200" data-testid="intake-form-additional-card">
        <CardHeader data-testid="intake-form-additional-header">
          <CardTitle className="flex items-center space-x-2 text-gray-900" data-testid="intake-form-additional-title">
            <Globe className="h-5 w-5 text-copper-600" data-testid="intake-form-additional-icon" />
            <span data-testid="intake-form-additional-title-text">{t('club.intakeFormPage.additionalInfo', language)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-additional-content">
          <div data-testid="intake-form-lifestyle-field">
            <Label htmlFor="lifestylePreferences" className="text-gray-700" data-testid="intake-form-lifestyle-label">{t('club.intakeFormPage.lifestyle', language)}</Label>
            <Textarea
              id="lifestylePreferences"
              value={formData.lifestylePreferences}
              onChange={(e) => handleChange('lifestylePreferences', e.target.value)}
              placeholder={t('club.intakeFormPage.lifestylePlaceholder', language)}
              rows={4}
              className="bg-white border-gray-200 text-gray-900"
              data-testid="intake-form-lifestyle-textarea"
            />
          </div>

          <div data-testid="intake-form-referral-field">
            <Label htmlFor="howDidYouHear" className="text-gray-700 text-base font-medium" data-testid="intake-form-referral-label">{t('club.intakeFormPage.howDidYouHear', language)}</Label>
            <select
              id="howDidYouHear"
              value={formData.howDidYouHear}
              onChange={(e) => handleChange('howDidYouHear', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
              data-testid="intake-form-referral-select"
            >
              <option value="">{t('club.intakeFormPage.selectOption', language)}</option>
              {HOW_HEARD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-notes-field">
            <Label htmlFor="additionalNotes" className="text-gray-700" data-testid="intake-form-notes-label">{t('club.intakeFormPage.additionalNotes', language)}</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              placeholder={t('club.intakeFormPage.notesPlaceholder', language)}
              rows={4}
              className="bg-white border-gray-200 text-gray-900"
              data-testid="intake-form-notes-textarea"
            />
          </div>
        </CardContent>
      </Card>

      {/* Extended Form Toggle */}
      <Card className="bg-gradient-to-r from-copper-50 to-white border-copper-200">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('club.intakeFormPage.extendedForm', language)}</h3>
              <p className="text-gray-500 text-sm">
                {t('club.intakeFormPage.extendedFormDescription', language)}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleToggleExtendedForm}
              className={`w-full sm:w-auto flex-shrink-0 transition-all duration-300 ${
                showExtendedForm 
                  ? 'bg-copper-600 hover:bg-copper-700 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {showExtendedForm ? t('club.intakeFormPage.hideExtended', language) : t('club.intakeFormPage.showExtended', language)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4" data-testid="intake-form-actions">
        <Button
          onClick={handleSave}
          disabled={saving || !formData.fullName || !formData.email}
          className="bg-copper-600 hover:bg-copper-700 text-white px-8 py-6 text-lg"
          data-testid="intake-form-save-button"
        >
          <Save className="h-5 w-5 mr-2" data-testid="intake-form-save-icon" />
          <span data-testid="intake-form-save-text">{saving ? t('club.intakeFormPage.saving', language) : t('club.intakeFormPage.saveSubmit', language)}</span>
        </Button>
      </div>
    </div>
  )
}
