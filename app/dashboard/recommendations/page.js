'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  Heart,
  Eye,
  Star,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Filter,
  RefreshCw,
  Target,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Lightbulb,
  ChevronRight
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { formatPrice as formatPriceUtil } from '../../../lib/currency'
import { t } from '../../../lib/translations'
import Link from 'next/link'

// Enhanced sample recommendations with AI-like matching
const SAMPLE_RECOMMENDATIONS = [
  {
    _id: '1',
    title: { en: 'Luxury Villa with Lake Como Views' },
    slug: { current: 'luxury-villa-lake-como' },
    propertyType: 'villa',
    price: { amount: 2500000, currency: 'EUR' },
    specifications: { bedrooms: 4, bathrooms: 3, squareFootage: 350 },
    location: { city: { name: { en: 'Como' } } },
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f',
    matchScore: 95,
    reasons: [
      'Matches your preferred villa type',
      'Located in Como (saved search area)',
      'Within your price range',
      'Similar to your favorited properties'
    ],
    aiInsight: 'This property perfectly matches your search for luxury lakefront villas. The architectural style is similar to properties you\'ve favorited before.',
    trending: true,
    newListing: false
  },
  {
    _id: '2',
    title: { en: 'Tuscan Farmhouse with Vineyards' },
    slug: { current: 'tuscan-farmhouse-vineyards' },
    propertyType: 'house',
    price: { amount: 1200000, currency: 'EUR' },
    specifications: { bedrooms: 3, bathrooms: 2, squareFootage: 280 },
    location: { city: { name: { en: 'Tuscany' } } },
    image: 'https://images.unsplash.com/12/gladiator.jpg',
    matchScore: 88,
    reasons: [
      'Rural setting matches your preferences',
      'Investment potential in wine region',
      'Good value for money',
      'Unique property type you browsed'
    ],
    aiInsight: 'Based on your browsing history, you seem interested in properties with character and investment potential. This farmhouse offers both.',
    trending: false,
    newListing: true
  },
  {
    _id: '3',
    title: { en: 'Italian Villa with Lemon Gardens' },
    slug: { current: 'italian-villa-lemon-gardens' },
    propertyType: 'villa',
    price: { amount: 1800000, currency: 'EUR' },
    specifications: { bedrooms: 5, bathrooms: 4, squareFootage: 420 },
    location: { city: { name: { en: 'Amalfi' } } },
    image: 'https://images.unsplash.com/photo-1697200517905-ed24837193b5',
    matchScore: 82,
    reasons: [
      'Amalfi Coast location (trending)',
      'Large villa matching your space needs',
      'Mediterranean garden feature',
      'High appreciation potential'
    ],
    aiInsight: 'The Amalfi Coast is seeing increased interest from international buyers. This villa offers both lifestyle and investment benefits.',
    trending: true,
    newListing: true
  },
  {
    _id: '4',
    title: { en: 'Modern Luxury Property with Pool' },
    slug: { current: 'modern-luxury-property-pool' },
    propertyType: 'villa',
    price: { amount: 3200000, currency: 'EUR' },
    specifications: { bedrooms: 6, bathrooms: 5, squareFootage: 500 },
    location: { city: { name: { en: 'Milan' } } },
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    matchScore: 75,
    reasons: [
      'Ultra-luxury segment match',
      'Milan business district location',
      'Modern amenities preference',
      'Large property size'
    ],
    aiInsight: 'While above your usual range, this property represents the luxury segment you\'ve shown interest in. Consider for long-term investment.',
    trending: false,
    newListing: false
  },
  {
    _id: '5',
    title: { en: 'Charming Apartment in Historic Florence' },
    slug: { current: 'charming-apartment-florence' },
    propertyType: 'apartment',
    price: { amount: 850000, currency: 'EUR' },
    specifications: { bedrooms: 2, bathrooms: 2, squareFootage: 120 },
    location: { city: { name: { en: 'Florence' } } },
    image: 'https://images.unsplash.com/photo-1533554030380-20991a0f9c9e',
    matchScore: 70,
    reasons: [
      'Historic city center location',
      'Good entry-level investment',
      'Strong rental potential',
      'Cultural significance'
    ],
    aiInsight: 'Florence apartments have shown steady appreciation. This could be a good diversification from your villa preferences.',
    trending: false,
    newListing: true
  }
]

export default function PropertyRecommendations() {
  const [recommendations, setRecommendations] = useState(SAMPLE_RECOMMENDATIONS)
  const [filteredRecommendations, setFilteredRecommendations] = useState(SAMPLE_RECOMMENDATIONS)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [userPreferences, setUserPreferences] = useState(null)
  const [feedbackGiven, setFeedbackGiven] = useState(new Set())
  const [filterType, setFilterType] = useState('all')
  const [minMatchScore, setMinMatchScore] = useState(0)
  const [language, setLanguage] = useState('cs')
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    loadUserData()
    
    // Load saved preferences
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) setLanguage(savedLanguage)
    
    const savedCurrency = localStorage.getItem('preferred-currency')
    if (savedCurrency) setCurrency(savedCurrency)
    
    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    filterRecommendations()
  }, [recommendations, filterType, minMatchScore])

  const loadUserData = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) return
      
      setUser(user)

      // Load user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()

      if (profile?.preferences) {
        setUserPreferences(profile.preferences)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const filterRecommendations = () => {
    let filtered = recommendations

    // Filter by property type
    if (filterType !== 'all') {
      filtered = filtered.filter(rec => rec.propertyType === filterType)
    }

    // Filter by match score
    filtered = filtered.filter(rec => rec.matchScore >= minMatchScore)

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore)

    setFilteredRecommendations(filtered)
  }

  const refreshRecommendations = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, this would call an AI recommendation service
    // For demo, we'll shuffle and slightly adjust match scores
    const shuffled = [...SAMPLE_RECOMMENDATIONS].map(rec => ({
      ...rec,
      matchScore: Math.max(60, rec.matchScore + (Math.random() - 0.5) * 10)
    }))
    
    setRecommendations(shuffled)
    setLoading(false)
  }

  const giveFeedback = async (propertyId, feedback) => {
    // In a real app, this would send feedback to improve recommendations
    setFeedbackGiven(prev => new Set([...prev, propertyId]))
    
    // Update match score based on feedback (demo)
    setRecommendations(prev => prev.map(rec => 
      rec._id === propertyId 
        ? { ...rec, matchScore: feedback === 'positive' ? Math.min(100, rec.matchScore + 5) : Math.max(50, rec.matchScore - 10) }
        : rec
    ))
  }

  const addToFavorites = async (propertyId) => {
    if (!user) return
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ userId: user.id, listingId: propertyId }])

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error
      }

      alert('Added to favorites!')
    } catch (error) {
      console.error('Error adding to favorites:', error)
      alert('Failed to add to favorites')
    }
  }

  const formatPrice = (price) => {
    return formatPriceUtil(price, currency, language)
  }

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-slate-800 bg-slate-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.recommendationsPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('club.recommendationsPage.subtitle', language)}</p>
        </div>
        <Button onClick={refreshRecommendations} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('club.recommendationsPage.updating', language) : t('club.recommendationsPage.refresh', language)}
        </Button>
      </div>

      {/* Personalization Status */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>
              <strong>Personalization Active:</strong> Recommendations based on {userPreferences ? 'your preferences, ' : ''}
              favorites, searches, and browsing history.
            </span>
            <Link href="/dashboard/profile" className="sm:flex-shrink-0">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Update Preferences
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
            </select>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Min Match:</span>
              <Input
                type="range"
                min="0"
                max="100"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-medium">{minMatchScore}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((property, index) => (
            <Card key={property._id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Property Image */}
                <div className="lg:w-80 h-64 lg:h-auto relative">
                  <Image
                    src={property.image}
                    alt={property.title.en}
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <Badge className={`${getMatchScoreColor(property.matchScore)} font-bold`}>
                      <Star className="h-3 w-3 mr-1" />
                      {property.matchScore}% Match
                    </Badge>
                    {property.trending && (
                      <Badge variant="destructive">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {property.newListing && (
                      <Badge className="bg-slate-800 hover:bg-slate-900">
                        New Listing
                      </Badge>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Target className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Property Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title.en}</h3>
                      <div className="flex items-center space-x-4 text-gray-600 mb-2">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location?.city?.name?.en}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {property.propertyType}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        {formatPrice(property.price)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Specs */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.specifications.bedrooms} beds
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.specifications.bathrooms} baths
                    </span>
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.specifications.squareFootage}m²
                    </span>
                  </div>
                  
                  {/* AI Insight */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">AI Insight</p>
                        <p className="text-sm text-blue-800">{property.aiInsight}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Match Reasons */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Why this matches you:</p>
                    <div className="flex flex-wrap gap-2">
                      {property.reasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/properties/${property.slug.current}`}>
                        <Button>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => addToFavorites(property._id)}>
                        <Heart className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                    
                    {/* Feedback */}
                    {!feedbackGiven.has(property._id) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Is this helpful?</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => giveFeedback(property._id, 'positive')}
                          className="min-w-[44px] min-h-[44px]"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => giveFeedback(property._id, 'negative')}
                          className="min-w-[44px] min-h-[44px]"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {feedbackGiven.has(property._id) && (
                      <Badge variant="secondary" className="text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Thanks for feedback!
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations match your filters</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or browse more properties to improve recommendations.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={() => { setFilterType('all'); setMinMatchScore(0); }}>
                Clear Filters
              </Button>
              <Link href="/properties">
                <Button variant="outline">
                  Browse All Properties
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>How Recommendations Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Personal Preferences</h4>
              <p className="text-gray-600">Based on your saved preferences, property types, and price ranges.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-slate-800" />
              </div>
              <h4 className="font-medium mb-2">Activity Analysis</h4>
              <p className="text-gray-600">Learns from your favorites, searches, and browsing patterns.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Market Intelligence</h4>
              <p className="text-gray-600">Considers market trends, appreciation potential, and investment value.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
