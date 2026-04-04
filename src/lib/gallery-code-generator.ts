// ============================================
// Gallery Code Generator Utility
// Generates unique gallery codes for new photo sessions
// ============================================

import { prisma } from '@/lib/db/prisma'

/**
 * Generate a unique gallery code
 * Format: 3 letters + 3 numbers (e.g., ABC123, XYZ789)
 */
export async function generateUniqueGalleryCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    // Generate 3 random letters
    const letters = Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    // Generate 3 random numbers
    const nums = Array.from({ length: 3 }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    ).join('')

    const code = letters + nums

    // Check if code already exists
    const existing = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: code },
    })

    if (!existing) {
      return code
    }

    attempts++
  }

  // Fallback: use timestamp-based code if random generation fails
  const timestamp = Date.now().toString().slice(-6)
  const fallbackCode = 'GAL' + timestamp

  // Double-check fallback code doesn't exist
  const existingFallback = await prisma.sessionPhoto.findUnique({
    where: { galleryCode: fallbackCode },
  })

  if (!existingFallback) {
    return fallbackCode
  }

  // Ultimate fallback: add random suffix
  return fallbackCode + Math.floor(Math.random() * 100)
}

/**
 * Check if a gallery code is available
 */
export async function isGalleryCodeAvailable(code: string): Promise<boolean> {
  const existing = await prisma.sessionPhoto.findUnique({
    where: { galleryCode: code },
  })
  return !existing
}

/**
 * Create a new photo session with unique gallery code
 */
export async function createNewPhotoSession(outletId: string, frameId?: string) {
  const galleryCode = await generateUniqueGalleryCode()

  const session = await prisma.sessionPhoto.create({
    data: {
      outletId,
      frameId,
      sessionCode: `SESSION-${galleryCode}-001`,
      status: 'CAPTURING',
      photos: JSON.stringify([]), // Start with empty array
      totalPrice: 0, // Will be updated when payment is made
      paymentMethod: null,
      paymentStatus: 'PENDING',
      galleryCode,
      galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return session
}
