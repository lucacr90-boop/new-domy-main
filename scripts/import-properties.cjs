#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const IMPORT_ROOT_DEFAULT = path.join(process.cwd(), 'data', 'import', 'properties')
const OUTPUT_PROPERTIES_PATH = path.join(process.cwd(), 'data', 'local-properties.json')
const PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'properties')

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.m4v'])
const MAX_REMOTE_IMAGE_URLS = 20

const REGION_NAME_MAP = {
  abruzzo: { it: 'Abruzzo', en: 'Abruzzo', cs: 'Abruzzo' },
  basilicata: { it: 'Basilicata', en: 'Basilicata', cs: 'Basilicata' },
  calabria: { it: 'Calabria', en: 'Calabria', cs: 'Kalábrie' },
  campania: { it: 'Campania', en: 'Campania', cs: 'Kampánie' },
  'emilia-romagna': { it: 'Emilia-Romagna', en: 'Emilia-Romagna', cs: 'Emilie-Romagna' },
  'friuli-venezia-giulia': { it: 'Friuli-Venezia Giulia', en: 'Friuli-Venezia Giulia', cs: 'Furlansko-Julské Benátsko' },
  lazio: { it: 'Lazio', en: 'Lazio', cs: 'Lazio' },
  liguria: { it: 'Liguria', en: 'Liguria', cs: 'Ligurie' },
  lombardia: { it: 'Lombardia', en: 'Lombardy', cs: 'Lombardie' },
  marche: { it: 'Marche', en: 'Marche', cs: 'Marky' },
  molise: { it: 'Molise', en: 'Molise', cs: 'Molise' },
  piemonte: { it: 'Piemonte', en: 'Piedmont', cs: 'Piemont' },
  puglia: { it: 'Puglia', en: 'Apulia', cs: 'Apulie' },
  sardegna: { it: 'Sardegna', en: 'Sardinia', cs: 'Sardinie' },
  sicilia: { it: 'Sicilia', en: 'Sicily', cs: 'Sicílie' },
  toscana: { it: 'Toscana', en: 'Tuscany', cs: 'Toskánsko' },
  'trentino-alto-adige': { it: 'Trentino-Alto Adige', en: 'Trentino-Alto Adige', cs: 'Tridentsko-Horní Adiže' },
  umbria: { it: 'Umbria', en: 'Umbria', cs: 'Umbrie' },
  "valle-d-aosta": { it: "Valle d'Aosta", en: 'Aosta Valley', cs: 'Údolí Aosta' },
  veneto: { it: 'Veneto', en: 'Veneto', cs: 'Benátsko' }
}

const PROPERTY_TYPE_ALIASES = {
  appartamento: 'apartment',
  apartment: 'apartment',
  attico: 'apartment',
  villa: 'villa',
  casa: 'house',
  house: 'house',
  villetta: 'house',
  casale: 'house',
  commerciale: 'commercial',
  commercial: 'commercial',
  ufficio: 'commercial',
  negozio: 'commercial',
  terreno: 'land',
  land: 'land'
}

function parseArgs(argv) {
  const options = {
    input: IMPORT_ROOT_DEFAULT,
    replace: false,
    dryRun: false,
    noAi: false,
    only: null,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  for (const arg of argv) {
    if (arg === '--replace') options.replace = true
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--no-ai') options.noAi = true
    else if (arg.startsWith('--input=')) options.input = path.resolve(process.cwd(), arg.split('=').slice(1).join('='))
    else if (arg.startsWith('--only=')) options.only = arg.split('=').slice(1).join('=').trim()
    else if (arg.startsWith('--model=')) options.model = arg.split('=').slice(1).join('=').trim()
    else if (arg === '--help' || arg === '-h') options.help = true
  }

  return options
}

function printHelp() {
  console.log(`
Import properties from folders into data/local-properties.json

Usage:
  node scripts/import-properties.cjs [options]

Options:
  --replace          Replace existing local properties with imported ones
  --dry-run          Parse and validate only, do not write files
  --no-ai            Disable AI description/translation generation
  --input=PATH       Import root folder (default: data/import/properties)
  --only=FOLDER      Import one folder only (by folder name)
  --model=MODEL      OpenAI model (default: OPENAI_MODEL or gpt-4o-mini)
  --help, -h         Show this help
`)
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeTextBlock(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

function pick(source, keys, fallback = undefined) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return fallback
}

function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function resolvePropertyType(rawType) {
  const normalized = slugify(rawType)
  return PROPERTY_TYPE_ALIASES[normalized] || 'apartment'
}

function resolveRegionNames(rawRegion) {
  const value = normalizeWhitespace(rawRegion || '')
  const key = slugify(value)
  const mapped = REGION_NAME_MAP[key]
  if (mapped) return mapped

  if (!value) {
    return { it: 'Italia', en: 'Italy', cs: 'Italie' }
  }

  return {
    it: value,
    en: value,
    cs: value
  }
}

function makeUniqueSlug(baseSlug, existingSlugs, runSlugs) {
  let slug = baseSlug || 'property'

  // Reuse an existing slug once per run so imports update existing properties.
  if (existingSlugs.has(slug) && !runSlugs.has(slug)) {
    runSlugs.add(slug)
    return slug
  }

  let suffix = 2
  while (existingSlugs.has(slug) || runSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
  runSlugs.add(slug)
  return slug
}

async function ensureFile(filePath, defaultValue = '[]') {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, defaultValue, 'utf8')
  }
}

async function readJson(filePath, fallback = []) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return fallback
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function normalizeAmenities(rawAmenities) {
  if (!Array.isArray(rawAmenities)) return []
  return rawAmenities
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') {
        return { it: normalizeWhitespace(item), en: '', cs: '' }
      }
      if (typeof item === 'object' && item.name) {
        if (typeof item.name === 'string') {
          return { it: normalizeWhitespace(item.name), en: '', cs: '' }
        }
        return {
          it: normalizeWhitespace(item.name.it || item.it || ''),
          en: normalizeWhitespace(item.name.en || item.en || ''),
          cs: normalizeWhitespace(item.name.cs || item.cs || '')
        }
      }
      if (typeof item === 'object') {
        return {
          it: normalizeWhitespace(item.it || ''),
          en: normalizeWhitespace(item.en || ''),
          cs: normalizeWhitespace(item.cs || '')
        }
      }
      return null
    })
    .filter((item) => item && (item.it || item.en || item.cs))
}

async function callOpenAI({ apiKey, model, messages, temperature = 0.2, maxTokens = 900 }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI request failed (${response.status}): ${error}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || ''
}

function buildFallbackDescription(base) {
  const parts = []
  parts.push(`${base.propertyTypeLabel} in ${base.city || base.region || 'Italia'}`)
  if (base.totalRooms > 0 || base.bedrooms > 0 || base.bathrooms > 0 || base.squareFootage > 0) {
    const specs = []
    if (base.totalRooms > 0) specs.push(`${base.totalRooms} locali`)
    if (base.bedrooms > 0) specs.push(`${base.bedrooms} camere`)
    if (base.bathrooms > 0) specs.push(`${base.bathrooms} bagni`)
    if (base.squareFootage > 0) specs.push(`${base.squareFootage} m2`)
    parts.push(specs.join(', '))
  }
  if (base.featureList.length > 0) {
    parts.push(`Caratteristiche: ${base.featureList.join(', ')}`)
  }
  if (base.price > 0) {
    parts.push(`Prezzo richiesto: ${base.price.toLocaleString('it-IT')} euro`)
  }
  parts.push('Annuncio da verificare con documentazione ufficiale e visita in loco.')
  return `${parts.join('. ')}.`
}

async function translateText({ text, sourceLang, targetLang, aiEnabled, apiKey, model, cache }) {
  const normalized = normalizeWhitespace(text)
  if (!normalized) return ''
  if (!aiEnabled || !apiKey) return normalized

  const cacheKey = `${sourceLang}->${targetLang}:${normalized}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const translated = await callOpenAI({
    apiKey,
    model,
    temperature: 0.1,
    maxTokens: 900,
    messages: [
      {
        role: 'system',
        content: `You are a professional real estate translator. Translate from ${sourceLang} to ${targetLang}.
Use a professional listing tone. Preserve numbers, addresses, proper nouns, and measurements.
Return only the translation.`
      },
      { role: 'user', content: normalized }
    ]
  })

  cache.set(cacheKey, translated)
  return translated
}

async function generateItalianDescription({
  listing,
  aiEnabled,
  apiKey,
  model
}) {
  const existingDescription =
    normalizeTextBlock(listing.description?.it) ||
    normalizeTextBlock(listing.description_it) ||
    (typeof listing.description === 'string' ? normalizeTextBlock(listing.description) : '')

  if (existingDescription) return existingDescription

  const propertyTypeLabel = normalizeWhitespace(listing.propertyType_it || listing.property_type_it || listing.propertyType || 'Immobile')
  const totalRooms = toNumber(pick(listing, ['rooms', 'locali', 'stanze', 'total_rooms'], 0), 0)
  const bedrooms = toNumber(pick(listing, ['bedrooms', 'camere', 'camere_da_letto'], 0), 0)
  const bathrooms = toNumber(pick(listing, ['bathrooms', 'bagni'], 0), 0)
  const squareFootage = toNumber(pick(listing, ['squareFootage', 'square_meters', 'mq', 'area_mq'], 0), 0)
  const city = normalizeWhitespace(pick(listing, ['city_it', 'city', 'comune'], ''))
  const region = normalizeWhitespace(pick(listing, ['region_it', 'region'], ''))
  const price = toNumber(pick(listing, ['price', 'price_eur'], 0), 0)

  const rawAmenities = normalizeAmenities(listing.features || listing.amenities || [])
  const featureList = rawAmenities.map((item) => item.it || item.en || item.cs).filter(Boolean)

  if (!aiEnabled || !apiKey) {
    return buildFallbackDescription({
      propertyTypeLabel,
      totalRooms,
      bedrooms,
      bathrooms,
      squareFootage,
      city,
      region,
      price,
      featureList
    })
  }

  const prompt = `
Scrivi una descrizione immobiliare in italiano (90-140 parole), professionale e concreta.
Usa solo i dati forniti, senza inventare servizi o caratteristiche non presenti.

Dati:
- Tipo: ${propertyTypeLabel}
- Locali: ${totalRooms || 'n.d.'}
- Camere: ${bedrooms || 'n.d.'}
- Bagni: ${bathrooms || 'n.d.'}
- Superficie: ${squareFootage || 'n.d.'} m2
- Citta: ${city || 'n.d.'}
- Regione: ${region || 'n.d.'}
- Prezzo: ${price > 0 ? `${price.toLocaleString('it-IT')} euro` : 'n.d.'}
- Caratteristiche dichiarate: ${featureList.join(', ') || 'nessuna indicata'}

Tono: trasparente, premium ma realistico.
Chiudi con una frase prudente tipo verifica documentale e sopralluogo.
`

  const generated = await callOpenAI({
    apiKey,
    model,
    temperature: 0.3,
    maxTokens: 550,
    messages: [
      {
        role: 'system',
        content: 'Sei un copywriter immobiliare esperto in annunci italiani. Non inventare mai dati.'
      },
      { role: 'user', content: prompt }
    ]
  })

  return generated || buildFallbackDescription({
    propertyTypeLabel,
    totalRooms,
    bedrooms,
    bathrooms,
    squareFootage,
    city,
    region,
    price,
    featureList
  })
}

async function importImages({ folderPath, slug, dryRun }) {
  const localImagesDir = path.join(folderPath, 'images')
  const importedImagePaths = []

  try {
    const entries = await fs.readdir(localImagesDir, { withFileTypes: true })
    const imageFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))

    if (imageFiles.length === 0) return importedImagePaths

    const destinationDir = path.join(PUBLIC_UPLOAD_ROOT, slug)
    if (!dryRun) {
      await fs.mkdir(destinationDir, { recursive: true })
    }

    for (let index = 0; index < imageFiles.length; index += 1) {
      const originalName = imageFiles[index]
      const extension = path.extname(originalName).toLowerCase()
      const baseName = path.basename(originalName, extension)
      const safeName = `${String(index + 1).padStart(2, '0')}-${slugify(baseName || `image-${index + 1}`)}${extension}`
      const sourceFile = path.join(localImagesDir, originalName)
      const destinationFile = path.join(destinationDir, safeName)
      const webPath = `/uploads/properties/${slug}/${safeName}`

      if (!dryRun) {
        await fs.copyFile(sourceFile, destinationFile)
      }

      importedImagePaths.push(webPath)
    }
  } catch {
    return importedImagePaths
  }

  return importedImagePaths
}

async function importVideos({ folderPath, slug, dryRun }) {
  const localVideosDir = path.join(folderPath, 'videos')
  const importedVideoPaths = []

  try {
    const entries = await fs.readdir(localVideosDir, { withFileTypes: true })
    const videoFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => VIDEO_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))

    if (videoFiles.length === 0) return importedVideoPaths

    const destinationDir = path.join(PUBLIC_UPLOAD_ROOT, slug)
    if (!dryRun) {
      await fs.mkdir(destinationDir, { recursive: true })
    }

    for (let index = 0; index < videoFiles.length; index += 1) {
      const originalName = videoFiles[index]
      const extension = path.extname(originalName).toLowerCase()
      const baseName = path.basename(originalName, extension)
      const safeName = `${String(index + 1).padStart(2, '0')}-${slugify(baseName || `video-${index + 1}`)}${extension}`
      const sourceFile = path.join(localVideosDir, originalName)
      const destinationFile = path.join(destinationDir, safeName)
      const webPath = `/uploads/properties/${slug}/${safeName}`

      if (!dryRun) {
        await fs.copyFile(sourceFile, destinationFile)
      }

      importedVideoPaths.push(webPath)
    }
  } catch {
    return importedVideoPaths
  }

  return importedVideoPaths
}

function findCoordinates(listing) {
  const lat = toNumber(pick(listing, ['lat', 'latitude'], NaN), NaN)
  const lng = toNumber(pick(listing, ['lng', 'lon', 'longitude'], NaN), NaN)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng }
  }

  if (Array.isArray(listing.coordinates) && listing.coordinates.length === 2) {
    const cLat = toNumber(listing.coordinates[0], NaN)
    const cLng = toNumber(listing.coordinates[1], NaN)
    if (Number.isFinite(cLat) && Number.isFinite(cLng)) {
      return { lat: cLat, lng: cLng }
    }
  }

  return null
}

function parseKeywords(listing) {
  if (Array.isArray(listing.keywords)) {
    return listing.keywords.map((item) => normalizeWhitespace(item)).filter(Boolean)
  }
  if (typeof listing.keywords === 'string') {
    return listing.keywords.split(',').map((item) => normalizeWhitespace(item)).filter(Boolean)
  }
  return []
}

function isDirectImageUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim())
    const pathname = parsed.pathname.toLowerCase()
    const extension = path.extname(pathname)

    // Fragment links like #foto1 are page anchors, not image files.
    if (parsed.hash) return false

    if (IMAGE_EXTENSIONS.has(extension)) return true

    // Common direct-image CDN patterns (can omit file extension).
    if (parsed.hostname.includes('im-cdn.it') && pathname.includes('/image/')) return true
    if (parsed.hostname.includes('images.unsplash.com')) return true
    if (parsed.hostname.includes('cloudinary.com')) return true

    return false
  } catch {
    return false
  }
}

async function transformFolderToProperty({
  folderPath,
  folderName,
  existingSlugs,
  runSlugs,
  aiEnabled,
  apiKey,
  model,
  dryRun,
  translationCache
}) {
  const listingPath = path.join(folderPath, 'listing.json')
  const listing = await readJson(listingPath, null)
  if (!listing || typeof listing !== 'object') {
    throw new Error(`Missing or invalid listing.json in folder "${folderName}"`)
  }

  const titleFromObject =
    typeof listing.title === 'object'
      ? normalizeWhitespace(listing.title?.it || listing.title?.en || listing.title?.cs || '')
      : ''
  const titleFromScalar = typeof listing.title === 'string' ? normalizeWhitespace(listing.title) : ''
  const titleIt = normalizeWhitespace(
    pick(listing, ['title_it', 'titleIt'], '') || titleFromObject || titleFromScalar
  )
  if (!titleIt) {
    throw new Error(`Missing title_it in ${folderName}/listing.json`)
  }

  const cityIt = normalizeWhitespace(pick(listing, ['city_it', 'city', 'comune'], ''))
  const cityEnInput = normalizeWhitespace(pick(listing, ['city_en'], ''))
  const cityCsInput = normalizeWhitespace(pick(listing, ['city_cs'], ''))
  const regionRaw = normalizeWhitespace(pick(listing, ['region_it', 'region', 'region_en'], ''))
  const regionNames = resolveRegionNames(regionRaw)
  const addressIt = normalizeWhitespace(pick(listing, ['address_it', 'address'], ''))

  const titleEnInput = normalizeWhitespace(pick(listing, ['title_en'], ''))
  const titleCsInput = normalizeWhitespace(pick(listing, ['title_cs'], ''))

  const descriptionIt = await generateItalianDescription({
    listing,
    aiEnabled,
    apiKey,
    model
  })

  const titleEn =
    titleEnInput ||
    (await translateText({
      text: titleIt,
      sourceLang: 'Italian',
      targetLang: 'English',
      aiEnabled,
      apiKey,
      model,
      cache: translationCache
    }))

  const titleCs =
    titleCsInput ||
    (await translateText({
      text: titleIt,
      sourceLang: 'Italian',
      targetLang: 'Czech',
      aiEnabled,
      apiKey,
      model,
      cache: translationCache
    }))

  const descriptionEn =
    normalizeTextBlock(listing?.description?.en) ||
    normalizeTextBlock(listing.description_en) ||
    (await translateText({
      text: descriptionIt,
      sourceLang: 'Italian',
      targetLang: 'English',
      aiEnabled,
      apiKey,
      model,
      cache: translationCache
    }))

  const descriptionCs =
    normalizeTextBlock(listing?.description?.cs) ||
    normalizeTextBlock(listing.description_cs) ||
    (await translateText({
      text: descriptionIt,
      sourceLang: 'Italian',
      targetLang: 'Czech',
      aiEnabled,
      apiKey,
      model,
      cache: translationCache
    }))

  const cityEn =
    cityEnInput ||
    (cityIt
      ? await translateText({
          text: cityIt,
          sourceLang: 'Italian',
          targetLang: 'English',
          aiEnabled,
          apiKey,
          model,
          cache: translationCache
        })
      : '')

  const cityCs =
    cityCsInput ||
    (cityIt
      ? await translateText({
          text: cityIt,
          sourceLang: 'Italian',
          targetLang: 'Czech',
          aiEnabled,
          apiKey,
          model,
          cache: translationCache
        })
      : '')

  const addressEn =
    normalizeWhitespace(pick(listing, ['address_en'], '')) ||
    (addressIt
      ? await translateText({
          text: addressIt,
          sourceLang: 'Italian',
          targetLang: 'English',
          aiEnabled,
          apiKey,
          model,
          cache: translationCache
        })
      : '')

  const addressCs =
    normalizeWhitespace(pick(listing, ['address_cs'], '')) ||
    (addressIt
      ? await translateText({
          text: addressIt,
          sourceLang: 'Italian',
          targetLang: 'Czech',
          aiEnabled,
          apiKey,
          model,
          cache: translationCache
        })
      : '')

  const rawAmenities = normalizeAmenities(listing.features || listing.amenities || [])
  const amenities = []

  for (const amenity of rawAmenities) {
    const nameIt = amenity.it || amenity.en || amenity.cs
    const nameEn =
      amenity.en ||
      (await translateText({
        text: nameIt,
        sourceLang: 'Italian',
        targetLang: 'English',
        aiEnabled,
        apiKey,
        model,
        cache: translationCache
      }))
    const nameCs =
      amenity.cs ||
      (await translateText({
        text: nameIt,
        sourceLang: 'Italian',
        targetLang: 'Czech',
        aiEnabled,
        apiKey,
        model,
        cache: translationCache
      }))

    amenities.push({
      name: {
        it: nameIt,
        en: nameEn,
        cs: nameCs
      }
    })
  }

  const baseSlug =
    slugify(pick(listing, ['slug'], '')) ||
    slugify(folderName) ||
    slugify(titleIt) ||
    'property'
  const finalSlug = makeUniqueSlug(baseSlug, existingSlugs, runSlugs)

  const imagesFromFolder = await importImages({
    folderPath,
    slug: finalSlug,
    dryRun
  })

  const videosFromFolder = await importVideos({
    folderPath,
    slug: finalSlug,
    dryRun
  })

  const rawImageUrls = Array.isArray(listing.image_urls)
    ? listing.image_urls.map((value) => normalizeWhitespace(value)).filter(Boolean)
    : []

  const imageUrls = rawImageUrls.filter(isDirectImageUrl)
  const droppedImageUrls = rawImageUrls.length - imageUrls.length
  const cappedImageUrls = imageUrls.slice(0, MAX_REMOTE_IMAGE_URLS)
  const overLimitImageUrls = Math.max(0, imageUrls.length - cappedImageUrls.length)

  // Keep only the first remote URLs: listing.json should already be ordered by quality.
  const images = imagesFromFolder.length > 0 ? imagesFromFolder : cappedImageUrls

  const totalRooms = toNumber(pick(listing, ['rooms', 'locali', 'stanze', 'total_rooms'], 0), 0)
  const bedrooms = toNumber(pick(listing, ['bedrooms', 'camere', 'camere_da_letto'], 0), 0)
  const bathrooms = toNumber(pick(listing, ['bathrooms', 'bagni'], 0), 0)
  const squareFootage = toNumber(pick(listing, ['squareFootage', 'square_meters', 'mq', 'area_mq'], 0), 0)
  const parking = toNumber(pick(listing, ['parking'], 0), 0)
  const yearBuilt = toNumber(pick(listing, ['yearBuilt', 'year_built'], 0), 0)
  const lotSize = toNumber(pick(listing, ['lotSize', 'lot_size', 'giardino_mq'], 0), 0)
  const price = toNumber(pick(listing, ['price', 'price_eur'], 0), 0)
  const coordinates = findCoordinates(listing)
  const badges = Array.isArray(listing.badges)
    ? listing.badges.map((item) => normalizeWhitespace(item)).filter(Boolean)
    : []
  const noAgency = Boolean(listing.noAgency || listing.no_agency || badges.includes('no-agency'))
  const videoUrl = normalizeWhitespace(pick(listing, ['videoUrl', 'video_url'], '')) || videosFromFolder[0] || ''
  const now = new Date().toISOString()
  const createdAtInput = normalizeWhitespace(pick(listing, ['_createdAt', 'createdAt', 'created_at'], ''))
  const updatedAtInput = normalizeWhitespace(pick(listing, ['_updatedAt', 'updatedAt', 'updated_at'], ''))
  const createdAt = Number.isFinite(Date.parse(createdAtInput)) ? new Date(createdAtInput).toISOString() : now
  const updatedAt = Number.isFinite(Date.parse(updatedAtInput)) ? new Date(updatedAtInput).toISOString() : now

  const property = {
    _id: `local-import-${finalSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    _type: 'listing',
    title: {
      en: titleEn || titleIt,
      cs: titleCs || titleIt,
      it: titleIt
    },
    slug: {
      _type: 'slug',
      current: finalSlug
    },
    propertyType: resolvePropertyType(pick(listing, ['propertyType', 'property_type', 'propertyType_it'], 'apartment')),
    price: {
      amount: price,
      currency: 'EUR'
    },
    specifications: {
      rooms: totalRooms > 0 ? totalRooms : bedrooms,
      bedrooms,
      bathrooms,
      squareFootage,
      ...(parking > 0 ? { parking } : {}),
      ...(yearBuilt > 0 ? { yearBuilt } : {}),
      ...(lotSize > 0 ? { lotSize } : {})
    },
    location: {
      city: {
        name: {
          en: cityEn || cityIt || regionNames.en,
          cs: cityCs || cityIt || regionNames.cs,
          it: cityIt || regionNames.it
        },
        slug: {
          current: slugify(cityIt || regionNames.it || 'italy')
        },
        region: {
          name: regionNames,
          country: {
            en: 'Italy',
            cs: 'Italie',
            it: 'Italia'
          }
        }
      },
      address: {
        en: addressEn || addressIt,
        cs: addressCs || addressIt,
        it: addressIt
      },
      ...(coordinates ? { coordinates } : {})
    },
    status: normalizeWhitespace(pick(listing, ['status'], 'available')) || 'available',
    featured: Boolean(listing.featured),
    isNew: Boolean(listing.isNew || listing.newListing),
    noAgency,
    ...(badges.length > 0 ? { badges } : {}),
    ...(videoUrl ? { videoUrl } : {}),
    description: {
      en: descriptionEn || descriptionIt,
      cs: descriptionCs || descriptionIt,
      it: descriptionIt
    },
    images,
    mainImage: 0,
    amenities,
    seoTitle: {
      en: normalizeWhitespace(pick(listing, ['seo_title_en'], titleEn || titleIt)),
      cs: normalizeWhitespace(pick(listing, ['seo_title_cs'], titleCs || titleIt)),
      it: normalizeWhitespace(pick(listing, ['seo_title_it'], titleIt))
    },
    seoDescription: {
      en: normalizeWhitespace(pick(listing, ['seo_description_en'], descriptionEn || descriptionIt)),
      cs: normalizeWhitespace(pick(listing, ['seo_description_cs'], descriptionCs || descriptionIt)),
      it: normalizeWhitespace(pick(listing, ['seo_description_it'], descriptionIt))
    },
    keywords: parseKeywords(listing),
    sourceUrl: normalizeWhitespace(pick(listing, ['source_url', 'sourceUrl'], '')),
    _createdAt: createdAt,
    _updatedAt: updatedAt
  }

  return {
    property,
    stats: {
      folderName,
      slug: finalSlug,
      imageCount: images.length,
      videoCount: videosFromFolder.length,
      amenityCount: amenities.length,
      droppedImageUrls,
      overLimitImageUrls
    }
  }
}

async function getFolderNames(rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('_'))
}

async function run() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printHelp()
    return
  }

  await ensureFile(OUTPUT_PROPERTIES_PATH, '[]')

  try {
    await fs.access(options.input)
  } catch {
    console.error(`Import folder not found: ${options.input}`)
    console.error('Create folders under data/import/properties/<property-slug>/listing.json')
    process.exit(1)
  }

  const existingProperties = await readJson(OUTPUT_PROPERTIES_PATH, [])
  const output = options.replace ? [] : [...existingProperties]
  const existingSlugs = new Set(
    output
      .map((property) => normalizeWhitespace(property?.slug?.current))
      .filter(Boolean)
  )
  const runSlugs = new Set()

  const aiEnabled = !options.noAi
  const apiKey = process.env.OPENAI_API_KEY

  if (aiEnabled && !apiKey) {
    console.warn('OPENAI_API_KEY not found: AI generation disabled, using fallback descriptions/translations.')
  }

  const folders = await getFolderNames(options.input)
  const targetFolders = options.only
    ? folders.filter((name) => name === options.only)
    : folders

  if (targetFolders.length === 0) {
    console.log('No property folders found to import.')
    return
  }

  const translationCache = new Map()
  const imported = []
  const errors = []

  for (const folderName of targetFolders) {
    const folderPath = path.join(options.input, folderName)
    try {
      const { property, stats } = await transformFolderToProperty({
        folderPath,
        folderName,
        existingSlugs,
        runSlugs,
        aiEnabled: aiEnabled && Boolean(apiKey),
        apiKey,
        model: options.model,
        dryRun: options.dryRun,
        translationCache
      })

      const existingIndex = output.findIndex((item) => item?.slug?.current === property.slug.current)
      if (existingIndex >= 0) {
        output[existingIndex] = property
      } else {
        output.unshift(property)
      }

      imported.push(stats)
      const dropped = stats.droppedImageUrls > 0 ? `, ${stats.droppedImageUrls} invalid image_urls ignored` : ''
      const overLimit = stats.overLimitImageUrls > 0 ? `, ${stats.overLimitImageUrls} image_urls over limit (${MAX_REMOTE_IMAGE_URLS}) ignored` : ''
      console.log(`Imported: ${stats.folderName} -> ${stats.slug} (${stats.imageCount} images, ${stats.amenityCount} amenities${dropped}${overLimit})`)
    } catch (error) {
      errors.push({ folderName, message: error.message })
      console.error(`Failed: ${folderName} -> ${error.message}`)
    }
  }

  if (!options.dryRun) {
    await writeJson(OUTPUT_PROPERTIES_PATH, output)
  }

  console.log('')
  console.log(`Imported properties: ${imported.length}`)
  console.log(`Failed folders: ${errors.length}`)
  console.log(`Mode: ${options.dryRun ? 'dry-run (no files written)' : 'write'}`)
  console.log(`Replace mode: ${options.replace ? 'yes' : 'no'}`)

  if (errors.length > 0) {
    console.log('')
    console.log('Errors:')
    for (const error of errors) {
      console.log(`- ${error.folderName}: ${error.message}`)
    }
  }

  if (errors.length > 0) {
    process.exit(1)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
