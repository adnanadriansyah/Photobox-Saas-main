'use client'

import { useState, useEffect } from 'react'
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
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

interface VoucherData {
  id: string
  code: string
  type: string
  value: number
  minOrder: number
  maxUses: number
  usedCount: number
  usageType: string
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}

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

interface VoucherFormProps {
  voucher?: VoucherData | null
  onClose: () => void
  onSubmit: (data: any) => void
}

function VoucherForm({ voucher, onClose, onSubmit }: VoucherFormProps) {
  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    type: voucher?.type || 'PERCENTAGE',
    value: voucher?.value ?? 0,
    minOrder: voucher?.minOrder ?? 0,
    maxUses: voucher?.maxUses ?? 100,
    usageType: voucher?.usageType || 'MULTI_USE',
    validFrom: voucher?.validFrom ? voucher.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: voucher?.validUntil ? voucher.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: voucher?.isActive ?? true
  })

  useEffect(() => {
    setFormData({
      code: voucher?.code || '',
      type: voucher?.type || 'PERCENTAGE',
      value: voucher?.value ?? 0,
      minOrder: voucher?.minOrder ?? 0,
      maxUses: voucher?.maxUses ?? 100,
      usageType: voucher?.usageType || 'MULTI_USE',
      validFrom: voucher?.validFrom ? voucher.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: voucher?.validUntil ? voucher.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: voucher?.isActive ?? true
    })
  }, [voucher])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      value: Number(formData.value),
      minOrder: Number(formData.minOrder),
      maxUses: Number(formData.maxUses),
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
              Kode Voucher
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={inputClass}
              required
              placeholder="e.g. PROMO50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Tipe Diskon
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={inputClass}
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED">Nominal Tetap (Rp)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Nilai {formData.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
              className={inputClass}
              required min="0"
              max={formData.type === 'PERCENTAGE' ? 100 : undefined}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Minimum Pembelian (Rp)
            </label>
            <input
              type="number"
              value={formData.minOrder}
              onChange={(e) => setFormData({ ...formData, minOrder: parseInt(e.target.value) || 0 })}
              className={inputClass}
              required min="0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Tipe Pemakaian
            </label>
            <select
              value={formData.usageType}
              onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
              className={inputClass}
            >
              <option value="MULTI_USE">Multi Use</option>
              <option value="SINGLE_USE">Single Use</option>
            </select>
          </div>

          {formData.usageType === 'MULTI_USE' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease }}
            >
              <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Batas Pemakaian
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className={inputClass}
                required min="1"
              />
            </motion.div>
          )}

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

function VoucherCard({
  voucher,
  index,
  onEdit,
  onDelete,
  formatPrice,
  formatDate
}: {
  voucher: VoucherData
  index: number
  onEdit: () => void
  onDelete: () => void
  formatPrice: (n: number) => string
  formatDate: (s: string) => string
}) {
  const usagePct = voucher.maxUses > 0
    ? Math.min((voucher.usedCount / voucher.maxUses) * 100, 100)
    : 0

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
      <div
        className="h-1 w-full transition-all duration-500"
        style={{
          background: voucher.isActive
            ? 'linear-gradient(90deg, #ec4899, #7c3aed)'
            : '#e5e7eb'
        }}
      />

      <div className="p-4">
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

        <div className="flex items-baseline gap-1.5 mb-4">
          {voucher.type === 'PERCENTAGE'
            ? <Percent className="w-5 h-5 text-emerald-500 self-center" />
            : <DollarSign className="w-5 h-5 text-emerald-500 self-center" />
          }
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {voucher.type === 'PERCENTAGE'
              ? `${voucher.value}%`
              : formatPrice(voucher.value)
            }
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 self-end pb-0.5">diskon</span>
        </div>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex justify-between">
            <span>Min. pembelian</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{formatPrice(voucher.minOrder)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tipe</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {voucher.usageType === 'SINGLE_USE' ? 'Single Use' : 'Multi Use'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(voucher.validFrom)} – {formatDate(voucher.validUntil)}</span>
          </div>
        </div>

        {voucher.usageType === 'MULTI_USE' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 dark:text-gray-400">Pemakaian</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {voucher.usedCount} / {voucher.maxUses}
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
        )}

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

export function VoucherModule() {
  const { searchQuery } = useDashboardStore()
  const [vouchers, setVouchers] = useState<VoucherData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<VoucherData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/admin/vouchers')
      const data = await res.json()
      if (data.success) setVouchers(data.data)
      else toast.error('Failed to load vouchers')
    } catch {
      toast.error('Failed to load vouchers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVouchers() }, [])

  const handleCreate = async (formData: any) => {
    const res = await fetch('/api/admin/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Voucher berhasil dibuat!')
      fetchVouchers()
    } else {
      toast.error(data.error || 'Gagal membuat voucher')
    }
  }

  const handleUpdate = async (formData: any) => {
    if (!editingVoucher) return
    const res = await fetch(`/api/admin/vouchers?id=${editingVoucher.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Voucher berhasil diperbarui!')
      fetchVouchers()
    } else {
      toast.error(data.error || 'Gagal memperbarui voucher')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      toast.success('Voucher dihapus.')
      setDeleteConfirm(null)
      fetchVouchers()
    } else {
      toast.error(data.error || 'Gagal menghapus voucher')
    }
  }

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all'
      || (filterStatus === 'active' && voucher.isActive)
      || (filterStatus === 'inactive' && !voucher.isActive)
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      <AnimatePresence>
        {showForm && (
          <VoucherForm
            voucher={editingVoucher}
            onClose={() => { setShowForm(false); setEditingVoucher(null) }}
            onSubmit={editingVoucher ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>

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
