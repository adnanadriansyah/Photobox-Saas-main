// ============================================
// Gallery API - Fetch Photos by Gallery Code
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Gallery code is required' },
        { status: 400 }
      )
    }

    // Find session by gallery code
    const session = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: code },
      include: {
        outlet: true,
        frame: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Check if gallery has expired
    if (session.galleryExpiresAt && new Date() > session.galleryExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'Gallery has expired' },
        { status: 410 }
      )
    }

    // Parse photos array
    let photos: string[] = []
    try {
      photos = JSON.parse(session.photos)
    } catch {
      photos = []
    }

    return NextResponse.json({
      success: true,
      data: {
        code: session.galleryCode,
        photos,
        gifUrl: session.gifUrl,
        newspaperUrl: session.newspaperUrl,
        outlet: {
          name: session.outlet.name,
          location: session.outlet.address,
        },
        createdAt: session.createdAt,
        expiresAt: session.galleryExpiresAt,
      },
    })
  } catch (error) {
    console.error('[Gallery API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}
