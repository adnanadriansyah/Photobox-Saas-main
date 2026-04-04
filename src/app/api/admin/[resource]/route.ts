import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const resourceMap: Record<string, string> = {
  tenants: 'tenant',
  outlets: 'outlet',
  outletConfigs: 'outletConfig',
  users: 'user',
  frameTemplates: 'frameTemplate',
  sessionPhotos: 'sessionPhoto',
  vouchers: 'voucher',
  transactions: 'transaction',
  boothHeartbeats: 'boothHeartbeat',
  galleryQueues: 'galleryQueue',
  testimonials: 'testimonial',
  brandAssets: 'brandAsset',
  apiKeys: 'apiKey',
}

const allowedFilters = [
  'id',
  'tenantId',
  'outletId',
  'sessionId',
  'machineId',
  'galleryCode',
  'code',
  'email',
  'sessionCode',
  'transactionRef',
]

function getModel(resource: string) {
  return resourceMap[resource]
}

function buildWhere(searchParams: URLSearchParams) {
  const where: Record<string, any> = {}
  for (const key of allowedFilters) {
    const value = searchParams.get(key)
    if (!value) continue

    if (key === 'id' || key.endsWith('Id')) {
      where[key] = value
      continue
    }

    if (key === 'transactionRef' || key === 'sessionCode' || key === 'galleryCode' || key === 'machineId' || key === 'code' || key === 'email') {
      where[key] = value
      continue
    }
  }
  return where
}

async function normalizePayload(resource: string, payload: any) {
  if (resource === 'users') {
    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, 10)
      delete payload.password
    }
    delete payload.passwordConfirm
  }

  if (resource === 'sessionPhotos' && payload.photos && !Array.isArray(payload.photos)) {
    payload.photos = JSON.parse(payload.photos)
  }

  return payload
}

export async function GET(request: NextRequest, { params }: { params: { resource: string } }) {
  const modelName = getModel(params.resource)
  if (!modelName) {
    return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const where = buildWhere(url.searchParams)
    const prismaClient = (prisma as any)[modelName] as any

    if (id) {
      const record = await prismaClient.findUnique({ where: { id } })
      return NextResponse.json({ success: true, data: record })
    }

    const records = await prismaClient.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('[Admin API] GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { resource: string } }) {
  const modelName = getModel(params.resource)
  if (!modelName) {
    return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const prismaClient = (prisma as any)[modelName] as any
    const payload = await normalizePayload(params.resource, body)

    const record = await prismaClient.create({ data: payload })
    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { resource: string } }) {
  const modelName = getModel(params.resource)
  if (!modelName) {
    return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Resource id is required' }, { status: 400 })
    }

    const body = await request.json()
    const prismaClient = (prisma as any)[modelName] as any
    const payload = await normalizePayload(params.resource, body)

    const record = await prismaClient.update({ where: { id }, data: payload })
    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('[Admin API] PUT error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { resource: string } }) {
  const modelName = getModel(params.resource)
  if (!modelName) {
    return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Resource id is required' }, { status: 400 })
    }

    const prismaClient = (prisma as any)[modelName] as any
    await prismaClient.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] DELETE error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
