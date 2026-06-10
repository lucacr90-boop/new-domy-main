'use client'

import { useState, useEffect } from 'react'
import PropertyImage from '@/components/PropertyImage'
import { getPropertyImage } from '@/lib/getPropertyImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, 
  Search, 
  Filter, 
  Trash2,
  Eye,
  Share2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Grid,
  List,
  ChevronRight,
  GitCompare
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { formatPrice as formatPriceUtil } from '../../../lib/currency'
import { t } from '../../../lib/translations'
import Link from 'next/link'

export default function FavoritesManagement() {
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProperties, setSelectedProperties] = useState(new Set())
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('cs')
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    loadFavorites()
    
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
    filterFavorites()
  }, [favorites, searchTerm, typeFilter, priceFilter])

  const loadFavorites = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      
      setUser(user)

      // 1. Fetch user favorites
      const { data: userFavorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 2. Fetch all properties from API to get details
      let allProperties = []
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const sanityProperties = await response.json()
          if (Array.isArray(sanityProperties)) {
             // Transform Sanity data to match our property card format
             allProperties = sanityProperties.map((prop, index) => ({
              _id: prop._id || `sanity-${index}`,
              title: { en: prop.title?.en || prop.title?.it || prop.title || 'Untitled Property' },
              propertyType: prop.propertyType ? prop.propertyType.toLowerCase() : 'property',
              price: { amount: prop.price?.amount || 0, currency: 'EUR' },
              specifications: {
                bedrooms: prop.specifications?.bedrooms || 0,
                bathrooms: prop.specifications?.bathrooms || 0,
                squareFootage: prop.specifications?.squareFootage || 0
              },
              location: { 
                city: { 
                  name: { 
                    en: prop.location?.city?.name?.en || prop.location?.city?.name || 'Italy' 
                  } 
                } 
              },
              image: getPropertyImage(prop),
              slug: { current: prop.slug?.current || prop.slug || '' },
              featured: prop.featured || false
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching properties API:', err)
      }

      // 3. Enrich favorites with property data
      const enrichedFavorites = (userFavorites || []).map(fav => {
        // Handle listing_id (snake_case from DB)
        const listingId = fav.listing_id || fav.listingId
        
        const property = allProperties.find(p => p._id === listingId) || {
          _id: listingId,
          title: { en: 'Property Not Found' },
          price: { amount: 0, currency: 'EUR' },
          propertyType: 'unknown',
          specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
          location: { city: { name: { en: 'Unknown' } } },
          image: 'https://images.unsplash.com/photo-1533554030380-20991a0f9c9e',
          slug: { current: '' }
        }
        
        return {
          ...fav,
          // Map created_at to camelCase for frontend compatibility
          createdAt: fav.created_at || fav.createdAt,
          property
        }
      })

      setFavorites(enrichedFavorites)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFavorites = () => {
    let filtered = favorites

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(fav => 
        fav.property.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.property.location?.city?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(fav => fav.property.propertyType === typeFilter)
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(fav => {
        const price = fav.property.price.amount
        switch (priceFilter) {
          case 'under-1m': return price < 1000000
          case '1m-2m': return price >= 1000000 && price < 2000000
          case 'over-2m': return price >= 2000000
          default: return true
        }
      })
    }

    setFilteredFavorites(filtered)
  }

  const removeFavorite = async (favoriteId, propertyId) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Failed to remove favorite')
    }
  }

  const toggleSelection = (propertyId) => {
    const newSelection = new Set(selectedProperties)
    if (newSelection.has(propertyId)) {
      newSelection.delete(propertyId)
    } else {
      newSelection.add(propertyId)
    }
    setSelectedProperties(newSelection)
  }

  const formatPrice = (price) => {
    return formatPriceUtil(price, currency, language)
  }

  const PropertyCard = ({ favorite, isGrid = true }) => {
    const { property } = favorite

    const handleShare = async () => {
      const url = `${window.location.origin}/properties/${property.slug?.current || property._id}`
      if (navigator.share) {
        try {
          await navigator.share({ title: property.title?.en || 'Property', url })
        } catch (err) {
          if (err.name !== 'AbortError') {
            await navigator.clipboard.writeText(url)
          }
        }
      } else {
        await navigator.clipboard.writeText(url)
      }
    }
    
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${selectedProperties.has(property._id) ? 'ring-2 ring-blue-500' : ''}`}>
        <div className={`${isGrid ? 'block' : 'flex flex-col sm:flex-row'}`}>
          <div className={`relative ${isGrid ? 'w-full h-48' : 'w-full sm:w-48 h-48 sm:h-32 flex-shrink-0'}`}>
            <PropertyImage
              src={property.image}
              alt={property.title.en}
              fill
              sizes={isGrid ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "192px"}
              className="object-cover rounded-t-lg"
            />
            {property.featured && (
              <Badge className="absolute top-3 left-3 bg-yellow-500">Featured</Badge>
            )}
            <button
              onClick={() => toggleSelection(property._id)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                selectedProperties.has(property._id) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </div>
          
          <div className={`p-4 ${isGrid ? '' : 'flex-1'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-1">{property.title.en}</h3>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.location?.city?.name?.en}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(property.price)}
                </div>
                <Badge variant="secondary" className="capitalize mt-1">
                  {property.propertyType}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Bed className="h-3 w-3 mr-1" />
                {property.specifications.bedrooms} beds
              </span>
              <span className="flex items-center">
                <Bath className="h-3 w-3 mr-1" />
                {property.specifications.bathrooms} baths
              </span>
              <span className="flex items-center">
                <Square className="h-3 w-3 mr-1" />
                {property.specifications.squareFootage}m²
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Saved: {new Date(favorite.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                Favorite
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/properties/${property.slug?.current || property._id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => removeFavorite(favorite.id, property._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.favoritesPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{favorites.length} {t('club.favoritesPage.savedProperties', language)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('club.favoritesPage.searchPlaceholder', language)}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t('club.favoritesPage.allTypes', language)}</option>
              <option value="villa">{t('club.favoritesPage.villa', language)}</option>
              <option value="house">{t('club.favoritesPage.house', language)}</option>
              <option value="apartment">{t('club.favoritesPage.apartment', language)}</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">{t('club.favoritesPage.allPrices', language)}</option>
              <option value="under-1m">{t('club.favoritesPage.under1m', language)}</option>
              <option value="1m-2m">{t('club.favoritesPage.between1m2m', language)}</option>
              <option value="over-2m">{t('club.favoritesPage.over2m', language)}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {selectedProperties.size > 0 && (
        <Alert>
          <GitCompare className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedProperties.size} {t('club.favoritesPage.propertiesSelected', language)}</span>
            <div className="flex items-center space-x-2">
              <Button size="sm">
                {t('club.favoritesPage.compareProperties', language)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedProperties(new Set())}>
                {t('club.favoritesPage.clearSelection', language)}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Favorites Grid/List */}
      {filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredFavorites.map((favorite) => (
            <PropertyCard 
              key={favorite.id} 
              favorite={favorite} 
              isGrid={viewMode === 'grid'}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || typeFilter !== 'all' || priceFilter !== 'all' 
                ? t('club.favoritesPage.noMatch', language)
                : t('club.favoritesPage.noFavorites', language)
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all' || priceFilter !== 'all'
                ? t('club.favoritesPage.adjustFilters', language)
                : t('club.favoritesPage.startBrowsing', language)
              }
            </p>
            <Link href="/properties">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {t('club.favoritesPage.browseProperties', language)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
