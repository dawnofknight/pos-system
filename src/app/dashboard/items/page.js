'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeaderCell, 
  Button, 
  Input, 
  Select, 
  Modal, 
  LoadingSpinner 
} from '@/components/ui'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    emoji: '',
    image: '',
    imageType: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater'
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchItems()
        setShowModal(false)
        setEditingItem(null)
        resetForm()
        alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to save item'}`)
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    console.log('Edit clicked for item:', item)
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      stock: item.stock.toString(),
      categoryId: item.categoryId.toString(),
      emoji: item.emoji || '',
      image: item.image || '',
      imageType: item.imageType || ''
    })
    setErrors({})
    setShowModal(true)
    console.log('Modal should be showing now, showModal:', true)
  }

  const handleAddNew = () => {
    console.log('Add new clicked')
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      emoji: '',
      image: '',
      imageType: ''
    })
    setErrors({})
    setShowModal(true)
    console.log('Modal should be showing now, showModal:', true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchItems()
        }
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const handleImageUploaded = (filename, type) => {
    setFormData(prev => ({
      ...prev,
      image: filename,
      imageType: type
    }))
  }

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imageType: ''
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      emoji: '',
      image: '',
      imageType: ''
    })
    setErrors({})
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }))

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-orange-50 to-red-50 p-8">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-black">
                    Items Management
                  </h1>
                  <p className="text-black mt-1">
                    Manage your inventory items and stock levels
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAddNew}
                variant="primary"
                icon="+"
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-600 hover:bg-orange-700"
              >
                Add New Item
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-red-400/10 rounded-full blur-3xl"></div>
          </div>

          <Card variant="glass" hover={true} className="backdrop-blur-xl border border-white/20 shadow-2xl">
           <CardHeader variant="glass" className="card-header-orange">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      Inventory Items
                    </h3>
                    <p className="text-sm text-orange-600">
                      {items.length} items in stock
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Item</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Stock</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <div className="w-14 h-14 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg">
                              <img
                                src={item.image.startsWith('http') ? item.image : `/uploads/items/${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl shadow-lg">
                              {item.emoji || '📦'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-emerald-600">
                          ${item.price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                          item.stock < 10 
                            ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-200' 
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                        }`}>
                          {item.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            icon="✏️"
                            className="hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(item.id)}
                            icon="🗑️"
                            className="hover:shadow-lg transition-all duration-200"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <Modal 
            isOpen={showModal} 
            onClose={() => {
              setShowModal(false)
              setEditingItem(null)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <span className="text-lg">{editingItem ? '✏️' : '➕'}</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </span>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={errors.name}
                icon="🏷️"
                variant="glass"
                placeholder="Enter item name"
              />
              
              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description"
                icon="📝"
                variant="glass"
              />

              <Input
                label="Emoji Icon"
                name="emoji"
                value={formData.emoji}
                onChange={handleInputChange}
                placeholder="📦 (optional emoji for visual identification)"
                maxLength={4}
                icon="😊"
                variant="glass"
              />

              <ImageUpload
                currentImage={formData.image}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Price (Rp)"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  error={errors.price}
                  icon="💰"
                  variant="glass"
                  placeholder="0.00"
                />
                
                <Input
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  error={errors.stock}
                  icon="📊"
                  variant="glass"
                  placeholder="0"
                />
              </div>
              
              <Select
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select a category' },
                  ...categoryOptions
                ]}
                required
                error={errors.categoryId}
                icon="📂"
                variant="glass"
              />
              
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting}
                  icon={isSubmitting ? "⏳" : (editingItem ? "✅" : "➕")}
                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  icon="❌"
                  className="flex-1 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
