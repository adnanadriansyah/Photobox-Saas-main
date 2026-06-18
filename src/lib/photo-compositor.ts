// ============================================
// Photo Compositing Utility - FIXED v4
// Koordinat slot diukur langsung dari pixel frame PNG
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
// Slot definitions — diukur dari pixel scan frame PNG
// ============================================

/**
 * Frame Ramadan (FRAME 4.png / FRAME 5.png) — canvas 1080x1920
 */
export function generateRamadanFrameSlots(): PhotoSlot[] {
  return [
    { x: 0,   y: 245,  width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
    { x: 580, y: 245,  width: 500, height: 420, cornerRadius: 30, photoIndex: 0 },
    { x: 0,   y: 680,  width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
    { x: 580, y: 670,  width: 500, height: 420, cornerRadius: 30, photoIndex: 1 },
    { x: 0,   y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
    { x: 580, y: 1120, width: 500, height: 420, cornerRadius: 30, photoIndex: 2 },
  ]
}

/**
 * Frame baru (beach/retro/floral/night/nature/korean) — canvas 1200x1800
 * Koordinat diukur langsung dari pixel scan frame PNG:
 * Col 0: x=51,  width=501  (51 to 552)
 * Col 1: x=641, width=501  (641 to 1142)
 * Row 0: y=222, height=376 (222 to 598)
 * Row 1: y=617, height=376 (617 to 993)
 * Row 2: y=1012,height=376 (1012 to 1388)
 */
export function generateGenericFrameSlots(): PhotoSlot[] {
  return [
    { x: 51,  y: 222,  width: 501, height: 376, cornerRadius: 0, photoIndex: 0 },
    { x: 641, y: 222,  width: 501, height: 376, cornerRadius: 0, photoIndex: 0 },
    { x: 51,  y: 617,  width: 501, height: 376, cornerRadius: 0, photoIndex: 1 },
    { x: 641, y: 617,  width: 501, height: 376, cornerRadius: 0, photoIndex: 1 },
    { x: 51,  y: 1012, width: 501, height: 376, cornerRadius: 0, photoIndex: 2 },
    { x: 641, y: 1012, width: 501, height: 376, cornerRadius: 0, photoIndex: 2 },
  ]
}

function getDimensionsForFrame(frameImageUrl: string): { width: number; height: number } {
  const url = frameImageUrl.toLowerCase()
  if (
    url.includes('frame 4') || url.includes('frame 5') ||
    url.includes('frame4') || url.includes('frame5') ||
    url.includes('ramad')
  ) {
    return { width: 1080, height: 1920 }
  }
  return { width: 1200, height: 1800 }
}

function getSlotsForFrame(frameImageUrl: string): PhotoSlot[] {
  const url = frameImageUrl.toLowerCase()
  if (
    url.includes('frame 4') || url.includes('frame 5') ||
    url.includes('frame4') || url.includes('frame5') ||
    url.includes('ramad')
  ) {
    return generateRamadanFrameSlots()
  }
  return generateGenericFrameSlots()
}

// ============================================
// CORS-safe image loader
// Fetch as blob dulu → tidak taint canvas
// ============================================
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    // Base64 data URL — load langsung
    if (src.startsWith('data:')) {
      const img = new Image()
      img.onload = () => {
        console.log(`[loadImage] base64 OK ${img.naturalWidth}x${img.naturalHeight}`)
        resolve(img)
      }
      img.onerror = (e) => reject(new Error(`base64 load failed: ${e}`))
      img.src = src
      return
    }

    // URL server → fetch blob dulu (bypass CORS taint)
    try {
      const res = await fetch(src, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        console.log(`[loadImage] url OK ${img.naturalWidth}x${img.naturalHeight} — ${src}`)
        URL.revokeObjectURL(blobUrl)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        reject(new Error(`blob load failed: ${src}`))
      }
      img.src = blobUrl
    } catch (err) {
      reject(err)
    }
  })
}

// ============================================
// Canvas helpers
// ============================================

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  if (r <= 0) {
    ctx.rect(x, y, w, h)
    return
  }
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot
): void {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = slot.width / slot.height

  let dw: number, dh: number, ox: number, oy: number

  if (imgRatio > slotRatio) {
    // Foto lebih lebar → fit height, crop kiri-kanan
    dh = slot.height
    dw = img.naturalWidth * (dh / img.naturalHeight)
    ox = slot.x - (dw - slot.width) / 2
    oy = slot.y
  } else {
    // Foto lebih tinggi → fit width, crop atas-bawah
    dw = slot.width
    dh = img.naturalHeight * (dw / img.naturalWidth)
    ox = slot.x
    oy = slot.y - (dh - slot.height) / 2
  }

  ctx.drawImage(img, ox, oy, dw, dh)
}

// ============================================
// Core compositor
// ============================================

export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, filter } = options
  const { width: cw, height: ch } = getDimensionsForFrame(frameImageUrl)

  console.log(`[composite] canvas=${cw}x${ch} slots=${slots.length} photos=${photos.length}`)

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, cw, ch)

  // Load frame
  const frameImg = await loadImage(frameImageUrl)

  // Load photos
  const validPhotos = photos.filter(p => p && p.length > 10)
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < validPhotos.length; i++) {
    try {
      loadedPhotos[i] = await loadImage(validPhotos[i])
    } catch (err) {
      console.error(`[composite] photo ${i} failed:`, err)
      loadedPhotos[i] = null
    }
  }

  console.log(`[composite] loaded ${loadedPhotos.filter(Boolean).length}/${validPhotos.length} photos`)

  // Draw photos into slots
  for (let si = 0; si < slots.length; si++) {
    const slot = slots[si]
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) {
      console.warn(`[composite] slot ${si} no photo for index ${slot.photoIndex}`)
      continue
    }
    console.log(`[composite] slot ${si} → photo[${slot.photoIndex}] at x=${slot.x} y=${slot.y} ${slot.width}x${slot.height}`)

    ctx.save()
    ctx.beginPath()
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()
    if (filter && filter !== 'none') ctx.filter = filter
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }

  // Draw frame ON TOP of photos
  ctx.drawImage(frameImg, 0, 0, cw, ch)

  // Export
  let result: string
  try {
    result = canvas.toDataURL('image/jpeg', 0.92)
  } catch (e) {
    throw new Error(`Canvas tainted — toDataURL failed: ${e}`)
  }

  console.log(`[composite] result length=${result.length}`)
  if (result.length < 50000) {
    throw new Error(`Result too small (${result.length}) — canvas likely tainted`)
  }

  return result
}

// ============================================
// Public API
// ============================================

export async function compositeToRamadanFrame(
  frameImageUrl: string,
  photos: string[],
  _outputWidth?: number,
  _outputHeight?: number,
  filter?: string
): Promise<string> {
  const validPhotos = photos.filter(Boolean)
  if (validPhotos.length === 0) throw new Error('No valid photos')

  console.log(`[compositeToRamadanFrame] frame=${frameImageUrl} photos=${validPhotos.length}`)

  const slots = getSlotsForFrame(frameImageUrl)
  const dims = getDimensionsForFrame(frameImageUrl)

  return compositePhotosToFrame({
    frameImageUrl,
    slots,
    photos: validPhotos,
    outputWidth: dims.width,
    outputHeight: dims.height,
    filter,
  })
}

// Alias
export const compositeToFrame = compositeToRamadanFrame

export async function generateCompositeThumbnail(
  frameImageUrl: string,
  photos: string[],
  maxWidth: number = 400,
  filter?: string
): Promise<string> {
  const validPhotos = photos.filter(Boolean)
  if (validPhotos.length === 0) throw new Error('No valid photos')

  const dims = getDimensionsForFrame(frameImageUrl)
  const maxHeight = Math.round(maxWidth * dims.height / dims.width)
  const scaleX = maxWidth / dims.width
  const scaleY = maxHeight / dims.height

  const slots = getSlotsForFrame(frameImageUrl).map(s => ({
    ...s,
    x: Math.round(s.x * scaleX),
    y: Math.round(s.y * scaleY),
    width: Math.round(s.width * scaleX),
    height: Math.round(s.height * scaleY),
    cornerRadius: Math.round(s.cornerRadius * scaleX),
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
    try { loadedPhotos[i] = await loadImage(validPhotos[i]) } catch { loadedPhotos[i] = null }
  }

  for (const slot of slots) {
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) continue
    ctx.save()
    ctx.beginPath()
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