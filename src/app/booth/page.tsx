'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useBoothStore, usePaymentStore, type Photo, type Template } from '@/lib/stores/booth-store'
import {
  CameraView,
  Countdown,
  ShutterButton,
  PaymentSelector,
  QrisDisplay,
  PhotoPreview,
  OfflineBanner,
  SessionTimer,
  TemplateSelector,
  BoothGuide,
  BoothLayout,
  PrintUpsellModal,
  CompletedScreen,
  ProcessingScreen,
} from '@/components/booth/BoothComponents'
import { sendGalleryNotification } from '@/lib/whatsapp-service'
import { compositeToFrame } from '@/lib/photo-compositor'
import { useRouter } from 'next/navigation'

// ============================================
// Demo Templates
// ============================================

const demoTemplates: Template[] = [
  {
    id: 'ramadhan-1',
    name: 'Ramadhan Kareem',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 5.png',
    thumbnailUrl: '/photos/FRAME 5.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'ramadhan-2',
    name: 'Eid Mubarak',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 4.png',
    thumbnailUrl: '/photos/FRAME 4.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'ramadhan-3',
    name: 'Lantern Night',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 5.png',
    thumbnailUrl: '/photos/FRAME 5.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-korean',
    name: 'Korean Style',
    theme: 'Korea',
    imageUrl: '/photos/frame-korean-1200x1800.png',
    thumbnailUrl: '/photos/frame-korean-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-nature',
    name: 'Natural',
    theme: 'Nature',
    imageUrl: '/photos/frame-nature-1200x1800.png',
    thumbnailUrl: '/photos/frame-nature-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-night',
    name: 'Night Sky',
    theme: 'Night',
    imageUrl: '/photos/frame-night-1200x1800.png',
    thumbnailUrl: '/photos/frame-night-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-floral',
    name: 'Floral',
    theme: 'Flowers',
    imageUrl: '/photos/frame-floral-1200x1800.png',
    thumbnailUrl: '/photos/frame-floral-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-beach',
    name: 'Beach',
    theme: 'Beach',
    imageUrl: '/photos/frame-beach-1200x1800.png',
    thumbnailUrl: '/photos/frame-beach-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'frame-retro',
    name: 'Retro',
    theme: 'Retro',
    imageUrl: '/photos/frame-retro-1200x1800.png',
    thumbnailUrl: '/photos/frame-retro-1200x1800.png',
    slots: 6,
    layout: 'grid-2x3',
  },
]

// ============================================
// Demo Config
// ============================================

const demoConfig = {
  outletId: 'demo-outlet',
  outletName: 'SnapNext Demo',
  machineId: 'BOOTH-ACEH-001',
  printEnabled: true,
  galleryEnabled: true,
  gifEnabled: false,
  newspaperEnabled: false,
  defaultPrice: 50000,
  paymentMethods: {
    qris: true,
    voucher: true,
    event: true,
  },
  countdownDuration: 8,
  burstCount: 3,
  gifFrames: 0,
  sessionTimeout: 540,
}

// ============================================
// Main Booth Page
// ============================================

export default function BoothPage() {
  const router = useRouter()
  const {
    session,
    config,
    startSession,
    setCountdown,
    addPhoto,
    setProcessing,
    setPreview,
    setPayment,
    setPaymentStatus,
    setCompleted,
    resetSession,
    setFrame,
    setOffline,
    setCustomerPhone,
    startSessionTimer,
    stopSessionTimer,
    decrementSessionTimer,
    setTemplate,
    setTemplateSelection,
    setPrinting,
    setPrintCopies,
    setTransactionRef,
    setSelectedFilter,
  } = useBoothStore()

  const { qrisString, setQrisString, clearQris, setQrisPolling, applyVoucher, clearVoucher } = usePaymentStore()

  const [showQrisModal, setShowQrisModal] = useState(false)
  const [showPrintUpsell, setShowPrintUpsell] = useState(false)
  const [showAdditionalPayment, setShowAdditionalPayment] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCountdown, setCaptureCountdown] = useState(8)
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize session on mount
  useEffect(() => {
    if (!session.code) {
      startSession(demoConfig.outletId)
    }
  }, [])

  // Handle network status
  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  // Global Session Timer
  useEffect(() => {
    if (session.sessionTimerActive && session.sessionTimer > 0) {
      timerRef.current = setInterval(() => {
        decrementSessionTimer()
      }, 1000)
    } else if (session.sessionTimerActive && session.sessionTimer <= 0) {
      handleSessionTimeout()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session.sessionTimerActive, session.sessionTimer, decrementSessionTimer])

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    stopSessionTimer()
    setCapturedPhotos([])
    setIsCapturing(false)
    setCaptureCountdown(8)
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        status: 'payment',
        sessionTimerActive: false,
        sessionTimer: 540,
        photos: [],
        currentPhotoIndex: 0,
        paymentStatus: 'pending',
      },
    }))
  }, [stopSessionTimer])

  // Burst Capture countdown ticker
  useEffect(() => {
    if (isCapturing && session.status === 'capturing') {
      if (captureCountdown > 0) {
        captureTimerRef.current = setTimeout(() => {
          setCaptureCountdown(captureCountdown - 1)
        }, 1000)
      } else {
        console.log('Photo capture triggered at countdown 0')
      }
    }
    return () => {
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current)
    }
  }, [isCapturing, captureCountdown, session.status])

  // ============================================
  // handlePhotoCapture — single state update + store sync
  // ============================================
  const handlePhotoCapture = useCallback((photo: Photo) => {
    console.log(`[handlePhotoCapture] Photo captured: ${photo.id.substring(0, 8)}`)

    setCapturedPhotos(prev => {
      const newPhotos = [...prev]
      const nullIndex = newPhotos.findIndex(p => p === null)

      if (nullIndex !== -1) {
        newPhotos[nullIndex] = photo
      } else {
        newPhotos.push(photo)
      }

      const validPhotos = newPhotos.filter(Boolean)
      console.log(`[handlePhotoCapture] Valid: ${validPhotos.length}/3`)

      // Sync ke Zustand store langsung
      useBoothStore.setState(state => ({
        session: {
          ...state.session,
          photos: validPhotos,
          currentPhotoIndex: validPhotos.length,
        }
      }))

      return newPhotos
    })

    // Baca latest capturedPhotos untuk cek count (pakai setTimeout biar state update selesai)
    setTimeout(() => {
      setCapturedPhotos(prev => {
        const count = prev.filter(Boolean).length
        if (count >= 3) {
          console.log('[handlePhotoCapture] All 3 photos done, stopping capture')
          setIsCapturing(false)
        } else {
          setCaptureCountdown(demoConfig.countdownDuration)
        }
        return prev
      })
    }, 0)
  }, [])

  // Handle payment selection
  const handlePaymentSelect = async (method: 'qris' | 'voucher' | 'event') => {
    setPayment(method)

    if (method === 'event') {
      setPaymentStatus('paid')
      startSessionTimer()
      setTemplateSelection()
    } else if (method === 'qris') {
      try {
        const response = await fetch('/api/payment/qris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: demoConfig.defaultPrice,
            orderId: session.code,
            customerPhone: session.customerPhone,
          }),
        })
        const data = await response.json()
        if (data.success) {
          setQrisString(data.qrString, new Date(data.expiresAt), data.transactionRef)
          setTransactionRef(data.transactionRef)
          setShowQrisModal(true)
          setQrisPolling(true)
          startPaymentPolling(data.transactionRef)
        }
      } catch (error) {
        console.error('QRIS generation failed:', error)
        const demoQris = `demo://qris?amount=${demoConfig.defaultPrice}&order=${session.code}`
        setQrisString(demoQris, new Date(Date.now() + 30 * 60 * 1000), `DEMO-${session.code}`)
        setTransactionRef(`DEMO-${session.code}`)
        setShowQrisModal(true)
      }
    } else if (method === 'voucher') {
      setPaymentStatus('paid')
      startSessionTimer()
      setTemplateSelection()
    }
  }

  const startPaymentPolling = (transactionRef: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status?ref=${transactionRef}`)
        const data = await response.json()
        if (data.status === 'success') {
          clearInterval(pollInterval)
          setPaymentStatus('paid')
          setQrisPolling(false)
          setShowQrisModal(false)
          clearQris()
          startSessionTimer()
          setTemplateSelection()
        } else if (data.status === 'failed') {
          clearInterval(pollInterval)
          setPaymentStatus('failed')
          setQrisPolling(false)
        }
      } catch (error) {
        console.error('Payment polling error:', error)
      }
    }, 3000)
    setTimeout(() => {
      clearInterval(pollInterval)
      setQrisPolling(false)
    }, 5 * 60 * 1000)
  }

  const handleQrisConfirm = () => {
    setPaymentStatus('paid')
    setQrisPolling(false)
    setShowQrisModal(false)
    clearQris()
    startSessionTimer()
    setTemplateSelection()
  }

  const handleQrisCancel = () => {
    setShowQrisModal(false)
    setQrisPolling(false)
    clearQris()
    setPaymentStatus('pending')
  }

  const handleTemplateSelect = (template: Template) => {
    setTemplate(template)
    startSessionTimer()
    useBoothStore.getState().setGuide()
  }

  const handleGuideStart = () => {
    useBoothStore.getState().setCapturing()
  }

  const handleStartCapture = () => {
    setIsCapturing(true)
    setCaptureCountdown(8)
  }

  const handleRetake = () => {
    setCapturedPhotos([])
    setIsCapturing(false)
    setCaptureCountdown(8)
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        photos: [],
        currentPhotoIndex: 0,
        status: 'capturing',
      },
    }))
  }

  const handleRetakePhoto = (index: number) => {
    setCapturedPhotos(prev => {
      const newPhotos = [...prev]
      newPhotos[index] = null as unknown as Photo

      const validPhotos = newPhotos.filter(Boolean)
      useBoothStore.setState(state => ({
        session: {
          ...state.session,
          photos: validPhotos,
          currentPhotoIndex: validPhotos.length,
        }
      }))

      return newPhotos
    })
  }

  // ============================================
  // handleFinishCapture — baca dari store, fallback ke local state
  // ============================================
  const handleFinishCapture = () => {
    console.log('[handleFinishCapture] Called')

    // Baca dari Zustand store (di-sync oleh handlePhotoCapture)
    let photosForProcessing = useBoothStore.getState().session.photos.filter(p => p)

    if (photosForProcessing.length === 0) {
      console.warn('[handleFinishCapture] Store empty, trying local capturedPhotos')
      photosForProcessing = capturedPhotos.filter(p => p)
    }

    if (photosForProcessing.length === 0) {
      console.error('[handleFinishCapture] No photos available anywhere!')
      return
    }

    console.log(`[handleFinishCapture] ${photosForProcessing.length} photos ready`)

    // Sync final state ke store
    useBoothStore.setState(state => ({
      session: {
        ...state.session,
        photos: photosForProcessing,
        currentPhotoIndex: photosForProcessing.length,
      }
    }))

    setProcessing()
    setTimeout(() => setPreview(), 2000)
  }

  // ============================================
  // Upload & Complete Session
  // ============================================
  const uploadPhotosAndComplete = async () => {
    try {
      const validPhotos = session.photos.filter(p => p && (p.url || p.base64))

      if (validPhotos.length === 0) {
        console.error('[upload] No valid photos to upload — store session.photos:', session.photos.length)
        session.photos.forEach((p, i) => console.error(`[upload] photo[${i}]:`, { id: p.id, hasUrl: !!p.url, hasBase64: !!p.base64, urlPrefix: p.url?.substring(0, 30) }))
        return null
      }

      console.log(`[upload] ${validPhotos.length} valid photos, template:`, session.template?.name)

      const photoUrls = validPhotos.map(p => p.url || p.base64 || '').filter(Boolean)
      console.log(`[upload] photoUrls[0] prefix: ${photoUrls[0]?.substring(0, 40)} (len=${photoUrls[0]?.length})`)

      let compositeBase64: string | null = null

      if (session.template?.imageUrl) {
        try {
          console.log(`[upload] Composite start: frame=${session.template.imageUrl}`)
          compositeBase64 = await compositeToFrame(
            session.template.imageUrl,
            photoUrls,
            undefined,
            undefined,
            session.selectedFilter && session.selectedFilter !== 'none'
              ? session.selectedFilter
              : undefined
          )
          console.log('[upload] Composite generated OK, length:', compositeBase64.length)
        } catch (error) {
          console.error('[upload] Composite failed:', error)
        }
      } else {
        console.error('[upload] No template.imageUrl!')
      }

      const uploadedUrls: string[] = []

      if (compositeBase64) {
        try {
          const base64Data = compositeBase64.split(',')[1]
          const byteCharacters = atob(base64Data)
          const byteArray = new Uint8Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i)
          }
          const blob = new Blob([byteArray], { type: 'image/jpeg' })
          const formData = new FormData()
          formData.append('photo', blob, `composite-${Date.now()}.jpg`)
          formData.append('machineId', demoConfig.machineId)

          const uploadResponse = await fetch('/api/photos/upload', { method: 'POST', body: formData })
          const uploadResult = await uploadResponse.json()

          if (uploadResult.success) {
            uploadedUrls.push(uploadResult.url)
            console.log('Composite uploaded:', uploadResult.url)
          } else {
            console.error('Composite upload failed:', uploadResult.error)
          }
        } catch (error) {
          console.error('Error uploading composite:', error)
        }
      }

      // Fallback: upload raw photos
      if (uploadedUrls.length === 0) {
        for (const photo of validPhotos) {
          try {
            let blob: Blob
            if (photo.base64 && photo.base64.startsWith('data:')) {
              const base64Data = photo.base64.split(',')[1]
              const byteArray = new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)))
              blob = new Blob([byteArray], { type: 'image/jpeg' })
            } else if (photo.url) {
              const response = await fetch(photo.url)
              blob = await response.blob()
            } else {
              continue
            }

            const formData = new FormData()
            formData.append('photo', blob, `photo-${Date.now()}.jpg`)
            formData.append('machineId', demoConfig.machineId)

            const uploadResponse = await fetch('/api/photos/upload', { method: 'POST', body: formData })
            const uploadResult = await uploadResponse.json()

            if (uploadResult.success) {
              uploadedUrls.push(uploadResult.url)
            } else {
              console.error('Upload failed:', uploadResult.error)
            }
          } catch (error) {
            console.error('Error uploading photo:', error)
          }
        }
      }

      if (uploadedUrls.length === 0) {
        console.error('No photos were successfully uploaded')
        return null
      }

      // Create session in DB
      const sessionResponse = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: demoConfig.machineId }),
      })
      const sessionData = await sessionResponse.json()

      if (!sessionData.success) {
        console.error('Failed to create session:', sessionData.error)
        return null
      }

      const { sessionId, galleryCode } = sessionData.data

      const updateResponse = await fetch(`/api/sessions/${sessionId}/photos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: uploadedUrls,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          totalPrice: demoConfig.defaultPrice,
        }),
      })
      const updateResult = await updateResponse.json()

      if (updateResult.success) {
        console.log('Session completed with gallery code:', galleryCode)
        return galleryCode
      } else {
        console.error('Failed to update session:', updateResult.error)
        return null
      }
    } catch (error) {
      console.error('Error in uploadPhotosAndComplete:', error)
      return null
    }
  }

  // Handle print
  const handlePrint = async () => {
    if (session.photos.length >= 3 && session.template) {
      setPrinting()
      setShowPrintUpsell(false)

      try {
        const photoUrls = session.photos.map(p => p.url || p.base64 || '').filter(Boolean)
        const compositeUrl = await compositeToFrame(
          session.template.imageUrl,
          photoUrls,
          undefined,
          undefined,
          session.selectedFilter && session.selectedFilter !== 'none' ? session.selectedFilter : undefined
        )

        const response = await fetch('/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compositeUrl,
            copies: session.printCopies || 1,
          }),
        })
        const result = await response.json()
        if (result.success) {
          console.log('Print sent successfully:', result.message)
        } else {
          console.error('Print failed:', result.error)
        }
      } catch (error) {
        console.error('Print error:', error)
      }

      setTimeout(async () => {
        const galleryCode = await uploadPhotosAndComplete()
        const finalCode = galleryCode || generateGalleryCode()
        setCompleted(finalCode)

        if (session.customerPhone) {
          sendGalleryNotification({
            phoneNumber: session.customerPhone,
            outletName: demoConfig.outletName,
            galleryCode: finalCode,
            galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery?code=${finalCode}`,
            photoCount: session.photos.length,
          })
        }
      }, 1500)
    }
  }

  const handleUpdateCopies = (copies: number) => {
    setPrintCopies(copies)
  }

  const handlePrintConfirm = () => {
    if (session.printCopies > 1) {
      setShowAdditionalPayment(true)
    } else {
      handlePrint()
    }
  }

  const handleAdditionalPaymentComplete = () => {
    setShowAdditionalPayment(false)
    setShowPrintUpsell(false)
    handlePrint()
  }

  const handlePrintCancel = async () => {
    setShowPrintUpsell(false)
    setShowAdditionalPayment(false)
    const galleryCode = await uploadPhotosAndComplete()
    const finalCode = galleryCode || generateGalleryCode()
    setCompleted(finalCode)

    if (session.customerPhone) {
      sendGalleryNotification({
        phoneNumber: session.customerPhone,
        outletName: demoConfig.outletName,
        galleryCode: finalCode,
        galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery?code=${finalCode}`,
        photoCount: session.photos.length,
      })
    }
  }

  const handleDone = () => {
    resetSession()
    stopSessionTimer()
    setCapturedPhotos([])
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        status: 'payment',
        paymentMethod: null,
        paymentStatus: 'pending',
        photos: [],
        currentPhotoIndex: 0,
        galleryCode: undefined,
      },
    }))
  }

  const generateGalleryCode = () => {
    return `${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  }

  return (
    <div className="min-h-screen bg-black">
      <OfflineBanner />

      <SessionTimer
        seconds={session.sessionTimer}
        active={session.sessionTimerActive}
      />

      {session.status === 'payment' && (
        <PaymentSelector
          totalPrice={demoConfig.defaultPrice}
          onSelect={handlePaymentSelect}
          config={demoConfig.paymentMethods}
          customerPhone={session.customerPhone || ''}
          onPhoneChange={setCustomerPhone}
        />
      )}

      {showQrisModal && qrisString && (
        <QrisDisplay
          qrString={qrisString}
          amount={demoConfig.defaultPrice}
          onComplete={handleQrisConfirm}
          onCancel={handleQrisCancel}
        />
      )}

      {session.status === 'template-selection' && (
        <TemplateSelector
          templates={demoTemplates}
          onSelect={handleTemplateSelect}
          sessionTimerActive={session.sessionTimerActive}
          sessionTimerSeconds={session.sessionTimer}
        />
      )}

      {session.status === 'guide' && (
        <BoothGuide
          template={session.template}
          onStart={handleGuideStart}
        />
      )}

      {(session.status === 'capturing' || session.status === 'countdown') && (
        <BoothLayout
          onCapture={handlePhotoCapture}
          onRetakePhoto={handleRetakePhoto}
          template={session.template}
          photos={capturedPhotos}
          currentPhotoIndex={capturedPhotos.filter(p => p).length}
          totalPhotos={3}
          countdownValue={captureCountdown}
          isCountdown={isCapturing && captureCountdown > 0}
          onStartCapture={handleStartCapture}
          onFinishCapture={handleFinishCapture}
        />
      )}

      {session.status === 'processing' && <ProcessingScreen />}

      {session.status === 'preview' && session.photos.length > 0 && (
        <PhotoPreview
          photos={session.photos}
          template={session.template}
          onRetake={handleRetake}
          onPrint={() => setShowPrintUpsell(true)}
          onContinue={() => setShowPrintUpsell(true)}
        />
      )}

      {showPrintUpsell && (
        <PrintUpsellModal
          currentCopies={session.printCopies}
          pricePerCopy={10000}
          onUpdateCopies={handleUpdateCopies}
          onConfirm={handlePrintConfirm}
          onCancel={handlePrintCancel}
          showPayment={showAdditionalPayment}
          onPaymentComplete={handleAdditionalPaymentComplete}
        />
      )}

      {session.status === 'printing' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Mencetak foto...</p>
            <p className="text-gray-400 text-sm mt-2">{session.printCopies} copy</p>
          </div>
        </div>
      )}

      {session.status === 'completed' && (
        <CompletedScreen
          galleryCode={session.galleryCode || ''}
          customerPhone={session.customerPhone}
          onDone={handleDone}
        />
      )}
    </div>
  )
}