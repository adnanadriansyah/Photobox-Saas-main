// ============================================
// Admin API - Add Gallery Code Manually
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const { galleryCode, photos, outletId, frameId, totalPrice = 25000 } = await request.json()

    if (!galleryCode || !photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { success: false, error: 'Gallery code and photos array are required' },
        { status: 400 }
      )
    }

    // Cek apakah gallery code sudah ada
    const existingSession = await prisma.sessionPhoto.findUnique({
      where: { galleryCode },
    })

    if (existingSession) {
      return NextResponse.json(
        { success: false, error: 'Gallery code already exists' },
        { status: 409 }
      )
    }

    // Ambil outlet default jika tidak dispecify
    let targetOutletId = outletId
    if (!targetOutletId) {
      const defaultOutlet = await prisma.outlet.findFirst({
        where: { machineId: 'BOOTH-ACEH-001' },
      })
      targetOutletId = defaultOutlet?.id
    }

    if (!targetOutletId) {
      return NextResponse.json(
        { success: false, error: 'No outlet found' },
        { status: 404 }
      )
    }

    // Buat session baru
    const newSession = await prisma.sessionPhoto.create({
      data: {
        outletId: targetOutletId,
        frameId: frameId || 'frame-4r-classic-001',
        sessionCode: `SESSION-${galleryCode}-001`,
        status: 'COMPLETED',
        photos: JSON.stringify(photos),
        totalPrice,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED',
        galleryCode,
        galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newSession.id,
        galleryCode: newSession.galleryCode,
        photos: JSON.parse(newSession.photos),
        createdAt: newSession.createdAt,
      },
    })
  } catch (error) {
    console.error('[Admin Gallery API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery' },
      { status: 500 }
    )
  }
}

// GET - List all galleries (for admin)
export async function GET(request: NextRequest) {
  try {
    const sessions = await prisma.sessionPhoto.findMany({
      include: {
        outlet: true,
        frame: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50
    })

    const galleries = sessions.map((session: any) => ({
      id: session.id,
      galleryCode: session.galleryCode,
      photos: JSON.parse(session.photos || '[]'),
      status: session.status,
      outlet: session.outlet.name,
      frame: session.frame?.name || 'No Frame',
      totalPrice: session.totalPrice,
      createdAt: session.createdAt,
      expiresAt: session.galleryExpiresAt,
    }))

    return NextResponse.json({
      success: true,
      data: galleries,
    })
  } catch (error) {
    console.error('[Admin Gallery API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch galleries' },
      { status: 500 }
    )
  }
}
