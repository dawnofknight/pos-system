import { useState } from 'react'
import { Button } from '@/components/ui'

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  onImageRemoved,
  className = ''
}) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'url'
  const [error, setError] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onImageUploaded(data.filename, data.type)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL')
      return
    }

    setUploading(true)
    setError('')

    try {
      console.log('Uploading image from URL:', imageUrl.trim())
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() })
      })

      const data = await response.json()
      console.log('Upload response:', data)

      if (data.success) {
        onImageUploaded(data.filename, data.type)
        setImageUrl('')
      } else {
        console.error('Upload failed:', data.error)
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    onImageRemoved()
    setError('')
  }

  const getImageSrc = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return `/uploads/items/${imagePath}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        
        {/* Current Image Display */}
        {currentImage && (
          <div className="mb-4 relative inline-block">
            <img
              src={getImageSrc(currentImage)}
              alt="Product"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Method Selection */}
        {!currentImage && (
          <div className="mb-3">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                From URL
              </label>
            </div>
          </div>
        )}

        {/* File Upload */}
        {!currentImage && uploadMethod === 'file' && (
          <div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 5MB. Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        )}

        {/* URL Upload */}
        {!currentImage && uploadMethod === 'url' && (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={uploading || !imageUrl.trim()}
              variant="outline"
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Upload from URL'}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}

        {/* Loading State */}
        {uploading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processing image...</span>
          </div>
        )}
      </div>
    </div>
  )
}
