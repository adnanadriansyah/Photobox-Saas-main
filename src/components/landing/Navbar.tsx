'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  Camera, 
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Zap
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

const ease = [0.22, 1, 0.36, 1] as const

function MagneticNavLink({
  href,
  label,
  isActive,
  primaryColor,
  secondaryColor,
  index,
  onClick,
}: {
  href: string
  label: string
  isActive: boolean
  primaryColor: string
  secondaryColor: string
  index: number
  onClick: () => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 180, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 180, damping: 18 })
  const rotateX = useTransform(springY, [-20, 20], [6, -6])
  const rotateY = useTransform(springX, [-40, 40], [-8, 8])

  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    mouseX.set(x * 0.4)
    mouseY.set(y * 0.4)
    setSpotPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setHovered(false)
  }, [mouseX, mouseY])

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 600,
      }}
      className="relative px-4 py-2 rounded-xl text-sm font-medium select-none cursor-pointer overflow-hidden"
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: `${primaryColor}20` }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}

      <AnimatePresence>
        {hovered && !isActive && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${spotPos.x}% ${spotPos.y}%, ${primaryColor}30 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      <motion.span
        className="relative z-10 block"
        animate={{ color: isActive ? '#fff' : hovered ? '#fff' : 'rgba(255,255,255,0.65)' }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>

      <motion.span
        className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 0 : hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease }}
        style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
      />
    </motion.a>
  )
}

function DropdownItem({
  href,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  index,
  onClick,
}: {
  href: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  index: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.28, delay: 0.06 + index * 0.07, ease }}
      className="relative flex items-center gap-3 px-4 py-3.5 overflow-hidden group"
    >
      <motion.span
        className="absolute inset-0"
        initial={{ scaleX: 0, originX: '0%' }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease }}
        style={{ backgroundColor: `${iconColor}12` }}
      />

      <motion.div
        animate={{
          scale: hovered ? 1.12 : 1,
          rotate: hovered ? 8 : 0,
          boxShadow: hovered ? `0 6px 20px ${iconColor}30` : '0 0px 0px transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </motion.div>

      <div className="relative z-10">
        <motion.p
          animate={{ x: hovered ? 2 : 0 }}
          transition={{ duration: 0.2 }}
          className="font-semibold text-white text-sm"
        >
          {title}
        </motion.p>
        <motion.p
          animate={{ x: hovered ? 2 : 0 }}
          transition={{ duration: 0.2, delay: 0.03 }}
          className="text-xs text-gray-400"
        >
          {subtitle}
        </motion.p>
      </div>

      <motion.span
        className="ml-auto relative z-10"
        animate={{ x: hovered ? 0 : -6, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4 -rotate-90" style={{ color: iconColor }} />
      </motion.span>
    </motion.a>
  )
}

export function Navbar() {
  const { branding } = useDashboardStore()
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('/')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setActiveLink(window.location.pathname) }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setLoginDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/',             label: 'Home'         },
    { href: '/features',     label: 'Features'     },
    { href: '/pricing',      label: 'Pricing'      },
    { href: '/locations',    label: 'Locations'    },
    { href: '/testimonials', label: 'Testimonials' },
  ]

  const dropdownItems = [
    {
      href:      '/admin/login',
      icon:      LayoutDashboard,
      iconBg:    `${branding.primaryColor}20`,
      iconColor: branding.primaryColor,
      title:     'Admin / Owner',
      subtitle:  'Dashboard & Management',
    },
    {
      href:      '/booth/login',
      icon:      Camera,
      iconBg:    `${branding.secondaryColor}20`,
      iconColor: branding.secondaryColor,
      title:     'Booth / Outlet',
      subtitle:  'Photo Session Interface',
    },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(10,10,26,0.82)' : 'rgba(10,10,26,0)',
        backdropFilter: scrolled ? 'blur(20px) saturate(200%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(200%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(168,85,247,0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <a href="/" className="flex items-center gap-2.5 group">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`, boxShadow: `0 4px 20px ${branding.primaryColor}40` }}
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.div>
            )}
            <motion.span
              className="text-xl font-bold text-gradient"
              whileHover={{ letterSpacing: '0.01em' }}
              transition={{ duration: 0.2 }}
            >
              {branding.companyName}
            </motion.span>
          </a>
        </motion.div>

        <nav className="hidden md:flex items-center gap-0.5" style={{ perspective: '800px' }}>
          {navLinks.map((link, i) => (
            <MagneticNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={activeLink === link.href}
              primaryColor={branding.primaryColor}
              secondaryColor={branding.secondaryColor}
              index={i}
              onClick={() => setActiveLink(link.href)}
            />
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="flex items-center gap-3"
        >
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                boxShadow: `0 4px 20px ${branding.primaryColor}40`,
              }}
            >
              <motion.span
                className="absolute inset-0 pointer-events-none"
                animate={{ x: loginDropdownOpen ? '200%' : '-100%' }}
                transition={{ duration: 0.7, ease: 'linear', repeat: loginDropdownOpen ? 0 : Infinity, repeatDelay: 2 }}
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                  width: '100%',
                }}
              />
              <Zap className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Login</span>
              <motion.span
                animate={{ rotate: loginDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease }}
                className="relative z-10"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {loginDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.93, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0,   scale: 1,    filter: 'blur(0px)' }}
                  exit={{   opacity: 0, y: -8,   scale: 0.93, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22, ease }}
                  className="absolute right-0 mt-2.5 w-64 rounded-2xl overflow-hidden"
                  style={{
                    transformOrigin: 'top right',
                    background: 'rgba(15, 10, 46, 0.95)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.15)',
                  }}
                >
                  <div
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                  />

                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Pilih peran Anda
                  </motion.p>

                  {dropdownItems.map((item, i) => (
                    <DropdownItem
                      key={item.href}
                      {...item}
                      index={i}
                      onClick={() => setLoginDropdownOpen(false)}
                    />
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22 }}
                    className="px-4 py-2.5 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-[11px] text-gray-500 text-center">
                      Butuh bantuan?{' '}
                      <a href="/contact" className="font-semibold" style={{ color: branding.primaryColor }}>
                        Hubungi kami
                      </a>
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                  exit={{   rotate: 90,  opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90,  opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                  exit={{   rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-white" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{   opacity: 0, height: 0,      filter: 'blur(6px)' }}
            transition={{ duration: 0.32, ease }}
            className="md:hidden overflow-hidden border-t"
            style={{ 
              background: 'rgba(10,10,26,0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(168,85,247,0.1)'
            }}
          >
            <nav className="flex flex-col p-3 gap-0.5">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0,   filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.055, duration: 0.3, ease }}
                  whileHover={{ x: 4 }}
                  className="relative flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm overflow-hidden group"
                  style={{
                    color: activeLink === link.href ? '#fff' : 'rgba(255,255,255,0.65)',
                    backgroundColor: activeLink === link.href ? 'rgba(168,85,247,0.15)' : undefined,
                  }}
                  onClick={() => { setActiveLink(link.href); setMobileMenuOpen(false) }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: 'rgba(168,85,247,0.08)' }}
                  />
                  <span className="relative z-10">{link.label}</span>
                  {activeLink === link.href && (
                    <motion.span
                      layoutId="mobile-active-dot"
                      className="relative z-10 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: branding.primaryColor }}
                    />
                  )}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ delay: navLinks.length * 0.055 + 0.06, duration: 0.3, ease }}
                className="mt-2 pt-2.5 border-t grid grid-cols-2 gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <a
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                  style={{ borderColor: `${branding.primaryColor}40`, color: branding.primaryColor }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin
                </a>
                <a
                  href="/booth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Booth
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
