'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Types
// ============================================

interface LocationData {
  id: string
  name: string
  location: string
  mapsUrl: string
  status: 'online' | 'offline' | 'error'
  createdAt: string
}

// ============================================
// Location Form Component
// ============================================

interface LocationFormProps {
  outlet?: LocationData | null
  onClose: () => void
  onSubmit: (data: {
    name: string
    location: string
    mapsUrl: string
    status: 'online' | 'offline' | 'error'
  }) => void
}

function LocationForm({ outlet, onClose, onSubmit }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: outlet?.name || '',
    location: outlet?.location || '',
    mapsUrl: outlet?.mapsUrl || '',
    status: outlet?.status || 'online'
  })

  useEffect(() => {
    setFormData({
      name: outlet?.name || '',
      location: outlet?.location || '',
      mapsUrl: outlet?.mapsUrl || '',
      status: outlet?.status || 'online'
    })
  }, [outlet])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {outlet ? 'Edit Location' : 'Add Location'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Location Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Pick Location on Map
              </label>
              <div className="space-y-2">
                <div className="relative w-full h-36 rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <iframe
                    id="map-embed"
                    className="w-full h-full"
                    src={formData.mapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56398935027!2d106.698688671875!3d-6.208763868808566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b5c7%3A0x2e69f5390917b5c7!2sJakarta!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => window.open('https://www.google.com/maps', '_blank')}
                  className="w-full px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Open Google Maps
                </button>
                <input
                  type="url"
                  value={formData.mapsUrl}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  placeholder="Paste Google Maps embed URL here..."
                  className="w-full px-3 py-2 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </label>
              <div className="flex gap-1.5">
                {(['online', 'offline', 'error'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      formData.status === s
                        ? s === 'online'
                          ? 'bg-green-500 text-white shadow-sm'
                          : s === 'offline'
                          ? 'bg-gray-400 text-white dark:bg-gray-500 shadow-sm'
                          : 'bg-red-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t dark:border-gray-800 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              {outlet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Location Module Component
// ============================================

export function LocationModule() {
  const { searchQuery } = useDashboardStore()
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/outlets')
      const json = await res.json()
      if (json.success) {
        setLocations(json.data.map((o: any) => ({
          id: o.id,
          name: o.name,
          location: o.address || o.location || '',
          mapsUrl: o.mapsUrl || '',
          status: o.status || 'online',
          createdAt: o.createdAt
        })))
      } else {
        toast.error('Failed to load locations')
      }
    } catch {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLocations() }, [])

  const handleCreate = async (data: { name: string; location: string; mapsUrl: string; status: 'online' | 'offline' | 'error' }) => {
    try {
      const res = await fetch('/api/admin/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          address: data.location,
          mapsUrl: data.mapsUrl,
          status: data.status
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Location created successfully!')
        fetchLocations()
      } else {
        toast.error(json.error || 'Failed to create location')
      }
    } catch {
      toast.error('Failed to create location')
    }
  }

  const handleUpdate = async (data: { name: string; location: string; mapsUrl: string; status: 'online' | 'offline' | 'error' }) => {
    if (!editingLocation) return
    try {
      const res = await fetch(`/api/admin/outlets?id=${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          location: data.location,
          mapsUrl: data.mapsUrl,
          status: data.status
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Location updated successfully!')
        fetchLocations()
      } else {
        toast.error(json.error || 'Failed to update location')
      }
    } catch {
      toast.error('Failed to update location')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/outlets?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Location deleted successfully!')
        setDeleteConfirm(null)
        fetchLocations()
      } else {
        toast.error(json.error || 'Failed to delete location')
      }
    } catch {
      toast.error('Failed to delete location')
    }
  }

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openMaps = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage outlet locations and maps</p>
        </div>
        <button
          onClick={() => { setEditingLocation(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border dark:border-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                location.status === 'online'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : location.status === 'offline'
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {location.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {location.location}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => openMaps(location.mapsUrl)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Open Map</span>
              </button>
              <button
                onClick={() => {
                  setEditingLocation(location)
                  setShowForm(true)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(location.id)}
                className="flex items-center justify-center px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No locations found</p>
          <button
            onClick={() => { setEditingLocation(null); setShowForm(true) }}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Add your first location
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Location?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this location?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <LocationForm
            outlet={editingLocation}
            onClose={() => {
              setShowForm(false)
              setEditingLocation(null)
            }}
            onSubmit={editingLocation ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
