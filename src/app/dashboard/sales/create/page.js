'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Input, 
  LoadingSpinner 
} from '@/components/ui'
import { useRouter } from 'next/navigation'
import ProductImage from '@/components/ProductImage'

export default function CreateSalePage() {
  const { user } = useAuth()
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
              <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-gray-600">Select items to add to cart</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Draft controls */}
              <div className="flex gap-2">
                {draftSaved && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg">
                    Draft saved
                  </span>
                )}
                {hasDraft() && (
                  <button
                    onClick={loadDraft}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Load Draft
                  </button>
                )}
                {cart.length > 0 && (
                  <>
                    <button
                      onClick={saveDraft}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={clearDraft}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Clear Cart
                    </button>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-600">Cashier: {user?.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Items Grid */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sm:w-64"
                      />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          item.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center p-2">
                          <ProductImage item={item} size="xl" className="w-full h-full" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{item.category.name}</p>
                          <p className="text-lg font-bold text-blue-600">{settings.currencySymbol}{item.price.toFixed(2)}</p>
                          <p className={`text-xs mt-1 ${item.stock <= 5 ? 'text-red-500' : 'text-green-500'}`}>
                            Stock: {item.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
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
                    <h3 className="text-lg font-semibold">Cart ({cart.length})</h3>
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
                    <div className="flex-1 flex items-center justify-center text-gray-500">
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
                          <div key={item.itemId} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <ProductImage item={item} size="sm" />
                                <div>
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  <p className="text-xs text-gray-500">{settings.currencySymbol}{item.price.toFixed(2)} each</p>
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
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm font-bold">{settings.currencySymbol}{item.total.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{settings.currencySymbol}{calculateTotal().toFixed(2)}</span>
                        </div>
                        {settings.taxEnabled && (
                          <div className="flex justify-between text-sm">
                            <span>{settings.taxName} ({settings.taxRate}%):</span>
                            <span>{settings.currencySymbol}{calculateTax().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
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
