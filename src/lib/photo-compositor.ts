// ============================================
// Photo Compositing Utility
// Canvas selalu 1080x1920, frame di-stretch ke ukuran itu
// Slot menggunakan koordinat original (hardcoded untuk 1080x1920)
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

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      console.log(`[loadImage] OK ${src.substring(0, 40)}... (${img.naturalWidth}x${img.naturalHeight})`)
      resolve(img)
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 80)}`))
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

/**
 * Draw photo into slot with "cover" fit (crop to fill, centered)
 * Handles any aspect ratio (landscape/portrait/square)
 */
function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot
): void {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = slot.width / slot.height

  let drawWidth: number
  let drawHeight: number
  let offsetX: number
  let offsetY: number

  if (imgRatio > slotRatio) {
    // Photo lebih lebar dari slot → fit by height, crop horizontal
    drawHeight = slot.height
    drawWidth = img.naturalWidth * (drawHeight / img.naturalHeight)
    offsetX = slot.x - (drawWidth - slot.width) / 2
    offsetY = slot.y
  } else {
    // Photo lebih tinggi dari slot → fit by width, crop vertikal
    drawWidth = slot.width
    drawHeight = img.naturalHeight * (drawWidth / img.naturalWidth)
    offsetX = slot.x
    offsetY = slot.y - (drawHeight - slot.height) / 2
  }

  console.log(`  [drawPhoto] slot=(${slot.x},${slot.y} ${slot.width}x${slot.height}) img=${img.naturalWidth}x${img.naturalHeight} draw=(${Math.round(offsetX)},${Math.round(offsetY)} ${Math.round(drawWidth)}x${Math.round(drawHeight)})`)
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
}

// Slot original untuk frame 1080x1920
// Posisi ini cocok dengan "jendela transparan" di file FRAME 4.png dan FRAME 5.png
const ORIGINAL_SLOTS: PhotoSlot[] = [
  { x: 0, y: 245, width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
  { x: 580, y: 245, width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
  { x: 0, y: 680, width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
  { x: 580, y: 670, width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
  { x: 0, y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
  { x: 580, y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
]

export function generateRamadanFrameSlots(): PhotoSlot[] {
  return ORIGINAL_SLOTS.map(s => ({ ...s }))
}

/**
 * Composite photos ke frame template
 * Canvas selalu 1080x1920, frame di-stretch, slot original
 */
export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, filter } = options

  console.log(`[composite] START canvas=1080x1920 slots=${slots.length} photos=${photos.length}`)

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // STEP 1: White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // STEP 2: Load frame
  console.log('[composite] Loading frame...')
  const frameImg = await loadImage(frameImageUrl)
  console.log(`[composite] Frame=${frameImg.naturalWidth}x${frameImg.naturalHeight}`)

  // STEP 3: Load photos
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < photos.length; i++) {
    if (photos[i] && photos[i].length > 100) {
      console.log(`[composite] Loading photo ${i}: len=${photos[i].length}`)
      try {
        loadedPhotos[i] = await loadImage(photos[i])
      } catch (error) {
        console.error(`[composite] Photo ${i} load failed:`, error)
        loadedPhotos[i] = null
      }
    } else {
      console.warn(`[composite] Photo ${i} invalid (len=${photos[i]?.length})`)
      loadedPhotos[i] = null
    }
  }

  const loadedCount = loadedPhotos.filter(Boolean).length
  console.log(`[composite] Photos loaded: ${loadedCount}/${photos.length}`)

  // STEP 4: Draw photos ke slot
  for (let si = 0; si < slots.length; si++) {
    const slot = slots[si]
    const photo = loadedPhotos[slot.photoIndex]

    if (!photo) {
      console.warn(`[composite] Slot ${si}: NO PHOTO for index ${slot.photoIndex}`)
      continue
    }

    console.log(`[composite] Slot ${si}: drawing photoIndex=${slot.photoIndex} at (${slot.x},${slot.y} ${slot.width}x${slot.height})`)
    ctx.save()
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()
    if (filter && filter !== 'none') ctx.filter = filter
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }

  // STEP 5: Frame di ATAS foto
  console.log('[composite] Drawing frame overlay...')
  ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  const result = canvas.toDataURL('image/jpeg', 0.95)
  console.log(`[composite] DONE result len=${result.length}`)

  return result
}

/**
 * Composite ke frame — selalu pake canvas 1080x1920
 */
export async function compositeToFrame(
  frameImageUrl: string,
  photos: string[],
  _outputWidth?: number,
  _outputHeight?: number,
  filter?: string
): Promise<string> {
  console.log(`[compositeToFrame] frame=${frameImageUrl.substring(0, 60)} photos=${photos.length}`)

  if (!photos || photos.length === 0) {
    throw new Error('No photos to composite')
  }

  return compositePhotosToFrame({
    frameImageUrl,
    slots: ORIGINAL_SLOTS,
    photos,
    outputWidth: CANVAS_WIDTH,
    outputHeight: CANVAS_HEIGHT,
    filter,
  })
}

/** Legacy alias */
export async function compositeToRamadanFrame(
  frameImageUrl: string,
  photos: string[],
  _outputWidth?: number,
  _outputHeight?: number,
  filter?: string
): Promise<string> {
  return compositeToFrame(frameImageUrl, photos, _outputWidth, _outputHeight, filter)
}

/**
 * Thumbnail preview
 */
export async function generateCompositeThumbnail(
  frameImageUrl: string,
  photos: string[],
  maxWidth: number = 400,
  filter?: string
): Promise<string> {
  const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT
  const maxHeight = Math.round(maxWidth / aspectRatio)

  const slots = ORIGINAL_SLOTS.map(s => ({
    ...s,
    x: Math.round((s.x / CANVAS_WIDTH) * maxWidth),
    y: Math.round((s.y / CANVAS_HEIGHT) * maxHeight),
    width: Math.round((s.width / CANVAS_WIDTH) * maxWidth),
    height: Math.round((s.height / CANVAS_HEIGHT) * maxHeight),
    cornerRadius: Math.round((s.cornerRadius / CANVAS_WIDTH) * maxWidth),
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
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try { loadedPhotos[i] = await loadImage(photos[i]) } catch { loadedPhotos[i] = null }
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
    if (filter && filter !== 'none') ctx.filter = filter
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }

  ctx.drawImage(frameImg, 0, 0, maxWidth, maxHeight)

  return canvas.toDataURL('image/jpeg', 0.9)
}
