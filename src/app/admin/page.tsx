'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { DashboardOverview } from '@/components/admin/DashboardOverview'
import { OutletModule } from '@/components/admin/OutletModule'
import { TemplateModule } from '@/components/admin/TemplateModule'
import { UserModule } from '@/components/admin/UserModule'
import { VoucherModule } from '@/components/admin/VoucherModule'
import { TestimonialModule } from '@/components/admin/TestimonialModule'
import { GalleryModule } from '@/components/admin/GalleryModule'
import { LocationModule } from '@/components/admin/LocationModule'
import { BrandingModule } from '@/components/admin/BrandingModule'
import { ReportModule } from '@/components/admin/ReportModule'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Toaster } from 'sonner'

// ============================================
// Admin Page Component
// ============================================

export default function AdminPage() {
  const router = useRouter()
  const { activeModule, darkMode } = useDashboardStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'include' })
        const data = await response.json()
        if (!response.ok || !data.authenticated) {
          router.replace('/admin/login')
          return
        }
      } catch (error) {
        console.error('[Admin Session] error:', error)
        router.replace('/admin/login')
        return
      }
      setIsChecking(false)
    }

    checkSession()
  }, [router])

  // Apply dark mode to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [darkMode])

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />
      case 'galleries':
        return <GalleryModule />
      case 'outlets':
        return <OutletModule />
      case 'templates':
        return <TemplateModule />
      case 'users':
        return <UserModule />
      case 'vouchers':
        return <VoucherModule />
      case 'testimonials':
        return <TestimonialModule />
      case 'settings':
        return <BrandingModule />
      case 'locations':
        return <LocationModule />
      case 'reports':
        return <ReportModule />
      default:
        return <DashboardOverview />
    }
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center">
          <p className="text-lg font-semibold text-gray-900">Memeriksa autentikasi...</p>
          <p className="text-sm text-gray-500 mt-2">Silakan tunggu sebentar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
