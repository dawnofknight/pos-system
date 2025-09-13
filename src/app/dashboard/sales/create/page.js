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
  const [paymentMethods, setPaymentMethods] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
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
    fetchPaymentMethods()
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

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data)
        // Set default payment method to first enabled one
        const defaultMethod = data.find(pm => pm.enabled)
        if (defaultMethod && !selectedPaymentMethod) {
          setSelectedPaymentMethod(defaultMethod.id.toString())
        }
      } else {
        console.error('Failed to fetch payment methods:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
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

    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
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
        userId: user.id,
        paymentMethodId: parseInt(selectedPaymentMethod)
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

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-orange-900/20 dark:via-gray-900 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/30 backdrop-blur-xl mb-8">
            <div className="absolute inset-0 bg-orange-50/50 dark:bg-orange-900/20" />
            <div className="relative px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <span className="text-white text-2xl">🛒</span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-black dark:bg-gradient-to-r dark:from-orange-400 dark:via-orange-500 dark:to-orange-300 dark:bg-clip-text dark:text-transparent">
                        Point of Sale
                      </h1>
                      <p className="text-black dark:text-orange-300 mt-1">
                        Select items to add to cart • Cashier: <span className="font-medium text-black dark:text-orange-400">{user?.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {draftSaved && (
                    <span className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 rounded-xl border border-green-200/50 dark:border-green-700/30 shadow-sm">
                      ✓ Draft saved
                    </span>
                  )}
                  {hasDraft() && (
                    <Button
                        onClick={loadDraft}
                        variant="primary"
                        size="sm"
                        icon="📂"
                        className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-orange-600 hover:from-primary-700 hover:to-orange-700"
                      >
                        Load Draft
                      </Button>
                  )}
                  {cart.length > 0 && (
                    <>
                      <Button
                        onClick={saveDraft}
                        variant="secondary"
                        size="sm"
                        icon="💾"
                        className="shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Save Draft
                      </Button>
                      <Button
                        onClick={clearDraft}
                        variant="danger"
                        size="sm"
                        icon="🗑️"
                        className="shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Clear Cart
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
            {/* Items Grid */}
            <div className="xl:col-span-3">
              <Card className="h-full glass-effect">
                <CardHeader variant="glass" className="card-header-orange">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <span className="text-xl">🍽️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Menu Items
                        </h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {filteredItems.length} items available
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative">
                        <Input
                          placeholder="🔍 Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="sm:w-64 pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="min-w-[160px]"
                      >
                        <option value="all">🏷️ All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className={`group relative bg-card rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border ${
                          item.stock <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-primary-300 dark:hover:border-primary-600'
                        }`}
                      >
                        {/* Stock badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.stock <= 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            item.stock <= 5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`}>
                            {item.stock <= 0 ? 'Out' : item.stock}
                          </span>
                        </div>
                        
                        {/* Product image */}
                        <div className="aspect-square rounded-lg mb-3 bg-muted flex items-center justify-center p-2 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                          <ProductImage item={item} size="xl" className="w-full h-full object-cover rounded-md" />
                        </div>
                        
                        {/* Product info */}
                        <div className="text-center space-y-1">
                          <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.category.name}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {settings.currencySymbol}{item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Hover overlay */}
                        {item.stock > 0 && (
                          <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              + Add to Cart
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8 transition-colors text-muted-foreground">
                      No items found matching your criteria
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Cart */}
            <div className="xl:col-span-1">
              <Card className="h-full glass-effect flex flex-col">
                <CardHeader variant="glass" className="card-header-orange">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <span className="text-xl">🛒</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Cart
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    {cart.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        🗑️ Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-4 flex flex-col flex-1 min-h-0">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🛒</span>
                        </div>
                        <div>
                          <p className="font-medium">Cart is empty</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">Click on items to add them</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full min-h-0">
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar min-h-0">
                        {cart.map((item) => (
                          <div 
                            key={item.itemId} 
                            className="bg-muted rounded-xl p-4 border border-border hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center flex-shrink-0">
                                <ProductImage item={item} size="sm" className="w-8 h-8 object-cover rounded" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.price.toFixed(2)} each</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.itemId)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-card rounded-lg border border-border">
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-l-lg transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="w-12 text-center text-sm font-medium text-foreground border-x border-border py-2">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-r-lg transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{settings.currencySymbol}{item.total.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="bg-card rounded-xl p-4 border border-border space-y-3 flex-shrink-0">
                        <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium text-foreground">{settings.currencySymbol}{calculateTotal().toFixed(2)}</span>
                          </div>
                          {settings.taxEnabled && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{settings.taxName} ({settings.taxRate}%):</span>
                              <span className="font-medium text-foreground">{settings.currencySymbol}{calculateTax().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                            <div className="flex justify-between">
                              <span className="text-lg font-bold text-foreground">Total:</span>
                              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{settings.currencySymbol}{calculateGrandTotal().toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Method Selection */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            💳 Payment Method
                          </label>
                          <Select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="w-full mb-4"
                          >
                            <option value="">Select payment method</option>
                            {paymentMethods
                              .filter(pm => pm.enabled)
                              .map(method => (
                                <option key={method.id} value={method.id}>
                                  {method.name}
                                </option>
                              ))
                            }
                          </Select>
                        </div>
                        
                        <Button
                          onClick={processSale}
                          variant="primary"
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          disabled={processing || !selectedPaymentMethod}
                        >
                          {processing ? (
                            <div className="flex items-center justify-center space-x-2">
                              <LoadingSpinner size="sm" />
                              <span>Processing Sale...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <span>💰</span>
                              <span>Complete Sale</span>
                            </div>
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
