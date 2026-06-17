// ============================================
// Photo Compositing Utility
// Composites captured photos into frame template
// with dynamic slot positions based on frame image size
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

/**
 * Load an image and return it as an HTMLImageElement
 * Skips crossOrigin for base64 data URLs to avoid tainted canvas errors
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      console.log(`[loadImage] Loaded: ${src.substring(0, 60)} (${img.naturalWidth}x${img.naturalHeight})`)
      resolve(img)
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 100)}`))
    img.src = src
  })
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
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

// Slot ratios based on original 1080x1920 Ramadan frame layout
// These are the proportional positions of the frame's transparent "windows"
const SLOT_RATIOS = [
  // Row 1
  { x: 0 / 1080, y: 245 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 0 },
  { x: 580 / 1080, y: 245 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 0 },
  // Row 2
  { x: 0 / 1080, y: 680 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 1 },
  { x: 580 / 1080, y: 670 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 1 },
  // Row 3
  { x: 0 / 1080, y: 1120 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 2 },
  { x: 580 / 1080, y: 1120 / 1920, w: 500 / 1080, h: 420 / 1920, photoIndex: 2 },
]

/**
 * Generate slot positions dynamically based on actual frame image dimensions
 * Uses proportional ratios derived from the original 1080x1920 Ramadan frame
 */
export function generateFrameSlots(frameWidth: number, frameHeight: number): PhotoSlot[] {
  const cornerRadius = Math.round(30 * (frameWidth / 1080))

  return SLOT_RATIOS.map(slot => ({
    x: Math.round(slot.x * frameWidth),
    y: Math.round(slot.y * frameHeight),
    width: Math.round(slot.w * frameWidth),
    height: Math.round(slot.h * frameHeight),
    cornerRadius,
    photoIndex: slot.photoIndex,
  }))
}

/**
 * Legacy - kept for backward compatibility
 * Uses fixed 1080x1920 dimensions
 */
export function generateRamadanFrameSlots(): PhotoSlot[] {
  return generateFrameSlots(1080, 1920)
}

/**
 * Composite captured photos into frame template
 * Draw order: white bg → photos (clipped to rounded rects) → frame PNG on top
 */
export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, outputWidth, outputHeight, filter } = options

  console.log(`[compositePhotosToFrame] output=${outputWidth}x${outputHeight}, slots=${slots.length}, photos=${photos.length}`)

  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')!

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // STEP 1: White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, outputWidth, outputHeight)

  // STEP 2: Load frame image
  const frameImg = await loadImage(frameImageUrl)

  // STEP 3: Load all photos
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try {
        loadedPhotos[i] = await loadImage(photos[i])
      } catch (error) {
        console.error(`[compositePhotosToFrame] Failed to load photo ${i}:`, error)
        loadedPhotos[i] = null
      }
    } else {
      loadedPhotos[i] = null
    }
  }

  console.log(`[compositePhotosToFrame] Loaded ${loadedPhotos.filter(Boolean).length}/${photos.length} photos`)

  // STEP 4: Draw all photos into slots with rounded clip
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

  // STEP 5: Draw frame template on top
  ctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight)

  const result = canvas.toDataURL('image/jpeg', 0.95)
  console.log(`[compositePhotosToFrame] Done, result length: ${result.length}`)

  return result
}

/**
 * Smart compositing that detects frame image dimensions and computes slot positions dynamically
 */
export async function compositeToFrame(
  frameImageUrl: string,
  photos: string[],
  outputWidth?: number,
  outputHeight?: number,
  filter?: string
): Promise<string> {
  console.log(`[compositeToFrame] frameImageUrl=${frameImageUrl.substring(0, 60)}, photos=${photos.length}`)

  const frameImg = await loadImage(frameImageUrl)

  const w = outputWidth || frameImg.naturalWidth || frameImg.width || 1080
  const h = outputHeight || frameImg.naturalHeight || frameImg.height || 1920

  console.log(`[compositeToFrame] Frame dimensions: ${frameImg.naturalWidth}x${frameImg.naturalHeight}, canvas=${w}x${h}`)

  const slots = generateFrameSlots(w, h)

  return compositePhotosToFrame({
    frameImageUrl,
    slots,
    photos,
    outputWidth: w,
    outputHeight: h,
    filter,
  })
}

/**
 * Legacy - kept for backward compatibility
 */
export async function compositeToRamadanFrame(
  frameImageUrl: string,
  photos: string[],
  _outputWidth: number = 1080,
  _outputHeight: number = 1920,
  filter?: string
): Promise<string> {
  return compositeToFrame(frameImageUrl, photos, _outputWidth, _outputHeight, filter)
}

/**
 * Generate a thumbnail preview of the composite
 */
export async function generateCompositeThumbnail(
  frameImageUrl: string,
  photos: string[],
  maxWidth: number = 400,
  filter?: string
): Promise<string> {
  const frameImg = await loadImage(frameImageUrl)
  const frameW = frameImg.naturalWidth || frameImg.width || 1080
  const frameH = frameImg.naturalHeight || frameImg.height || 1920

  const aspectRatio = frameW / frameH
  const maxHeight = Math.round(maxWidth / aspectRatio)

  const fullSlots = generateFrameSlots(frameW, frameH)
  const slots = fullSlots.map(slot => ({
    ...slot,
    x: Math.round((slot.x / frameW) * maxWidth),
    y: Math.round((slot.y / frameH) * maxHeight),
    width: Math.round((slot.width / frameW) * maxWidth),
    height: Math.round((slot.height / frameH) * maxHeight),
    cornerRadius: Math.round((slot.cornerRadius / frameW) * maxWidth),
  }))

  const canvas = document.createElement('canvas')
  canvas.width = maxWidth
  canvas.height = maxHeight
  const ctx = canvas.getContext('2d')!

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, maxWidth, maxHeight)

  const frameImgThumb = await loadImage(frameImageUrl)

  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try {
        loadedPhotos[i] = await loadImage(photos[i])
      } catch {
        loadedPhotos[i] = null
      }
    } else {
      loadedPhotos[i] = null
    }
  }

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

  ctx.drawImage(frameImgThumb, 0, 0, maxWidth, maxHeight)

  return canvas.toDataURL('image/jpeg', 0.9)
}
