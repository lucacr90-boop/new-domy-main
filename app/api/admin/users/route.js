import { NextResponse } from 'next/server'
import { isAdminEmail, requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getCreatedAt(record) {
  return record?.createdAt || record?.created_at || null
}

function normalizeProfile(profile = {}, authUser = null) {
  const email = profile.email || authUser?.email || null
  const name =
    profile.name ||
    profile.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.user_metadata?.full_name ||
    email?.split('@')[0] ||
    'User'

  return {
    id: profile.id || authUser?.id,
    name,
    email,
    role: isAdminEmail(email) ? 'admin' : profile.role || 'user',
    createdAt: getCreatedAt(profile) || authUser?.created_at || null,
    updatedAt: profile.updatedAt || profile.updated_at || null
  }
}

async function countByUser(admin, table, userId, columns = ['user_id', 'userId']) {
  for (const column of columns) {
    const { count, error } = await admin
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(column, userId)

    if (!error) return count || 0

    const message = String(error.message || '').toLowerCase()
    if (!message.includes(column.toLowerCase()) && !message.includes('does not exist')) {
      return 0
    }
  }

  return 0
}

async function listAllAuthUsers(admin) {
  const users = []
  let page = 1
  const perPage = 100

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const batch = data?.users || []
    users.push(...batch)
    if (batch.length < perPage) break
    page += 1
  }

  return users
}

export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const admin = getSupabaseAdminClient()
    const [authUsers, profilesResult] = await Promise.all([
      listAllAuthUsers(admin),
      admin.from('profiles').select('*')
    ])

    if (profilesResult.error) {
      return NextResponse.json(
        { error: 'Failed to load profiles', details: profilesResult.error.message },
        { status: 500 }
      )
    }

    const profilesById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]))
    const authUsersById = new Map(authUsers.map((user) => [user.id, user]))
    const ids = new Set([...profilesById.keys(), ...authUsersById.keys()])

    const users = Array.from(ids)
      .map((id) => normalizeProfile(profilesById.get(id), authUsersById.get(id)))
      .filter((user) => user.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    const statsEntries = await Promise.all(users.map(async (user) => {
      const [
        favorites,
        savedSearches,
        inquiries,
        forms,
        webinars,
        documents
      ] = await Promise.all([
        countByUser(admin, 'favorites', user.id),
        countByUser(admin, 'saved_searches', user.id),
        countByUser(admin, 'inquiries', user.id),
        countByUser(admin, 'client_intake_forms', user.id),
        countByUser(admin, 'webinar_registrations', user.id),
        countByUser(admin, 'document_access_logs', user.id)
      ])

      return [user.id, { favorites, savedSearches, inquiries, forms, webinars, documents }]
    }))

    return access.applyCookies(
      NextResponse.json({
        users,
        stats: Object.fromEntries(statsEntries)
      })
    )
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to load users', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const userId = String(body?.userId || '').trim()
    const role = String(body?.role || '').trim()

    if (!userId || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data: authUserData } = await admin.auth.admin.getUserById(userId)
    const authUser = authUserData?.user

    const profilePayload = {
      id: userId,
      role,
      name:
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.full_name ||
        authUser?.email?.split('@')[0] ||
        'User'
    }

    const { data, error } = await admin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user role', details: error.message },
        { status: 500 }
      )
    }

    return access.applyCookies(
      NextResponse.json({
        success: true,
        user: normalizeProfile(data, authUser)
      })
    )
  } catch (error) {
    console.error('Admin users role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    )
  }
}
