'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Search, 
  Calendar,
  Home,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Send
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'
import Link from 'next/link'

// Sample property data for inquiries
const SAMPLE_PROPERTY_DATA = {
  '1': {
    _id: '1',
    title: { en: 'Luxury Villa with Lake Como Views' },
    slug: { current: 'luxury-villa-lake-como' },
    price: { amount: 2500000, currency: 'EUR' },
    location: { city: { name: { en: 'Como' } } },
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f'
  },
  '2': {
    _id: '2',
    title: { en: 'Tuscan Farmhouse with Vineyards' },
    slug: { current: 'tuscan-farmhouse-vineyards' },
    price: { amount: 1200000, currency: 'EUR' },
    location: { city: { name: { en: 'Tuscany' } } },
    image: 'https://images.unsplash.com/12/gladiator.jpg'
  },
  'demo-property-1': {
    _id: 'demo-property-1',
    title: { en: 'Demo Property for Testing' },
    slug: { current: 'demo-property' },
    price: { amount: 1500000, currency: 'EUR' },
    location: { city: { name: { en: 'Demo City' } } },
    image: 'https://images.unsplash.com/photo-1533554030380-20991a0f9c9e'
  }
}

export default function InquiriesManagement() {
  const [inquiries, setInquiries] = useState([])
  const [filteredInquiries, setFilteredInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    loadInquiries()
    
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

  useEffect(() => {
    filterInquiries()
  }, [inquiries, searchTerm, statusFilter])

  const loadInquiries = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      
      setUser(user)

      const { data: userInquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Enrich with property data and add demo status
      const enrichedInquiries = (userInquiries || []).map(inquiry => ({
        ...inquiry,
        property: SAMPLE_PROPERTY_DATA[inquiry.listing_id || inquiry.listingId] || {
          _id: inquiry.listing_id || inquiry.listingId,
          title: { en: 'Property Not Found' },
          price: { amount: 0, currency: 'EUR' },
          location: { city: { name: { en: 'Unknown' } } },
          image: 'https://images.unsplash.com/photo-1533554030380-20991a0f9c9e'
        },
        status: inquiry.responded ? 'responded' : 'pending', // Demo status
        priority: Math.random() > 0.7 ? 'high' : 'normal', // Demo priority
        createdAt: inquiry.created_at || inquiry.createdAt,
        responses: inquiry.responded ? [{
          id: 1,
          message: 'Thank you for your interest in this property. We\'d be happy to arrange a viewing. Please let us know your availability.',
          sender: 'Property Agent',
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }] : []
      }))

      setInquiries(enrichedInquiries)
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = inquiries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inquiry => 
        inquiry.property.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property.location?.city?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    setFilteredInquiries(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-slate-100 text-slate-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority) => {
    return priority === 'high' ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-500" />
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.inquiriesPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{inquiries.length} {t('club.inquiriesPage.inquiriesSent', language)}</p>
        </div>
        <Link href="/properties" className="sm:flex-shrink-0">
          <Button className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" />
            {t('club.inquiriesPage.browseProperties', language)}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries by property or message..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">Awaiting Response</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-slate-800 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'responded').length}</div>
            <div className="text-sm text-gray-600">Responses Received</div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Property Image */}
                  <Image
                    src={inquiry.property.image}
                    alt={inquiry.property.title.en}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{inquiry.property.title.en}</h3>
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                          {inquiry.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {inquiry.property.location?.city?.name?.en}
                          </span>
                          <span className="flex items-center font-medium text-blue-600">
                            {formatPrice(inquiry.property.price)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(inquiry.priority)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 font-medium mb-1">Your Inquiry:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{inquiry.message}</p>
                    </div>
                    
                    {inquiry.responses.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-blue-700 font-medium mb-1">Agent Response:</p>
                        <p className="text-sm text-blue-700 line-clamp-2">{inquiry.responses[0].message}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {inquiry.responses[0].sender} • {new Date(inquiry.responses[0].date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-6">
                              {/* Property Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <Image
                                  src={selectedInquiry.property.image}
                                  alt={selectedInquiry.property.title.en}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold">{selectedInquiry.property.title.en}</h4>
                                  <p className="text-sm text-gray-600">{selectedInquiry.property.location?.city?.name?.en}</p>
                                  <p className="text-sm font-medium text-blue-600">
                                    {formatPrice(selectedInquiry.property.price)}
                                  </p>
                                </div>
                                <div className="sm:flex-shrink-0">
                                  <Link href={`/properties/${selectedInquiry.property.slug?.current || selectedInquiry.property._id}`}>
                                    <Button size="sm" className="w-full sm:w-auto">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Property
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              
                              {/* Inquiry Details */}
                              <div>
                                <h4 className="font-medium mb-2">Your Inquiry</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Date:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                  <p><strong>Status:</strong> 
                                    <Badge className={`ml-2 ${getStatusColor(selectedInquiry.status)}`}>
                                      {selectedInquiry.status}
                                    </Badge>
                                  </p>
                                  <div>
                                    <strong>Message:</strong>
                                    <p className="mt-1 p-3 bg-gray-50 rounded border">{selectedInquiry.message}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Responses */}
                              {selectedInquiry.responses.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Responses</h4>
                                  <div className="space-y-3">
                                    {selectedInquiry.responses.map((response, index) => (
                                      <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-blue-900">{response.sender}</span>
                                          <span className="text-xs text-blue-700">
                                            {new Date(response.date).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-blue-800">{response.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Contact Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-sm truncate">{selectedInquiry.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-sm">Contact via inquiry system</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Link href={`/properties/${inquiry.property.slug?.current || inquiry.property._id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Home className="h-4 w-4 mr-1" />
                          View Property
                        </Button>
                      </Link>
                      
                      {inquiry.status === 'responded' && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Send className="h-4 w-4 mr-1" />
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No inquiries match your filters'
                : 'No inquiries yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'When you inquire about properties, your inquiries and responses will appear here.'
              }
            </p>
            <Link href="/properties">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Inquiry Tips:</strong> Responses typically arrive within 24-48 hours. 
          Be specific about your requirements and preferred viewing times to get faster responses.
        </AlertDescription>
      </Alert>
    </div>
  )
}
