import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card } from "@/components/ui/card"
import { Trend } from '@/types/admin'
import { Modal } from '@/components/ui/Modal'
import Image from 'next/image'

export function TrendsTab() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    imageUrls: [''],
    mainImageIndex: 0,
    spreadsheetUrl: ''
  })
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState<'details' | 'images' | 'data'>('details')

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/admin/trends')
        if (!response.ok) throw new Error('Failed to fetch trends')
        const data = await response.json()
        setTrends(data)
      } catch {
        toast.error('Failed to load trends')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [])

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls]
    newImageUrls[index] = value
    setFormData({ ...formData, imageUrls: newImageUrls })
  }

  const addImageUrl = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] })
  }

  const removeImageUrl = (index: number) => {
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index)
    setFormData({ 
      ...formData, 
      imageUrls: newImageUrls,
      mainImageIndex: formData.mainImageIndex >= index ? Math.max(0, formData.mainImageIndex - 1) : formData.mainImageIndex
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileUpload = useCallback((files: File[]) => {
    const newFiles = files.slice(0, 10 - uploadedImages.length) // Limit to 10 images total
    if (newFiles.length < files.length) {
      toast.error('Maximum 10 images allowed')
    }

    setUploadedImages(prev => [...prev, ...newFiles])

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [uploadedImages.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) {
      toast.error('Please drop only image files')
      return
    }

    handleFileUpload(files)
  }, [handleFileUpload])

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setUploadedImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.description.trim()) throw new Error('Description is required')
      if (!formData.type.trim()) throw new Error('Type is required')
      if (formData.imageUrls[0].trim().length === 0 && uploadedImages.length === 0) {
        throw new Error('At least one image is required')
      }
      if (!formData.spreadsheetUrl.trim()) throw new Error('Google Spreadsheet URL is required')

      // First, upload any files
      const uploadedUrls: string[] = []
      if (uploadedImages.length > 0) {
        const formData = new FormData()
        uploadedImages.forEach(file => {
          formData.append('files', file)
        })

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) throw new Error('Failed to upload images')
        const uploadedData = await uploadResponse.json()
        uploadedUrls.push(...uploadedData.urls)
      }

      // Create the trend
      const response = await fetch('/api/admin/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrls: [
            ...formData.imageUrls.filter(url => url.trim()),
            ...uploadedUrls
          ],
        }),
      })

      if (!response.ok) throw new Error('Failed to create trend')

      const newTrend = await response.json()
      setTrends([...trends, newTrend])
      setIsModalOpen(false)
      setFormData({
        title: '',
        description: '',
        type: '',
        imageUrls: [''],
        mainImageIndex: 0,
        spreadsheetUrl: ''
      })
      setUploadedImages([])
      setUploadedImagePreviews([])
      toast.success('Trend created successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create trend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Enter trend title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all min-h-[100px]"
                placeholder="Enter trend description"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-foreground">
                Type
              </label>
              <input
                type="text"
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Enter trend type (e.g., Fashion, Technology)"
                required
              />
            </div>
          </div>
        )

      case 'images':
        return (
          <div className="space-y-6">
            {/* Image Upload Zone */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium">Drag and drop your images here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  You can upload up to 10 images. Supported formats: PNG, JPG, JPEG, GIF
                </p>
                <p className="text-sm text-muted-foreground">
                  Images will be resized and optimized automatically. Maximum file size: 5MB
                </p>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t forget to set your main image after uploading
                </p>
                <p className="text-sm text-muted-foreground">
                  You can also provide image URLs instead of uploading files
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {(uploadedImagePreviews.length > 0 || formData.imageUrls.some(url => url.trim())) && (
              <div className="space-y-4">
                <h3 className="font-medium">Added Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedImagePreviews.map((preview, index) => (
                    <div key={`upload-${index}`} className="relative group aspect-video">
                      <Image
                        src={preview}
                        alt={`Upload preview ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.imageUrls.map((url, index) => url.trim() && (
                    <div key={`url-${index}`} className="relative group aspect-video">
                      <Image
                        src={url}
                        alt={`URL preview ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image URL Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Add Image URLs</h3>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="text-sm text-primary hover:text-primary/90 transition-colors"
                >
                  + Add URL
                </button>
              </div>
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    placeholder="Enter image URL"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="p-2 text-destructive hover:text-destructive/90 transition-colors"
                    disabled={formData.imageUrls.length === 1 && index === 0}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="spreadsheet" className="text-sm font-medium text-foreground">
                Google Spreadsheet URL
              </label>
              <input
                type="url"
                id="spreadsheet"
                value={formData.spreadsheetUrl}
                onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Enter Google Spreadsheet URL"
                required
              />
              <p className="text-xs text-muted-foreground">
                The spreadsheet should have &apos;trend&apos; and &apos;date&apos; columns
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Spreadsheet Requirements</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Must be a publicly accessible Google Spreadsheet</li>
                <li>Required columns: &apos;trend&apos; (numeric values) and &apos;date&apos; (YYYY-MM-DD format)</li>
                <li>Data should be sorted by date in ascending order</li>
                <li>Minimum of 6 months of historical data recommended</li>
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trends Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add New Trend
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map(trend => (
            <Card key={trend.id} className="p-4">
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                {trend.imageUrls[0] && (
                  <Image 
                    src={trend.imageUrls[0]} 
                    alt={trend.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{trend.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{trend.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(trend.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {trend.type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Trend">
        <div className="mb-6">
          <div className="flex border-b">
            {(['details', 'images', 'data'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                  currentTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderTabContent()}

          <div className="flex justify-between items-center pt-6 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {currentTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentTab === 'images' ? 'details' : 'images')}
                  className="px-4 py-2 text-primary hover:text-primary/90 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentTab !== 'data' ? (
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentTab === 'details' ? 'images' : 'data')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Trend'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
} 