import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'
import { client } from '../../../lib/sanity.js'
import { FEATURED_PROPERTIES_QUERY, ALL_PROPERTIES_QUERY, PROPERTY_BY_SLUG_QUERY } from '../../../lib/sanity.js'
import { requireAdminApiAccess } from '@/lib/adminAuth'

// Force dynamic rendering - don't pre-render this route during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

const LOCAL_PROPERTIES_PATH = path.join(process.cwd(), 'data', 'local-properties.json')

function hasSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  return Boolean(projectId && dataset && projectId !== 'placeholder')
}

async function getSupabaseClient() {
  const cookieStore = await cookies()
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

async function readLocalPropertiesFromJson() {
  try {
    const raw = await fs.readFile(LOCAL_PROPERTIES_PATH, 'utf8')
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getPropertyMergeKey(property) {
  return property?.slug?.current || property?._id || null
}

function mergePropertyCollections(primary = [], secondary = []) {
  const merged = []
  const seen = new Set()

  for (const property of [...primary, ...secondary]) {
    const key = getPropertyMergeKey(property)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    merged.push(property)
  }

  return merged
}

function getPropertyTimestamp(property) {
  const value = property?._createdAt || property?._updatedAt || property?.createdAt || property?.updatedAt
  const timestamp = Date.parse(value || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortPropertiesByNewest(properties = []) {
  return [...properties].sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a))
}

async function findLocalPropertyBySlug(slugOrId) {
  const properties = await readLocalPropertiesFromJson()
  return (
    properties.find(
      (property) =>
        property?.slug?.current === slugOrId || property?._id === slugOrId
    ) || null
  )
}

// Handle all API routes
export async function GET(request, { params }) {
  const { path = [] } = await params
  const url = new URL(request.url)
  const searchParams = url.searchParams

  try {
    const supabase = await getSupabaseClient()

    // Check if Supabase is configured
    if (!supabase && path && (path[0] === 'favorites' || path[0] === 'saved-searches' || path[0] === 'inquiries')) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    // Properties endpoints
    if (!path || path.length === 0 || (path.length === 1 && path[0] === 'properties')) {
      // Get all properties with optional filtering
      const featured = searchParams.get('featured') === 'true'
      const propertyType = searchParams.get('type')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      const city = searchParams.get('city')
      const search = searchParams.get('search')

      let properties = []
      const localProperties = await readLocalPropertiesFromJson()

      if (!hasSanityConfig()) {
        properties = localProperties
      } else {
        let query = ALL_PROPERTIES_QUERY
        if (featured) {
          query = FEATURED_PROPERTIES_QUERY
        }

        const sanityProperties = await client.fetch(query)
        properties = mergePropertyCollections(localProperties, Array.isArray(sanityProperties) ? sanityProperties : [])
      }
      
      // Apply additional filters if needed
      let filteredProperties = Array.isArray(properties) ? properties : []
      
      if (propertyType) {
        filteredProperties = filteredProperties.filter(p => p.propertyType === propertyType)
      }
      
      if (minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price.amount >= parseInt(minPrice))
      }
      
      if (maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price.amount <= parseInt(maxPrice))
      }
      
      if (city) {
        filteredProperties = filteredProperties.filter(p => 
          p.location?.city?.slug?.current === city ||
          p.location?.city?.name?.en?.toLowerCase().includes(city.toLowerCase())
        )
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProperties = filteredProperties.filter(p => 
          p.title?.en?.toLowerCase().includes(searchLower) ||
          p.title?.it?.toLowerCase().includes(searchLower) ||
          p.description?.en?.toLowerCase().includes(searchLower) ||
          p.description?.it?.toLowerCase().includes(searchLower) ||
          p.location?.city?.name?.en?.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json(sortPropertiesByNewest(filteredProperties))
    }

    if (path[0] === 'properties' && path[1]) {
      // Get single property by slug
      const slug = path[1]
      let property = null

      if (hasSanityConfig()) {
        property = await client.fetch(PROPERTY_BY_SLUG_QUERY, { slug })
      }

      // Always fallback to local store for dev/imported properties
      if (!property) {
        property =
          await findLocalPropertyBySlug(slug) ||
          await findLocalPropertyBySlug(decodeURIComponent(slug))
      }

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      
      return NextResponse.json(property)
    }

    // Favorites endpoints
    if (path[0] === 'favorites') {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Updated to snake_case
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('listing_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Map back to camelCase for frontend compatibility if needed, or update frontend
      // Let's return as is but the frontend needs to map listing_id -> listingId or use listing_id
      const mappedFavorites = favorites.map(f => ({
        listingId: f.listing_id,
        createdAt: f.created_at
      }))

      return NextResponse.json(mappedFavorites || [])
    }

    // Saved searches endpoints
    if (path[0] === 'saved-searches') {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: searches, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      const mappedSearches = searches.map(s => ({
        id: s.id,
        userId: s.user_id,
        name: s.name,
        filters: s.filters,
        notifications: s.notifications,
        createdAt: s.created_at
      }))

      return NextResponse.json(mappedSearches || [])
    }

    // Inquiries endpoints
    if (path[0] === 'inquiries' && path.length === 1) {
      const access = await requireAdminApiAccess()
      if (!access.ok) return access.response

      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(inquiries || [])
    }

    return NextResponse.json({ message: 'Italian Properties API' })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const { path = [] } = await params
  const body = await request.json()

  try {
    const supabase = await getSupabaseClient()

    // Toggle favorite
    if (path[0] === 'favorites' && path[1] === 'toggle') {
      if (!supabase) {
        console.error('Database not configured')
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('User not authenticated')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { listingId } = body
      
      // Check if already favorited (snake_case)
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "No rows found"
         console.error('Error checking favorite:', checkError)
         return NextResponse.json({ error: checkError.message }, { status: 500 })
      }

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        
        if (error) {
          console.error('Error deleting favorite:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ favorited: false })
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, listing_id: listingId }])
        
        if (error) {
          console.error('Error adding favorite:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ favorited: true })
      }
    }

    // Save search
    if (path[0] === 'saved-searches') {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { name, filters, notifications = true } = body
      
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{ user_id: user.id, name, filters, notifications }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Map back to camelCase
      const mappedData = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        filters: data.filters,
        notifications: data.notifications,
        createdAt: data.created_at
      }

      return NextResponse.json(mappedData)
    }

    // Submit inquiry
    if (path[0] === 'inquiries' && path.length === 1) {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { listingId, name, email, message, propertyTitle, phone, type = 'property' } = body

      if (!String(name || '').trim() || !isValidEmail(email) || !String(message || '').trim()) {
        return NextResponse.json(
          { error: 'Name, a valid email address, and message are required' },
          { status: 400 }
        )
      }
      
      // Get user if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      const inquiryData = {
        listingId: listingId || null,
        name,
        email,
        message,
        userId: user?.id || null,
        phone: phone || null,
        type
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select()
        .single()

      if (error) {
        console.error('[INQUIRY] Database insert failed', {
          code: error.code,
          message: error.message,
          type
        })
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log('[INQUIRY] Saved', {
        inquiryId: data?.id,
        type,
        hasListingId: Boolean(listingId)
      })

      let notificationResult
      try {
        const { default: emailService } = await import('@/lib/emailService')

        notificationResult = await emailService.sendInternalInquiryNotification({
          userEmail: email,
          userName: name,
          userPhone: phone,
          propertyTitle: propertyTitle || (listingId ? `Property ${listingId}` : 'General inquiry'),
          listingId,
          inquiryMessage: message,
          inquiryType: type,
          inquiryId: data?.id
        })

        if (!notificationResult?.success) {
          console.error('[INQUIRY] Internal notification failed', {
            inquiryId: data?.id,
            provider: notificationResult?.provider,
            error: notificationResult?.error || notificationResult?.message || 'Unknown email error'
          })
        } else {
          console.log('[INQUIRY] Internal notification sent', {
            inquiryId: data?.id,
            provider: notificationResult.provider,
            statusCode: notificationResult.statusCode
          })
        }
      } catch (emailError) {
        notificationResult = {
          success: false,
          provider: 'sendgrid',
          error: emailError.message
        }
        console.error('[INQUIRY] Internal notification exception', {
          inquiryId: data?.id,
          error: emailError.message
        })
      }

      // Send inquiry confirmation email if user has email notifications enabled
      if (user) {
        try {
          const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('inquiry_responses, email_enabled')
            .eq('user_id', user.id)
            .single()

          if (!preferences || (preferences.inquiry_responses && preferences.email_enabled)) {
            // Import the email service dynamically to avoid circular imports
            const { default: emailService } = await import('@/lib/emailService')
            
            await emailService.sendInquiryConfirmation({
              userEmail: email,
              userName: name,
              propertyTitle: propertyTitle || `Property ${listingId}`,
              inquiryMessage: message
            })
          }
        } catch (emailError) {
          console.error('Failed to send inquiry confirmation email:', emailError)
          // Don't fail the inquiry if email fails
        }
      }

      if (!notificationResult?.success) {
        return NextResponse.json(
          {
            success: false,
            inquirySaved: true,
            inquiryId: data?.id,
            error: 'Your request was saved, but the email notification could not be delivered.'
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        data,
        notification: {
          sent: true,
          provider: notificationResult.provider,
          statusCode: notificationResult.statusCode
        }
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { path = [] } = await params
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  try {
    const supabase = await getSupabaseClient()

    if (path[0] === 'saved-searches' && id) {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
