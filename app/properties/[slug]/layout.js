import { getPropertyBySlug, getAllProperties } from '@/lib/propertyApi'
import { absoluteUrl } from '@/lib/siteConfig'
import JsonLd from '@/components/seo/JsonLd'
import { buildPropertyJsonLd } from '@/lib/seo/contentSeo'

// Re-fetch fresh listings every hour. Properties newly added after a deploy
// are still rendered on demand and then cached.
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const properties = await getAllProperties(new URLSearchParams())
    return properties
      .map((property) => property?.slug?.current)
      .filter(Boolean)
      .map((slug) => ({ slug }))
  } catch (error) {
    console.error('generateStaticParams (properties) failed:', error)
    return []
  }
}

function getLocalizedValue(value, language = 'cs', fallback = '') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.it || value.cs || fallback
  }
  return value || fallback
}

function buildDescription(property) {
  const localized =
    getLocalizedValue(property?.seoDescription, 'en') ||
    getLocalizedValue(property?.description, 'en')

  if (localized) {
    return localized.replace(/\s+/g, ' ').trim().slice(0, 160)
  }

  const city = getLocalizedValue(property?.location?.city?.name, 'en', 'Italy')
  return `Property for sale in ${city}, Italy. Review photos, pricing, property type, and practical buying context.`
}

function getImage(property) {
  const images = Array.isArray(property?.images) ? property.images : []
  const mainImageIndex = Number.isInteger(property?.mainImage) ? property.mainImage : 0
  return images[mainImageIndex] || images[0] || null
}

export async function generateMetadata({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const property = rawSlug ? await getPropertyBySlug(rawSlug) : null

  if (!property) {
    return {
      title: 'Property not found | Domy v Itálii',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title =
    getLocalizedValue(property?.seoTitle, 'en') ||
    getLocalizedValue(property?.title, 'en', 'Property in Italy')
  const city = getLocalizedValue(property?.location?.city?.name, 'en', 'Italy')
  const image = getImage(property)
  const canonicalPath = `/properties/${property?.slug?.current || rawSlug}`
  const description = buildDescription(property)

  return {
    title: `${title} | Domy v Itálii`,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: `${title} | Domy v Itálii`,
      description,
      url: absoluteUrl(canonicalPath),
      type: 'article',
      images: image ? [{ url: image, alt: title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Domy v Itálii`,
      description,
      images: image ? [image] : undefined
    },
    other: {
      'geo.placename': city
    }
  }
}

export default async function PropertyDetailLayout({ children, params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const property = rawSlug ? await getPropertyBySlug(rawSlug) : null
  const canonicalPath = property?.slug?.current
    ? `/properties/${property.slug.current}`
    : rawSlug
    ? `/properties/${rawSlug}`
    : null

  return (
    <>
      <JsonLd data={buildPropertyJsonLd(property, canonicalPath)} />
      {children}
    </>
  )
}
