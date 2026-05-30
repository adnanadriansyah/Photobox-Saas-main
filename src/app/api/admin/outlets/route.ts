// ============================================
// Admin Outlets API - Full CRUD
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (id) {
      const outlet = await prisma.outlet.findUnique({ where: { id } })
      if (!outlet) {
        return NextResponse.json({ success: false, error: 'Outlet not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: outlet })
    }

    const outlets = await prisma.outlet.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: outlets,
    })
  } catch (error) {
    console.error('[Admin Outlets API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outlets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const tenant = await prisma.tenant.findFirst({ where: { isActive: true } })
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'No active tenant' }, { status: 400 })
    }

    const outlet = await prisma.outlet.create({
      data: {
        tenantId: tenant.id,
        name: body.name,
        address: body.address || body.location,
        phone: body.phone,
        latitude: body.latitude,
        longitude: body.longitude,
        mapsUrl: body.mapsUrl,
        status: body.status || 'online',
        machineId: body.machineId || `MACH-${Date.now()}`,
        isActive: body.isActive ?? true,
      }
    })

    return NextResponse.json({ success: true, data: outlet }, { status: 201 })
  } catch (error) {
    console.error('[Admin Outlets API] POST error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Outlet id is required' }, { status: 400 })
    }

    const body = await request.json()

    const payload: Record<string, any> = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.address !== undefined) payload.address = body.address
    if (body.location !== undefined) payload.address = body.location
    if (body.phone !== undefined) payload.phone = body.phone
    if (body.latitude !== undefined) payload.latitude = body.latitude
    if (body.longitude !== undefined) payload.longitude = body.longitude
    if (body.mapsUrl !== undefined) payload.mapsUrl = body.mapsUrl
    if (body.status !== undefined) payload.status = body.status
    if (body.machineId !== undefined) payload.machineId = body.machineId
    if (body.isActive !== undefined) payload.isActive = body.isActive

    const outlet = await prisma.outlet.update({
      where: { id },
      data: payload
    })

    return NextResponse.json({ success: true, data: outlet })
  } catch (error) {
    console.error('[Admin Outlets API] PUT error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Outlet id is required' }, { status: 400 })
    }

    await prisma.outlet.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Outlets API] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
