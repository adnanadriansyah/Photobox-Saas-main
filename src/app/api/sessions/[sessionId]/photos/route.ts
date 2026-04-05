// ============================================
// Update Session Photos API
// Updates photos for a completed session
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { photos, status, paymentStatus, totalPrice } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Update session with photos
    const updatedSession = await prisma.sessionPhoto.update({
      where: { id: sessionId },
      data: {
        photos: JSON.stringify(photos),
        status: status || 'COMPLETED',
        paymentStatus: paymentStatus || 'COMPLETED',
        totalPrice: totalPrice || 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: updatedSession.id,
        galleryCode: updatedSession.galleryCode,
        photos: JSON.parse(updatedSession.photos),
      },
    })
  } catch (error) {
    console.error('[Update Session Photos API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session photos' },
      { status: 500 }
    )
  }
}