'use client'

import { motion } from 'framer-motion'
import { 
  Zap,
  CheckCircle2,
  QrCode,
  WifiOff,
  Cloud,
  ShieldCheck,
  BarChart3,
  Layout,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const featureImages = {
  qris: '/photos/features/qris.jpg',
  print: '/photos/features/silent-print.jpg',
  gif: '/photos/features/gif-engine.jpg',
  newspaper: '/photos/features/newspaper.jpg',
  qrcode: '/photos/features/qr-code.jpg',
  offline: '/photos/features/offline-mode.jpg',
  cloud: '/photos/features/cloud-backup.jpg',
  secure: '/photos/features/secure-private.jpg',
  analytics: '/photos/features/realtime.jpg',
  template: '/photos/features/multi-template.jpg',
}

// ============================================
// Features Page
// ============================================

export default function FeaturesPage() {
  const { branding } = useDashboardStore()

  const mainFeatures = [
    {
      image: featureImages.qris,
      title: 'QRIS Payment',
      description: 'Tamu Anda bisa bayar foto cukup dengan scan QRIS dari aplikasi e-wallet atau mobile banking favorit mereka. Semua metode pembayaran populer di Indonesia didukung — GoPay, OVO, DANA, ShopeePay, sampai transfer bank. Pembayaran langsung terverifikasi dalam hitungan detik, dan foto langsung bisa dicetak. Gampang, cepat, tanpa ribet!',
      benefits: [
        'Scan QRIS dari e-wallet atau m-banking mana aja',
        'Pembayaran langsung terverifikasi dalam 3 detik',
        'Cocok untuk event, bazaar, dan acara formal',
        'Notifikasi otomatis kalau pembayaran berhasil'
      ]
    },
    {
      image: featureImages.print,
      title: 'Silent Print',
      description: 'Foto langsung jadi dalam hitungan detik — tanpa suara berisik! Teknologi silent print kami bikin proses cetak foto tetap tenang, cocok banget buat acara formal kayak wedding, gathering kantor, atau aktivasi brand. Kualitas cetak 300 DPI, hasilnya tajam dan profesional.',
      benefits: [
        'Proses cetak sunyi, cocok acara formal',
        'Kualitas foto 300 DPI, tajam dan profesional',
        'Cetak cuma 5-10 detik per foto',
        'Pemotongan kertas otomatis, rapi tanpa antre'
      ]
    },
    {
      image: featureImages.gif,
      title: 'GIF Engine',
      description: 'Mau bikin GIF lucu dari foto tamu? Cukup ambil beberapa burst foto, dan sistem kami langsung mengubahnya jadi GIF animasi yang seru! Bisa ditambah frame kustom, efek transisi, dan langsung bisa di-share ke Instagram, TikTok, atau WhatsApp. Momen seru jadi makin hidup!',
      benefits: [
        'Ambil hingga 10 foto burst dalam sekali sesi',
        'Bisa tambah frame dan efek transisi',
        'Langung bisa di-share ke medsos',
        'Export file GIF atau MP4'
      ]
    },
    {
      image: featureImages.newspaper,
      title: 'Newspaper A4',
      description: 'Pengalaman foto yang beda dari biasanya! Cetak foto dengan template koran vintage ukuran A4. Tamu bisa custom judul berita dan caption sendiri, hasilnya unik dan aesthetic banget. Cocok buat pajangan di rumah atau kado spesial untuk orang tersayang.',
      benefits: [
        'Template koran vintage yang Instagrammable',
        'Bisa tulis judul & caption sendiri',
        'Beberapa pilihan layout koran',
        'Cetak ukuran A4, langsung bisa dipajang'
      ]
    }
  ]

  const additionalFeatures = [
    {
      image: featureImages.qrcode,
      icon: QrCode,
      title: 'QR Code Gallery',
      description: 'Setiap foto cetak punya QR code unik. Tamu tinggal scan, langsung bisa lihat dan download galeri digital foto mereka — kapan aja, di mana aja.'
    },
    {
      image: featureImages.offline,
      icon: WifiOff,
      title: 'Offline Mode',
      description: 'Internet mati? Tenang, photobooth tetap jalan terus. Foto tetep bisa diambil, data tersimpan otomatis, dan langsung sinkron pas internet balik lagi.'
    },
    {
      image: featureImages.cloud,
      icon: Cloud,
      title: 'Cloud Backup',
      description: 'Semua foto tamu otomatis tersimpan aman di cloud. Gak perlu khawatir data hilang — backup real-time bikin bisnis Anda tetap aman.'
    },
    {
      image: featureImages.secure,
      icon: ShieldCheck,
      title: 'Secure & Private',
      description: 'Data dan foto tamu terenkripsi end-to-end. Privasi pelanggan tetap terjaga, bisnis Anda pun lebih terpercaya.'
    },
    {
      image: featureImages.analytics,
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Pantau langsung performa booth Anda — jumlah foto, pendapatan, jam sibuk, semua dalam dashboard real-time yang gampang dibaca.'
    },
    {
      image: featureImages.template,
      icon: Layout,
      title: 'Multi-Template',
      description: 'Pilih dari berbagai template foto yang kece. Bisa dikustomisasi sesuai branding event atau acara Anda.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{ 
                backgroundColor: `${branding.primaryColor}20`,
                color: branding.primaryColor
              }}
            >
              <Zap className="w-4 h-4" />
              <span>Fitur Lengkap</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fitur{' '}
              <span 
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Unggulan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Teknologi terdepan untuk pengalaman photo booth yang tak terlupakan. 
              Semua yang Anda butuhkan untuk bisnis photo booth profesional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? '' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Lainnya</h2>
            <p className="text-xl text-gray-600">Dan masih banyak lagi fitur yang mendukung bisnis Anda</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${branding.primaryColor}20` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Mencoba?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Mulai dengan uji coba gratis dan rasakan semua fitur SnapNext
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/admin/login"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Mulai Gratis
                </a>
                <a 
                  href="/pricing"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Lihat Harga
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
