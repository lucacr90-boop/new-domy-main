import { NextResponse } from 'next/server'
import { getAdminAccess } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const access = await getAdminAccess()

  if (!access.ok) {
    const status =
      access.reason === 'unauthenticated'
        ? 401
        : access.reason === 'unconfigured'
          ? 503
          : 403

    return access.applyCookies(
      NextResponse.json({ admin: false, reason: access.reason }, { status })
    )
  }

  return access.applyCookies(
    NextResponse.json({
      admin: true,
      user: {
        id: access.user.id,
        email: access.user.email
      },
      profile: access.profile
        ? {
            id: access.profile.id,
            name: access.profile.name,
            role: access.profile.role
          }
        : null
    })
  )
}
