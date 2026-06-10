'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Search, 
  SearchX,
  Home, 
  Building, 
  Castle, 
  Building2,
  X,
  MapPin,
  Map as MapIcon,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '../../lib/supabase';
import Footer from '../../components/Footer';
import RegionBanner from '../../components/RegionBanner';
import Navigation from '@/components/Navigation';
import PropertyImage from '@/components/PropertyImage';
import { getPropertyImage } from '@/lib/getPropertyImage';
import { formatPriceCompact } from '../../lib/currency';
import NewPropertyRibbon from '@/components/NewPropertyRibbon';
import NoAgencyBadge from '@/components/NoAgencyBadge';
import ExclusiveBadge from '@/components/ExclusiveBadge';

// Format price with compact symbols (k, M) using shared currency utility
const formatPrice = (price, currency = 'EUR', language = 'cs') => {
  return formatPriceCompact(price, currency, language)
}

const PROPERTY_TYPE_LABELS = {
  apartment: { cs: 'Byt', it: 'Appartamento', en: 'Apartment' },
  house: { cs: 'Samostatn\u00fd d\u016fm', it: 'Casa singola', en: 'Single House' },
  villa: { cs: 'Vila', it: 'Villa', en: 'Villa' },
  rustico: { cs: 'Rustiko', it: 'Rustico', en: 'Rustic House' }
}

const PROPERTY_TYPE_KEYWORDS = {
  apartment: ['apartment', 'appartamento', 'flat', 'byt'],
  house: ['house', 'home', 'casa', 'single', 'singola', 'detached', 'dum'],
  villa: ['villa'],
  rustico: ['rustico', 'casale', 'masseria', 'trullo', 'farmhouse', 'podere', 'borgo'],
  commercial: ['commercial', 'commercio', 'komercni']
}

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const hasKeyword = (text, keywords = []) => keywords.some((keyword) => text.includes(keyword))

const resolvePropertyType = (rawType, context = '') => {
  const normalizedType = normalizeText(rawType)
  const normalizedContext = normalizeText(context)

  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.rustico) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.rustico)
  ) {
    return 'rustico'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.villa) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.villa)
  ) {
    return 'villa'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.apartment) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.apartment)
  ) {
    return 'apartment'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.house) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.house)
  ) {
    return 'house'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.commercial) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.commercial)
  ) {
    return 'house'
  }

  return 'house'
}

const getLocalizedValue = (value, language, fallback = '') => {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.it || value.cs || fallback
  }
  return value || fallback
}

const getPropertyTypeLabel = (propertyType, language) => {
  const resolvedType = resolvePropertyType(propertyType, propertyType)
  return PROPERTY_TYPE_LABELS[resolvedType]?.[language] || PROPERTY_TYPE_LABELS[resolvedType]?.en || resolvedType
}

const getStatusLabel = (status, language) => {
  if (status === 'sold') {
    return language === 'cs' ? 'Prodano' : language === 'it' ? 'Venduto' : 'Sold'
  }

  if (status === 'reserved') {
    return language === 'cs' ? 'Rezervovano' : language === 'it' ? 'Riservato' : 'Reserved'
  }

  return null
}

const getPropertyTimestamp = (property) => {
  const value = property?.createdAt || property?.updatedAt || property?._createdAt || property?._updatedAt
  const timestamp = Date.parse(value || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

// PropertyCard component matching homepage design
function PropertyCard({ property, onFavorite, isFavorited, canFavorite, language, currency, onClick }) {
  const roomsLabel = language === 'cs' ? 'm\u00edstnosti' : language === 'it' ? 'locali' : 'rooms'
  const bedroomsLabel = language === 'cs' ? 'lo\u017enice' : language === 'it' ? 'camere' : 'bedrooms'
  const viewDetailsLabel = PAGE_LABELS[language]?.viewDetails || PAGE_LABELS.en.viewDetails
  const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, 'Untitled Property')
  const localizedTypeLabel = getPropertyTypeLabel(property.type, language)
  const statusLabel = getStatusLabel(property.status, language)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite(property.id)
  }

  // Construct the href with slug safeguard
  const propertyHref = property.slug?.current 
    ? `/properties/${property.slug.current}` 
    : property.slug 
    ? `/properties/${property.slug}` 
    : property.sanityId 
    ? `/properties/${property.sanityId}`
    : '#'

  return (
    <Card 
      className="group relative cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100 shadow-lg bg-white rounded-2xl flex flex-col h-full hover:border-slate-200/50"
      data-testid="property-card"
      data-property-id={property.id}
      data-property-type={property.type}
    >
      <Link 
        href={propertyHref}
        className="absolute inset-0 z-10"
        data-testid="property-card-link"
      >
        <span className="sr-only">View property details</span>
      </Link>

      <div className="relative overflow-hidden h-48 sm:h-64" data-testid="property-image-container">
        <PropertyImage
          src={property.image}
          alt={localizedTitle}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
          data-testid="property-image"
        />

        {(property.noAgency || property.exclusive || property.isNew) && (
          <div
            className="absolute right-3 top-16 z-30 flex max-w-[calc(100%-7rem)] flex-col items-end gap-2 pointer-events-none sm:right-4 sm:top-20"
            data-testid="property-card-badge-stack"
          >
            {property.noAgency && <NoAgencyBadge language={language} />}
            {property.exclusive && <ExclusiveBadge language={language} />}
            {property.isNew && <NewPropertyRibbon language={language} compact inline />}
          </div>
        )}

        {statusLabel && (
          <div className="absolute left-4 top-4 z-30 pointer-events-none">
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg ${
                property.status === 'sold' ? 'bg-red-600/95' : 'bg-amber-600/95'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        )}
        
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/30 via-transparent to-transparent group-hover:from-slate-800/40 transition-all duration-300" />
        
        {/* Top badges and favorite button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <Badge 
            className={`bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white transition-all duration-300 px-3 py-1.5 text-xs font-medium shadow-lg rounded-lg capitalize backdrop-blur-sm border border-white/20 group-hover:shadow-xl pointer-events-none ${statusLabel ? 'ml-0 mt-10' : ''}`}
            data-testid="property-type-badge"
          >
            {localizedTypeLabel}
          </Badge>
          
          {canFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={`p-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-sm border border-white/20 ${
                isFavorited 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25' 
                  : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-slate-500/25'
              }`}
              onClick={handleFavoriteClick}
              data-testid="favorite-button"
              data-property-id={property.id}
              data-favorited={isFavorited}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Price overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="inline-flex w-fit max-w-full items-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:bg-white/15 group-hover:shadow-xl sm:px-4 sm:py-2.5">
            <span 
              className="block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1rem,2.35vw,1.5rem)] font-bold leading-none text-white"
              data-testid="property-price"
              data-price={property.priceAmount || property.price?.amount || property.price}
            >
              {formatPrice(property.price, currency, language)}
            </span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 sm:p-8 flex flex-col flex-1">
        {/* Content area that grows */}
        <div className="flex-1 space-y-2 sm:space-y-3">
          {/* Title and location */}
          <div className="space-y-1.5 sm:space-y-2">
            <h3 
              className="font-bold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-slate-800 transition-colors duration-300 group-hover:tracking-wide"
              data-testid="property-title"
            >
              {localizedTitle}
            </h3>
            
            <div className="flex items-center text-gray-500 text-xs sm:text-sm group-hover:text-gray-600 transition-colors duration-300" data-testid="property-location">
              <div className="p-1 bg-slate-100 rounded-lg mr-2 group-hover:bg-slate-200 transition-colors duration-300">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
              </div>
              <span className="font-medium" data-testid="property-region">{property.region}</span>
            </div>
          </div>
          
          {/* Specifications */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300" data-testid="property-specifications">
            <span className="font-semibold" data-testid="rooms-count">{property.rooms} {roomsLabel}</span>
            <span className="font-semibold" data-testid="bedrooms-count">{property.bedrooms} {bedroomsLabel}</span>
            <span className="font-semibold" data-testid="square-footage-count">{property.area} m2</span>
          </div>
        </div>
        
        {/* Enhanced CTA button - always at bottom */}
        <div className="pt-3 sm:pt-4 mt-auto" data-testid="property-footer">
          <div 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group border-0 text-xs sm:text-sm flex items-center justify-center cursor-pointer"
          >
            <span data-testid="view-details-text">{viewDetailsLabel}</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dynamically import map components to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/PropertyMap'), {
  loading: () => (
    <div className="h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-slate-800 mx-auto mb-2 animate-pulse" />
        <p className="text-slate-800">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false
});

const REGION_LABEL_BY_SLUG = {
  abruzzo: 'Abruzzo',
  basilicata: 'Basilicata',
  calabria: 'Calabria',
  campania: 'Campania',
  'emilia-romagna': 'Emilia-Romagna',
  'friuli-venezia-giulia': 'Friuli-Venezia Giulia',
  lazio: 'Lazio',
  liguria: 'Liguria',
  lombardy: 'Lombardy',
  marche: 'Marche',
  molise: 'Molise',
  piemonte: 'Piedmont',
  puglia: 'Puglia',
  sardegna: 'Sardinia',
  sicilia: 'Sicily',
  toscana: 'Tuscany',
  'trentino-alto-adige': 'Trentino-Alto Adige',
  umbria: 'Umbria',
  'valle-d-aosta': "Valle d'Aosta",
  veneto: 'Veneto'
};

const REGION_SLUG_ALIASES = {
  lombardia: 'lombardy',
  piedmont: 'piemonte',
  sicily: 'sicilia',
  sardinia: 'sardegna',
  tuscany: 'toscana',
  'aosta-valley': 'valle-d-aosta',
  'valle-daosta': 'valle-d-aosta'
};

const toRegionSlug = (value) => {
  if (!value || typeof value !== 'string') return '';

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return REGION_SLUG_ALIASES[normalized] || normalized;
};

const propertyTypes = [
  { id: 'apartment', name: PROPERTY_TYPE_LABELS.apartment, icon: Building },
  { id: 'house', name: PROPERTY_TYPE_LABELS.house, icon: Home },
  { id: 'villa', name: PROPERTY_TYPE_LABELS.villa, icon: Castle },
  { id: 'rustico', name: PROPERTY_TYPE_LABELS.rustico, icon: Building2 }
];

const ROOM_LAYOUT_OPTIONS = [
  { id: '1+kk', label: '1+kk', min: 1, max: 1 },
  { id: '2+kk', label: '2+kk', min: 2, max: 2 },
  { id: '3+kk', label: '3+kk', min: 3, max: 3 },
  { id: '4+kk', label: '4+kk', min: 4, max: 4 },
  { id: '5+kk+', label: '5+kk+', min: 5, max: null }
];

const PAGE_LABELS = {
  cs: {
    viewDetails: 'Zobrazit detail',
    loadingMap: 'Na\u010d\u00edt\u00e1m mapu...',
    showFilters: 'Zobrazit filtry',
    hideFilters: 'Skr\u00fdt filtry',
    title: 'Nemovitosti v It\u00e1lii',
    propertiesCount: 'nemovitost\u00ed',
    propertyType: 'Typ nemovitosti',
    region: 'Region',
    allRegions: 'V\u0161echny regiony',
    layout: 'Dispozice',
    priceRange: 'Cenov\u00e9 rozp\u011bt\u00ed (EUR)',
    from: 'Od',
    to: 'Do',
    amenities: 'Vybaven\u00ed',
    clearFilters: 'Vymazat filtry',
    searchPlaceholder: 'Vyhledat nemovitosti...',
    sortNewest: 'Nejnov\u011bj\u0161\u00ed',
    sortCheapest: 'Nejlevn\u011bj\u0161\u00ed',
    sortExpensive: 'Nejdra\u017e\u0161\u00ed',
    showMap: 'Zobrazit mapu',
    hideMap: 'Skr\u00fdt mapu',
    loading: 'Na\u010d\u00edt\u00e1n\u00ed...',
    loadMore: 'Na\u010d\u00edst dal\u0161\u00ed nemovitosti',
    allShown: 'Zobrazili jste v\u0161echny nemovitosti',
    noResultsBadge: 'Nena\u0161li jsme p\u0159esnou shodu',
    noResultsTitle: 'Va\u0161i vysn\u011bnou nemovitost najdeme i mimo n\u00e1\u0161 v\u00fdb\u011br',
    noResultsDescription1: 'To, co vid\u00edte zde, je pouze na\u0161e doporu\u010den\u00e1 selekce \u2013 nikoli kompletn\u00ed nab\u00eddka. M\u00e1me kontakty po cel\u00e9 It\u00e1lii a najdeme v\u00e1m p\u0159esn\u011b to, co hled\u00e1te.',
    noResultsDescription2: 'Napi\u0161te n\u00e1m, co si p\u0159edstavujete, a my v\u00e1m p\u0159iprav\u00edme nab\u00eddku na m\u00edru \u2013 zdarma a nez\u00e1vazn\u011b.',
    contactUsCta: 'Kontaktujte n\u00e1s',
    whatsappCta: 'Napsat na WhatsApp',
    clearFiltersCta: 'Vymazat filtry'
  },
  it: {
    viewDetails: 'Vedi dettagli',
    loadingMap: 'Caricamento mappa...',
    showFilters: 'Mostra filtri',
    hideFilters: 'Nascondi filtri',
    title: 'Proprietà in Italia',
    propertiesCount: 'proprietà',
    propertyType: 'Tipo di proprietà',
    region: 'Regione',
    allRegions: 'Tutte le regioni',
    layout: 'Disposizione',
    priceRange: 'Fascia di prezzo (EUR)',
    from: 'Da',
    to: 'A',
    amenities: 'Servizi',
    clearFilters: 'Cancella filtri',
    searchPlaceholder: 'Cerca proprietà...',
    sortNewest: 'Più recenti',
    sortCheapest: 'Prezzo più basso',
    sortExpensive: 'Prezzo più alto',
    showMap: 'Mostra mappa',
    hideMap: 'Nascondi mappa',
    loading: 'Caricamento...',
    loadMore: 'Carica altre proprietà',
    allShown: 'Hai visualizzato tutte le proprietà',
    noResultsBadge: 'Nessuna corrispondenza esatta',
    noResultsTitle: 'Possiamo trovare la tua casa anche fuori da questa selezione',
    noResultsDescription1: 'Quelle che vedi qui sono soltanto le nostre proprietà consigliate \u2013 non l\u2019intero portafoglio. Abbiamo contatti in tutta Italia e possiamo trovare esattamente ciò che cerchi.',
    noResultsDescription2: 'Scrivici cosa hai in mente e prepareremo una proposta su misura \u2013 gratis e senza impegno.',
    contactUsCta: 'Contattaci',
    whatsappCta: 'Scrivici su WhatsApp',
    clearFiltersCta: 'Cancella filtri'
  },
  en: {
    viewDetails: 'View details',
    loadingMap: 'Loading map...',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    title: 'Properties in Italy',
    propertiesCount: 'properties',
    propertyType: 'Property type',
    region: 'Region',
    allRegions: 'All regions',
    layout: 'Layout',
    priceRange: 'Price range (EUR)',
    from: 'From',
    to: 'To',
    amenities: 'Amenities',
    clearFilters: 'Clear filters',
    searchPlaceholder: 'Search properties...',
    sortNewest: 'Newest',
    sortCheapest: 'Lowest price',
    sortExpensive: 'Highest price',
    showMap: 'Show map',
    hideMap: 'Hide map',
    loading: 'Loading...',
    loadMore: 'Load more properties',
    allShown: 'You have viewed all properties',
    noResultsBadge: 'No exact match found',
    noResultsTitle: 'We can find your dream home beyond this selection',
    noResultsDescription1: 'What you see here is only our recommended selection \u2013 not our complete portfolio. We have contacts across Italy and can source exactly what you are looking for.',
    noResultsDescription2: 'Tell us what you have in mind and we\u2019ll put together a tailored offer \u2013 free of charge and with no obligation.',
    contactUsCta: 'Contact us',
    whatsappCta: 'Message on WhatsApp',
    clearFiltersCta: 'Clear filters'
  }
}

const matchesRoomLayout = (roomCount, selectedLayoutId) => {
  if (!selectedLayoutId) return true

  const selectedLayout = ROOM_LAYOUT_OPTIONS.find((option) => option.id === selectedLayoutId)
  if (!selectedLayout) return true

  const parsedRoomCount = Number(roomCount || 0)
  if (!Number.isFinite(parsedRoomCount) || parsedRoomCount <= 0) return false

  if (selectedLayout.max === null) {
    return parsedRoomCount >= selectedLayout.min
  }

  return parsedRoomCount >= selectedLayout.min && parsedRoomCount <= selectedLayout.max
}

const amenities = [
  { id: 'pool', name: { cs: 'Baz\u00e9n', it: 'Piscina', en: 'Pool' } },
  { id: 'garden', name: { cs: 'Zahrada', it: 'Giardino', en: 'Garden' } },
  { id: 'parking', name: { cs: 'Parkov\u00e1n\u00ed', it: 'Parcheggio', en: 'Parking' } },
  { id: 'sea_view', name: { cs: 'V\u00fdhled na mo\u0159e', it: 'Vista mare', en: 'Sea view' } },
  { id: 'balcony', name: { cs: 'Balkon', it: 'Balcone', en: 'Balcony' } },
  { id: 'terrace', name: { cs: 'Terasa', it: 'Terrazza', en: 'Terrace' } },
  { id: 'fireplace', name: { cs: 'Krb', it: 'Camino', en: 'Fireplace' } },
  { id: 'aircon', name: { cs: 'Klimatizace', it: 'Aria condizionata', en: 'Air conditioning' } }
];

// Map placeholder component
function MapPlaceholder({ properties, selectedProperty, currency = 'EUR', language = 'cs' }) {
  return (
    <div className="h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-16 w-16 text-slate-800 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Interaktivní mapa</h3>
        <p className="text-sm text-slate-800 mb-2">
          {properties?.length || 0} nemovitostí na mapě
        </p>
        {selectedProperty && (
          <div className="bg-white p-3 rounded-lg shadow-sm border max-w-sm mx-auto">
            <h4 className="font-semibold text-sm text-gray-900">{selectedProperty.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{selectedProperty.description}</p>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-slate-800 font-bold">{formatPrice(selectedProperty.price, currency, language)}</span>
              <span className="text-gray-500">{selectedProperty.area}m²</span>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">Leaflet mapa bude připojena</p>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    region: '',
    rooms: '',
    priceFrom: '',
    priceTo: '',
    amenities: []
  });
  
  const [showRegionBanner, setShowRegionBanner] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState([42.8333, 12.8333]);
  const [showMap, setShowMap] = useState(false);
  
  // Navigation state (user only used for Favorites functionality)
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('cs');
  const [currency, setCurrency] = useState('EUR');

  // Properties state
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [useSanity, setUseSanity] = useState(false);
  const [userFavorites, setUserFavorites] = useState(new Set());
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12); // Show 12 properties initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const ITEMS_PER_PAGE = 9; // Load 9 more each time
  
  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const pageLabels = PAGE_LABELS[language] || PAGE_LABELS.en;

  // Search whisper state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadFavorites(user.id);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadFavorites(session.user.id);
      } else {
        setUserFavorites(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFavorites = async (userId) => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        setUserFavorites(new Set(favorites.map(fav => fav.listingId)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleToggleFavorite = async (propertyId) => {
    if (!user) {
      return;
    }

    // Optimistic update
    setUserFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Refresh real state
      await loadFavorites(user.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      await loadFavorites(user.id);
    }
  };

  // Language effect
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
    
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Listen for language changes from Navigation
    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, []);

  // Scroll detection for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, sortBy]);

  // Load properties from Sanity API
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      // Try to fetch from Sanity API
      const response = await fetch('/api/properties');
      
      if (response.ok) {
        const sanityProperties = await response.json();
        
        if (sanityProperties && Array.isArray(sanityProperties) && sanityProperties.length > 0) {
          // Transform Sanity data to match our property card format
          const transformedProperties = sanityProperties.map((prop, index) => {
            const regionName =
              prop.location?.city?.region?.name?.en ||
              prop.location?.city?.region?.name?.it ||
              prop.location?.city?.region?.name?.cs ||
              prop.location?.city?.name?.it ||
              prop.location?.city?.name ||
              'Italy';

            const regionSlug =
              prop.location?.city?.region?.slug?.current ||
              toRegionSlug(regionName);

            const titleI18n = {
              en: prop.title?.en || prop.title?.it || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : ''),
              it: prop.title?.it || prop.title?.en || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : ''),
              cs: prop.title?.cs || prop.title?.en || prop.title?.it || (typeof prop.title === 'string' ? prop.title : '')
            };

            const typeContext = [
              prop.propertyType,
              prop.slug?.current || prop.slug,
              titleI18n.en,
              titleI18n.it,
              titleI18n.cs
            ]
              .filter(Boolean)
              .join(' ');

            const resolvedType = resolvePropertyType(prop.propertyType, typeContext);

            return {
              id: prop._id || `sanity-${index}`,
              title: titleI18n.en || 'Untitled Property',
              titleI18n,
              type: resolvedType,
              region: regionName,
              regionSlug,
              price: prop.price || { amount: 0, currency: 'EUR' },
              priceAmount: prop.price?.amount || 0,
              rooms: prop.specifications?.rooms || prop.specifications?.bedrooms || 0,
              bedrooms: prop.specifications?.bedrooms || 0,
              bathrooms: prop.specifications?.bathrooms || 0,
              area: prop.specifications?.squareFootage || 0,
              image: getPropertyImage(prop),
              location: prop.location?.coordinates
                ? [prop.location.coordinates.lat || prop.location.coordinates[1], prop.location.coordinates.lng || prop.location.coordinates[0]]
                : [42.8333, 12.8333],
              views: 0,
              terrain: 'mountains',
              amenities: prop.amenities?.map(a => a.name?.en?.toLowerCase().replace(/\s+/g, '_')) || [],
              description: prop.description?.en || prop.description?.it || prop.description || '',
              slug: prop.slug?.current || prop.slug || '',
              sanityId: prop._id,
              status: prop.status || 'available',
              sourceUrl: prop.sourceUrl || '',
              createdAt: prop._createdAt || prop.createdAt || '',
              updatedAt: prop._updatedAt || prop.updatedAt || '',
              isNew: Boolean(prop.isNew || prop.newListing),
              noAgency: Boolean(prop.noAgency || prop.no_agency || prop.badges?.includes('no-agency')),
              exclusive: Boolean(prop.exclusive || prop.isExclusive || prop.badges?.includes('exclusive'))
            };
          });

          setProperties(transformedProperties);
          setUseSanity(true);
          setLoadingProperties(false);
          return;
        }
      }
      
      // If Sanity fails or returns no properties, leave empty
      setProperties([]);
      setUseSanity(false);
    } catch (error) {
      console.log('Sanity API not available or not configured:', error);
      // Properties will remain empty if fetch fails
      setProperties([]);
      setUseSanity(false);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Check URL parameters from homepage quick filters/search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regionParam = urlParams.get('region');
    const searchParam = urlParams.get('search');
    const amenityParam = (urlParams.get('amenity') || '').toLowerCase();
    const validAmenityIds = new Set(amenities.map((amenity) => amenity.id));
    const nextFilters = {};

    if (searchParam) {
      nextFilters.search = searchParam.trim();
    }

    if (amenityParam && validAmenityIds.has(amenityParam)) {
      nextFilters.amenities = [amenityParam];
    }

    if (regionParam) {
      const normalizedRegion = toRegionSlug(regionParam);
      if (normalizedRegion) {
        nextFilters.region = normalizedRegion;
        setShowRegionBanner(true);
      }
    }

    if (Object.keys(nextFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...nextFilters }));
    }
  }, []);

  // Scroll to top when region banner appears
  useEffect(() => {
    if (showRegionBanner) {
      // Multiple attempts to ensure scroll works
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      
      // Immediate scroll
      scrollToTop();
      
      // Delayed scroll to ensure it works
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 200);
    }
  }, [showRegionBanner]);

  // Load more properties
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 600);
  };

  // Update map center when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setMapCenter(selectedProperty.location);
    }
  }, [selectedProperty]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const activeRegionSlug = toRegionSlug(filters.region);
      const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, '');

      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        const searchableContent = [
          localizedTitle,
          property.description || '',
          property.region || '',
          ...(property.amenities || [])
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableContent.includes(searchQuery)) {
          return false;
        }
      }
      if (filters.propertyType && resolvePropertyType(property.type, property.type) !== filters.propertyType) {
        return false;
      }
      if (activeRegionSlug && toRegionSlug(property.regionSlug || property.region) !== activeRegionSlug) {
        return false;
      }
      if (filters.rooms && !matchesRoomLayout(property.rooms, filters.rooms)) {
        return false;
      }
      const propertyPriceAmount = property.priceAmount || property.price?.amount || property.price || 0
      if (filters.priceFrom && propertyPriceAmount < parseInt(filters.priceFrom)) {
        return false;
      }
      if (filters.priceTo && propertyPriceAmount > parseInt(filters.priceTo)) {
        return false;
      }
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [filters, properties, language]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'cheapest':
        return sorted.sort((a, b) => a.price - b.price);
      case 'expensive':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return sorted.sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a));
    }
  }, [filteredProperties, sortBy]);

  // Get displayed properties (for pagination)
  const displayedProperties = useMemo(() => {
    return sortedProperties.slice(0, displayedCount);
  }, [sortedProperties, displayedCount]);

  // Check if there are more properties to load
  const hasMoreProperties = sortedProperties.length > displayedCount;

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      region: '',
      rooms: '',
      priceFrom: '',
      priceTo: '',
      amenities: []
    });
  };

  const toggleAmenity = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
      ? prev.amenities.filter(id => id !== amenityId)
      : [...prev.amenities, amenityId]
    }));
  };

  const handleCardClick = (property) => {
    setSelectedProperty(property);
    // Navigate to property detail page if slug is available
    if (property.slug) {
      window.location.href = `/properties/${property.slug}`;
    } else if (property.sanityId) {
      // For Sanity properties, try to use slug or _id
      window.location.href = `/properties/${property.slug || property.sanityId}`;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Static whisper suggestions pool
  const staticSuggestions = useMemo(() => [
    // Regions
    { label: language === 'cs' ? 'Toskánsko' : 'Toscana', value: 'toscana', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Puglia', value: 'puglia', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: language === 'cs' ? 'Sicílie' : 'Sicilia', value: 'sicilia', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Umbria', value: 'umbria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Liguria', value: 'liguria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: language === 'cs' ? 'Sardinie' : 'Sardegna', value: 'sardegna', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Abruzzo', value: 'abruzzo', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Campania', value: 'campania', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Calabria', value: 'calabria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Marche', value: 'marche', category: language === 'cs' ? 'Region' : 'Regione' },
    // Types
    { label: language === 'cs' ? 'Vila' : 'Villa', value: 'villa', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Rustiko' : 'Rustico', value: 'rustico', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Byt' : 'Appartamento', value: language === 'cs' ? 'byt' : 'appartamento', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Dům' : 'Casa', value: language === 'cs' ? 'dum' : 'casa', category: language === 'cs' ? 'Typ' : 'Tipo' },
    // Amenities
    { label: language === 'cs' ? 'Bazén' : 'Piscina', value: language === 'cs' ? 'bazén' : 'piscina', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Zahrada' : 'Giardino', value: language === 'cs' ? 'zahrada' : 'giardino', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Výhled na moře' : 'Vista mare', value: language === 'cs' ? 'moře' : 'mare', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Terasa' : 'Terrazza', value: language === 'cs' ? 'terasa' : 'terrazza', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
  ], [language]);

  // Dynamic suggestions from loaded properties
  const dynamicSuggestions = useMemo(() => {
    const seen = new Set();
    return properties
      .flatMap(p => {
        const title = typeof p.titleI18n === 'object'
          ? (p.titleI18n[language] || p.titleI18n.en || '')
          : (p.title || '');
        return [
          title && { label: title, value: title.toLowerCase(), category: language === 'cs' ? 'Nemovitost' : 'Immobile' },
          p.region && { label: p.region, value: p.region.toLowerCase(), category: language === 'cs' ? 'Region' : 'Regione' },
        ].filter(Boolean);
      })
      .filter(s => {
        if (seen.has(s.value)) return false;
        seen.add(s.value);
        return true;
      })
      .slice(0, 30);
  }, [properties, language]);

  const allSuggestions = useMemo(() => [...dynamicSuggestions, ...staticSuggestions], [dynamicSuggestions, staticSuggestions]);

  const filteredSuggestions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return staticSuggestions.slice(0, 6);
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(q) || s.value.includes(q))
      .slice(0, 6);
  }, [filters.search, allSuggestions, staticSuggestions]);

  const applySuggestion = useCallback((suggestion) => {
    setFilters(prev => ({ ...prev, search: suggestion.label }));
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] overflow-x-hidden">
      {/* Navigation */}
      <Navigation hideAuth />

      {/* Prominent search bar — full width, above everything */}
      <div className="bg-white border-b border-gray-200 pt-28 sm:pt-24 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6" style={{ maxWidth: '1100px' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 text-center">
            {pageLabels.title}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-5">
            {language === 'cs' ? 'Vyhledejte podle lokality, typu nebo vybavení' :
             language === 'it' ? 'Cerca per posizione, tipo o servizi' :
             'Search by location, type or amenities'}
          </p>
          <div ref={searchRef} className="relative">
            <div
              className="flex items-center gap-2 bg-white rounded-2xl p-2 transition-all duration-200"
              style={{
                border: '2px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={filters.search}
                onChange={e => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setShowSuggestions(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                    applySuggestion(filteredSuggestions[highlightedIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder={language === 'cs' ? 'Toskánsko, vila, bazén, Puglia…' : language === 'it' ? 'Toscana, villa, piscina, Puglia…' : 'Tuscany, villa, pool, Puglia…'}
                className="flex-1 py-2.5 text-base bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 min-w-0"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              {filters.search && (
                <button
                  onClick={() => { setFilters(prev => ({ ...prev, search: '' })); inputRef.current?.focus(); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                className="flex-shrink-0 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, rgba(199,137,91,1), rgb(153,105,69))',
                  boxShadow: '0 2px 8px rgba(153,105,69,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                onClick={() => setShowSuggestions(false)}
              >
                {language === 'cs' ? 'Hledat' : language === 'it' ? 'Cerca' : 'Search'}
              </button>
            </div>

            {/* Whisper suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={`${s.category}-${s.value}`}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-amber-50"
                    style={{ backgroundColor: i === highlightedIndex ? 'rgba(199,137,91,0.08)' : '' }}
                    onMouseDown={e => { e.preventDefault(); applySuggestion(s); }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                  >
                    <Search className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-800 font-medium">{s.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div className="container mx-auto px-6" style={{ maxWidth: '1600px' }}>
          {/* Region Banner */}
          {showRegionBanner && filters.region && (
            <div className="mb-8">
              <RegionBanner 
                regionSlug={filters.region}
                language={language}
                onClose={() => {
                  setShowRegionBanner(false);
                  // Scroll to top when closing the banner
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showMobileFilters ? pageLabels.hideFilters : pageLabels.showFilters}
              </Button>
            </div>

            {/* Left Sidebar - Filters (Hidden on mobile, shown when toggled) */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg lg:sticky lg:top-24">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-t-2xl">
                  <h1 className="font-bold text-gray-900 tracking-tight mb-2">
                    {pageLabels.title}
                  </h1>
                  <span className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-800">
                    {sortedProperties.length} {pageLabels.propertiesCount}
                  </span>
                </div>

                {/* Filters */}
                <div className="flex-1">
                  {/* Property Type */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.propertyType}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {propertyTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setFilters(prev => ({ 
                              ...prev, 
                              propertyType: prev.propertyType === type.id ? '' : type.id 
                            }))}
                            className={`cursor-pointer leading-none p-3 rounded-lg border transition-all duration-300 flex flex-col items-center space-y-2 shadow-sm hover:shadow-md ${
                              filters.propertyType === type.id 
                                ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-700 text-white shadow-lg' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-semibold">{type.name[language] || type.name.en}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Region */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.region}</h3>
                    <select
                      value={filters.region}
                      onChange={(e) => setFilters(prev => ({ ...prev, region: toRegionSlug(e.target.value) }))}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm hover:border-gray-400 transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
                    >
                      <option value="">{pageLabels.allRegions}</option>
                      {Object.entries(REGION_LABEL_BY_SLUG).map(([regionSlug, regionLabel]) => (
                        <option key={regionSlug} value={regionSlug}>{regionLabel}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rooms */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.layout}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {ROOM_LAYOUT_OPTIONS.map((layoutOption) => (
                        <button
                          key={layoutOption.id}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            rooms: prev.rooms === layoutOption.id ? '' : layoutOption.id
                          }))}
                          className={`cursor-pointer leading-none px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                            filters.rooms === layoutOption.id
                              ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border border-slate-700 shadow-lg'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                          }`}
                        >
                          {layoutOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.priceRange}</h3>
                    <div className="space-y-3">
                      <Input
                        type="number"
                        placeholder={pageLabels.from}
                        value={filters.priceFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                      />
                      <Input
                        type="number"
                        placeholder={pageLabels.to}
                        value={filters.priceTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="p-6">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.amenities}</h3>
                    <div className="space-y-3">
                      {amenities.map(amenity => (
                        <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer group">
                          <Checkbox
                            checked={filters.amenities.includes(amenity.id)}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                            className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-slate-800 font-medium transition-colors duration-200">{amenity.name[language] || amenity.name.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-b-2xl">
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {pageLabels.clearFilters}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Top Controls Bar */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 pr-8 sm:pr-10 bg-white hover:border-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] flex-1 sm:flex-none"
                    >
                      <option value="newest">{pageLabels.sortNewest}</option>
                      <option value="cheapest">{pageLabels.sortCheapest}</option>
                      <option value="expensive">{pageLabels.sortExpensive}</option>
                    </select>


                    {/* Map Toggle Button */}
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      className={`${
                        showMap
                          ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg'
                      } font-bold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 border-0 whitespace-nowrap`}
                    >
                      <MapIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">{showMap ? pageLabels.hideMap : pageLabels.showMap}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Map View (when toggled) */}
              {showMap && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-4 sm:mb-6 overflow-hidden">
                  <div className="h-[300px] sm:h-[400px] lg:h-[500px] relative">
                    <MapComponent
                      properties={sortedProperties}
                      selectedProperty={selectedProperty}
                      onPropertyClick={handleCardClick}
                      center={selectedProperty ? selectedProperty.location : [42.8333, 12.8333]}
                      zoom={selectedProperty ? 10 : 6}
                    />
                  </div>
                </div>
              )}

              {/* Properties Grid */}
              {displayedProperties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProperties.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onFavorite={handleToggleFavorite}
                      isFavorited={userFavorites.has(property.id)}
                      canFavorite={Boolean(user)}
                      language={language}
                      currency={currency}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              )}

              {/* No results — Contact Us CTA */}
              {!loadingProperties && sortedProperties.length === 0 && (
                <div
                  className="relative overflow-hidden rounded-2xl border border-amber-100/80 shadow-lg p-6 sm:p-12 text-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #faf6f0 0%, #ffffff 60%, #fdf3e7 100%)'
                  }}
                  data-testid="properties-empty-state"
                >
                  {/* Decorative sparkle */}
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(199,137,91,0.45), transparent 70%)' }}
                  />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(153,105,69,0.35), transparent 70%)' }}
                  />

                  <div className="relative">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(199,137,91,0.15), rgba(153,105,69,0.18))'
                      }}
                    >
                      <SearchX className="h-8 w-8" style={{ color: 'rgb(153,105,69)' }} />
                    </div>

                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4"
                      style={{
                        background: 'rgba(199,137,91,0.12)',
                        color: 'rgb(120, 80, 50)'
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {pageLabels.noResultsBadge}
                    </span>

                    <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
                      {pageLabels.noResultsTitle}
                    </h2>

                    <p className="text-sm sm:text-base text-gray-600 mb-3 max-w-2xl mx-auto leading-relaxed">
                      {pageLabels.noResultsDescription1}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                      {pageLabels.noResultsDescription2}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
                      <Link href="/contact" className="w-full sm:w-auto">
                        <Button
                          className="w-full sm:w-auto text-white font-semibold px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
                          style={{
                            background:
                              'linear-gradient(to right, rgba(199,137,91,1), rgb(153,105,69))'
                          }}
                          data-testid="empty-state-contact-cta"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          {pageLabels.contactUsCta}
                        </Button>
                      </Link>

                      <a
                        href="https://wa.me/420731450001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto font-semibold px-6 py-6 rounded-xl border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                          data-testid="empty-state-whatsapp-cta"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {pageLabels.whatsappCta}
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold px-6 py-6 rounded-xl transition-all duration-200"
                        data-testid="empty-state-clear-filters"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {pageLabels.clearFiltersCta}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Load More / Back to Top */}
              <div className="mt-12 text-center space-y-6">
                {hasMoreProperties && (
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-white hover:bg-gray-50 text-slate-800 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 px-8 py-6 rounded-xl font-semibold text-lg"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-800 mr-3"></div>
                        {pageLabels.loading}
                      </span>
                    ) : (
                      pageLabels.loadMore
                    )}
                  </Button>
                )}
                
                {!hasMoreProperties && displayedProperties.length > 0 && (
                  <p className="text-gray-500 font-medium">
                    {pageLabels.allShown} ({displayedProperties.length})
                  </p>
                )}

                {/* Back to Top Button - Only shows when scrolled down */}
                <div 
                  className={`fixed bottom-8 right-8 transition-all duration-300 transform ${
                    showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                  }`}
                >
                  <Button
                    onClick={scrollToTop}
                    className="bg-slate-800 hover:bg-slate-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <ChevronRight className="h-6 w-6 transform -rotate-90" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer language={language} />

    </div>
  )
}
