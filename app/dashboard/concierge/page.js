'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  User,
  Sparkles
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'

const SAMPLE_TICKETS = [
  {
    id: 1,
    subject: 'Property Viewing Request - Villa in Tuscany',
    category: 'Property Viewing',
    status: 'open',
    priority: 'high',
    createdAt: '2025-10-01',
    lastUpdate: '2025-10-05',
    messages: 3
  },
  {
    id: 2,
    subject: 'Tax Documentation Question',
    category: 'Legal Support',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2025-09-28',
    lastUpdate: '2025-10-04',
    messages: 5
  },
  {
    id: 3,
    subject: 'Mortgage Pre-approval Assistance',
    category: 'Financing',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2025-09-20',
    lastUpdate: '2025-09-25',
    messages: 8
  }
]

const TICKET_CATEGORIES = [
  'General Inquiry',
  'Property Viewing',
  'Legal Support',
  'Tax Questions',
  'Financing',
  'Property Management',
  'Renovation Advice',
  'Lifestyle & Relocation',
  'Other'
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-red-400' }
]

// Light mode colors
const cardClass = "bg-white border-gray-200"
const textPrimary = "text-gray-900"
const textSecondary = "text-gray-500"
const bgIcon = "bg-slate-100"
const inputClass = "bg-white border-gray-200 text-gray-900"

export default function ConciergePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [tickets, setTickets] = useState([])
  const [language, setLanguage] = useState('cs')

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    contactMethod: 'email'
  })

  useEffect(() => {
    loadConciergeData()
    
    // Load saved language preference
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

  const loadConciergeData = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      
      setUser(user)

      // Load user's tickets (inquiries of type 'concierge')
      // NOTE: inquiries table uses camelCase columns (userId, type, createdAt) unlike favorites which uses snake_case
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('userId', user.id)
        .eq('type', 'concierge')
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching tickets:', error)
        return
      }

      const realTickets = (data || []).map(inquiry => {
        // Parse metadata from message if possible, or provide defaults
        const lines = inquiry.message.split('\n')
        const subject = lines.find(l => l.startsWith('Subject: '))?.substring(9) || 'Concierge Request'
        const category = lines.find(l => l.startsWith('Category: '))?.substring(10) || 'General'
        const priority = lines.find(l => l.startsWith('Priority: '))?.substring(10) || 'medium'
        
        return {
          id: inquiry.id,
          subject,
          category,
          status: inquiry.responded ? 'resolved' : 'open',
          priority: priority.toLowerCase(),
          createdAt: inquiry.createdAt,
          lastUpdate: inquiry.createdAt, 
          messages: 1, // Placeholder
          description: inquiry.message
        }
      })

      setTickets(realTickets)
    } catch (error) {
      console.error('Error loading concierge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (!supabase) return
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      if (!newTicket.subject || !newTicket.category || !newTicket.description) {
        setMessage({ type: 'error', text: t('club.conciergePage.errorFillFields', language) })
        setSubmitting(false)
        return
      }

      if (!user) {
        setMessage({ type: 'error', text: t('club.conciergePage.errorLogin', language) })
        setSubmitting(false)
        return
      }

      // Structure the message with metadata
      const fullMessage = `Subject: ${newTicket.subject}\nCategory: ${newTicket.category}\nPriority: ${newTicket.priority}\nContact Method: ${newTicket.contactMethod}\n\n${newTicket.description}`

      // NOTE: inquiries table uses camelCase columns (userId, listingId, etc)
      const { error } = await supabase.from('inquiries').insert({
        userId: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Club Member',
        email: user.email,
        listingId: 'Concierge Request',
        type: 'concierge',
        message: fullMessage,
        phone: null 
      })

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: t('club.conciergePage.successMessage', language)
      })
      
      // Reset form
      setNewTicket({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        contactMethod: 'email'
      })

      // Reload tickets
      loadConciergeData()

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setMessage({ type: 'error', text: 'Failed to submit request: ' + error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-900/20 text-blue-400 border-blue-400/30',
      'in-progress': 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30',
      resolved: 'bg-green-900/20 text-green-400 border-green-400/30',
      closed: 'bg-gray-900/20 text-gray-400 border-gray-400/30'
    }
    return styles[status] || styles.open
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-copper-600" />
          <span>{t('club.conciergePage.title', language)}</span>
        </h1>
        <p className="text-gray-600 mt-2">
          {t('club.conciergePage.subtitle', language)}
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-copper-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-copper-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.callUs', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('club.conciergePage.callHours', language)}</p>
            <p className="text-copper-600 font-medium">{t('club.conciergePage.phone', language)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.emailUs', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('club.conciergePage.emailResponse', language)}</p>
            <p className="text-blue-600 font-medium">{t('club.conciergePage.email', language)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.bookCall', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('club.conciergePage.bookDescription', language)}</p>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              {t('club.conciergePage.scheduleNow', language)}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'success' ? 'bg-green-900/20 border-green-600 text-green-400' : ''}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="bg-white border-gray-200">
          <TabsTrigger value="new" className="data-[state=active]:bg-copper-50 data-[state=active]:text-copper-700">
            {t('club.conciergePage.newRequest', language)}
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-copper-50 data-[state=active]:text-copper-700">
            {t('club.conciergePage.myTickets', language)} ({tickets.length})
          </TabsTrigger>
        </TabsList>

        {/* New Request Tab */}
        <TabsContent value="new" className="mt-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Sparkles className="h-5 w-5 text-copper-600" />
                <span>{t('club.conciergePage.submitRequest', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-gray-700">{t('club.conciergePage.subject', language)} *</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={t('club.conciergePage.subjectPlaceholder', language)}
                    className="bg-white border-gray-200 text-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-700">{t('club.conciergePage.category', language)} *</Label>
                    <select
                      id="category"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                      required
                    >
                      <option value="">{t('club.conciergePage.selectCategory', language)}</option>
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-gray-700">{t('club.conciergePage.priority', language)}</Label>
                    <select
                      id="priority"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full mt-2 p-3 rounded-lg bg-white border border-gray-200 text-gray-900"
                    >
                      {PRIORITY_LEVELS.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700">{t('club.conciergePage.description', language)} *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('club.conciergePage.descriptionPlaceholder', language)}
                    rows={6}
                    className="bg-white border-gray-200 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-700">{t('club.conciergePage.contactMethod', language)}</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={newTicket.contactMethod === 'email'}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, contactMethod: e.target.value }))}
                        className="text-copper-600 focus:ring-copper-600"
                      />
                      <span className="text-gray-700">{t('club.conciergePage.emailOption', language)}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={newTicket.contactMethod === 'phone'}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, contactMethod: e.target.value }))}
                        className="text-copper-600 focus:ring-copper-600"
                      />
                      <span className="text-gray-700">{t('club.conciergePage.phoneOption', language)}</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-copper-600 hover:bg-copper-700 text-white py-6 text-lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {submitting ? t('club.conciergePage.submitting', language) : t('club.conciergePage.submit', language)}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white border-gray-200 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {ticket.category}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {t('club.conciergePage.created', language)}: {formatDate(ticket.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {ticket.messages} {t('club.conciergePage.messages', language)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-copper-200 text-copper-600 text-xs">
                          {t('club.conciergePage.priority', language)}: {ticket.priority}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {t('club.conciergePage.lastUpdate', language)}: {formatDate(ticket.lastUpdate)}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" className="bg-copper-600 hover:bg-copper-700">
                      {t('club.conciergePage.viewDetails', language)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border-gray-200">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('club.conciergePage.noTickets', language)}</p>
                <p className="text-sm text-gray-500 mt-2">{t('club.conciergePage.noTicketsDescription', language)}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
