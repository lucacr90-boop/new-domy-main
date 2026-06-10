'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText,
  Download,
  Search,
  Folder,
  File,
  FileCheck,
  FileSpreadsheet,
  FileImage,
  Eye,
  Clock
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/translations'

const STORAGE_BUCKET = 'documents'

// Light mode colors
const cardClass = "bg-white border-gray-200"
const textPrimary = "text-gray-900"
const textSecondary = "text-gray-500"
const inputClass = "bg-white border-gray-200 text-gray-900"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Documents')
  const [categories, setCategories] = useState(['All Documents'])
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    loadDocuments()
    
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

  const loadDocuments = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('premium_documents')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error loading documents:', error)
      } else {
        setDocuments(data || [])
        
        // Extract unique categories
        const uniqueCategories = ['All Documents', ...new Set((data || []).map(d => d.category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveDocumentUrl = async (doc) => {
    if (!doc?.file_url) return null

    if (doc.file_url.includes('example.com')) {
      return null
    }

    if (doc.file_url.startsWith('http://') || doc.file_url.startsWith('https://')) {
      return doc.file_url
    }

    if (!supabase) return null

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(doc.file_url, 60 * 60)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data?.signedUrl || null
  }

  const openDocument = async (doc) => {
    const url = await resolveDocumentUrl(doc)
    if (!url) {
      alert('Document link is unavailable. Please contact support or re-upload the file.')
      return
    }

    window.open(url, '_blank')
  }

  const handleDownload = async (doc) => {
    // Log access
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('document_access_logs').insert({
            document_id: doc.id,
            user_id: user.id,
            action: 'download'
          })
        }
      }
    } catch (err) {
      console.error('Error logging access:', err)
    }

    // Open URL
    await openDocument(doc)
  }

  const handlePreview = async (doc) => {
    // Log access
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('document_access_logs').insert({
            document_id: doc.id,
            user_id: user.id,
            action: 'preview'
          })
        }
      }
    } catch (err) {
      console.error('Error logging access:', err)
    }
    
    // For now, preview is same as download/open
    await openDocument(doc)
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Documents' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFileIcon = (type) => {
    if (['PDF'].includes(type)) return FileText
    if (['XLS', 'XLSX', 'CSV'].includes(type)) return FileSpreadsheet
    if (['JPG', 'JPEG', 'PNG', 'WEBP'].includes(type)) return FileImage
    if (['DOC', 'DOCX'].includes(type)) return FileText
    return File
  }

  return (
    <div className="space-y-6" data-testid="documents-container">
      {/* Header */}
      <div data-testid="documents-header">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3" data-testid="documents-title">
          <Folder className="h-8 w-8 text-copper-600" data-testid="documents-title-icon" />
          <span data-testid="documents-title-text">{t('club.documentsPage.title', language)}</span>
        </h1>
        <p className="text-gray-600 mt-2" data-testid="documents-subtitle">
          {t('club.documentsPage.subtitle', language)}
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-gray-200" data-testid="documents-search-card">
        <CardContent className="p-6" data-testid="documents-search-content">
          <div className="flex flex-col lg:flex-row gap-4" data-testid="documents-search-layout">
            <div className="flex-1 relative" data-testid="documents-search-field">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" data-testid="documents-search-icon" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('club.documentsPage.searchPlaceholder', language)}
                className="pl-10 bg-white border-gray-200 text-gray-900"
                data-testid="documents-search-input"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0" data-testid="documents-category-filters">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="outline"
                  size="sm"
                  className={`whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-copper-600 text-white border-copper-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                  data-testid={`documents-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="documents-stats-grid">
        <Card className="bg-white border-gray-200" data-testid="documents-stat-total">
          <CardContent className="p-6" data-testid="documents-stat-total-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-total-layout">
              <div data-testid="documents-stat-total-info">
                <p className="text-sm font-medium text-gray-500" data-testid="documents-stat-total-label">{t('club.documentsPage.totalDocuments', language)}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="documents-stat-total-value">{documents.length}</p>
              </div>
              <div className="p-3 rounded-full bg-copper-50" data-testid="documents-stat-total-icon">
                <FileText className="h-6 w-6 text-copper-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200" data-testid="documents-stat-categories">
          <CardContent className="p-6" data-testid="documents-stat-categories-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-categories-layout">
              <div data-testid="documents-stat-categories-info">
                <p className="text-sm font-medium text-gray-500" data-testid="documents-stat-categories-label">{t('club.documentsPage.categories', language)}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="documents-stat-categories-value">{Math.max(0, categories.length - 1)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50" data-testid="documents-stat-categories-icon">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200" data-testid="documents-stat-downloads">
          <CardContent className="p-6" data-testid="documents-stat-downloads-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-downloads-layout">
              <div data-testid="documents-stat-downloads-info">
                <p className="text-sm font-medium text-gray-500" data-testid="documents-stat-downloads-label">{t('club.documentsPage.newThisMonth', language)}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="documents-stat-downloads-value">
                  {documents.filter(d => {
                    const date = new Date(d.uploaded_at)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50" data-testid="documents-stat-downloads-icon">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-3" data-testid="documents-list">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-600 mx-auto"></div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => {
            const Icon = getFileIcon(doc.file_type)
            return (
              <Card key={doc.id} className="bg-white border-gray-200 hover:shadow-md transition-all" data-testid={`document-${doc.id}`}>
                <CardContent className="p-6" data-testid={`document-${doc.id}-content`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4" data-testid={`document-${doc.id}-layout`}>
                    {/* Icon + Details row */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-copper-50 rounded-lg flex items-center justify-center" data-testid={`document-${doc.id}-icon-container`}>
                        <Icon className="h-6 w-6 text-copper-600" data-testid={`document-${doc.id}-icon`} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0" data-testid={`document-${doc.id}-details`}>
                        <h3 className="font-semibold text-gray-900 mb-1" data-testid={`document-${doc.id}-name`}>{doc.name}</h3>
                        <p className="text-sm text-gray-500 mb-2" data-testid={`document-${doc.id}-description`}>{doc.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400" data-testid={`document-${doc.id}-metadata`}>
                          <Badge variant="outline" className="border-copper-200 text-copper-600" data-testid={`document-${doc.id}-category`}>
                            {doc.category}
                          </Badge>
                          <span data-testid={`document-${doc.id}-type`}>{doc.file_type}</span>
                          <span data-testid={`document-${doc.id}-size`}>{doc.file_size}</span>
                          <span className="flex items-center" data-testid={`document-${doc.id}-date`}>
                            <Clock className="h-3 w-3 mr-1" data-testid={`document-${doc.id}-date-icon`} />
                            {formatDate(doc.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-shrink-0" data-testid={`document-${doc.id}-actions`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        className="flex-1 sm:flex-none bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600"
                        data-testid={`document-${doc.id}-preview`}
                      >
                        <Eye className="h-4 w-4 mr-2" data-testid={`document-${doc.id}-preview-icon`} />
                        {t('club.documentsPage.preview', language)}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="flex-1 sm:flex-none bg-copper-600 hover:bg-copper-700 text-white"
                        data-testid={`document-${doc.id}-download`}
                      >
                        <Download className="h-4 w-4 mr-2" data-testid={`document-${doc.id}-download-icon`} />
                        {t('club.documentsPage.download', language)}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-white border-gray-200" data-testid="documents-empty-state">
            <CardContent className="p-12 text-center" data-testid="documents-empty-content">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" data-testid="documents-empty-icon" />
              <p className="text-gray-500" data-testid="documents-empty-message">{t('club.documentsPage.noDocuments', language)}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
