import { hasSanityConfig } from '@/lib/propertyApi'
import { client, writeClient } from '@/lib/sanity'
import { readLocalPropertiesFromJson, updateLocalProperty } from '@/lib/localPropertiesStore'

const SOURCE_STATUS_QUERY = `
  *[_type == "listing" && defined(sourceUrl) && sourceUrl != ""] {
    _id,
    title,
    slug,
    status,
    sourceUrl,
    sourceStatus,
    sourceCheckedAt,
    sourceLastChangedAt,
    sourceStatusReason
  }
`

const UNAVAILABLE_PATTERNS = [
  /annuncio non (?:e|è) (?:piu|più) disponibile/i,
  /annuncio non disponibile/i,
  /immobile non disponibile/i,
  /listing not available/i,
  /this listing is no longer available/i,
  /annuncio disattivato/i,
  /contenuto non disponibile/i,
  /pagina non trovata/i
]

const SOLD_PATTERNS = [
  /\bvendut[oa]\b/i,
  /\bsold\b/i,
  /\bcomprat[oa]\b/i
]

function getMergeKey(property) {
  return property?.slug?.current || property?._id || null
}

function mergeCollections(primary = [], secondary = []) {
  const merged = []
  const seen = new Set()

  for (const property of [...primary, ...secondary]) {
    const key = getMergeKey(property)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    merged.push(property)
  }

  return merged
}

function normalizeBody(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/\s+/g, ' ')
}

function inferListingState({ httpStatus, finalUrl, requestedUrl, bodyText }) {
  const normalizedBody = normalizeBody(bodyText)
  const requested = String(requestedUrl || '')
  const final = String(finalUrl || '')

  if ([404, 410].includes(httpStatus)) {
    return {
      sourceStatus: 'unavailable',
      propertyStatus: 'reserved',
      reason: `http_${httpStatus}`
    }
  }

  if (final && requested && final !== requested && !/immobiliare\.it\/annunci\//i.test(final)) {
    return {
      sourceStatus: 'unavailable',
      propertyStatus: 'reserved',
      reason: 'redirected_off_listing'
    }
  }

  if (SOLD_PATTERNS.some((pattern) => pattern.test(normalizedBody))) {
    return {
      sourceStatus: 'sold',
      propertyStatus: 'sold',
      reason: 'sold_keyword_detected'
    }
  }

  if (UNAVAILABLE_PATTERNS.some((pattern) => pattern.test(normalizedBody))) {
    return {
      sourceStatus: 'unavailable',
      propertyStatus: 'reserved',
      reason: 'unavailable_keyword_detected'
    }
  }

  if (httpStatus >= 200 && httpStatus < 300) {
    return {
      sourceStatus: 'active',
      propertyStatus: 'available',
      reason: 'listing_page_loaded'
    }
  }

  return {
    sourceStatus: 'unknown',
    propertyStatus: null,
    reason: `http_${httpStatus || 'unknown'}`
  }
}

function isMonitorableSource(url) {
  return /immobiliare\.it\/annunci\//i.test(url || '')
}

export async function loadSourceTrackedProperties() {
  const localProperties = (await readLocalPropertiesFromJson()).filter((property) => property?.sourceUrl)

  if (!hasSanityConfig() || !process.env.SANITY_API_TOKEN) {
    return localProperties
  }

  const sanityProperties = await client.fetch(SOURCE_STATUS_QUERY)
  return mergeCollections(localProperties, Array.isArray(sanityProperties) ? sanityProperties : [])
}

export async function checkSourceListing(url) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; DomySourceMonitor/1.0; +https://domyvitalii.cz)',
      accept: 'text/html,application/xhtml+xml'
    },
    cache: 'no-store'
  })

  const body = await response.text()
  const inferred = inferListingState({
    httpStatus: response.status,
    finalUrl: response.url,
    requestedUrl: url,
    bodyText: body
  })

  return {
    ...inferred,
    httpStatus: response.status,
    finalUrl: response.url
  }
}

export async function updatePropertySourceStatus(property, monitoringResult) {
  const now = new Date().toISOString()
  const currentStatus = property.status || 'available'
  const shouldPreserveManualStatus =
    ['sold', 'reserved'].includes(currentStatus) && monitoringResult.propertyStatus === 'available'
  const nextStatus = shouldPreserveManualStatus
    ? currentStatus
    : monitoringResult.propertyStatus || currentStatus
  const sourceStatusChanged = property.sourceStatus !== monitoringResult.sourceStatus
  const propertyStatusChanged = property.status !== nextStatus

  const update = {
    status: nextStatus,
    sourceStatus: monitoringResult.sourceStatus,
    sourceCheckedAt: now,
    sourceStatusReason: monitoringResult.reason,
    sourceHttpStatus: monitoringResult.httpStatus,
    sourceFinalUrl: monitoringResult.finalUrl
  }

  if (sourceStatusChanged || propertyStatusChanged) {
    update.sourceLastChangedAt = now
  }

  const isLocalProperty = String(property?._id || '').startsWith('local-')

  if (isLocalProperty || !process.env.SANITY_API_TOKEN || !hasSanityConfig()) {
    return updateLocalProperty(property._id, update)
  }

  return writeClient.patch(property._id).set(update).commit()
}

export function canMonitorSource(property) {
  return Boolean(property?.sourceUrl) && isMonitorableSource(property.sourceUrl)
}
