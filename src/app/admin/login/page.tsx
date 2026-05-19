'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { 
  Camera, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Shield
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

const ease = [0.22, 1, 0.36, 1] as const

// ============================================
// Animated floating orb
// ============================================
function Orb({ x, y, size, duration, delay, color, blur }: {
  x: number; y: number; size: number
  duration: number; delay: number; color: string; blur: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity: 0.55,
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.15, 0.92, 1],
        opacity: [0.55, 0.75, 0.45, 0.55],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ============================================
// Floating particle dot
// ============================================
function Particle({ x, y, size, duration, delay, color }: {
  x: number; y: number; size: number
  duration: number; delay: number; color: string
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color }}
      animate={{ y: [0, -20, 0], opacity: [0, 0.7, 0], scale: [0.8, 1.3, 0.8] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ============================================
// Cursor-following spotlight
// ============================================
function CursorSpotlight({ primaryColor }: { primaryColor: string }) {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="fixed pointer-events-none z-0 rounded-full"
      style={{
        width: 480,
        height: 480,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        background: `radial-gradient(circle, ${primaryColor}18 0%, transparent 65%)`,
      }}
    />
  )
}

// ============================================
// Animated input field
// ============================================
function InputField({
  label, type, value, onChange, placeholder, icon: Icon,
  rightElement, disabled, primaryColor, index
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: React.ComponentType<{ className?: string }>
  rightElement?: React.ReactNode
  disabled: boolean
  primaryColor: string
  index: number
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.35 + index * 0.1, ease }}
    >
      <motion.label
        className="block text-xs font-semibold mb-2 uppercase tracking-wider"
        animate={{ color: focused ? primaryColor : '#6B7280' }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <div className="relative">
        {/* Focus ring glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: focused
              ? `0 0 0 3px ${primaryColor}28, 0 4px 20px ${primaryColor}18`
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.25 }}
        />

        {/* Input background */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            backgroundColor: focused ? '#ffffff' : filled ? '#fafafa' : '#f9fafb',
            borderColor: focused ? primaryColor : filled ? `${primaryColor}50` : '#E5E7EB',
          }}
          style={{ border: '1.5px solid' }}
          transition={{ duration: 0.2 }}
        />

        {/* Icon */}
        <motion.div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
          animate={{ color: focused ? primaryColor : '#9CA3AF', scale: focused ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </motion.div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className="relative z-10 w-full pl-10 pr-12 py-3.5 bg-transparent rounded-2xl focus:outline-none text-sm text-gray-900 placeholder-gray-400 disabled:opacity-50"
        />

        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Admin Login Page — Full Premium
// ============================================
export default function AdminLoginPage() {
  const router = useRouter()
  const { branding } = useDashboardStore()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [rememberMe, setRememberMe]     = useState(false)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Harap isi semua field')
      setIsLoading(false)
      return
    }
    if (!email.includes('@')) {
      setError('Masukkan alamat email yang valid')
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || 'Login gagal')
        setIsLoading(false)
        return
      }
      setSuccess('Login berhasil! Mengalihkan...')
      setTimeout(() => router.replace('/admin'), 900)
    } catch {
      setError('Tidak dapat login. Coba lagi nanti.')
      setIsLoading(false)
    }
  }

  // Orb configs
  const orbs = [
    { x: -8,  y: -5,  size: 420, duration: 12, delay: 0,   color: branding.primaryColor,   blur: 60 },
    { x: 75,  y: 60,  size: 380, duration: 15, delay: 2,   color: branding.secondaryColor, blur: 70 },
    { x: 40,  y: 80,  size: 300, duration: 10, delay: 4,   color: branding.primaryColor,   blur: 80 },
    { x: 85,  y: -10, size: 260, duration: 18, delay: 1,   color: branding.secondaryColor, blur: 55 },
  ]

  const particles = [
    { x: 10, y: 25, size: 3, duration: 4,   delay: 0,   color: `${branding.primaryColor}90`   },
    { x: 22, y: 70, size: 2, duration: 5.5, delay: 1,   color: `${branding.secondaryColor}80` },
    { x: 78, y: 20, size: 3, duration: 4.8, delay: 0.5, color: `${branding.primaryColor}70`   },
    { x: 88, y: 65, size: 2, duration: 6,   delay: 1.8, color: `${branding.secondaryColor}90` },
    { x: 50, y: 10, size: 2, duration: 5,   delay: 2.5, color: `${branding.primaryColor}60`   },
    { x: 65, y: 85, size: 3, duration: 4.2, delay: 0.8, color: `${branding.secondaryColor}70` },
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* ── Dark gradient background ──────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, ${branding.primaryColor}22 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, ${branding.secondaryColor}22 0%, transparent 50%),
            linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 40%, #0d1117 100%)
          `,
        }}
      />

      {/* ── Subtle grid ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${branding.primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${branding.primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Floating orbs ─────────────────────────────────────── */}
      {mounted && orbs.map((orb, i) => <Orb key={i} {...orb} />)}

      {/* ── Particles ─────────────────────────────────────────── */}
      {mounted && particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Cursor spotlight ──────────────────────────────────── */}
      {mounted && <CursorSpotlight primaryColor={branding.primaryColor} />}

      {/* ── Main card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative w-full max-w-md z-10"
      >
        {/* ── Logo / Header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="text-center mb-8"
        >
          <motion.a
            href="/"
            className="inline-flex items-center gap-3 mb-5 group"
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName} className="h-12 w-auto" />
            ) : (
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  boxShadow: `0 8px 32px ${branding.primaryColor}50`,
                }}
              >
                <Camera className="w-6 h-6 text-white" />
              </motion.div>
            )}
            <span
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {branding.companyName}
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: `${branding.primaryColor}20`,
              color: branding.primaryColor,
              border: `1px solid ${branding.primaryColor}35`,
            }}
          >
            <Shield className="w-3 h-3" />
            Secure Admin Area
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease }}
            className="text-2xl font-bold text-white mb-1.5"
          >
            Admin / Owner Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm"
          >
            Masuk ke dashboard manajemen bisnis Anda
          </motion.p>
        </motion.div>

        {/* ── Glass card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Inner top shine */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.primaryColor}60, transparent)` }}
          />

          {/* Sparkle corner decoration */}
          <motion.div
            className="absolute top-4 right-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 opacity-30" style={{ color: branding.primaryColor }} />
          </motion.div>

          {/* ── Alert messages ──────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3, ease }}
                className="mb-5 p-3.5 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <AlertCircle className="w-4.5 h-4.5 w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                </motion.div>
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease }}
                className="mb-5 p-3.5 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <CheckCircle2 className="w-[18px] h-[18px] text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@snapnext.com"
              icon={Mail}
              disabled={isLoading}
              primaryColor={branding.primaryColor}
              index={0}
            />

            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={Lock}
              disabled={isLoading}
              primaryColor={branding.primaryColor}
              index={1}
              rightElement={
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.span key="off"
                        initial={{ rotate: -15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 15, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <EyeOff className="w-[18px] h-[18px]" />
                      </motion.span>
                    ) : (
                      <motion.span key="on"
                        initial={{ rotate: 15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -15, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              }
            />

            {/* Remember me + Forgot password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <motion.div
                    animate={{
                      backgroundColor: rememberMe ? branding.primaryColor : 'transparent',
                      borderColor: rememberMe ? branding.primaryColor : 'rgba(255,255,255,0.2)',
                    }}
                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-2.5 h-2.5 text-white"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Remember me
                </span>
              </label>
              <motion.a
                href="#"
                className="text-sm font-medium"
                style={{ color: branding.primaryColor }}
                whileHover={{ opacity: 0.8, x: 2 }}
                transition={{ duration: 0.15 }}
              >
                Forgot Password?
              </motion.a>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="relative w-full py-3.5 px-4 text-white font-semibold rounded-2xl overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  boxShadow: `0 8px 28px ${branding.primaryColor}45`,
                }}
              >
                {/* Shimmer sweep */}
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)',
                    }}
                  />
                )}

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 relative z-10"
                    >
                      <span>Sign In</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="relative my-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-gray-500" style={{ backgroundColor: 'transparent' }}>
                atau
              </span>
            </div>
          </motion.div>

          {/* Back to home */}
          <motion.a
            href="/"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#D1D5DB',
            }}
          >
            Kembali ke Beranda
          </motion.a>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="text-center text-gray-600 text-xs mt-6"
        >
          © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  )
}