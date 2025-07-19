'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Input, 
  Select,
  LoadingSpinner 
} from '@/components/ui'
import { useRouter } from 'next/navigation'
import ProductImage from '@/components/ProductImage'

export default function CreateSalePage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState({
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax',
    currencySymbol: '$'
  })
  const [draftSaved, setDraftSaved] = useState(false)
  const [showDraftNotification, setShowDraftNotification] = useState(false)

  const DRAFT_STORAGE_KEY = `pos_draft_cart_${user?.id || 'anonymous'}`

  useEffect(() => {
    fetchItems()
    fetchCategories()
    fetchSettings()
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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Draft management functions
  const saveDraft = () => {
    if (cart.length > 0) {
      const draftData = {
        cart: cart,
        timestamp: new Date().toISOString(),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      setDraftSaved(true)
      setShowDraftNotification(true)
      setTimeout(() => setShowDraftNotification(false), 3000)
    }
  }

  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (draftData) {
        const parsed = JSON.parse(draftData)
        setCart(parsed.cart)
        setDraftSaved(true)
        alert(`Draft loaded with ${parsed.itemCount} items from ${new Date(parsed.timestamp).toLocaleString()}`)
        return true
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return false
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setCart([])
    setDraftSaved(false)
  }

  const hasDraft = () => {
    try {
      const draftData = localStorage.getItem(DRAFT_STORAGE_KEY)
      return draftData && JSON.parse(draftData).cart.length > 0
    } catch {
      return false
    }
  }

  // Auto-save draft when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft()
      }, 1000) // Auto-save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    } else if (cart.length === 0 && draftSaved) {
      // Clear draft if cart is empty
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setDraftSaved(false)
    }
  }, [cart, DRAFT_STORAGE_KEY, draftSaved])

  // Load draft on component mount
  useEffect(() => {
    if (user && hasDraft()) {
      const shouldLoad = window.confirm('You have a saved draft cart. Would you like to load it?')
      if (shouldLoad) {
        loadDraft()
      }
    }
  }, [user, DRAFT_STORAGE_KEY])

  const addToCart = (item) => {
    if (item.stock <= 0) {
      alert('This item is out of stock')
      return
    }

    const existingIndex = cart.findIndex(cartItem => cartItem.itemId === item.id)
    
    if (existingIndex >= 0) {
      const newCart = [...cart]
      const newQuantity = newCart[existingIndex].quantity + 1
      
      if (newQuantity > item.stock) {
        alert('Not enough stock available')
        return
      }
      
      newCart[existingIndex].quantity = newQuantity
      newCart[existingIndex].total = newQuantity * item.price
      setCart(newCart)
    } else {
      setCart([...cart, {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        total: item.price
      }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.itemId !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    const item = items.find(i => i.id === itemId)
    if (newQuantity > item.stock) {
      alert('Not enough stock available')
      return
    }

    setCart(cart.map(cartItem => 
      cartItem.itemId === itemId 
        ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.price }
        : cartItem
    ))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    if (!settings.taxEnabled) return 0
    return calculateTotal() * (settings.taxRate / 100)
  }

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax()
  }

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart')
      return
    }

    setProcessing(true)

    try {
      const saleData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateGrandTotal(),
        userId: user.id
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      })

      if (response.ok) {
        alert('Sale completed successfully!')
        clearDraft() // Clear the draft after successful sale
        router.push('/dashboard/sales')
      } else {
        alert('Error processing sale')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error processing sale')
    } finally {
      setProcessing(false)
    }
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearDraft()
    }
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId.toString() === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
        <div className="h-full">
          {/* Draft notification */}
          {showDraftNotification && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Draft saved successfully!
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 
                className="text-2xl font-bold transition-colors"
                style={{ color: isDark ? '#ffffff' : '#111827' }}
              >
                Point of Sale
              </h1>
              <p 
                className="transition-colors"
                style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
              >
                Select items to add to cart
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Draft controls */}
              <div className="flex gap-2">
                {draftSaved && (
                  <span 
                    className="px-2 py-1 text-sm rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
                      color: isDark ? '#93c5fd' : '#1e40af'
                    }}
                  >
                    Draft saved
                  </span>
                )}
                {hasDraft() && (
                  <button
                    onClick={loadDraft}
                    className="px-3 py-2 text-white rounded-lg text-sm transition-colors duration-200"
                    style={{
                      backgroundColor: isDark ? '#1d4ed8' : '#2563eb'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? '#1e40af' : '#1d4ed8'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = isDark ? '#1d4ed8' : '#2563eb'
                    }}
                  >
                    Load Draft
                  </button>
                )}
                {cart.length > 0 && (
                  <>
                    <button
                      onClick={saveDraft}
                      className="px-3 py-2 text-white rounded-lg text-sm transition-colors duration-200"
                      style={{
                        backgroundColor: isDark ? '#4b5563' : '#6b7280'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDark ? '#374151' : '#4b5563'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = isDark ? '#4b5563' : '#6b7280'
                      }}
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={clearDraft}
                      className="px-3 py-2 text-white rounded-lg text-sm transition-colors duration-200"
                      style={{
                        backgroundColor: isDark ? '#dc2626' : '#ef4444'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDark ? '#b91c1c' : '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = isDark ? '#dc2626' : '#ef4444'
                      }}
                    >
                      Clear Cart
                    </button>
                  </>
                )}
              </div>
              <span 
                className="text-sm transition-colors"
                style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
              >
                Cashier: {user?.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Items Grid */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <h3 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      Items
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sm:w-64"
                      />
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        options={[
                          { value: 'all', label: 'All Categories' },
                          ...categories.map(category => ({
                            value: category.id.toString(),
                            label: category.name
                          }))
                        ]}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className={`rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          item.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          borderColor: isDark ? '#374151' : '#e5e7eb',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        onMouseEnter={(e) => {
                          if (item.stock > 0) {
                            e.target.style.borderColor = isDark ? '#3b82f6' : '#2563eb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = isDark ? '#374151' : '#e5e7eb'
                        }}
                      >
                        <div 
                          className="aspect-square rounded-lg mb-3 flex items-center justify-center p-2 transition-colors"
                          style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                        >
                          <ProductImage item={item} size="xl" className="w-full h-full" />
                        </div>
                        <div className="text-center">
                          <h4 
                            className="font-medium text-sm mb-1 truncate transition-colors"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                          >
                            {item.name}
                          </h4>
                          <p 
                            className="text-xs mb-2 transition-colors"
                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                          >
                            {item.category.name}
                          </p>
                          <p 
                            className="text-lg font-bold transition-colors"
                            style={{ color: isDark ? '#60a5fa' : '#2563eb' }}
                          >
                            {settings.currencySymbol}{item.price.toFixed(2)}
                          </p>
                          <p 
                            className="text-xs mt-1 transition-colors"
                            style={{ 
                              color: item.stock <= 5 
                                ? (isDark ? '#f87171' : '#ef4444') 
                                : (isDark ? '#4ade80' : '#16a34a') 
                            }}
                          >
                            Stock: {item.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredItems.length === 0 && (
                    <div 
                      className="text-center py-8 transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      No items found matching your criteria
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      Cart ({cart.length})
                    </h3>
                    {cart.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearCart}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-4 flex flex-col h-full">
                  {cart.length === 0 ? (
                    <div 
                      className="flex-1 flex items-center justify-center transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">🛒</div>
                        <p>Cart is empty</p>
                        <p className="text-sm">Click on items to add them</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {cart.map((item) => (
                          <div 
                            key={item.itemId} 
                            className="rounded-lg p-3 transition-colors"
                            style={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <ProductImage item={item} size="sm" />
                                <div>
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.price.toFixed(2)} each</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.itemId)}
                                className="ml-2 p-1 h-6 w-6"
                              >
                                ×
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{settings.currencySymbol}{item.total.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-900 dark:text-gray-100">
                          <span>Subtotal:</span>
                          <span>{settings.currencySymbol}{calculateTotal().toFixed(2)}</span>
                        </div>
                        {settings.taxEnabled && (
                          <div className="flex justify-between text-sm text-gray-900 dark:text-gray-100">
                            <span>{settings.taxName} ({settings.taxRate}%):</span>
                            <span>{settings.currencySymbol}{calculateTax().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-900 dark:text-white">
                          <span>Total:</span>
                          <span>{settings.currencySymbol}{calculateGrandTotal().toFixed(2)}</span>
                        </div>
                        
                        <Button
                          onClick={processSale}
                          variant="success"
                          className="w-full mt-4"
                          disabled={processing}
                        >
                          {processing ? (
                            <div className="flex items-center space-x-2">
                              <LoadingSpinner size="sm" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Complete Sale'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
