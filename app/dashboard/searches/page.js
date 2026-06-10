'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Edit, 
  Trash2,
  Plus,
  Bell,
  BellOff,
  Calendar,
  Filter,
  Save,
  X,
  CheckCircle,
  Settings
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'
import Link from 'next/link'

export default function SavedSearchesManagement() {
  const [savedSearches, setSavedSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSearch, setEditingSearch] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    loadSavedSearches()
    
    // Load language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) setLanguage(savedLanguage)
    
    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadSavedSearches = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      
      setUser(user)

      const { data: searches, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedSearches((searches || []).map(s => ({
        ...s,
        userId: s.user_id,
        createdAt: s.created_at
      })))
    } catch (error) {
      console.error('Error loading saved searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewSearch = () => {
    setEditingSearch({
      id: 'new',
      name: '',
      filters: {
        type: '',
        minPrice: '',
        maxPrice: '',
        location: '',
        bedrooms: '',
        bathrooms: ''
      },
      notifications: true
    })
    setIsDialogOpen(true)
  }

  const editSearch = (search) => {
    setEditingSearch({
      ...search,
      notifications: search.notifications ?? true
    })
    setIsDialogOpen(true)
  }

  const saveSearch = async () => {
    if (!supabase) return
    if (!editingSearch.name.trim()) {
      alert('Please enter a name for your search')
      return
    }

    try {
      if (editingSearch.id === 'new') {
        // Create new search
        const { data, error } = await supabase
          .from('saved_searches')
          .insert([{
            user_id: user.id,
            name: editingSearch.name,
            filters: editingSearch.filters,
            notifications: editingSearch.notifications
          }])
          .select()
          .single()

        if (error) throw error

        setSavedSearches(prev => [{...data, userId: data.user_id, createdAt: data.created_at}, ...prev])
      } else {
        // Update existing search
        const { data, error } = await supabase
          .from('saved_searches')
          .update({
            name: editingSearch.name,
            filters: editingSearch.filters,
            notifications: editingSearch.notifications
          })
          .eq('id', editingSearch.id)
          .select()
          .single()

        if (error) throw error

        setSavedSearches(prev => prev.map(s => s.id === editingSearch.id ? {...data, userId: data.user_id, createdAt: data.created_at} : s))
      }

      setIsDialogOpen(false)
      setEditingSearch(null)
    } catch (error) {
      console.error('Error saving search:', error)
      alert('Failed to save search')
    }
  }

  const deleteSearch = async (searchId) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.id)

      if (error) throw error

      setSavedSearches(prev => prev.filter(s => s.id !== searchId))
    } catch (error) {
      console.error('Error deleting search:', error)
      alert('Failed to delete search')
    }
  }

  const toggleNotifications = async (searchId, currentStatus) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notifications: !currentStatus })
        .eq('id', searchId)
        .eq('user_id', user.id)

      if (error) throw error

      setSavedSearches(prev => prev.map(s => 
        s.id === searchId ? { ...s, notifications: !currentStatus } : s
      ))
    } catch (error) {
      console.error('Error toggling notifications:', error)
      alert('Failed to update notifications')
    }
  }

  const runSearch = (filters) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })
    window.open(`/properties?${params.toString()}`, '_blank')
  }

  const formatFilters = (filters) => {
    const parts = []
    if (filters.type) parts.push(filters.type.charAt(0).toUpperCase() + filters.type.slice(1))
    if (filters.location) parts.push(filters.location)
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `€${parseInt(filters.minPrice).toLocaleString()}` : '0'
      const max = filters.maxPrice ? `€${parseInt(filters.maxPrice).toLocaleString()}` : '€'
      parts.push(`${min} - ${max}`)
    }
    if (filters.bedrooms) parts.push(`${filters.bedrooms}+ beds`)
    if (filters.bathrooms) parts.push(`${filters.bathrooms}+ baths`)
    return parts.join(' • ') || 'All properties'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.searchesPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{savedSearches.length} {t('club.searchesPage.savedCriteria', language)}</p>
        </div>
        <Button onClick={createNewSearch} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('club.searchesPage.newSearch', language)}
        </Button>
      </div>

      {/* Search Management */}
      {savedSearches.length > 0 ? (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                      <Badge variant={search.notifications ? 'default' : 'secondary'} className="text-xs">
                        {search.notifications ? (
                          <><Bell className="h-3 w-3 mr-1" /> Alerts On</>
                        ) : (
                          <><BellOff className="h-3 w-3 mr-1" /> Alerts Off</>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{formatFilters(search.filters)}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created: {new Date(search.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Search className="h-3 w-3 mr-1" />
                        Last used: {new Date(search.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => runSearch(search.filters)}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Run Search
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleNotifications(search.id, search.notifications)}
                    >
                      {search.notifications ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => editSearch(search)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteSearch(search.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('club.searchesPage.noSearches', language)}</h3>
            <p className="text-gray-600 mb-6">
              {t('club.searchesPage.noSearchesDescription', language)}
            </p>
            <Button onClick={createNewSearch}>
              <Plus className="h-4 w-4 mr-2" />
              {t('club.searchesPage.createFirst', language)}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Search Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSearch?.id === 'new' ? 'Create New Search' : 'Edit Saved Search'}
            </DialogTitle>
          </DialogHeader>
          {editingSearch && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search Name</label>
                <Input
                  placeholder="e.g., Lake Como Villas Under 2M"
                  value={editingSearch.name}
                  onChange={(e) => setEditingSearch(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Property Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingSearch.filters.type || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, type: e.target.value }
                    }))}
                  >
                    <option value="">Any Type</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Input
                    placeholder="City or region"
                    value={editingSearch.filters.location || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, location: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Price (EUR)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={editingSearch.filters.minPrice || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, minPrice: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Price (EUR)</label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={editingSearch.filters.maxPrice || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, maxPrice: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Bedrooms</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingSearch.filters.bedrooms || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, bedrooms: e.target.value }
                    }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Bathrooms</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingSearch.filters.bathrooms || ''}
                    onChange={(e) => setEditingSearch(prev => ({
                      ...prev,
                      filters: { ...prev.filters, bathrooms: e.target.value }
                    }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={editingSearch.notifications}
                  onChange={(e) => setEditingSearch(prev => ({ ...prev, notifications: e.target.checked }))}
                />
                <label htmlFor="notifications" className="text-sm font-medium">
                  Send me email alerts when new properties match this search
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSearch}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingSearch.id === 'new' ? 'Create Search' : 'Update Search'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tips */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Enable notifications on your saved searches to get email alerts 
          when new properties match your criteria. You can manage notifications individually for each search.
        </AlertDescription>
      </Alert>
    </div>
  )
}
