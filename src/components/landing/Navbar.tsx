'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  ChevronDown,
  Users,
  Menu,
  X
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

// ============================================
// Navbar Component — Premium Animated
// ============================================

export function Navbar() {
  const { branding } = useDashboardStore()
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('/')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ─── Scroll detection ───────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ─── Active link detection ──────────────────────────────────────────
  useEffect(() => {
    setActiveLink(window.location.pathname)
  }, [])

  // ─── Close dropdown on outside click ───────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/locations', label: 'Locations' },
    { href: '/testimonials', label: 'Testimonials' }
  ]

  // ─── Animation variants ─────────────────────────────────────────────
  const navItemVariants = {
    hidden: { opacity: 0, y: -8 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }
    })
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    show: { 
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { 
      opacity: 0, y: -8, scale: 0.96,
      transition: { duration: 0.15 }
    }
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    show: { 
      opacity: 1, height: 'auto',
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { 
      opacity: 0, height: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(255, 255, 255, 0)',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? `1px solid ${branding.primaryColor}18` : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* ── Logo ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="/" className="flex items-center gap-2 group">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                }}
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.div>
            )}
            <span
              className="text-xl font-bold transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {branding.companyName}
            </span>
          </a>
        </motion.div>

        {/* ── Desktop Navigation ─────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              custom={i}
              variants={navItemVariants}
              initial="hidden"
              animate="show"
              onClick={() => setActiveLink(link.href)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 group"
              style={{
                color: activeLink === link.href ? branding.primaryColor : '#4B5563'
              }}
            >
              {/* Active / hover background pill */}
              {activeLink === link.href && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: `${branding.primaryColor}12` }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 group-hover:text-gray-900 transition-colors">
                {link.label}
              </span>
              {/* Hover underline */}
              <span
                className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{
                  background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  opacity: activeLink === link.href ? 0 : 1
                }}
              />
            </motion.a>
          ))}
        </nav>

        {/* ── Login Dropdown + Mobile Toggle ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white text-sm shadow-lg shadow-purple-500/25 transition-shadow hover:shadow-purple-500/40"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
              }}
            >
              Login
              <motion.span
                animate={{ rotate: loginDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {loginDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  style={{ transformOrigin: 'top right' }}
                >
                  {/* Top gradient accent */}
                  <div
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                  />

                  <motion.a
                    href="/admin/login"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${branding.primaryColor}18` }}
                    >
                      <Users className="w-5 h-5" style={{ color: branding.primaryColor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Admin / Owner</p>
                      <p className="text-xs text-gray-500">Dashboard & Management</p>
                    </div>
                  </motion.a>

                  <div className="h-px bg-gray-100 mx-4" />

                  <motion.a
                    href="/booth/login"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${branding.secondaryColor}18` }}
                    >
                      <Camera className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Booth / Outlet</p>
                      <p className="text-xs text-gray-500">Photo Session Interface</p>
                    </div>
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile toggle */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center px-4 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  style={{
                    color: activeLink === link.href ? branding.primaryColor : undefined,
                    backgroundColor: activeLink === link.href ? `${branding.primaryColor}10` : undefined
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}