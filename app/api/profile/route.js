import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAdminEmail } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function createRouteClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, applyCookies: (response) => response }
  }

  const cookieStore = await cookies()
  const pendingCookies = []

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          pendingCookies.push(cookie)
        }
      }
    }
  })

  const applyCookies = (response) => {
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }
    return response
  }

  return { supabase, applyCookies }
}

async function ensureAuthenticatedUser(supabase) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

function buildProfileFromUser(user) {
  return {
    id: user.id,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User',
    role: isAdminEmail(user.email) ? 'admin' : 'user'
  }
}

function withEffectiveRole(profile, user) {
  if (!profile) return profile
  return {
    ...profile,
    role: isAdminEmail(user?.email) ? 'admin' : profile.role
  }
}

export async function POST() {
  try {
    const { supabase, applyCookies } = await createRouteClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const user = await ensureAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return applyCookies(
        NextResponse.json({
          success: true,
          message: 'Profile already exists',
          profile: withEffectiveRole(existingProfile, user)
        })
      )
    }

    const profileData = buildProfileFromUser(user)
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (createError) {
      return applyCookies(
        NextResponse.json(
          {
            error: 'Failed to create profile',
            details: createError.message
          },
          { status: 500 }
        )
      )
    }

    return applyCookies(
      NextResponse.json({
        success: true,
        message: 'Profile created successfully',
        profile: createdProfile
      })
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { supabase, applyCookies } = await createRouteClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const user = await ensureAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return applyCookies(
        NextResponse.json(
          {
            error: 'Failed to fetch profile',
            details: profileError.message
          },
          { status: 500 }
        )
      )
    }

    if (!profile) {
      return POST()
    }

    return applyCookies(
      NextResponse.json({
        success: true,
        profile: withEffectiveRole(profile, user)
      })
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
