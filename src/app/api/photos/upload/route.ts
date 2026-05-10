// ============================================
// Photo Upload API Route
// Saves photos to Supabase Storage
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db/prisma'
import { createNewPhotoSession } from '@/lib/gallery-code-generator'

export const dynamic = 'force-dynamic'

// Supabase admin client (service role - server side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'photos'

// ============================================
// POST - Upload Single Photo
// ============================================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const sessionId = formData.get('sessionId') as string
    const galleryCode = formData.get('galleryCode') as string
    const machineId = formData.get('machineId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    let targetGalleryCode = galleryCode
    let targetSessionId = sessionId

    // Kalau tidak ada gallery code, buat session baru
    if (!targetGalleryCode) {
      if (!machineId) {
        return NextResponse.json(
          { success: false, error: 'machineId is required when no galleryCode provided' },
          { status: 400 }
        )
      }

      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
      })

      if (!outlet) {
        return NextResponse.json(
          { success: false, error: 'Outlet not found for machineId' },
          { status: 404 }
        )
      }

      const newSession = await createNewPhotoSession(outlet.id)
      targetGalleryCode = newSession.galleryCode
      targetSessionId = newSession.id
    }

    // Generate filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${targetGalleryCode}-${timestamp}.${extension}`
    const storagePath = `sessions/${targetGalleryCode}/${filename}`

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Supabase Storage] Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    console.log('[Supabase Storage] Photo saved:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      galleryCode: targetGalleryCode,
      sessionId: targetSessionId,
    })
  } catch (error) {
    console.error('[Supabase Storage] Upload error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Upload Multiple Photos (Burst Mode)
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('photos') as File[]
    const galleryCode = formData.get('galleryCode') as string
    const machineId = formData.get('machineId') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    let targetGalleryCode = galleryCode

    if (!targetGalleryCode) {
      if (!machineId) {
        return NextResponse.json(
          { success: false, error: 'machineId is required when no galleryCode provided' },
          { status: 400 }
        )
      }

      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
      })

      if (!outlet) {
        return NextResponse.json(
          { success: false, error: 'Outlet not found for machineId' },
          { status: 404 }
        )
      }

      const newSession = await createNewPhotoSession(outlet.id)
      targetGalleryCode = newSession.galleryCode
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const filename = `${targetGalleryCode}-${i + 1}-${timestamp}.${extension}`
      const storagePath = `sessions/${targetGalleryCode}/${filename}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error(`[Supabase Storage] Error uploading file ${i + 1}:`, uploadError)
        continue // skip file yang gagal, lanjut ke berikutnya
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

      uploadedUrls.push(publicUrl)
    }

    console.log('[Supabase Storage] Multiple photos saved:', uploadedUrls)

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      galleryCode: targetGalleryCode,
    })
  } catch (error) {
    console.error('[Supabase Storage] Multiple upload error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Hapus Photo
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('filename')
    const galleryCode = request.nextUrl.searchParams.get('galleryCode')

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'No filename provided' },
        { status: 400 }
      )
    }

    if (filename.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const storagePath = galleryCode
      ? `sessions/${galleryCode}/${filename}`
      : `sessions/${filename}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath])

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Supabase Storage] Delete error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}