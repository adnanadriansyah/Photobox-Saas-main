'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Gift,
  Percent,
  DollarSign,
  Calendar,
  X,
  Check,
  Copy,
  AlertTriangle
} from 'lucide-react'
import { useDashboardStore, Voucher } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Shared ease ───────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const

// ============================================
// Copy Button — animated icon swap feedback
// ============================================
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Kode voucher disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Copy kode"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ duration: 0.2, ease }}
          >
            <Check className="w-4 h-4 text-green-500" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ============================================
// Voucher Form Modal — premium spring scale
// ============================================
interface VoucherFormProps {
  voucher?: Voucher | null
  onClose: () => void
  onSubmit: (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => void
}

function VoucherForm({ voucher, onClose, onSubmit }: VoucherFormProps) {
  const [formData, setFormData] = useState({
    discountType: voucher?.discountType || 'percentage' as const,
    discountValue: voucher?.discountValue || 0,
    minPurchase: voucher?.minPurchase || 0,
    maxDiscount: voucher?.maxDiscount || undefined as number | undefined,
    usageLimit: voucher?.usageLimit || 100,
    validFrom: voucher?.validFrom ? voucher.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: voucher?.validUntil ? voucher.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: voucher?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString()
    })
    onClose()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-shadow"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header accent */}
        <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-purple-600" />

        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {voucher ? 'Edit Voucher' : 'Buat Voucher Baru'}
            </h2>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Tipe Diskon
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
              className={inputClass}
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Nominal Tetap (Rp)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Nilai Diskon {formData.discountType === 'percentage' ? '(%)' : '(Rp)'}
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
              className={inputClass}
              required min="0"
              max={formData.discountType === 'percentage' ? 100 : undefined}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Minimum Pembelian (Rp)
            </label>
            <input
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
              className={inputClass}
              required min="0"
            />
          </div>

          <AnimatePresence>
            {formData.discountType === 'percentage' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease }}
              >
                <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Maksimal Diskon (Rp)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || undefined })}
                  className={inputClass}
                  min="0"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Batas Pemakaian
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              className={inputClass}
              required min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['validFrom', 'validUntil'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {field === 'validFrom' ? 'Berlaku Dari' : 'Berlaku Sampai'}
                </label>
                <input
                  type="date"
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Aktifkan Voucher</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-colors"
            >
              Batal
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              {voucher ? 'Simpan Perubahan' : 'Buat Voucher'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Voucher Card
// ============================================
function VoucherCard({
  voucher,
  index,
  onEdit,
  onDelete,
  formatPrice,
  formatDate
}: {
  voucher: Voucher
  index: number
  onEdit: () => void
  onDelete: () => void
  formatPrice: (n: number) => string
  formatDate: (s: string) => string
}) {
  // Usage bar percentage
  const usagePct = Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
      layout
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group"
    >
      {/* Top gradient bar (active = purple, inactive = gray) */}
      <div
        className="h-1 w-full transition-all duration-500"
        style={{
          background: voucher.isActive
            ? 'linear-gradient(90deg, #ec4899, #7c3aed)'
            : '#e5e7eb'
        }}
      />

      <div className="p-4">
        {/* Code row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Gift className="w-5 h-5 text-purple-500" />
            </motion.div>
            <span className="font-mono font-bold text-base tracking-widest text-gray-900 dark:text-white">
              {voucher.code}
            </span>
          </div>
          <CopyButton code={voucher.code} />
        </div>

        {/* Discount value */}
        <div className="flex items-baseline gap-1.5 mb-4">
          {voucher.discountType === 'percentage'
            ? <Percent className="w-5 h-5 text-emerald-500 self-center" />
            : <DollarSign className="w-5 h-5 text-emerald-500 self-center" />
          }
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {voucher.discountType === 'percentage'
              ? `${voucher.discountValue}%`
              : formatPrice(voucher.discountValue)
            }
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 self-end pb-0.5">diskon</span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex justify-between">
            <span>Min. pembelian</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{formatPrice(voucher.minPurchase)}</span>
          </div>
          {voucher.maxDiscount && (
            <div className="flex justify-between">
              <span>Max. diskon</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{formatPrice(voucher.maxDiscount)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(voucher.validFrom)} – {formatDate(voucher.validUntil)}</span>
          </div>
        </div>

        {/* Usage progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Pemakaian</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {voucher.usedCount} / {voucher.usageLimit}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="h-full rounded-full"
              style={{
                background: usagePct > 80
                  ? '#ef4444'
                  : 'linear-gradient(90deg, #ec4899, #7c3aed)'
              }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <motion.span
            layout
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
              voucher.isActive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${voucher.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}
            />
            {voucher.isActive ? 'Aktif' : 'Nonaktif'}
          </motion.span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </motion.button>
          <motion.button
            onClick={onDelete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-transparent hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// VoucherModule — Main Component
// ============================================
export function VoucherModule() {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher, searchQuery } = useDashboardStore()
  const [showForm, setShowForm]           = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null)
  const [filterStatus, setFilterStatus]     = useState<string>('all')

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch  = voucher.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus  = filterStatus === 'all'
      || (filterStatus === 'active'   && voucher.isActive)
      || (filterStatus === 'inactive' && !voucher.isActive)
    return matchesSearch && matchesStatus
  })

  const handleCreate = (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => {
    addVoucher(data)
    toast.success('Voucher berhasil dibuat! 🎉')
  }
  const handleUpdate = (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => {
    if (editingVoucher) {
      updateVoucher(editingVoucher.id, data)
      toast.success('Voucher berhasil diperbarui!')
    }
  }
  const handleDelete = (id: string) => {
    deleteVoucher(id)
    setDeleteConfirm(null)
    toast.success('Voucher dihapus.')
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voucher & Diskon</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola voucher promosi dan diskon</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                     text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Buat Voucher
        </motion.button>
      </motion.div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kode voucher..."
            value={searchQuery}
            onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </motion.div>

      {/* ── Voucher Grid ───────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredVouchers.length > 0 ? (
          <motion.div
            key="grid"
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredVouchers.map((voucher, i) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                index={i}
                formatPrice={formatPrice}
                formatDate={formatDate}
                onEdit={() => { setEditingVoucher(voucher); setShowForm(true) }}
                onDelete={() => setDeleteConfirm(voucher.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Gift className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            </motion.div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Tidak ada voucher ditemukan</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voucher Form Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <VoucherForm
            voucher={editingVoucher}
            onClose={() => { setShowForm(false); setEditingVoucher(null) }}
            onSubmit={editingVoucher ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </motion.div>
              <h3 className="text-base font-semibold mb-1 text-gray-900 dark:text-white text-center">
                Hapus Voucher?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 text-center">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 text-sm font-medium dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/25"
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}