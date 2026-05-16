'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Camera, 
  MapPin, 
  Phone, 
  Clock,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

// ============================================
// Footer Component — Premium Animated
// ============================================

export function Footer() {
  const { branding } = useDashboardStore()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  const quickLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/locations', label: 'Locations' },
    { href: '/testimonials', label: 'Testimonials' }
  ]

  const contactItems = [
    { icon: Phone,  text: '+62 21 1234 5678' },
    { icon: MapPin, text: 'Jakarta, Indonesia' },
    { icon: Clock,  text: 'Mon-Fri: 9AM - 6PM' }
  ]

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter,   href: '#', label: 'Twitter'   },
    { icon: Youtube,   href: '#', label: 'Youtube'   },
  ]

  // Shared ease curve
  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <footer ref={ref} className="bg-gray-950 text-white pt-20 pb-8 px-4 overflow-hidden relative">
      {/* ── Decorative gradient blobs ───────────────────────────── */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: `radial-gradient(circle, ${branding.primaryColor}, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full opacity-8 pointer-events-none blur-3xl"
        style={{ background: `radial-gradient(circle, ${branding.secondaryColor}, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* ── Brand Column ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-5">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  className="h-10 w-auto brightness-0 invert"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                  }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">{branding.companyName}</span>
            </div>

            <p className="text-gray-400 mb-7 max-w-sm leading-relaxed text-sm">
              {branding.tagline || 'Platform photo booth profesional untuk event dan bisnis di Indonesia.'}
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease }}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center transition-colors hover:bg-gray-700"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── Quick Links ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            <h4 className="font-semibold mb-5 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.07, ease }}
                >
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full transition-all duration-300 group-hover:w-3"
                      style={{ backgroundColor: branding.primaryColor }}
                    />
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Contact ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            <h4 className="font-semibold mb-5 text-white">Contact</h4>
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07, ease }}
                  className="flex items-center gap-3 text-gray-400 text-sm"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${branding.primaryColor}20` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} />
                  </span>
                  {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Divider + Copyright ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
          </p>
          {/* Gradient accent line */}
          <div
            className="h-px w-24 rounded-full"
            style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
          />
        </motion.div>
      </div>
    </footer>
  )
}