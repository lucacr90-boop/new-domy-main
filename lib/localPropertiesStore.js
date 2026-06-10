import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { createRequire } from 'module'
import bundledPropertiesJson from '../data/local-properties.json'
import { getSupabaseAdminClient } from './supabaseAdmin'

// On Vercel the deployed filesystem is read-only and /tmp is per-instance and
// ephemeral, which means runtime writes to data/local-properties.json never
// propagate across serverless instances. The store therefore prefers Supabase
// (consistent across instances, persists across cold starts) and falls back
// to the on-disk file only when Supabase env vars are missing — typically
// `next dev` on a developer machine that hasn't set up Supabase locally.
//
// External API (getLocalProperties, getLocalPropertyBySlug, createLocalProperty,
// updateLocalProperty, deleteLocalProperty) is unchanged so callers don't need
// to know which backend is active.

const require = createRequire(import.meta.url)
const PROJECT_DATA_PATH = require.resolve('../data/local-properties.json')
const TMP_DATA_PATH = path.join(os.tmpdir(), 'local-properties.json')
const SUPABASE_TABLE = 'local_properties'

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// ---------------------------------------------------------------------------
// File-backed implementation (used as a dev fallback when Supabase isn't
// configured). Identical in behaviour to the previous version of this file.
// ---------------------------------------------------------------------------

let _writablePath = null

async function getWritablePath() {
  if (_writablePath) return _writablePath

  const dir = path.dirname(PROJECT_DATA_PATH)
  try {
    await fs.mkdir(dir, { recursive: true })
    const handle = await fs.open(PROJECT_DATA_PATH, 'a')
    await handle.close()
    _writablePath = PROJECT_DATA_PATH
  } catch {
    _writablePath = TMP_DATA_PATH
  }

  return _writablePath
}

async function ensureDataFile(dataPath) {
  const dir = path.dirname(dataPath)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(dataPath)
  } catch {
    if (dataPath !== PROJECT_DATA_PATH) {
      try {
        const seed = await fs.readFile(PROJECT_DATA_PATH, 'utf8')
        await fs.writeFile(dataPath, seed, 'utf8')
        return
      } catch {
        // project file not readable either, start fresh
      }
    }
    await fs.writeFile(dataPath, '[]', 'utf8')
  }
}

async function readPropertiesFromFile() {
  const dataPath = await getWritablePath()
  try {
    await ensureDataFile(dataPath)
    const raw = await fs.readFile(dataPath, 'utf8')
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function readPropertiesFromProjectFile() {
  return Array.isArray(bundledPropertiesJson)
    ? JSON.parse(JSON.stringify(bundledPropertiesJson))
    : []
}

export async function readLocalPropertiesFromJson() {
  return readPropertiesFromProjectFile()
}

async function writePropertiesToFile(properties) {
  const dataPath = await getWritablePath()
  await ensureDataFile(dataPath)
  await fs.writeFile(dataPath, JSON.stringify(properties, null, 2), 'utf8')
}

// ---------------------------------------------------------------------------
// Supabase-backed implementation. Each row in `local_properties` holds a
// single property as `data` (jsonb), keyed by `id` and indexed by `slug`.
// ---------------------------------------------------------------------------

function rowToProperty(row) {
  return row && row.data ? row.data : null
}

function propertyToRow(property) {
  return {
    id: property._id,
    slug: property?.slug?.current || property._id,
    data: property,
    updated_at: new Date().toISOString()
  }
}

function getPropertyKey(property) {
  return property?.slug?.current || property?._id || null
}

function mergeProperties(primary = [], secondary = []) {
  const merged = []
  const seen = new Set()

  for (const property of [...primary, ...secondary]) {
    const key = getPropertyKey(property)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    merged.push(property)
  }

  return merged
}

async function readPropertiesFromSupabase() {
  const client = getSupabaseAdminClient()
  const { data, error } = await client
    .from(SUPABASE_TABLE)
    .select('data, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return Array.isArray(data) ? data.map(rowToProperty).filter(Boolean) : []
}

async function readPropertyFromSupabase(slugOrId) {
  const client = getSupabaseAdminClient()

  // Try by slug first since most callers route through slugs; fall through to
  // id lookup so legacy callers passing _id still resolve.
  const bySlug = await client
    .from(SUPABASE_TABLE)
    .select('data')
    .eq('slug', slugOrId)
    .maybeSingle()

  if (bySlug.error) throw bySlug.error
  if (bySlug.data) return rowToProperty(bySlug.data)

  const byId = await client
    .from(SUPABASE_TABLE)
    .select('data')
    .eq('id', slugOrId)
    .maybeSingle()

  if (byId.error) throw byId.error
  return rowToProperty(byId.data)
}

async function upsertPropertyInSupabase(property) {
  const client = getSupabaseAdminClient()
  const row = propertyToRow(property)
  const { error } = await client
    .from(SUPABASE_TABLE)
    .upsert(row, { onConflict: 'id' })

  if (error) throw error
}

async function deletePropertyFromSupabase(id) {
  const client = getSupabaseAdminClient()
  const { error, count } = await client
    .from(SUPABASE_TABLE)
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) throw error
  return (count || 0) > 0
}

// ---------------------------------------------------------------------------
// Helpers shared by both backends.
// ---------------------------------------------------------------------------

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function defaultLocation() {
  return {
    city: {
      name: { en: 'Italy', cs: 'Itálie', it: 'Italia' },
      slug: { current: 'italy' },
      region: {
        name: { en: 'Italy', cs: 'Itálie', it: 'Italia' },
        country: { en: 'Italy', cs: 'Itálie', it: 'Italia' }
      }
    },
    address: { en: '', cs: '', it: '' }
  }
}

function buildPropertyFromInput(data = {}) {
  const now = new Date().toISOString()
  const titleForSlug = data?.title?.en || data?.title?.it || data?.title?.cs || 'property'
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  return {
    _id: id,
    _type: 'listing',
    title: data.title || { en: 'Untitled property', cs: 'Nemovitost bez názvu', it: 'Proprietà senza titolo' },
    slug: {
      _type: 'slug',
      current: `${slugify(titleForSlug)}-${Date.now()}`
    },
    propertyType: data.propertyType || 'apartment',
    price: {
      amount: data?.price?.amount || 0,
      currency: data?.price?.currency || 'EUR'
    },
    specifications: {
      rooms: data?.specifications?.rooms || 0,
      bedrooms: data?.specifications?.bedrooms || 0,
      bathrooms: data?.specifications?.bathrooms || 0,
      squareFootage: data?.specifications?.squareFootage || 0
    },
    location: data.location || defaultLocation(),
    status: data.status || 'available',
    featured: Boolean(data.featured),
    description: data.description || { en: '', cs: '', it: '' },
    images: data.images || [],
    mainImage: data.mainImage ?? 0,
    amenities: data.amenities || [],
    seoTitle: data.seoTitle || { en: '', cs: '', it: '' },
    seoDescription: data.seoDescription || { en: '', cs: '', it: '' },
    keywords: data.keywords || [],
    sourceUrl: data.sourceUrl || '',
    publishAt: data.publishAt || null,
    scheduledPublish: Boolean(data.scheduledPublish),
    _createdAt: now,
    _updatedAt: now
  }
}

function mergePropertyUpdate(current, data) {
  return {
    ...current,
    ...data,
    // Preserve the original slug — changing it would break existing URLs.
    slug: current.slug,
    price: data.price ? { ...current.price, ...data.price } : current.price,
    specifications: data.specifications
      ? { ...current.specifications, ...data.specifications }
      : current.specifications,
    location: data.location ? { ...current.location, ...data.location } : current.location,
    _updatedAt: new Date().toISOString()
  }
}

// ---------------------------------------------------------------------------
// Public API.
// ---------------------------------------------------------------------------

export async function getLocalProperties() {
  if (hasSupabaseConfig()) {
    const bundledProperties = await readPropertiesFromProjectFile()
    try {
      const supabaseProperties = await readPropertiesFromSupabase()
      return mergeProperties(supabaseProperties, bundledProperties)
    } catch {
      return bundledProperties
    }
  }
  return readPropertiesFromFile()
}

export async function getLocalPropertyBySlug(slugOrId) {
  if (hasSupabaseConfig()) {
    try {
      const property = await readPropertyFromSupabase(slugOrId)
      if (property) return property
    } catch {
      // Fall through to the bundled JSON copy so newly deployed local imports
      // still resolve even if Supabase is temporarily unavailable.
    }

    const bundledProperties = await readPropertiesFromProjectFile()
    return bundledProperties.find((property) =>
      property?.slug?.current === slugOrId || property?._id === slugOrId
    ) || null
  }

  const properties = await readPropertiesFromFile()
  return properties.find((property) =>
    property?.slug?.current === slugOrId || property?._id === slugOrId
  ) || null
}

export async function createLocalProperty(data = {}) {
  const property = buildPropertyFromInput(data)

  if (hasSupabaseConfig()) {
    await upsertPropertyInSupabase(property)
    return property
  }

  const properties = await readPropertiesFromFile()
  properties.unshift(property)
  await writePropertiesToFile(properties)
  return property
}

export async function updateLocalProperty(id, data = {}) {
  if (hasSupabaseConfig()) {
    const current = await readPropertyFromSupabase(id)
    if (!current) return null

    const next = mergePropertyUpdate(current, data)
    await upsertPropertyInSupabase(next)
    return next
  }

  const properties = await readPropertiesFromFile()
  const index = properties.findIndex((property) => property?._id === id)
  if (index < 0) return null

  const next = mergePropertyUpdate(properties[index], data)
  properties[index] = next
  await writePropertiesToFile(properties)
  return next
}

export async function deleteLocalProperty(id) {
  if (hasSupabaseConfig()) {
    return deletePropertyFromSupabase(id)
  }

  const properties = await readPropertiesFromFile()
  const next = properties.filter((property) => property?._id !== id)
  const deleted = next.length !== properties.length

  if (!deleted) return false

  await writePropertiesToFile(next)
  return true
}
