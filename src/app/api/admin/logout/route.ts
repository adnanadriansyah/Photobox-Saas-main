import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookieName } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(getAuthCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
    sameSite: 'lax',
  })
  return response
}
