// ============================================
// Photo Compositing Utility
// Canvas sesuai dimensi frame (1080x1920 untuk FRAME 4/5, 1200x1800 untuk Korean dll)
// Slot menggunakan koordinat yang sesuai dengan canvas size
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

// ============================================
// Slot definitions
// ============================================

// Slot original untuk frame Ramadan (FRAME 4.png, FRAME 5.png) — 1080x1920
const RAMADAN_SLOTS: PhotoSlot[] = [
  { x: 0, y: 245, width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
  { x: 580, y: 245, width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
  { x: 0, y: 680, width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
  { x: 580, y: 670, width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
  { x: 0, y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
  { x: 580, y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
]

export function generateRamadanFrameSlots(): PhotoSlot[] {
  return RAMADAN_SLOTS.map(s => ({ ...s }))
}

export function generateGenericFrameSlots(): PhotoSlot[] {
  // Frame 1200x1800
  // Header area (judul frame): ~200px dari atas
  // Footer area (teks bawah): ~150px dari bawah
  // Padding kiri-kanan: ~60px
  // Gap antar slot: ~20px
  // 2 kolom, 3 baris

  const W = 1200
  const H = 1800
  const PAD_X = 60      // padding kiri dan kanan
  const PAD_TOP = 200   // header frame (judul/dekorasi atas)
  const PAD_BOT = 150   // footer frame (teks/dekorasi bawah)
  const GAP_X = 20      // jarak horizontal antar kolom
  const GAP_Y = 20      // jarak vertikal antar baris
  const cr = 20         // corner radius

  const colW = Math.floor((W - PAD_X * 2 - GAP_X) / 2)
  const rowH = Math.floor((H - PAD_TOP - PAD_BOT - GAP_Y * 2) / 3)

  const slots: PhotoSlot[] = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      slots.push({
        x: PAD_X + col * (colW + GAP_X),
        y: PAD_TOP + row * (rowH + GAP_Y),
        width: colW,
        height: rowH,
        cornerRadius: cr,
        photoIndex: row,
      })
    }
  }
  return slots
}

function getDimensionsForFrame(frameImageUrl: string) {
  const url = frameImageUrl.toLowerCase()
  if (url.includes('frame 4') || url.includes('frame 5') ||
      url.includes('frame4') || url.includes('frame5') ||
      url.includes('ramad')) {
    return { width: 1080, height: 1920 }
  }
  return { width: 1200, height: 1800 }
}

// ============================================
// CORS-safe image loader
// ============================================

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    // Base64 data URL — load langsung tanpa crossOrigin
    if (src.startsWith('data:')) {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
      return
    }

    // File dari server — fetch as blob dulu biar tidak taint canvas
    try {
      const res = await fetch(src, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        reject(new Error(`Failed to load: ${src}`))
      }
      img.src = blobUrl
    } catch (err) {
      reject(err)
    }
  })
}

// ============================================
// Canvas drawing helpers
// ============================================

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

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
}

// ============================================
// Main composite function
// ============================================

/**
 * Composite photos ke frame template
 * Canvas menggunakan dimensi dari options (outputWidth x outputHeight)
 */
export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, outputWidth, outputHeight, filter } = options

  const dims = getDimensionsForFrame(frameImageUrl)
  const cw = dims.width
  const ch = dims.height

  console.log(`[composite] START canvas=${cw}x${ch} slots=${slots.length} photos=${photos.length}`)

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // STEP 1: White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, cw, ch)

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
  ctx.drawImage(frameImg, 0, 0, cw, ch)

  const result = canvas.toDataURL('image/jpeg', 0.92)
  console.log(`[composite] DONE result len=${result.length}`)

  // Validasi: canvas tainted akan menghasilkan dataURL terlalu kecil
  if (result.length < 50000) {
    throw new Error(`Canvas tainted — result too small (${result.length} bytes)`)
  }

  return result
}

// ============================================
// Public API
// ============================================

/**
 * Composite ke frame — otomatis deteksi ukuran frame dari URL
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

  // Deteksi tipe frame dari URL
  const dims = getDimensionsForFrame(frameImageUrl)
  const useGeneric = dims.width === 1200

  const outputWidth = _outputWidth || dims.width
  const outputHeight = _outputHeight || dims.height
  const slots = useGeneric ? generateGenericFrameSlots() : RAMADAN_SLOTS

  console.log(`[compositeToFrame] detected: ${dims.width}x${dims.height}`)

  return compositePhotosToFrame({
    frameImageUrl,
    slots,
    photos,
    outputWidth,
    outputHeight,
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
  const dims = getDimensionsForFrame(frameImageUrl)
  const canvasW = dims.width
  const canvasH = dims.height
  const useGeneric = dims.width === 1200
  const slots = useGeneric ? generateGenericFrameSlots() : RAMADAN_SLOTS

  const aspectRatio = canvasW / canvasH
  const maxHeight = Math.round(maxWidth / aspectRatio)

  const scaledSlots = slots.map(s => ({
    ...s,
    x: Math.round((s.x / canvasW) * maxWidth),
    y: Math.round((s.y / canvasH) * maxHeight),
    width: Math.round((s.width / canvasW) * maxWidth),
    height: Math.round((s.height / canvasH) * maxHeight),
    cornerRadius: Math.round((s.cornerRadius / canvasW) * maxWidth),
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

  for (const slot of scaledSlots) {
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
