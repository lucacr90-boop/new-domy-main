'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  MapPin, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Image,
  DollarSign,
  Bed,
  Bath,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  Star,
  Calendar,
  Tag,
  ExternalLink,
  Languages,
  RefreshCcw
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { t } from '@/lib/translations'

const DEFAULT_MILAN_PROPERTY = {
  _id: 'new',
  title: {
    en: 'Finely Renovated Three-Room Apartment with Balcony in Milan',
    cs: 'Pečlivě zrekonstruovaný třípokojový byt s balkonem v Miláně',
    it: 'Trilocale finemente ristrutturato con balcone a Milano'
  },
  slug: { current: '' },
  propertyType: 'apartment',
  price: { amount: 399000, currency: 'EUR' },
  specifications: { rooms: 3, bedrooms: 2, bathrooms: 1, squareFootage: 105, yearBuilt: 1960 },
  location: {
    city: {
      name: { en: 'Milan, Cimiano', cs: 'Milan, Cimiano', it: 'Milano, Cimiano' },
      slug: { current: 'milano' },
      region: {
        name: { en: 'Lombardy', cs: 'Lombardie', it: 'Lombardia' },
        country: { en: 'Italy', cs: 'Itálie', it: 'Italia' }
      }
    },
    address: {
      en: 'Cimiano, Via Atene 6',
      cs: 'Cimiano, Via Atene 6',
      it: 'Cimiano, Via Atene 6'
    }
  },
  status: 'available',
  featured: false,
  description: {
    en: "FINELY RENOVATED THREE-ROOM APARTMENT WITH BALCONY\n\nAre you looking for a spacious, fully renovated property in an elegant and well-inhabited setting? ICONACASA MILANO CIMIANO offers for sale a 105 sqm ground-floor unit, with a balcony facing inward onto a well-maintained condominium garden.\n\nINTERIOR: entrance into a hallway with a spacious living area. Next is a separate eat-in kitchen with access to the balcony; a large windowed bathroom with bathtub and shower box; and, completing the property, two bedrooms, both with windows, one of which has a comfortable walk-in closet.\n\nEXTERIOR: well-inhabited 1960s building, private cellar on the S1 level, half-day concierge service, monthly condominium fees of 300 euro, no planned/approved works, and possibility to purchase a parking space/garage on the semi-basement level.\n\nLOCATION: well-served area, a short walk from the Coop shopping center and from the M2 Cimiano (Via Palmanova) and M2 Udine metro stops. Bus lines 44, 51, 53 and 56 provide quick and easy connections across the city and to major rail interchange points. Many services are available in the area. The East Ring Road, at the end of Via Palmanova, provides access to the motorway network. The area is rich in greenery and parks: Parco Lambro and Parco della Martesana can be reached in a few minutes.",
    cs: "PEČLIVĚ ZREKONSTRUOVANÝ TŘÍPOKOJOVÝ BYT S BALKONEM\n\nHledáte prostorné řešení po kompletní rekonstrukci v reprezentativním a dobře obydleném prostředí? ICONACASA MILANO CIMIANO nabízí k prodeji jednotku o velikosti 105 m2 v přízemí, vybavenou balkonem s vnitřní orientací do upraveného kondominiálního zahradního prostoru.\n\nINTERIÉR: vstup do chodby s prostornou denní částí. Následuje samostatná obytná kuchyň s přístupem na balkon; velká koupelna s oknem, vanou a sprchovým koutem; a na závěr dvě ložnice, obě s oknem, z nichž jedna má pohodlnou šatnu.\n\nEXTERIÉR: dobře obydlený dům ze 60. let, sklepní kóje v podlaží S1, služba vrátného půl dne, měsíční kondominiální poplatky 300 euro, žádné plánované/schválené práce, možnost dokoupení parkovacího místa/garáže v polosuterénu.\n\nPOLOHA: velmi dobře obsloužená zóna, pár kroků od nákupního centra Coop a od stanic metra M2 Cimiano (Via Palmanova) a M2 Udine.",
    it: "TRILOCALE FINEMENTE RISTRUTTURATO CON BALCONE\n\nCerchi un'ampia soluzione completamente ristrutturata in un contesto signorile e ben abitato? ICONACASA MILANO CIMIANO propone in vendita una soluzione di 105 mq sita al piano terra, dotata di balcone con esposizione interna su giardino condominiale ben curato.\n\nINTERNO: ingresso su disimpegno con spaziosa zona giorno. A seguire cucina abitabile con affaccio sul balcone; ampio bagno finestrato con vasca e box doccia; due camere da letto entrambe finestrate, di cui una con comoda cabina armadio.\n\nESTERNO: stabile anni '60 ben abitato, cantina al piano S1 di pertinenza, servizio di portineria mezza giornata, spese condominiali di 300 euro mensili, nessun lavoro previsto/deliberato, possibilità di acquisto posto auto/box al piano seminterrato.\n\nPOSIZIONE: zona ben servita, a pochi passi da Coop e dalla metropolitana M2 Cimiano (Via Palmanova) e M2 Udine. Autobus 44, 51, 53, 56 con collegamenti rapidi verso la città e i principali nodi ferroviari."
  },
  images: [
    '/uploads/properties/lombardia-appartamento/01-bagno.png',
    '/uploads/properties/lombardia-appartamento/02-cuci2.png',
    '/uploads/properties/lombardia-appartamento/03-cucina.png',
    '/uploads/properties/lombardia-appartamento/04-ext.png',
    '/uploads/properties/lombardia-appartamento/05-letto.png',
    '/uploads/properties/lombardia-appartamento/06-letto2.png',
    '/uploads/properties/lombardia-appartamento/07-sogg.png',
    '/uploads/properties/lombardia-appartamento/08-stanza.png',
    '/uploads/properties/lombardia-appartamento/09-vera.png'
  ],
  mainImage: 0,
  amenities: [
    { name: { en: 'Renovated', cs: 'Po rekonstrukci', it: 'Ristrutturato' } },
    { name: { en: 'Balcony', cs: 'Balkon', it: 'Balcone' } },
    { name: { en: 'Cellar', cs: 'Sklep', it: 'Cantina' } },
    { name: { en: 'Walk-in closet', cs: 'Satna', it: 'Cabina armadio' } },
    { name: { en: 'Half-day concierge service', cs: 'Vratny pul dne', it: 'Portineria mezza giornata' } }
  ],
  seoTitle: {
    en: 'Renovated 2-Bed Apartment with Balcony in Milan Cimiano',
    cs: 'Zrekonstruovaný být 3+kk s balkonem v Milane Cimiano',
    it: 'Trilocale ristrutturato con balcone a Milano Cimiano'
  },
  seoDescription: {
    en: '105 sqm ground-floor three-room apartment in Milan Cimiano with balcony, separate kitchen, cellar and concierge service. Close to M2 Cimiano and M2 Udine.',
    cs: 'Třípokojový byt 105 m2 v přízemí v Miláně Cimiano s balkonem, samostatnou kuchyní, sklepem a vrátným. Blízko metra M2 Cimiano a M2 Udine.',
    it: 'Trilocale di 105 mq al piano terra a Milano Cimiano: balcone, cucina abitabile, cantina e servizio di portineria. Vicino a M2 Cimiano e M2 Udine.'
  },
  keywords: ['milano', 'cimiano', 'trilocale', 'ristrutturato'],
  sourceUrl: '',
  publishAt: null,
  scheduledPublish: false
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('properties')
  const [properties, setProperties] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [sanityConfigured, setSanityConfigured] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [translating, setTranslating] = useState({})
  const [language, setLanguage] = useState('cs')
  const [editingRegion, setEditingRegion] = useState(null)
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false)
  const [syncingProperties, setSyncingProperties] = useState(false)
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false)

  const syncLabel = language === 'cs' ? 'Synchronizovat' : language === 'it' ? 'Sincronizza' : 'Sync'
  const syncDoneMessage = (count) => {
    if (count > 0) {
      if (language === 'cs') return `Synchronizovano ${count} nemovitostí do admin panelu.`
      if (language === 'it') return `Sincronizzate ${count} proprietà nel pannello admin.`
      return `Synced ${count} properties into Admin panel.`
    }
    if (language === 'cs') return 'Nemovitosti v admin panelu jsou jiz synchronizovane.'
    if (language === 'it') return 'Le proprietà nel pannello admin sono già sincronizzate.'
    return 'Admin properties were already in sync.'
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'cs'
    setLanguage(savedLanguage)
    
    const handleLanguageChange = (e) => {
      if (e.detail) setLanguage(e.detail)
      else if (e.newValue) setLanguage(e.newValue)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [activeTab])

  useEffect(() => {
    // Safety net: if "new property" modal opens with an empty draft, prefill Milan template
    if (isModalOpen && editingItem?._id === 'new' && !editingItem?.title?.en) {
      setEditingItem(JSON.parse(JSON.stringify(DEFAULT_MILAN_PROPERTY)))
    }
  }, [isModalOpen, editingItem?._id, editingItem?.title?.en])

  const loadContent = async () => {
    const loadPropertiesFallback = async () => {
      const fallbackResponse = await fetch('/api/properties', { cache: 'no-store' })
      if (!fallbackResponse.ok) return []
      const fallbackData = await fallbackResponse.json()
      return Array.isArray(fallbackData) ? fallbackData : []
    }

    try {
      setLoading(true)
      setError(null)

      const type = activeTab === 'properties' ? 'properties' : 'regions'
      const response = await fetch(`/api/content?type=${type}`, { cache: 'no-store' })
      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'Sanity CMS not configured') {
          setSanityConfigured(false)
        }

        // Secondary fallback for properties list used by admin
        if (activeTab === 'properties') {
          const fallbackProperties = await loadPropertiesFallback()
          setProperties(fallbackProperties)
          if (fallbackProperties.length > 0) {
            return
          }
        }

        throw new Error(result.error || 'Failed to load content')
      }

      if (activeTab === 'properties') {
        const incoming = Array.isArray(result.properties) ? result.properties : []
        if (incoming.length > 0) {
          setProperties(incoming)
        } else {
          const fallbackProperties = await loadPropertiesFallback()
          setProperties(fallbackProperties)
        }
      } else {
        setRegions(result.regions || [])
      }
    } catch (err) {
      console.error('Error loading content:', err)

      // Last-resort fallback for properties tab
      if (activeTab === 'properties') {
        try {
          const fallbackProperties = await loadPropertiesFallback()
          if (fallbackProperties.length > 0) {
            setProperties(fallbackProperties)
            setError(null)
            return
          }
        } catch {
          // keep original error below
        }
      }

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const syncPropertiesFromPublicApi = async () => {
    try {
      setSyncingProperties(true)
      setError(null)

      // 1) Read visible/public properties (same source used by /properties page)
      const publicResponse = await fetch('/api/properties', { cache: 'no-store' })
      if (!publicResponse.ok) {
        throw new Error('Failed to load public properties')
      }
      const publicProperties = await publicResponse.json()
      if (!Array.isArray(publicProperties) || publicProperties.length === 0) {
        throw new Error('No public properties found to sync')
      }

      // 2) Read current admin properties
      const adminResponse = await fetch('/api/content?type=properties', { cache: 'no-store' })
      const adminJson = await adminResponse.json().catch(() => ({}))
      const current = Array.isArray(adminJson?.properties) ? adminJson.properties : []
      const existingSlugs = new Set(
        current
          .map((item) => item?.slug?.current)
          .filter(Boolean)
      )

      // 3) Create missing properties via admin API so they become editable from panel
      let created = 0
      for (const item of publicProperties) {
        const slug = item?.slug?.current
        if (!slug || existingSlugs.has(slug)) continue

        const payload = {
          title: item.title || { en: '', cs: '', it: '' },
          propertyType: item.propertyType || 'apartment',
          price: item.price || { amount: 0, currency: 'EUR' },
          specifications: item.specifications || { rooms: 0, bedrooms: 0, bathrooms: 0, squareFootage: 0 },
          location: item.location || {
            city: {
              name: { en: 'Italy', cs: 'Itálie', it: 'Italia' },
              slug: { current: 'italy' },
              region: {
                name: { en: 'Italy', cs: 'Itálie', it: 'Italia' },
                country: { en: 'Italy', cs: 'Itálie', it: 'Italia' }
              }
            },
            address: { en: '', cs: '', it: '' }
          },
          status: item.status || 'available',
          featured: Boolean(item.featured),
          description: item.description || { en: '', cs: '', it: '' },
          images: item.images || [],
          mainImage: item.mainImage ?? 0,
          amenities: item.amenities || [],
          seoTitle: item.seoTitle || { en: '', cs: '', it: '' },
          seoDescription: item.seoDescription || { en: '', cs: '', it: '' },
          keywords: item.keywords || [],
          sourceUrl: item.sourceUrl || ''
        }

        const createResponse = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'property', data: payload })
        })
        if (!createResponse.ok) {
          const err = await createResponse.json().catch(() => ({}))
          throw new Error(err?.error || 'Failed to create synced property')
        }
        created += 1
      }

      await loadContent()
      setSuccess(syncDoneMessage(created))
    } catch (err) {
      console.error('Sync properties error:', err)
      setError(err.message || 'Failed to sync properties')
    } finally {
      setSyncingProperties(false)
    }
  }

  useEffect(() => {
    if (
      activeTab === 'properties' &&
      !loading &&
      !syncingProperties &&
      properties.length === 0 &&
      !autoSyncAttempted
    ) {
      setAutoSyncAttempted(true)
      syncPropertiesFromPublicApi()
    }
  }, [activeTab, loading, syncingProperties, properties.length, autoSyncAttempted])

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
  }

  const getImageSrc = (image) => {
    if (!image) return ''
    if (typeof image === 'string') return image
    return image.url || image.asset?.url || ''
  }

  const handleEditProperty = (property) => {
    // Ensure all fields have proper defaults for editing
    setEditingItem({
      ...property,
      title: { en: '', cs: '', it: '', ...property.title },
      price: { amount: 0, currency: 'EUR', ...(property.price || {}) },
      specifications: { rooms: 0, bedrooms: 0, bathrooms: 0, squareFootage: 0, ...(property.specifications || {}) },
      location: {
        city: {
          name: { en: '', cs: '', it: '', ...(property.location?.city?.name || {}) },
          slug: property.location?.city?.slug || { current: '' },
          region: property.location?.city?.region || {
            name: { en: '', cs: '', it: '' },
            country: { en: 'Italy', cs: 'Itálie', it: 'Italia' }
          }
        },
        address: { en: '', cs: '', it: '', ...(property.location?.address || {}) },
        ...(property.location?.coordinates ? { coordinates: property.location.coordinates } : {})
      },
      images: property.images || [],
      mainImage: property.mainImage ?? null,
      seoTitle: { en: '', cs: '', it: '', ...(property.seoTitle || {}) },
      seoDescription: { en: '', cs: '', it: '', ...(property.seoDescription || {}) },
      keywords: property.keywords || [],
      publishAt: property.publishAt || null,
      scheduledPublish: property.scheduledPublish || false,
      description: { en: '', cs: '', it: '', ...(property.description || {}) },
      amenities: property.amenities || [],
      sourceUrl: property.sourceUrl || ''
    })
    setKeywordInput('')
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploadedImages = []
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const result = await response.json()
        uploadedImages.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: result.asset._id
          },
          url: result.asset.url
        })
      }

      setEditingItem(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages],
        // Set first uploaded image as main if no main image is set
        mainImage: prev.mainImage || (uploadedImages.length > 0 ? 0 : null)
      }))
    } catch (err) {
      setError('Failed to upload images: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index) => {
    setEditingItem(prev => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      
      // Adjust main image index if needed
      let newMainImage = prev.mainImage
      if (prev.mainImage === index) {
        newMainImage = newImages.length > 0 ? 0 : null
      } else if (prev.mainImage > index) {
        newMainImage = prev.mainImage - 1
      }

      return {
        ...prev,
        images: newImages,
        mainImage: newMainImage
      }
    })
  }

  const handleSetMainImage = (index) => {
    setEditingItem(prev => ({
      ...prev,
      mainImage: index
    }))
  }

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return
    
    setEditingItem(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), keywordInput.trim()]
    }))
    setKeywordInput('')
  }

  const handleRemoveKeyword = (index) => {
    setEditingItem(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const handleTranslate = async (field, sourceLang, targetLang) => {
    const translationKey = `${field}-${targetLang}`
    setTranslating(prev => ({ ...prev, [translationKey]: true }))

    try {
      // Get source text based on field type
      let sourceText = ''
      let context = ''
      
      if (field === 'title') {
        sourceText = editingItem.title[sourceLang]
        context = 'Property title'
      } else if (field === 'description') {
        sourceText = editingItem.description[sourceLang]
        context = 'Property description'
      } else if (field === 'seoTitle') {
        sourceText = editingItem.seoTitle[sourceLang]
        context = 'SEO page title'
      } else if (field === 'seoDescription') {
        sourceText = editingItem.seoDescription[sourceLang]
        context = 'SEO meta description'
      }

      if (!sourceText) {
        setError(t('admin.content.noTextToTranslate', language))
        setTranslating(prev => ({ ...prev, [translationKey]: false }))
        return
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const { translatedText } = await response.json()

      // Update the appropriate field
      setEditingItem(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: translatedText
        }
      }))

      setSuccess(t('admin.content.translationSuccess', language))
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || t('admin.content.translationFailed', language))
    } finally {
      setTranslating(prev => ({ ...prev, [translationKey]: false }))
    }
  }

  const handleSaveProperty = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
    if (editingItem._id === 'new') {
        // Create new property
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'property',
            data: {
              title: editingItem.title,
              propertyType: editingItem.propertyType,
              price: editingItem.price,
              specifications: editingItem.specifications,
              status: editingItem.status,
              featured: editingItem.featured,
              description: editingItem.description || { en: '', it: '' },
              images: editingItem.images || [],
              mainImage: editingItem.mainImage,
              location: editingItem.location,
              amenities: editingItem.amenities || [],
              sourceUrl: editingItem.sourceUrl || '',
              seoTitle: editingItem.seoTitle || { en: '', it: '' },
              seoDescription: editingItem.seoDescription || { en: '', it: '' },
              keywords: editingItem.keywords || [],
              publishAt: editingItem.publishAt || null,
              scheduledPublish: editingItem.scheduledPublish || false
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          // Show detailed error message if available
          const errorMessage = result.details 
            ? `${result.error}: ${result.details}${result.hint ? ` (${result.hint})` : ''}`
            : result.error || 'Failed to create property'
          throw new Error(errorMessage)
        }

        setSuccess(t('admin.content.propertyCreated', language))
        setIsModalOpen(false)
        setEditingItem(null)
        await loadContent()
    } else {
      // Update existing property
        const response = await fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'property',
            id: editingItem._id,
            data: {
              title: editingItem.title,
              propertyType: editingItem.propertyType,
              price: editingItem.price,
              specifications: editingItem.specifications,
              status: editingItem.status,
              featured: editingItem.featured,
              description: editingItem.description,
              images: editingItem.images,
              mainImage: editingItem.mainImage,
              location: editingItem.location,
              amenities: editingItem.amenities || [],
              sourceUrl: editingItem.sourceUrl || '',
              seoTitle: editingItem.seoTitle,
              seoDescription: editingItem.seoDescription,
              keywords: editingItem.keywords,
              publishAt: editingItem.publishAt,
              scheduledPublish: editingItem.scheduledPublish
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          // Show detailed error message if available
          const errorMessage = result.details 
            ? `${result.error}: ${result.details}${result.hint ? ` (${result.hint})` : ''}`
            : result.error || 'Failed to update property'
          throw new Error(errorMessage)
    }

        setSuccess(t('admin.content.propertyUpdated', language))
    setIsModalOpen(false)
    setEditingItem(null)
        await loadContent()
      }
    } catch (err) {
      console.error('Error saving property:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm(t('admin.content.deleteConfirm', language))) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/content?type=property&id=${propertyId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete property')

      setSuccess(t('admin.content.propertyDeleted', language))
      await loadContent()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError(err.message)
    }
  }

  const createNewProperty = () => {
    setEditingItem(JSON.parse(JSON.stringify(DEFAULT_MILAN_PROPERTY)))
    setKeywordInput('')
    setIsModalOpen(true)
  }

  const normalizeRegionForEditing = (region = {}) => {
    const topCities = Array.isArray(region.topCities) ? region.topCities : []
    const highlights = Array.isArray(region.highlights) ? region.highlights : []

    return {
      ...region,
      _id: region._id || 'new',
      name: {
        en: region?.name?.en || '',
        cs: region?.name?.cs || '',
        it: region?.name?.it || ''
      },
      slug: {
        _type: 'slug',
        current: region?.slug?.current || ''
      },
      country: region.country || 'Italy',
      description: {
        en: region?.description?.en || '',
        cs: region?.description?.cs || '',
        it: region?.description?.it || ''
      },
      image: region.image || '',
      propertyCount: Number(region.propertyCount || 0),
      averagePrice: Number(region.averagePrice || 0),
      priceRange: {
        min: Number(region?.priceRange?.min || 0),
        max: Number(region?.priceRange?.max || 0)
      },
      topCities,
      highlights,
      topCitiesText: topCities.join(', '),
      highlightsText: highlights.join(', '),
      popularity: Number(region.popularity || 0)
    }
  }

  const createNewRegion = () => {
    setEditingRegion(
      normalizeRegionForEditing({
        _id: 'new',
        name: { en: '', cs: '', it: '' },
        slug: { _type: 'slug', current: '' },
        country: 'Italy',
        description: { en: '', cs: '', it: '' },
        image: '',
        propertyCount: 0,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        topCities: [],
        highlights: [],
        popularity: 0
      })
    )
    setIsRegionModalOpen(true)
  }

  const handleEditRegion = (region) => {
    setEditingRegion(normalizeRegionForEditing(region))
    setIsRegionModalOpen(true)
  }

  const handleSaveRegion = async () => {
    if (!editingRegion) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        name: editingRegion.name,
        slug: {
          _type: 'slug',
          current: editingRegion?.slug?.current || ''
        },
        country: editingRegion.country,
        description: editingRegion.description,
        image: editingRegion.image,
        propertyCount: Number(editingRegion.propertyCount || 0),
        averagePrice: Number(editingRegion.averagePrice || 0),
        priceRange: {
          min: Number(editingRegion?.priceRange?.min || 0),
          max: Number(editingRegion?.priceRange?.max || 0)
        },
        topCities: (editingRegion.topCitiesText || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        highlights: (editingRegion.highlightsText || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        popularity: Number(editingRegion.popularity || 0)
      }

      const isNew = editingRegion._id === 'new'
      const response = await fetch('/api/content', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew
            ? { type: 'region', data: payload }
            : { type: 'region', id: editingRegion._id, data: payload }
        )
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || (isNew ? 'Failed to create region' : 'Failed to update region'))
      }

      setSuccess(isNew ? 'Region created successfully.' : 'Region updated successfully.')
      setIsRegionModalOpen(false)
      setEditingRegion(null)
      await loadContent()
    } catch (err) {
      console.error('Error saving region:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRegion = async (regionId) => {
    if (!confirm(t('admin.content.deleteConfirm', language))) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/content?type=region&id=${regionId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete region')
      setSuccess('Region deleted successfully.')
      await loadContent()
    } catch (err) {
      console.error('Error deleting region:', err)
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.content.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('admin.content.subtitle', language)}</p>
        </div>
      </div>

      {/* Status Alerts */}
      {!sanityConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('admin.content.sanityNotConfigured', language)}</strong>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('admin.content.error', language)}:</strong> {error}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
      <Alert>
          <CheckCircle className="h-4 w-4" />
        <AlertDescription>
            {success}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => setSuccess(null)}
            >
              <X className="h-3 w-3" />
            </Button>
        </AlertDescription>
      </Alert>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">{t('admin.content.properties', language)}</TabsTrigger>
          <TabsTrigger value="regions">{t('admin.content.regions', language)}</TabsTrigger>
          <TabsTrigger value="settings">{t('admin.content.settings', language)}</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('admin.content.propertyManagement', language)}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={syncPropertiesFromPublicApi} disabled={syncingProperties}>
                {syncingProperties ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                {syncLabel}
              </Button>
              <Button onClick={createNewProperty}>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.content.addProperty', language)}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.totalProperties', language)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.status === 'available').length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.available', language)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.featured).length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.featured', language)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.allProperties', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">{t('admin.content.loadingProperties', language)}</span>
                </div>
              ) : properties.length > 0 ? (
              <div className="space-y-6">
                {properties.map((property) => (
                  <div key={property._id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {property.title?.en || property.title?.it || 'Untitled Property'}
                            </h3>
                          {property.featured && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                          )}
                          <Badge variant="secondary" className="capitalize">{property.propertyType}</Badge>
                            <Badge variant="outline" className="capitalize">{property.status || 'available'}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {property.location?.city?.name?.en && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location?.city?.name?.en}
                          </span>
                            )}
                          <span className="flex items-center font-medium text-blue-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatPrice(property.price)}
                          </span>
                            {property.specifications?.rooms !== undefined && (
                          <span className="flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            {property.specifications.rooms} {language === 'cs' ? 'mistnosti' : language === 'it' ? 'locali' : 'rooms'}
                          </span>
                            )}
                            {property.specifications?.bedrooms !== undefined && (
                          <span className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.specifications.bedrooms} {language === 'cs' ? 'loznice' : language === 'it' ? 'camere' : 'beds'}
                          </span>
                            )}
                            {property.specifications?.bathrooms !== undefined && (
                          <span className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.specifications.bathrooms} {language === 'cs' ? 'koupelny' : language === 'it' ? 'bagni' : 'baths'}
                          </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {property.slug?.current && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/properties/${property.slug.current}`, '_blank')}
                            title="View property detail page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProperty(property)}
                        >
                        <Edit className="h-4 w-4" />
                      </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteProperty(property._id)}
                        >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.content.noProperties', language)}</h3>
                  <p className="text-gray-600 mb-4">
                    {sanityConfigured 
                      ? t('admin.content.getStarted', language)
                      : t('admin.content.configureSanity', language)}
                  </p>
                  {sanityConfigured && (
                    <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" onClick={syncPropertiesFromPublicApi} disabled={syncingProperties}>
                      {syncingProperties ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4 mr-2" />
                      )}
                      {syncLabel}
                    </Button>
                    <Button onClick={createNewProperty}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.content.addFirstProperty', language)}
                    </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('admin.content.regionManagement', language)}</h2>
            <Button onClick={createNewRegion}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.content.addRegion', language)}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.allRegions', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">{t('admin.content.loadingRegions', language)}</span>
                </div>
              ) : regions.length > 0 ? (
              <div className="space-y-4">
                {regions.map((region) => (
                  <div key={region._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                          <h3 className="font-medium text-gray-900">
                            {region.name?.en || region.name?.it || t('admin.content.unnamedRegion', language)}
                          </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{region.country || 'Italy'}</span>
                            <span>{region.propertyCount || 0} {t('admin.content.propertiesCount', language)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditRegion(region)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRegion(region._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.content.noRegions', language)}</h3>
                  <p className="text-gray-600">
                    {sanityConfigured 
                      ? t('admin.content.regionsWillAppear', language)
                      : t('admin.content.configureSanity', language)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">{t('admin.content.platformSettings', language)}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.content.siteConfiguration', language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.siteName', language)}</label>
                  <Input defaultValue="Domy v Itálii" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.defaultCurrency', language)}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="CZK">CZK (Kč)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.contactEmail', language)}</label>
                  <Input defaultValue="info@domyvitalii.com" />
                </div>
                <Button>{t('admin.content.saveSettings', language)}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.content.emailTemplates', language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.welcomeEmailSubject', language)}</label>
                  <Input defaultValue="Welcome to Domy v Itálii!" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.inquiryAutoResponse', language)}</label>
                  <Textarea 
                    defaultValue="Thank you for your inquiry. We'll get back to you within 24 hours."
                    rows={3}
                  />
                </div>
                <Button>{t('admin.content.updateTemplates', language)}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Property Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem?._id === 'new' ? t('admin.content.addNewProperty', language) : t('admin.content.editProperty', language)}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t('admin.content.basicInfo', language)}</TabsTrigger>
                <TabsTrigger value="images">{t('admin.content.images', language)}</TabsTrigger>
                <TabsTrigger value="description">{t('admin.content.descriptionTab', language)}</TabsTrigger>
                <TabsTrigger value="seo">{t('admin.content.seoPublishing', language)}</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleEn', language)} *</label>
                    <Input
                      value={editingItem.title.en}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, en: e.target.value }
                      }))}
                      placeholder="Luxury Villa in Tuscany"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleCs', language)}</label>
                    <Input
                      value={editingItem.title.cs || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, cs: e.target.value }
                      }))}
                      placeholder="Luxusní vila v Toskánsku"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleIt', language)}</label>
                    <Input
                      value={editingItem.title.it}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, it: e.target.value }
                      }))}
                      placeholder="Villa di Lusso in Toscana"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.propertyType', language)} *</label>
                    <Select
                      value={editingItem.propertyType}
                      onValueChange={(value) => setEditingItem(prev => ({
                        ...prev,
                        propertyType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="villa">{t('admin.content.propertyTypes.villa', language)}</SelectItem>
                        <SelectItem value="house">{t('admin.content.propertyTypes.house', language)}</SelectItem>
                        <SelectItem value="apartment">{t('admin.content.propertyTypes.apartment', language)}</SelectItem>
                        <SelectItem value="farmhouse">{t('admin.content.propertyTypes.farmhouse', language)}</SelectItem>
                        <SelectItem value="castle">{t('admin.content.propertyTypes.castle', language)}</SelectItem>
                        <SelectItem value="commercial">{t('admin.content.propertyTypes.commercial', language)}</SelectItem>
                        <SelectItem value="land">{t('admin.content.propertyTypes.land', language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.status', language)} *</label>
                    <Select
                      value={editingItem.status}
                      onValueChange={(value) => setEditingItem(prev => ({
                        ...prev,
                        status: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t('admin.content.statusOptions.available', language)}</SelectItem>
                        <SelectItem value="reserved">{t('admin.content.statusOptions.reserved', language)}</SelectItem>
                        <SelectItem value="sold">{t('admin.content.statusOptions.sold', language)}</SelectItem>
                        <SelectItem value="draft">{t('admin.content.statusOptions.draft', language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.price', language)} *</label>
                    <Input
                      type="number"
                      value={editingItem.price.amount}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        price: { ...prev.price, amount: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.rooms', language)}</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.rooms}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, rooms: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.bedrooms', language)}</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.bedrooms}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, bedrooms: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.bathrooms', language)}</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.bathrooms}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, bathrooms: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.area', language)}</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.squareFootage}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, squareFootage: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="250"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.city', language)}</label>
                  <Input
                    value={editingItem.location?.city?.name?.en || ''}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        city: {
                          ...prev.location?.city,
                          name: { ...prev.location?.city?.name, en: e.target.value }
                        }
                      }
                    }))}
                    placeholder="Florence, Tuscany"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingItem.featured}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      featured: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {t('admin.content.featuredProperty', language)}
                  </label>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('admin.content.propertyImages', language)}</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">{t('admin.content.uploadingImages', language)}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {t('admin.content.uploadImages', language)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t('admin.content.imageFormat', language)}
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {editingItem.images && editingItem.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('admin.content.uploadedImages', language)} ({editingItem.images.length})
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      {t('admin.content.setMainImage', language)}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {editingItem.images.map((image, index) => (
                        <div
                          key={index}
                          className={`relative group border-2 rounded-lg overflow-hidden ${
                            editingItem.mainImage === index
                              ? 'border-yellow-500 shadow-lg'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={getImageSrc(image)}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetMainImage(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  editingItem.mainImage === index ? 'fill-yellow-500 text-yellow-500' : ''
                                }`}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveImage(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingItem.mainImage === index && (
                            <Badge className="absolute top-2 left-2 bg-yellow-500">
                              Main Image
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Description Tab */}
              <TabsContent value="description" className="space-y-4 mt-4">
                  <Alert className="mb-4">
                    <Languages className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI Translation:</strong> Fill in the English description, then use the translate buttons to automatically translate to Czech and Italian using OpenAI.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Description (English)</label>
                    <Textarea
                      value={editingItem.description?.en || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), en: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Enter a detailed description of the property in English..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.en || '').length} characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">Description (Czech)</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslate('description', 'en', 'cs')}
                        disabled={!editingItem.description?.en || translating['description-cs']}
                        className="h-7"
                      >
                        {translating['description-cs'] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="h-3 w-3 mr-1" />
                            Translate from EN
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={editingItem.description?.cs || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), cs: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Zadejte podrobný popis nemovitostí v češtině..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.cs || '').length} characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">Description (Italian)</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslate('description', 'en', 'it')}
                        disabled={!editingItem.description?.en || translating['description-it']}
                        className="h-7"
                      >
                        {translating['description-it'] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="h-3 w-3 mr-1" />
                            Translate from EN
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={editingItem.description?.it || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), it: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Inserisci una descrizione dettagliata della proprietà in italiano..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.it || '').length} characters
                    </p>
                  </div>
              </TabsContent>

              {/* SEO & Publishing Tab */}
              <TabsContent value="seo" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {t('admin.content.seoSettings', language)}
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (English)</label>
                      <Input
                        value={editingItem.seoTitle?.en || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), en: e.target.value }
                        }))}
                        placeholder="Luxury Villa in Tuscany | Buy Italian Property"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.en || '').length}/60 characters (optimal: 50-60)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (Czech)</label>
                      <Input
                        value={editingItem.seoTitle?.cs || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), cs: e.target.value }
                        }))}
                        placeholder="Luxusní vila v Toskánsku | Koupit italskou nemovitost"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.cs || '').length}/60 characters
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (Italian)</label>
                      <Input
                        value={editingItem.seoTitle?.it || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), it: e.target.value }
                        }))}
                        placeholder="Villa di Lusso in Toscana | Acquista Proprietà Italiana"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.it || '').length}/60 characters
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (English)</label>
                      <Textarea
                        value={editingItem.seoDescription?.en || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), en: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Stunning luxury villa in the heart of Tuscany with panoramic views..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.en || '').length}/160 characters (optimal: 150-160)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (Czech)</label>
                      <Textarea
                        value={editingItem.seoDescription?.cs || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), cs: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Úžasná luxusní vila v srdci Toskánska s panoramatickým výhledem..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.cs || '').length}/160 characters
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (Italian)</label>
                      <Textarea
                        value={editingItem.seoDescription?.it || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), it: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Splendida villa di lusso nel cuore della Toscana con vista panoramica..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.it || '').length}/160 characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Keywords</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddKeyword()
                          }
                        }}
                        placeholder="Enter keyword and press Enter"
                      />
                      <Button type="button" onClick={handleAddKeyword} variant="secondary">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {editingItem.keywords && editingItem.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingItem.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {keyword}
                            <button
                              onClick={() => handleRemoveKeyword(index)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Publishing Schedule
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduledPublish"
                      checked={editingItem.scheduledPublish || false}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        scheduledPublish: e.target.checked
                      }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="scheduledPublish" className="text-sm font-medium">
                      Schedule publication date
                    </label>
                  </div>

                  {editingItem.scheduledPublish && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Publish Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={editingItem.publishAt || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          publishAt: e.target.value
                        }))}
                        className="max-w-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Property will be automatically published at this date and time
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  {t('admin.content.cancel', language)}
                </Button>
                <Button 
                  onClick={handleSaveProperty}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('admin.content.saving', language)}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem._id === 'new' ? t('admin.content.createProperty', language) : t('admin.content.saveChanges', language)}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRegionModalOpen} onOpenChange={setIsRegionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingRegion?._id === 'new' ? 'Add New Region' : 'Edit Region'}
            </DialogTitle>
          </DialogHeader>
          {editingRegion && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (EN)</label>
                  <Input
                    value={editingRegion.name.en}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      name: { ...prev.name, en: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (CS)</label>
                  <Input
                    value={editingRegion.name.cs}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      name: { ...prev.name, cs: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (IT)</label>
                  <Input
                    value={editingRegion.name.it}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      name: { ...prev.name, it: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Slug</label>
                  <Input
                    value={editingRegion.slug.current}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      slug: { ...prev.slug, current: e.target.value }
                    }))}
                    placeholder="toscana"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Country</label>
                  <Input
                    value={editingRegion.country}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      country: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Image URL / Path</label>
                <Input
                  value={editingRegion.image}
                  onChange={(e) => setEditingRegion((prev) => ({
                    ...prev,
                    image: e.target.value
                  }))}
                  placeholder="/Toscana.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (EN)</label>
                  <Textarea
                    value={editingRegion.description.en}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (CS)</label>
                  <Textarea
                    value={editingRegion.description.cs}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      description: { ...prev.description, cs: e.target.value }
                    }))}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (IT)</label>
                  <Textarea
                    value={editingRegion.description.it}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      description: { ...prev.description, it: e.target.value }
                    }))}
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Properties</label>
                  <Input
                    type="number"
                    value={editingRegion.propertyCount}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      propertyCount: Number(e.target.value || 0)
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Avg Price</label>
                  <Input
                    type="number"
                    value={editingRegion.averagePrice}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      averagePrice: Number(e.target.value || 0)
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Price</label>
                  <Input
                    type="number"
                    value={editingRegion.priceRange.min}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: Number(e.target.value || 0) }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Price</label>
                  <Input
                    type="number"
                    value={editingRegion.priceRange.max}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Number(e.target.value || 0) }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Popularity (0-5)</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={editingRegion.popularity}
                    onChange={(e) => setEditingRegion((prev) => ({
                      ...prev,
                      popularity: Number(e.target.value || 0)
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Top Cities (comma separated)</label>
                <Input
                  value={editingRegion.topCitiesText}
                  onChange={(e) => setEditingRegion((prev) => ({
                    ...prev,
                    topCitiesText: e.target.value
                  }))}
                  placeholder="Florence, Siena, Pisa"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Highlights (comma separated)</label>
                <Input
                  value={editingRegion.highlightsText}
                  onChange={(e) => setEditingRegion((prev) => ({
                    ...prev,
                    highlightsText: e.target.value
                  }))}
                  placeholder="Wine regions, Historic cities"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsRegionModalOpen(false)} disabled={saving}>
                  {t('admin.content.cancel', language)}
                </Button>
                <Button onClick={handleSaveRegion} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('admin.content.saving', language)}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingRegion._id === 'new' ? 'Create Region' : t('admin.content.saveChanges', language)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
