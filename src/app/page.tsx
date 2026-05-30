'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Camera, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  Printer,
  Film,
  Newspaper,
  Users,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Navigation,
  Star,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const ease = [0.22, 1, 0.36, 1] as const

function PhotoGallery() {
  const photos = [
    { src: 'https://picsum.photos/seed/p1/400/500', label: 'Event Photo' },
    { src: 'https://picsum.photos/seed/p2/400/500', label: 'Party Time' },
    { src: 'https://picsum.photos/seed/p3/400/500', label: 'Memories' },
  ]

  return (
    <div className="relative w-full">
      <motion.div
        className="absolute -inset-4"
        animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, #a855f7 0%, transparent 60%)',
        }}
      />
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-2"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-full h-72 rounded-xl overflow-hidden">
              <img src={photos[0].src} alt={photos[0].label} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium tracking-wide">{photos[0].label}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-full h-48 rounded-xl overflow-hidden">
              <img src={photos[1].src} alt={photos[1].label} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium tracking-wide">{photos[1].label}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-full h-48 rounded-xl overflow-hidden">
              <img src={photos[2].src} alt={photos[2].label} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium tracking-wide">{photos[2].label}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const duration = 2000
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setDisplayed(end)
        clearInterval(timer)
      } else {
        setDisplayed(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <motion.span ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="tabular-nums">
      {displayed.toLocaleString('id-ID')}{suffix}
    </motion.span>
  )
}

export default function HomePage() {
  const { branding, outlets } = useDashboardStore()
  const [stats, setStats] = useState({
    photos: 10000,
    outlets: 50,
    users: 5000,
    uptime: 99.9
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        photos: prev.photos + Math.floor(Math.random() * 5),
        outlets: prev.outlets + (Math.random() > 0.95 ? 1 : 0),
        users: prev.users + Math.floor(Math.random() * 3),
        uptime: 99.9
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const onlineOutlets = outlets.filter(o => o.status === 'online')

  const features = [
    {
      icon: CreditCard,
      title: 'QRIS Payment',
      description: 'Pembayaran instan dengan QRIS tanpa ribet',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Printer,
      title: 'Silent Print',
      description: 'Teknologi thermal printing tanpa suara',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Film,
      title: 'GIF Engine',
      description: 'Buat GIF animasi dari burst foto',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Newspaper,
      title: 'Newspaper A4',
      description: 'Template koran A4 yang unik & personal',
      gradient: 'from-violet-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Cloud Backup',
      description: 'Semua foto tersimpan aman di cloud',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Sinkronasi multi-booth secara real-time',
      gradient: 'from-amber-500 to-orange-500'
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ============================== */}
      {/* HERO                          */}
      {/* ============================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#a855f7_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,#ec4899_0%,transparent_50%)] opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 glass-strong"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-white/80">Solusi SaaS Photo Box All-in-One</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="text-white">SnapNext:</span>
                <br />
                <span className="text-gradient">Photo Box</span>
                <br />
                <span className="text-white/90">All-in-One SaaS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl"
              >
                Platform photo booth profesional dengan pembayaran QRIS, printing instan,
                pembuatan GIF, dan galeri digital. Sempurna untuk event, pesta, dan aktivasi marketing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="/booth"
                  className="group relative px-8 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  }}
                >
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      width: '60%',
                    }}
                  />
                  <span className="relative z-10 text-white">Mulai Sesi Foto</span>
                  <ArrowRight className="w-5 h-5 relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/features"
                  className="px-8 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 glass-strong hover:bg-white/10 text-white/80 hover:text-white"
                >
                  Pelajari Fitur
                  <ChevronRight className="w-5 h-5" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-6 mt-10"
              >
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 overflow-hidden">
                      <img src={`https://i.pravatar.cc/32?u=${i}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 mt-0.5">Dipercaya 500+ vendor</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <PhotoGallery />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-purple-400"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </section>

      {/* ============================== */}
      {/* STATS                          */}
      {/* ============================== */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            <StatCard icon={ImageIcon} value={stats.photos} label="Photos Captured" color={branding.primaryColor} />
            <StatCard icon={MapPin} value={stats.outlets} label="Active Outlets" color={branding.secondaryColor} />
            <StatCard icon={Users} value={stats.users} label="Happy Users" color="#6366f1" />
            <StatCard icon={TrendingUp} value={stats.uptime} label="Uptime %" color="#22c55e" suffix="%" />
          </motion.div>
        </div>
      </section>

      {/* ============================== */}
      {/* FEATURES                       */}
      {/* ============================== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-4 glass-strong"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white/80">Powerful Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Fitur </span>
              <span className="text-gradient">Unggulan</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Teknologi terdepan untuk pengalaman photo booth yang tak terlupakan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl glass-strong hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              Lihat Semua Fitur
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================== */}
      {/* LOCATIONS                      */}
      {/* ============================== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-4 glass-strong"
            >
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-white/80">Lokasi Kami</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Temukan Booth{' '}
              <span className="text-gradient">Terdekat</span>
            </h2>
               <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {onlineOutlets.length}+ outlet aktif di seluruh Indonesia. Temukan lokasi SnapNext terdekat dari Anda.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden relative h-[400px] mb-8 glass-strong"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.84559901476918!3d-6.208763495493379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356225804!2sJakarta!5e0!3m2!1sen!2sid!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SnapNext"
            />
            <div className="absolute top-4 left-4 glass-strong rounded-xl p-4 max-w-xs">
              <h3 className="font-semibold text-white mb-2 text-sm">Cara Menggunakan</h3>
               <ul className="text-xs text-white/80 space-y-1">
                <li>Klik marker untuk melihat detail lokasi</li>
                <li>Gunakan tombol navigasi untuk arah</li>
                <li>Zoom in/out untuk melihat area lebih detail</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Outlet Aktif</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {outlets.slice(0, 4).map((outlet) => (
                <motion.div
                  key={outlet.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="glass-strong rounded-xl p-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">{outlet.name}</h3>
                      <p className="text-white/70 text-xs mt-1">{outlet.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      outlet.status === 'online'
                        ? 'bg-green-500/20 text-green-400'
                        : outlet.status === 'offline'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {outlet.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs">{outlet.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs">10:00 - 22:00</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {outlet.features.qris && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full">QRIS</span>
                    )}
                    {outlet.features.voucher && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full">Voucher</span>
                    )}
                    {outlet.features.cashless && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full">Cashless</span>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white hover:text-white text-xs glass hover:bg-white/10"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Buka di Maps
                  </a>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a
                href="/locations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                <span>Lihat Semua Lokasi</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================== */}
      {/* CTA                            */}
      {/* ============================== */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="cta-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-pattern)" />
              </svg>
            </div>

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                Siap Memulai?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              >
                Bergabunglah dengan ratusan vendor yang telah mempercayakan bisnis photo booth mereka dengan SnapNext
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <a
                  href="/admin/login"
                  className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  Mulai Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/pricing"
                  className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Lihat Harga
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  value: number
  label: string
  color: string
  suffix?: string
}

function StatCard({ icon: Icon, value, label, color, suffix = '' }: StatCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-2xl p-6 text-center group hover:border-purple-500/30 transition-all duration-300"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-white/70 text-sm">{label}</p>
    </motion.div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
  index: number
}

function FeatureCard({ icon: Icon, title, description, gradient, index }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-strong rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(168,85,247,0.05), rgba(236,72,153,0.05))`,
        }}
      />

      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
        {title}
      </h3>
      <p className="text-white/70 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
