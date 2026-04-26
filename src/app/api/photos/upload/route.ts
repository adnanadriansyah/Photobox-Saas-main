// ============================================
// Local File Upload API Route
// Saves photos to public/photos folder for local demo
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/db/prisma'
import { createNewPhotoSession } from '@/lib/gallery-code-generator'

// Configure upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'photos')

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Parse multipart form data
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

    // If no gallery code provided, create new session
    if (!targetGalleryCode) {
      if (!machineId) {
        return NextResponse.json(
          { success: false, error: 'machineId is required when no galleryCode provided' },
          { status: 400 }
        )
      }

      // Find outlet by machineId
      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
      })

      if (!outlet) {
        return NextResponse.json(
          { success: false, error: 'Outlet not found for machineId' },
          { status: 404 }
        )
      }

      // Create new session
      const newSession = await createNewPhotoSession(outlet.id)
      targetGalleryCode = newSession.galleryCode
      targetSessionId = newSession.id
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${targetGalleryCode}-${timestamp}.${extension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/photos folder
    const filepath = path.join(UPLOAD_DIR, filename)
    await writeFile(filepath, buffer)

    // Return the public URL path
    const photoUrl = `/photos/${filename}`

    console.log('[Local Storage] Photo saved:', photoUrl)

    return NextResponse.json({
      success: true,
      url: photoUrl,
      filename,
      galleryCode: targetGalleryCode,
      sessionId: targetSessionId,
    })
  } catch (error) {
    console.error('[Local Storage] Upload error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// ============================================
// Upload Multiple Photos (Burst Mode)
// ============================================

export async function PUT(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

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

    // If no gallery code provided, create new session
    if (!targetGalleryCode) {
      if (!machineId) {
        return NextResponse.json(
          { success: false, error: 'machineId is required when no galleryCode provided' },
          { status: 400 }
        )
      }

      // Find outlet by machineId
      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
      })

      if (!outlet) {
        return NextResponse.json(
          { success: false, error: 'Outlet not found for machineId' },
          { status: 404 }
        )
      }

      // Create new session
      const newSession = await createNewPhotoSession(outlet.id)
      targetGalleryCode = newSession.galleryCode
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const filename = `${targetGalleryCode}-${i + 1}-${timestamp}.${extension}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filepath = path.join(UPLOAD_DIR, filename)
      await writeFile(filepath, buffer)

      uploadedUrls.push(`/photos/${filename}`)
    }

    console.log('[Local Storage] Multiple photos saved:', uploadedUrls)

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      galleryCode: targetGalleryCode,
    })
  } catch (error) {
    console.error('[Local Storage] Multiple upload error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// ============================================
// Delete Photo (Cleanup)
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'No filename provided' },
        { status: 400 }
      )
    }

    // Security: Only allow photos in the photos directory
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const filepath = path.join(UPLOAD_DIR, filename)

    // Check if file exists before deletion
    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises')
      await unlink(filepath)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'File not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[Local Storage] Delete error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
