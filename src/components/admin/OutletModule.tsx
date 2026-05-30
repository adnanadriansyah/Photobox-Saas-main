'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  X,
  Check,
  Cpu,
  Globe,
  Loader2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface OutletData {
  id: string
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  isActive: boolean
  machineId: string
  createdAt: string
}

interface OutletFormProps {
  outlet?: OutletData | null
  onClose: () => void
  onSubmit: (data: {
    name: string
    address: string
    phone: string
    latitude: number
    longitude: number
    isActive: boolean
    machineId: string
  }) => void
}

function OutletForm({ outlet, onClose, onSubmit }: OutletFormProps) {
  const [formData, setFormData] = useState({
    name: outlet?.name || '',
    address: outlet?.address || '',
    phone: outlet?.phone || '',
    latitude: outlet?.latitude ?? 0,
    longitude: outlet?.longitude ?? 0,
    isActive: outlet?.isActive ?? true,
    machineId: outlet?.machineId || ''
  })

  useEffect(() => {
    setFormData({
      name: outlet?.name || '',
      address: outlet?.address || '',
      phone: outlet?.phone || '',
      latitude: outlet?.latitude ?? 0,
      longitude: outlet?.longitude ?? 0,
      isActive: outlet?.isActive ?? true,
      machineId: outlet?.machineId || ''
    })
  }, [outlet])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude)
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {outlet ? 'Edit Outlet' : 'Add New Outlet'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Outlet Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value as unknown as number })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value as unknown as number })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Machine ID</label>
            <input
              type="text"
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-gray-900 dark:text-white">Cancel</span>
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              {outlet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function OutletModule() {
  const { searchQuery } = useDashboardStore()
  const [outlets, setOutlets] = useState<OutletData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<OutletData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchOutlets = async () => {
    try {
      const res = await fetch('/api/admin/outlets')
      const data = await res.json()
      if (data.success) setOutlets(data.data)
      else toast.error('Failed to load outlets')
    } catch {
      toast.error('Failed to load outlets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOutlets() }, [])

  const handleCreate = async (formData: any) => {
    const res = await fetch('/api/admin/outlets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Outlet created successfully!')
      fetchOutlets()
    } else {
      toast.error(data.error || 'Failed to create outlet')
    }
  }

  const handleUpdate = async (formData: any) => {
    if (!editingOutlet) return
    const res = await fetch(`/api/admin/outlets?id=${editingOutlet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Outlet updated successfully!')
      fetchOutlets()
    } else {
      toast.error(data.error || 'Failed to update outlet')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/outlets?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      toast.success('Outlet deleted successfully!')
      setDeleteConfirm(null)
      fetchOutlets()
    } else {
      toast.error(data.error || 'Failed to delete outlet')
    }
  }

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Outlet Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your photo booth outlets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Outlet
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search outlets..."
          value={searchQuery}
          onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOutlets.map((outlet) => (
          <motion.div
            key={outlet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border dark:border-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${outlet.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{outlet.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                outlet.isActive
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {outlet.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{outlet.address}</span>
              </div>
              {outlet.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{outlet.phone}</span>
                </div>
              )}
              {outlet.machineId && (
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span className="font-mono text-xs">{outlet.machineId}</span>
                </div>
              )}
              {(outlet.latitude || outlet.longitude) && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="text-xs">{outlet.latitude}, {outlet.longitude}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingOutlet(outlet)
                  setShowForm(true)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(outlet.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOutlets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No outlets found</p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <OutletForm
            outlet={editingOutlet}
            onClose={() => {
              setShowForm(false)
              setEditingOutlet(null)
            }}
            onSubmit={editingOutlet ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Outlet?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this outlet?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
