import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const ADMIN_EMAILS = new Set([
  'luca.croce@domyvitalii.cz',
  'lucie@domyvitalii.cz'
])

export function isAdminEmail(email) {
  return ADMIN_EMAILS.has(String(email || '').trim().toLowerCase())
}

async function loadProfileWithSessionClient(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) return null
  return data || null
}

async function loadProfileWithAdminClient(userId) {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('id, name, role')
      .eq('id', userId)
      .maybeSingle()

    if (error) return null
    return data || null
  } catch {
    return null
  }
}

export async function getAdminAccess() {
  const { supabase, applyCookies } = await createRouteSupabaseClient()

  if (!supabase) {
    return {
      ok: false,
      reason: 'unconfigured',
      supabase,
      applyCookies
    }
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return {
      ok: false,
      reason: 'unauthenticated',
      supabase,
      applyCookies
    }
  }

  const profile =
    (await loadProfileWithSessionClient(supabase, user.id)) ||
    (await loadProfileWithAdminClient(user.id))

  const emailAdmin = isAdminEmail(user.email)

  if (!emailAdmin && profile?.role !== 'admin') {
    return {
      ok: false,
      reason: 'forbidden',
      user,
      profile,
      supabase,
      applyCookies
    }
  }

  return {
    ok: true,
    user,
    profile: emailAdmin && profile?.role !== 'admin'
      ? { ...(profile || {}), role: 'admin' }
      : profile,
    supabase,
    applyCookies
  }
}

export async function requireAdminApiAccess() {
  const access = await getAdminAccess()

  if (access.ok) {
    return access
  }

  if (access.reason === 'unconfigured') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Auth is not configured on server' },
        { status: 503 }
      )
    }
  }

  if (access.reason === 'unauthenticated') {
    return {
      ok: false,
      response: access.applyCookies(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }
  }

  return {
    ok: false,
    response: access.applyCookies(
      NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    )
  }
}
