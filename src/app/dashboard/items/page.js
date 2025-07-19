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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
              <p className="text-gray-600">Manage your inventory items</p>
            </div>
            <Button 
              onClick={handleAddNew}
              variant="primary"
            >
              Add New Item
            </Button>
          </div>

          <Card>
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
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <div className="w-12 h-12 overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={item.image.startsWith('http') ? item.image : `/uploads/items/${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                              {item.emoji || '📦'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(item.id)}
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
            title={editingItem ? 'Edit Item' : 'Add New Item'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={errors.name}
              />
              
              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description"
              />

              <Input
                label="Emoji"
                name="emoji"
                value={formData.emoji}
                onChange={handleInputChange}
                placeholder="📦 (optional emoji for visual identification)"
                maxLength={4}
              />

              <ImageUpload
                currentImage={formData.image}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
              />
              
              <Input
                label="Price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
                error={errors.price}
              />
              
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                required
                error={errors.stock}
              />
              
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
              />
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
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
