import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/siteConfig'

function normalizeImage(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return absoluteUrl(url)
}

export function buildArticleMetadata(entry) {
  if (!entry) return {}

  const image = normalizeImage(entry.image)

  return {
    title: `${entry.title} | ${SITE_NAME}`,
    description: entry.description,
    alternates: {
      canonical: entry.path
    },
    openGraph: {
      title: `${entry.title} | ${SITE_NAME}`,
      description: entry.description,
      url: absoluteUrl(entry.path),
      type: 'article',
      siteName: SITE_NAME,
      publishedTime: entry.datePublished,
      images: image ? [{ url: image, alt: entry.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${entry.title} | ${SITE_NAME}`,
      description: entry.description,
      images: image ? [image] : undefined
    }
  }
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  }
}

export function buildArticleJsonLd(entry) {
  if (!entry) return null

  const image = normalizeImage(entry.image)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.description,
    datePublished: entry.datePublished,
    dateModified: entry.datePublished,
    inLanguage: 'cs-CZ',
    mainEntityOfPage: absoluteUrl(entry.path),
    articleSection: entry.articleSection,
    image: image ? [image] : undefined,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo domy.svg')
      }
    }
  }
}

function mapPropertyTypeToSchemaType(propertyType) {
  const normalized = String(propertyType || '').toLowerCase()
  if (normalized === 'apartment') return 'Apartment'
  if (normalized === 'house' || normalized === 'villa') return 'House'
  if (normalized === 'rustic') return 'Residence'
  if (normalized === 'land') return 'Place'
  return 'Residence'
}

function mapAvailability(status) {
  if (status === 'sold') return 'https://schema.org/SoldOut'
  if (status === 'reserved') return 'https://schema.org/LimitedAvailability'
  return 'https://schema.org/InStock'
}

function getLocalizedValue(value, language = 'cs', fallback = '') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.it || value.cs || fallback
  }
  return value || fallback
}

export function buildPropertyJsonLd(property, canonicalPath) {
  if (!property || !canonicalPath) return null

  const title =
    getLocalizedValue(property?.seoTitle, 'en') ||
    getLocalizedValue(property?.title, 'en', 'Property in Italy')
  const description =
    getLocalizedValue(property?.seoDescription, 'en') ||
    getLocalizedValue(property?.description, 'en') ||
    'Property in Italy.'
  const url = absoluteUrl(canonicalPath)
  const imageList = Array.isArray(property?.images)
    ? property.images
        .map((image) => normalizeImage(image))
        .filter(Boolean)
        .slice(0, 8)
    : []
  const location = property?.location || {}
  const city = getLocalizedValue(location?.city?.name, 'en')
  const region = getLocalizedValue(location?.city?.region?.name, 'en')
  const address = getLocalizedValue(location?.address, 'en')
  const coordinates = location?.coordinates || {}
  const schemaType = mapPropertyTypeToSchemaType(property?.propertyType)
  const specifications = property?.specifications || {}

  const aboutEntity = {
    '@type': schemaType,
    name: title,
    description,
    image: imageList,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address || undefined,
      addressLocality: city || undefined,
      addressRegion: region || undefined,
      addressCountry: 'IT'
    }
  }

  if (coordinates?.lat && coordinates?.lng) {
    aboutEntity.geo = {
      '@type': 'GeoCoordinates',
      latitude: coordinates.lat,
      longitude: coordinates.lng
    }
  }

  if (specifications?.squareFootage) {
    aboutEntity.floorSize = {
      '@type': 'QuantitativeValue',
      value: specifications.squareFootage,
      unitCode: 'MTK'
    }
  }

  if (specifications?.rooms) aboutEntity.numberOfRooms = specifications.rooms
  if (specifications?.bedrooms) aboutEntity.numberOfBedrooms = specifications.bedrooms
  if (specifications?.bathrooms) aboutEntity.numberOfBathroomsTotal = specifications.bathrooms

  // RealEstateListing is the canonical schema for individual property
  // listings and is preferred by Google for real estate rich results.
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: title,
    description,
    image: imageList,
    datePosted: property?._createdAt || property?.createdAt || undefined,
    inLanguage: 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    breadcrumb: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: title, path: canonicalPath }
    ]),
    about: aboutEntity,
    offers: {
      '@type': 'Offer',
      url,
      price: property?.price?.amount,
      priceCurrency: property?.price?.currency || 'EUR',
      availability: mapAvailability(property?.status),
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL
      }
    }
  }
}
