// ============================================
// Admin Outlets API - Get All Outlets
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const outlets = await prisma.outlet.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        machineId: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: outlets,
    })
  } catch (error) {
    console.error('[Admin Outlets API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outlets' },
      { status: 500 }
    )
  }
}
