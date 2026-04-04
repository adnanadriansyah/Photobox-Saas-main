// ============================================
// Start New Photo Session API
// Creates a new session with unique gallery code
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createNewPhotoSession } from '@/lib/gallery-code-generator'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const { outletId, frameId, machineId } = await request.json()

    if (!outletId && !machineId) {
      return NextResponse.json(
        { success: false, error: 'outletId or machineId is required' },
        { status: 400 }
      )
    }

    let targetOutletId = outletId

    // If machineId provided, find outlet by machineId
    if (machineId && !outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
      })

      if (!outlet) {
        return NextResponse.json(
          { success: false, error: 'Outlet not found for machineId' },
          { status: 404 }
        )
      }

      targetOutletId = outlet.id
    }

    // Create new session
    const session = await createNewPhotoSession(targetOutletId, frameId)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionCode: session.sessionCode,
        galleryCode: session.galleryCode,
        galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery?code=${session.galleryCode}`,
        expiresAt: session.galleryExpiresAt,
      },
    })
  } catch (error) {
    console.error('[New Session API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create new session' },
      { status: 500 }
    )
  }
}
