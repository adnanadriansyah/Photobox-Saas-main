// ============================================
// Photo Compositing Utility - FIXED VERSION
// ============================================

export interface PhotoSlot {
  x: number
  y: number
  width: number
  height: number
  cornerRadius: number
  photoIndex: number
}

export interface CompositingOptions {
  frameImageUrl: string
  slots: PhotoSlot[]
  photos: string[]
  outputWidth: number
  outputHeight: number
  filter?: string
}

const TEMPLATE_WIDTH = 1080
const TEMPLATE_HEIGHT = 1920

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    // For base64 data URLs, no need for crossOrigin
    if (src.startsWith('data:')) {
      img.crossOrigin = ''
    }
    img.src = src
  })
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot
): void {
  const imgRatio = img.width / img.height
  const slotRatio = slot.width / slot.height

  let drawWidth: number
  let drawHeight: number
  let offsetX: number
  let offsetY: number

  if (imgRatio > slotRatio) {
    drawHeight = slot.height
    drawWidth = img.width * (drawHeight / img.height)
    offsetX = slot.x - (drawWidth - slot.width) / 2
    offsetY = slot.y
  } else {
    drawWidth = slot.width
    drawHeight = img.height * (drawWidth / img.width)
    offsetX = slot.x
    offsetY = slot.y - (drawHeight - slot.height) / 2
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
}

// ============================================
// SLOT DEFINITIONS — per frame type
// All values relative to 1080x1920 canvas
// ============================================

/**
 * Ramadan frame slots (original, hardcoded positions)
 */
export function generateRamadanFrameSlots(): PhotoSlot[] {
  const cr = 30
  return [
    { x: 0,   y: 245,  width: 500, height: 420, cornerRadius: cr, photoIndex: 0 },
    { x: 580, y: 245,  width: 500, height: 420, cornerRadius: cr, photoIndex: 0 },
    { x: 0,   y: 680,  width: 500, height: 420, cornerRadius: cr, photoIndex: 1 },
    { x: 580, y: 670,  width: 500, height: 420, cornerRadius: cr, photoIndex: 1 },
    { x: 0,   y: 1120, width: 500, height: 420, cornerRadius: cr, photoIndex: 2 },
    { x: 580, y: 1120, width: 500, height: 420, cornerRadius: cr, photoIndex: 2 },
  ]
}

/**
 * Generic 2x3 grid slots for new frames (beach, retro, floral, night, nature, korean)
 * These frames follow a consistent layout:
 *   - Header area: top ~135px (scaled from 38/450 * 1920)
 *   - Footer area: bottom ~188px (scaled from 44/450 * 1920 - but we use 130px here)  
 *   - Left/right padding: ~50px each side
 *   - 2 columns, 3 rows, with ~27px gap between
 * 
 * Preview canvas was 300x450, output is 1080x1920 → scale = 3.6×
 * PAD=14*3.6=50, GAP=8*3.6=29, TOP=38*3.6=137, BOT=44*3.6=158
 * colW = (1080 - 50*2 - 29) / 2 = 475.5 ≈ 475
 * rowH = (1920 - 137 - 158 - 29*2) / 3 = 523
 */
export function generateGenericFrameSlots(): PhotoSlot[] {
  const PAD = 50
  const GAP = 29
  const TOP = 137
  const BOT = 158
  const cr = 30

  const colW = Math.floor((TEMPLATE_WIDTH - PAD * 2 - GAP) / 2)
  const rowH = Math.floor((TEMPLATE_HEIGHT - TOP - BOT - GAP * 2) / 3)

  const slots: PhotoSlot[] = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      slots.push({
        x: PAD + col * (colW + GAP),
        y: TOP + row * (rowH + GAP),
        width: colW,
        height: rowH,
        cornerRadius: cr,
        photoIndex: row, // row 0→photo 0, row 1→photo 1, row 2→photo 2
      })
    }
  }
  return slots
}

/**
 * Pick the right slots based on frame URL
 */
function getSlotsForFrame(frameImageUrl: string): PhotoSlot[] {
  const url = frameImageUrl.toLowerCase()
  // Ramadan frames use the original slot layout
  if (url.includes('frame 4') || url.includes('frame 5') || url.includes('frame4') || url.includes('frame5') || url.includes('ramad')) {
    return generateRamadanFrameSlots()
  }
  // All new themed frames (beach, retro, floral, night, nature, korean)
  return generateGenericFrameSlots()
}

// ============================================
// Core compositor
// ============================================

export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, filter } = options

  const canvas = document.createElement('canvas')
  canvas.width = TEMPLATE_WIDTH
  canvas.height = TEMPLATE_HEIGHT
  const ctx = canvas.getContext('2d')!

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT)

  // Load frame
  const frameImg = await loadImage(frameImageUrl)

  // Load photos — filter out empty strings
  const validPhotos = photos.filter(Boolean)
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < validPhotos.length; i++) {
    try {
      loadedPhotos[i] = await loadImage(validPhotos[i])
    } catch (err) {
      console.error(`Failed to load photo ${i}:`, err)
      loadedPhotos[i] = null
    }
  }

  // Draw photos into slots
  for (const slot of slots) {
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) continue

    ctx.save()
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()

    if (filter && filter !== 'none') {
      ctx.filter = filter
    }
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }

  // Draw frame on top
  ctx.drawImage(frameImg, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT)

  return canvas.toDataURL('image/jpeg', 0.95)
}

// ============================================
// Main export — auto-detects correct slots
// ============================================

export async function compositeToRamadanFrame(
  frameImageUrl: string,
  photos: string[],
  outputWidth: number = TEMPLATE_WIDTH,
  outputHeight: number = TEMPLATE_HEIGHT,
  filter?: string
): Promise<string> {
  // Filter out nulls/empty
  const validPhotos = photos.filter(Boolean)
  if (validPhotos.length === 0) {
    throw new Error('No valid photos to composite')
  }

  const slots = getSlotsForFrame(frameImageUrl)

  return compositePhotosToFrame({
    frameImageUrl,
    slots,
    photos: validPhotos,
    outputWidth: TEMPLATE_WIDTH,
    outputHeight: TEMPLATE_HEIGHT,
    filter,
  })
}

// ============================================
// Thumbnail preview (same logic, smaller canvas)
// ============================================

export async function generateCompositeThumbnail(
  frameImageUrl: string,
  photos: string[],
  maxWidth: number = 400,
  filter?: string
): Promise<string> {
  const validPhotos = photos.filter(Boolean)
  if (validPhotos.length === 0) throw new Error('No valid photos')

  const aspectRatio = TEMPLATE_WIDTH / TEMPLATE_HEIGHT
  const maxHeight = Math.round(maxWidth / aspectRatio)
  const scaleX = maxWidth / TEMPLATE_WIDTH
  const scaleY = maxHeight / TEMPLATE_HEIGHT

  const slots = getSlotsForFrame(frameImageUrl).map(slot => ({
    ...slot,
    x: Math.round(slot.x * scaleX),
    y: Math.round(slot.y * scaleY),
    width: Math.round(slot.width * scaleX),
    height: Math.round(slot.height * scaleY),
    cornerRadius: Math.round(slot.cornerRadius * scaleX),
  }))

  const canvas = document.createElement('canvas')
  canvas.width = maxWidth
  canvas.height = maxHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, maxWidth, maxHeight)

  const frameImg = await loadImage(frameImageUrl)
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < validPhotos.length; i++) {
    try {
      loadedPhotos[i] = await loadImage(validPhotos[i])
    } catch {
      loadedPhotos[i] = null
    }
  }

  for (const slot of slots) {
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) continue
    ctx.save()
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()
    if (filter && filter !== 'none') ctx.filter = filter
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }

  ctx.drawImage(frameImg, 0, 0, maxWidth, maxHeight)
  return canvas.toDataURL('image/jpeg', 0.9)
}