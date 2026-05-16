'use client'

import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Image, 
  CreditCard, 
  Settings, 
  BarChart3, 
  QrCode,
  Gift,
  MessageSquare,
  MapPin,
  ChevronRight,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Sidebar Item — Premium with layoutId pill
// ============================================

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  module: string
  active?: boolean
  onClick: () => void
  delay?: number
}

function SidebarItem({ icon: Icon, label, active, onClick, delay = 0 }: SidebarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
      style={{
        color: active ? 'var(--active-color, #7c3aed)' : '#6B7280'
      }}
    >
      {/* ── Sliding active background (shared layoutId) ─────── */}
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: 'var(--active-bg, #f5f3ff)' }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}

      {/* ── Hover background (only when not active) ──────────── */}
      {!active && (
        <span className="absolute inset-0 rounded-xl bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}

      {/* ── Icon ─────────────────────────────────────────────── */}
      <motion.span
        className="relative z-10 flex-shrink-0"
        whileHover={{ rotate: active ? 0 : 8, scale: 1.12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
      </motion.span>

      {/* ── Label ────────────────────────────────────────────── */}
      <span
        className={`relative z-10 font-medium text-sm transition-colors ${
          active ? 'text-purple-700' : 'text-gray-600 group-hover:text-gray-900'
        }`}
      >
        {label}
      </span>

      {/* ── Active chevron ────────────────────────────────────── */}
      <motion.span
        className="relative z-10 ml-auto"
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="w-4 h-4 text-purple-400" />
      </motion.span>
    </motion.button>
  )
}

// ============================================
// Sidebar Component — Premium Animated
// ============================================

export function Sidebar() {
  const router = useRouter()
  const { 
    sidebarOpen, 
    toggleSidebar, 
    activeModule, 
    setActiveModule,
    darkMode,
    toggleDarkMode
  } = useDashboardStore()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',       module: 'dashboard'    },
    { icon: QrCode,          label: 'Galleries',        module: 'galleries'    },
    { icon: Store,           label: 'Outlets',          module: 'outlets'      },
    { icon: Image,           label: 'Template Frames',  module: 'templates'    },
    { icon: Users,           label: 'User Management',  module: 'users'        },
    { icon: Gift,            label: 'Vouchers',         module: 'vouchers'     },
    { icon: MessageSquare,   label: 'Testimonials',     module: 'testimonials' },
    { icon: MapPin,          label: 'Locations',        module: 'locations'    },
    { icon: BarChart3,       label: 'Reports',          module: 'reports'      },
    { icon: Settings,        label: 'Settings',         module: 'settings'     },
  ]

  return (
    <>
      {/* ── Sidebar Panel ─────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                   bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
                   shadow-2xl shadow-gray-900/5
                   lg:relative lg:translate-x-0 lg:shadow-none"
        style={{
          // CSS vars picked up by child components
          '--active-color': '#7c3aed',
          '--active-bg': darkMode ? 'rgba(124,58,237,0.15)' : '#f5f3ff',
        } as React.CSSProperties}
      >
        {/* ── Logo / Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
          >
            SnapNext Admin
          </motion.h1>
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>

        {/* ── Navigation ───────────────────────────────────────── */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {menuItems.map((item, i) => (
            <SidebarItem
              key={item.module}
              icon={item.icon}
              label={item.label}
              module={item.module}
              active={activeModule === item.module}
              delay={0.04 * i}
              onClick={() => setActiveModule(item.module)}
            />
          ))}
        </nav>

        {/* ── Bottom Actions ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5 flex-shrink-0"
        >
          {/* Dark mode toggle */}
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-amber-400" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </motion.button>

          {/* Logout */}
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              try {
                await fetch('/api/admin/logout', { method: 'POST' })
                router.push('/admin/login')
              } catch (error) {
                console.error('[Logout] error:', error)
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400
                       transition-colors group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* ── Mobile Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  )
}