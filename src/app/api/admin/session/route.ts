import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAuthCookieName, verifyAuthToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getAuthCookieName())?.value
    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 })
    }

    let payload
    try {
      payload = verifyAuthToken(token)
    } catch (error) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ success: true, authenticated: true, user })
  } catch (error) {
    console.error('[Admin Session] error:', error)
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 })
  }
}
