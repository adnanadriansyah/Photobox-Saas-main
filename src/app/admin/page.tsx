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
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

// ============================================
// Admin Page Component — Premium Dark
// ============================================
export default function AdminPage() {
  const router = useRouter()
  const { activeModule, darkMode, branding } = useDashboardStore()
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
      } catch {
        router.replace('/admin/login')
        return
      }
      setIsChecking(false)
    }
    checkSession()
  }, [router])

  useEffect(() => {
    // Always dark for premium look
    document.documentElement.classList.add('dark')
  }, [])

  const renderModule = () => {
    const map: Record<string, React.ReactNode> = {
      dashboard:    <DashboardOverview />,
      galleries:    <GalleryModule />,
      outlets:      <OutletModule />,
      templates:    <TemplateModule />,
      users:        <UserModule />,
      vouchers:     <VoucherModule />,
      testimonials: <TestimonialModule />,
      settings:     <BrandingModule />,
      locations:    <LocationModule />,
      reports:      <ReportModule />,
    }
    return map[activeModule] ?? <DashboardOverview />
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0d1117 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-base font-semibold text-white">Memeriksa autentikasi...</p>
          <p className="text-sm text-white/40 mt-1">Silakan tunggu sebentar.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 40%, #0d1117 100%)' }}
    >
      {/* ── Background mesh gradient ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary color blob top-left */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.13, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${branding.primaryColor}, transparent 65%)` }}
        />
        {/* Secondary color blob bottom-right */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.11, 0.07] }}
          transition={{ duration: 13, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${branding.secondaryColor}, transparent 65%)` }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              exit={{   opacity: 0, y: -8,  filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="top-right" richColors theme="dark" />
    </div>
  )
}