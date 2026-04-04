// ============================================
// Gallery Module - Admin Gallery Management
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Copy, Check, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Gallery {
  id: string
  galleryCode: string
  photos: string[]
  status: string
  outlet: string
  frame: string
  totalPrice: number
  createdAt: string
  expiresAt: string | null
}

export function GalleryModule() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/admin/gallery')
      const data = await response.json()
      if (data.success) {
        setGalleries(data.data)
      } else {
        toast.error('Failed to fetch galleries')
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
      toast.error('Failed to fetch galleries')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Gallery code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleViewGallery = (code: string) => {
    window.open(`/gallery?code=${code}`, '_blank')
  }

  const filteredGalleries = galleries.filter(gallery =>
    gallery.galleryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.outlet.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage photo galleries and codes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGalleries}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Gallery
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search galleries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGalleries.map((gallery) => (
          <div key={gallery.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {gallery.galleryCode}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {gallery.outlet} • {gallery.frame}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                gallery.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {gallery.status}
              </span>
            </div>

            {/* Photo Preview */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {gallery.photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
              ))}
              {gallery.photos.length > 4 && (
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">+{gallery.photos.length - 4}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCopyCode(gallery.galleryCode)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {copiedCode === gallery.galleryCode ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedCode === gallery.galleryCode ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={() => handleViewGallery(gallery.galleryCode)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Rp {gallery.totalPrice.toLocaleString()}</span>
                <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <Eye className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No galleries found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first gallery to get started'}
          </p>
        </div>
      )}

      {/* Add Gallery Modal */}
      {showAddModal && (
        <AddGalleryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchGalleries()
          }}
        />
      )}
    </div>
  )
}

// ============================================
// Add Gallery Modal Component
// ============================================

function AddGalleryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [galleryCode, setGalleryCode] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')
  const [totalPrice, setTotalPrice] = useState(25000)
  const [loading, setLoading] = useState(false)

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotos([...photos, photoInput.trim()])
      setPhotoInput('')
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleAddGallery = async () => {
    // If gallery code provided, must have photos
    if (galleryCode.trim() && photos.length === 0) {
      toast.error('Photos are required when providing gallery code')
      return
    }

    // If no gallery code and no photos, this will create new session
    if (!galleryCode.trim() && photos.length === 0) {
      // This is fine - will create empty session
    }

    setLoading(true)
    try {
      let requestData: any = {
        totalPrice,
      }

      if (galleryCode.trim()) {
        // Manual gallery code
        requestData.galleryCode = galleryCode.trim()
        requestData.photos = photos
      } else {
        // Auto-generate new session
        const outlet = await fetch('/api/admin/outlets').then(r => r.json())
        if (outlet.success && outlet.data.length > 0) {
          requestData.outletId = outlet.data[0].id
        } else {
          toast.error('No outlet found')
          return
        }
      }

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(galleryCode.trim() ? 'Gallery added successfully!' : 'New gallery session created!')
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to add gallery')
      }
    } catch (error) {
      console.error('Error adding gallery:', error)
      toast.error('Failed to add gallery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Gallery</h3>

        <form onSubmit={handleAddGallery} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gallery Code <span className="text-gray-500">(optional - will auto-generate if empty)</span>
            </label>
            <input
              type="text"
              value={galleryCode}
              onChange={(e) => setGalleryCode(e.target.value.toUpperCase())}
              placeholder="e.g., MHN2 (leave empty for auto-generate)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Price (Rp)
            </label>
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="/photos/photo1.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {photos.map((photo, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{photo}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
