#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/har oggi'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')
const IMPORT_CREATED_AT = '2026-04-30T10:00:00.000Z'

const ITEMS = [
  { n: 1, url: 'https://www.immobiliare.it/annunci/126461445/' },
  { n: 2, url: 'https://www.immobiliare.it/annunci/103650712/' },
  { n: 3, url: 'https://www.immobiliare.it/annunci/124226039/' },
  { n: 4, url: 'https://www.immobiliare.it/annunci/126530463/' },
  { n: 5, url: 'https://www.immobiliare.it/annunci/128581296/' },
  { n: 6, url: 'https://www.immobiliare.it/annunci/129047742/' },
  { n: 7, url: 'https://www.immobiliare.it/annunci/122047948/' },
  { n: 8, url: 'https://www.immobiliare.it/annunci/128259742/' },
  { n: 9, url: 'https://www.immobiliare.it/annunci/79848369/' },
  { n: 10, url: 'https://www.immobiliare.it/annunci/129044560/' },
  { n: 11, url: 'https://www.immobiliare.it/annunci/127175569/' },
  { n: 12, url: 'https://www.immobiliare.it/annunci/127766248/' },
  { n: 13, url: 'https://www.immobiliare.it/annunci/121337792/' },
  { n: 14, url: 'https://www.immobiliare.it/annunci/113335747/' },
  { n: 15, url: 'https://www.immobiliare.it/annunci/120549148/' }
]

const CITY_REGIONS = {
  Centola: 'Campania',
  Rutino: 'Campania',
  "Cassano all'Ionio": 'Calabria',
  'Santa Maria del Cedro': 'Calabria',
  Scalea: 'Calabria',
  Grisolia: 'Calabria',
  'San Nicola Arcella': 'Calabria',
  Maratea: 'Basilicata',
  Tortora: 'Calabria',
  Diamante: 'Calabria',
  Praia: 'Calabria',
  'Praia a Mare': 'Calabria',
  Palinuro: 'Campania',
  Camerota: 'Campania',
  Agropoli: 'Campania',
  'Casal Velino': 'Campania',
  Torchiara: 'Campania',
  Ascea: 'Campania',
  Bari: 'Puglia',
  Conversano: 'Puglia',
  'Mola di Bari': 'Puglia',
  Monopoli: 'Puglia',
  Triggiano: 'Puglia'
}

const REGION_NAMES = {
  Basilicata: { it: 'Basilicata', en: 'Basilicata', cs: 'Basilicata' },
  Calabria: { it: 'Calabria', en: 'Calabria', cs: 'Kalábrie' },
  Campania: { it: 'Campania', en: 'Campania', cs: 'Kampánie' },
  Puglia: { it: 'Puglia', en: 'Apulia', cs: 'Apulie' }
}

const CZECH_TITLE_OVERRIDES = {
  'campania-villa-centola-via-velardino': 'Řadová vila v Centole, Via Velardino',
  'campania-appartamento-rutino-via-dei-mille': 'Prostorný byt se zahradou v Rutinu, Via dei Mille',
  'calabria-appartamento-cassano-all-ionio-via-giovanni-amendola-136': "Světlý byt v Cassano all'Ionio, Via Giovanni Amendola",
  'campania-villa-camerota-contrada-conca-dei-vascelli': 'Vila v Camerotě, Contrada Conca dei Vascelli',
  'campania-villa-casal-velino-via-ardisani-s-n-c': 'Rodinná vila v Casal Velino, Via Ardisani',
  'campania-villa-torchiara-parco-elena': 'Vila v Torchiaře, Parco Elena',
  'calabria-villa-san-nicola-arcella-villaggio-del-bridge': 'Prostorná vila v San Nicola Arcella, Villaggio del Bridge',
  'campania-casa-indipendente-ascea-via-grisi-s-n-c': 'Samostatný dům v Ascee, Via Grisi',
  'calabria-villa-praia-a-mare-localita-laccata': 'Přímořská vila v Praia a Mare, lokalita Laccata',
  'calabria-villa-francavilla-marittima-via-sant-emiddio-21': "Samostatná vila ve Francavilla Marittima, Via Sant'Emiddio",
  'puglia-casa-indipendente-bari-via-de-marinis': 'Samostatný dům v Bari, Via De Marinis',
  'puglia-villa-conversano-viale-discesa-del-monte': 'Rodinná vila v Conversanu, Viale Discesa del Monte',
  'puglia-villa-mola-di-bari-strada-provinciale-mola-conversano-per-villa-pepe': 'Menší vila v Mola di Bari u silnice na Conversano',
  'puglia-appartamento-monopoli-viale-aldo-moro': 'Dostupný byt v Monopoli, Viale Aldo Moro',
  'puglia-casa-indipendente-triggiano-via-tito-fanfulla': 'Samostatný dům v Triggianu, Via Tito Fanfulla'
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
  return String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function num(value) {
  if (value == null) return 0
  const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function rooms(value) {
  if (String(value || '').includes('5+')) return 6
  return num(value)
}

function normalizeAddress(data) {
  return [data.address, data.streetNumber, data.city]
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .join(', ')
}

function resolveRegion(city) {
  return CITY_REGIONS[city] || 'Calabria'
}

function regionNames(region) {
  return REGION_NAMES[region] || { it: region, en: region, cs: region }
}

function resolveKind(data) {
  const value = `${data.typology || ''} ${data.title || ''}`.toLowerCase()
  if (value.includes('villa')) return 'villa'
  if (value.includes('villetta') || value.includes('casa') || value.includes('terratetto')) return 'house'
  return 'apartment'
}

function typeIt(kind) {
  if (kind === 'villa') return 'villa'
  if (kind === 'house') return 'casa indipendente'
  return 'appartamento'
}

function kindEn(kind) {
  if (kind === 'villa') return 'villa'
  if (kind === 'house') return 'house'
  return 'apartment'
}

function kindCs(kind) {
  if (kind === 'villa') return 'vila'
  if (kind === 'house') return 'dům'
  return 'byt'
}

function titleCase(value) {
  return String(value || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

function buildTitles(data, kind) {
  const city = data.city || 'Italia'
  const address = data.address ? `, ${data.address}` : ''
  const type = titleCase(data.typology || typeIt(kind))

  return {
    it: `${type} a ${city}${address}`,
    en: `${titleCase(kindEn(kind))} in ${city}${address}`,
    cs: `${titleCase(kindCs(kind))} v lokalitě ${city}${address}`
  }
}

function buildHighlight(data, kind) {
  const text = normalizeWhitespace(data.description)
  const lower = text.toLowerCase()
  if (lower.includes('vista mare')) return 'immobile con vista mare o contesto costiero'
  if (lower.includes('giardino')) return 'presenza di spazi esterni o giardino'
  if (lower.includes('terraz')) return 'spazi esterni vivibili come terrazzo o balcone'
  if (lower.includes('ristrutturat')) return 'immobile indicato come ristrutturato o in buono stato'
  if (kind === 'villa') return 'villa in area residenziale da verificare con sopralluogo'
  if (kind === 'house') return 'soluzione indipendente da valutare per uso personale o investimento'
  return 'appartamento con dati essenziali chiari e prezzo definito'
}

function translateHighlightEn(value) {
  return String(value)
    .replace('immobile con vista mare o contesto costiero', 'property with sea view or coastal setting')
    .replace('presenza di spazi esterni o giardino', 'outdoor areas or garden')
    .replace('spazi esterni vivibili come terrazzo o balcone', 'usable outdoor space such as terrace or balcony')
    .replace('immobile indicato come ristrutturato o in buono stato', 'property described as renovated or in good condition')
    .replace('villa in area residenziale da verificare con sopralluogo', 'villa in a residential area to be checked on site')
    .replace('soluzione indipendente da valutare per uso personale o investimento', 'independent property to assess for personal use or investment')
    .replace('appartamento con dati essenziali chiari e prezzo definito', 'apartment with clear basic data and defined price')
}

function translateHighlightCs(value) {
  return String(value)
    .replace('immobile con vista mare o contesto costiero', 'nemovitost s výhledem na moře nebo v přímořském prostředí')
    .replace('presenza di spazi esterni o giardino', 'venkovní prostory nebo zahrada')
    .replace('spazi esterni vivibili come terrazzo o balcone', 'využitelné venkovní prostory jako terasa nebo balkon')
    .replace('immobile indicato come ristrutturato o in buono stato', 'nemovitost uvedená jako zrekonstruovaná nebo v dobrém stavu')
    .replace('villa in area residenziale da verificare con sopralluogo', 'vila v rezidenční oblasti k ověření při prohlídce')
    .replace('soluzione indipendente da valutare per uso personale o investimento', 'samostatné řešení vhodné k posouzení pro vlastní užívání nebo investici')
    .replace('appartamento con dati essenziali chiari e prezzo definito', 'byt s jasnými základními údaji a stanovenou cenou')
}

function buildDescriptions({ data, kind, region, highlight }) {
  const rn = regionNames(region)
  const sqm = num(data.surface)
  const roomCount = rooms(data.rooms)
  const bedrooms = num(data.bedrooms)
  const bathrooms = num(data.bathrooms)
  const address = normalizeAddress(data)
  const price = num(data.priceLabel)
  const sourceText = normalizeTextBlock(data.description)

  return {
    it: `A ${data.city || rn.it}, proponiamo ${typeIt(kind)} con ${sqm || 'metratura indicata'} mq, ${roomCount || 'locali indicati'} locali, ${bedrooms || 'camere indicate'} camere e ${bathrooms || 'bagni indicati'} bagni. La proprietà si trova ${address ? `in ${address}` : 'nella posizione indicata dall annuncio'} e ha un prezzo richiesto di ${price ? `${price.toLocaleString('it-IT')} euro` : 'valore da verificare'}.\n\nIl punto da valutare è ${highlight}. ${sourceText ? `Dalla descrizione originale emerge inoltre: ${sourceText}` : 'La proposta va valutata con attenzione sulla base della documentazione disponibile.'}\n\nPrima di procedere è necessario verificare documenti, stato tecnico, spese e condizioni reali con sopralluogo.`,
    en: `In ${data.city || rn.en}, this ${kindEn(kind)} offers ${sqm || 'listed'} sqm, ${roomCount || 'listed'} rooms, ${bedrooms || 'listed'} bedrooms and ${bathrooms || 'listed'} bathrooms. The property is located ${address ? `at ${address}` : 'at the position stated in the listing'} and has an asking price of ${price ? `EUR ${price.toLocaleString('en-US')}` : 'to be checked'}.\n\nThe point to assess is ${translateHighlightEn(highlight)}. The property should be reviewed according to the buyer's goals, with particular attention to documentation, technical condition and real costs.\n\nBefore any purchase decision, documents, technical checks and an on-site visit remain essential.`,
    cs: `V lokalitě ${data.city || rn.cs} nabízí tato nemovitost ${sqm || 'uvedenou výměru'} m2, ${roomCount || 'uvedený počet'} místností, ${bedrooms || 'uvedený počet'} ložnic a ${bathrooms || 'uvedený počet'} koupelen. Nachází se ${address ? `na adrese ${address}` : 'v poloze uvedené v inzerátu'} a požadovaná cena je ${price ? `${price.toLocaleString('cs-CZ')} EUR` : 'k ověření'}.\n\nHlavním bodem k posouzení je ${translateHighlightCs(highlight)}. Nemovitost je vhodné hodnotit podle cíle kupujícího, se zvláštním důrazem na dokumentaci, technický stav a reálné náklady.\n\nPřed rozhodnutím o koupi je nutné ověřit dokumenty, technický stav a nemovitost osobně navštívit.`
  }
}

function buildFeatures({ data, highlight }) {
  return [
    { it: highlight, en: translateHighlightEn(highlight), cs: translateHighlightCs(highlight) },
    { it: `${num(data.surface) || data.surface} mq commerciali`, en: `${num(data.surface) || data.surface} commercial sqm`, cs: `${num(data.surface) || data.surface} m2 užitné plochy` },
    { it: `${rooms(data.rooms) || data.rooms} locali`, en: `${rooms(data.rooms) || data.rooms} rooms`, cs: `${rooms(data.rooms) || data.rooms} místností` },
    { it: `${num(data.bedrooms) || data.bedrooms} camere da letto`, en: `${num(data.bedrooms) || data.bedrooms} bedrooms`, cs: `${num(data.bedrooms) || data.bedrooms} ložnice` },
    { it: `${num(data.bathrooms) || data.bathrooms} bagni`, en: `${num(data.bathrooms) || data.bathrooms} bathrooms`, cs: `${num(data.bathrooms) || data.bathrooms} koupelny` }
  ].filter((item) => item.it && !/^0 /.test(item.it))
}

function buildListing(meta, data) {
  const kind = resolveKind(data)
  const region = resolveRegion(data.city)
  const rn = regionNames(region)
  const titles = buildTitles(data, kind)
  const highlight = buildHighlight(data, kind)
  const descriptions = buildDescriptions({ data, kind, region, highlight })
  const slug = slugify(`${slugify(region)}-${typeIt(kind)}-${data.city}-${data.address || meta.n}`)
  if (CZECH_TITLE_OVERRIDES[slug]) {
    titles.cs = CZECH_TITLE_OVERRIDES[slug]
  }
  const price = num(data.priceLabel)
  const sqm = num(data.surface)
  const bedroomCount = num(data.bedrooms)
  const bathroomCount = num(data.bathrooms)

  return {
    slug,
    title_it: titles.it,
    title_en: titles.en,
    title_cs: titles.cs,
    propertyType: kind,
    propertyType_it: typeIt(kind),
    region_it: rn.it,
    city_it: data.city || rn.it,
    city_en: data.city || rn.en,
    city_cs: data.city || rn.cs,
    address_it: normalizeAddress(data),
    address_en: normalizeAddress(data),
    address_cs: normalizeAddress(data),
    price,
    rooms: rooms(data.rooms),
    bedrooms: bedroomCount,
    bathrooms: bathroomCount,
    square_meters: sqm,
    features: buildFeatures({ data, highlight }),
    description_it: descriptions.it,
    description_en: descriptions.en,
    description_cs: descriptions.cs,
    seo_title_it: `${titles.it} in vendita`,
    seo_title_en: `${titles.en} for sale`,
    seo_title_cs: `${titles.cs} na prodej`,
    seo_description_it: `${data.city || rn.it}: ${typeIt(kind)} di ${sqm} mq, ${bedroomCount} camere, ${bathroomCount} bagni. Prezzo ${price.toLocaleString('it-IT')} euro.`,
    seo_description_en: `${data.city || rn.en}: ${kindEn(kind)} of ${sqm} sqm, ${bedroomCount} bedrooms, ${bathroomCount} bathrooms. Asking price EUR ${price.toLocaleString('en-US')}.`,
    seo_description_cs: `${data.city || rn.cs}: nemovitost ${sqm} m2, ${bedroomCount} ložnice, ${bathroomCount} koupelny. Cena ${price.toLocaleString('cs-CZ')} EUR.`,
    status: 'available',
    featured: false,
    isNew: false,
    badges: [],
    keywords: [slugify(region), slugify(data.city), kind, slugify(data.address), 'immobiliare-it'].filter(Boolean),
    source_url: meta.url,
    lat: data.latitude,
    lng: data.longitude,
    image_urls: data.gallery || [],
    _createdAt: IMPORT_CREATED_AT,
    _updatedAt: IMPORT_CREATED_AT
  }
}

function main() {
  const summary = []

  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, `${meta.n}har.har`)
    const data = extractListingData(harPath)
    const listing = buildListing(meta, data)
    const folder = path.join(IMPORT_ROOT, listing.slug)
    const imagesDir = path.join(folder, 'images')
    fs.mkdirSync(imagesDir, { recursive: true })

    const extractedWithImages = extractListingData(harPath, imagesDir)
    listing.image_urls = extractedWithImages.gallery || listing.image_urls
    fs.writeFileSync(path.join(folder, 'listing.json'), `${JSON.stringify(listing, null, 2)}\n`, 'utf8')

    summary.push({
      n: meta.n,
      slug: listing.slug,
      city: data.city,
      region: listing.region_it,
      price: listing.price,
      sqm: listing.square_meters,
      images: fs.readdirSync(imagesDir).filter((file) => /\.(jpe?g|png|webp)$/i.test(file)).length,
      isNew: listing.isNew,
      badges: listing.badges.length
    })
  }

  console.table(summary)
}

main()
