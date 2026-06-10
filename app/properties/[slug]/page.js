import { notFound } from 'next/navigation'
import { getPropertyBySlug } from '@/lib/propertyApi'
import { getPropertyImageList } from '@/lib/getPropertyImage'
import PropertyDetailClient from './PropertyDetailClient'

export const dynamic = 'force-dynamic'

function getLocalized(value, language = 'cs', fallback = '') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value !== 'object') return fallback

  const candidates = [
    value[language],
    value.cs,
    value.en,
    value.it,
    ...Object.values(value)
  ]

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue
    if (typeof candidate === 'string') return candidate
    if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate)
    if (typeof candidate === 'object' && candidate !== value) {
      const resolved = getLocalized(candidate, language, '')
      if (resolved) return resolved
    }
  }

  return fallback
}

const PROPERTY_TYPE_LABELS_CS = {
  apartment: 'Byt',
  house: 'Dum',
  villa: 'Vila',
  rustic: 'Rustikalni nemovitost',
  land: 'Pozemek'
}

function formatPriceForSeo(price) {
  if (price?.onRequest || price?.priceOnRequest) return 'Cena na vyžádání'
  if (!price?.amount) return null
  const currency = price.currency || 'EUR'
  try {
    const formatted = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(price.amount)
    return price?.prefix || price?.startingFrom || price?.from ? `Od ${formatted}` : formatted
  } catch {
    const formatted = `${price.amount} ${currency}`
    return price?.prefix || price?.startingFrom || price?.from ? `Od ${formatted}` : formatted
  }
}

// Server-rendered SEO content. Googlebot sees this on first byte even before
// the interactive client component hydrates. Visually identical content is
// rendered by the client below; this block is positioned off-screen so it
// does not duplicate the visible UI but is still in the DOM for crawlers.
function PropertySeoContent({ property }) {
  if (!property) return null

  const title = getLocalized(property.title, 'cs', 'Nemovitost v Itálii')
  const description =
    getLocalized(property.description, 'cs', '') ||
    getLocalized(property.seoDescription, 'cs', '')
  const propertyType = String(property.propertyType || '').toLowerCase()
  const propertyTypeLabel = PROPERTY_TYPE_LABELS_CS[propertyType] || 'Nemovitost'
  const city = getLocalized(property?.location?.city?.name, 'cs', '')
  const region = getLocalized(property?.location?.city?.region?.name, 'cs', '')
  const address = getLocalized(property?.location?.address, 'cs', '')
  const formattedPrice = formatPriceForSeo(property.price)
  const specs = property.specifications || {}

  return (
    <div
      aria-hidden="false"
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      <article>
        <h1>{title}</h1>
        {(city || region) ? (
          <p>
            <strong>{propertyTypeLabel}</strong>
            {address ? `, ${address}` : ''}
            {city ? `, ${city}` : ''}
            {region ? `, ${region}` : ''}
            , Itálie
          </p>
        ) : null}
        {formattedPrice ? <p>Cena: {formattedPrice}</p> : null}
        {description ? <p>{description}</p> : null}
        <ul>
          {specs.bedrooms ? <li>Loznice: {getLocalized(specs.bedrooms, 'cs', '')}</li> : null}
          {specs.bathrooms ? <li>Koupelny: {getLocalized(specs.bathrooms, 'cs', '')}</li> : null}
          {specs.rooms ? <li>Mistnosti: {getLocalized(specs.rooms, 'cs', '')}</li> : null}
          {specs.squareFootage ? <li>Plocha: {getLocalized(specs.squareFootage, 'cs', '')} m2</li> : null}
          {specs.parking ? <li>Parkovani: {getLocalized(specs.parking, 'cs', '')}</li> : null}
        </ul>
        {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
          <>
            <h2>Vybaveni</h2>
            <ul>
              {property.amenities.map((amenity, index) => {
                const label =
                  typeof amenity === 'string'
                    ? amenity
                    : getLocalized(amenity?.name ?? amenity, 'cs', '')
                return label ? <li key={index}>{label}</li> : null
              })}
            </ul>
          </>
        ) : null}
      </article>
    </div>
  )
}

export default async function PropertyDetailPage({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug

  if (!rawSlug) {
    notFound()
  }

  const sanityProperty = await getPropertyBySlug(rawSlug)

  if (!sanityProperty) {
    notFound()
  }

  // Mirror the transform the client component used to do on mount, so the
  // shape passed in matches what the existing UI expects.
  const property = {
    _id: sanityProperty._id,
    title: sanityProperty.title,
    slug: sanityProperty.slug,
    propertyType: sanityProperty.propertyType,
    price: sanityProperty.price,
    description: sanityProperty.description,
    seoTitle: sanityProperty.seoTitle,
    seoDescription: sanityProperty.seoDescription,
    specifications: sanityProperty.specifications,
    location: sanityProperty.location,
    images: getPropertyImageList(sanityProperty),
    mainImage: 0,
    amenities: sanityProperty.amenities || [],
    developer: sanityProperty.developer,
    status: sanityProperty.status || 'available',
    featured: sanityProperty.featured || false,
    isNew: Boolean(sanityProperty.isNew || sanityProperty.newListing),
    noAgency: Boolean(sanityProperty.noAgency || sanityProperty.no_agency || sanityProperty.badges?.includes('no-agency')),
    exclusive: Boolean(sanityProperty.exclusive || sanityProperty.isExclusive || sanityProperty.badges?.includes('exclusive')),
    videoUrl: sanityProperty.videoUrl || sanityProperty.video_url || ''
  }

  return (
    <>
      <PropertySeoContent property={property} />
      <PropertyDetailClient initialProperty={property} />
    </>
  )
}
