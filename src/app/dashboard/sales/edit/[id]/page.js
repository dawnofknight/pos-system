'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { formatCurrency } from '@/lib/utils'

export default function EditSalePage({ params }) {
  const router = useRouter()
  const { id } = params
  
  const [loading, setLoading] = useState(true)
  const [sale, setSale] = useState(null)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [settings, setSettings] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  
  // Fetch sale details
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await fetch(`/api/sales/${id}`)
        const data = await res.json()
        
        if (data.success) {
          setSale(data.sale)
          // Initialize cart with existing items
          setCart(data.sale.items.map(item => ({
            id: item.item.id,
            name: item.item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.item.category
          })))
        } else {
          toast.error('Failed to load sale details')
          router.push('/dashboard/sales')
        }
      } catch (error) {
        console.error('Error fetching sale:', error)
        toast.error('Failed to load sale details')
        router.push('/dashboard/sales')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSale()
  }, [id, router])
  
  // Fetch items, categories, settings, and payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch items
        const itemsRes = await fetch('/api/items')
        const itemsData = await itemsRes.json()
        if (itemsData.success) {
          setItems(itemsData.items)
        }
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories')
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success) {
          setCategories(categoriesData.categories)
        }
        
        // Fetch settings
        const settingsRes = await fetch('/api/settings')
        const settingsData = await settingsRes.json()
        if (settingsData.success) {
          setSettings(settingsData.settings)
        }
        
        // Fetch payment methods
        const paymentMethodsRes = await fetch('/api/payment-methods')
        const paymentMethodsData = await paymentMethodsRes.json()
        if (paymentMethodsData.success) {
          setPaymentMethods(paymentMethodsData.paymentMethods)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load necessary data')
      }
    }
    
    fetchData()
  }, [])
  
  // Filter items by category
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.categoryId === parseInt(selectedCategory))
  
  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          category: item.category
        }
      ])
    }
    
    toast.success(`${item.name} added to order`)
  }
  
  // Update item quantity
  const updateQuantity = (id, action) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        if (action === 'increase') {
          return { ...item, quantity: item.quantity + 1 }
        } else if (action === 'decrease' && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 }
        }
      }
      return item
    }))
  }
  
  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
    toast.success('Item removed from order')
  }
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  
  // Calculate tax
  const taxRate = settings?.tax || 0
  const tax = subtotal * (taxRate / 100)
  
  // Calculate total
  const total = subtotal + tax
  
  // Update sale
  const updateSale = async () => {
    if (cart.length === 0) {
      toast.error('Cannot update sale with empty cart')
      return
    }
    
    try {
      setLoading(true)
      
      const saleItems = cart.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
      
      const res = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: saleItems,
          total: total
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Sale updated successfully')
        router.push('/dashboard/sales/create')
      } else {
        toast.error(data.error || 'Failed to update sale')
      }
    } catch (error) {
      console.error('Error updating sale:', error)
      toast.error('Failed to update sale')
    } finally {
      setLoading(false)
    }
  }
  
  // Complete sale
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Cannot complete sale with empty cart')
      return
    }
    
    try {
      setLoading(true)
      
      const saleItems = cart.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
      
      const res = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: saleItems,
          status: 'completed',
          total: total
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Sale completed successfully')
        router.push('/dashboard/sales')
      } else {
        toast.error(data.error || 'Failed to complete sale')
      }
    } catch (error) {
      console.error('Error completing sale:', error)
      toast.error('Failed to complete sale')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sale not found</h1>
          <button
            onClick={() => router.push('/dashboard/sales')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Sales
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Sale #{sale.orderNumber}</h1>
        <div>
          <button
            onClick={() => router.push('/dashboard/sales/create')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={updateSale}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            disabled={loading}
          >
            Update Order
          </button>
          <button
            onClick={completeSale}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            Complete Sale
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Menu</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-3 py-1 rounded ${selectedCategory === category.id.toString() ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => addToCart(item)}
              >
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category?.name}</p>
                <p className="font-semibold mt-1">
                  {settings && formatCurrency(item.price, settings.currency, settings.currencySymbol)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {sale.tableId && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium">Table: {sale.table?.name || `#${sale.tableId}`}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Items</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">No items in order</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {settings && formatCurrency(item.price, settings.currency, settings.currencySymbol)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, 'decrease')}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 'increase')}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaPlus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 bg-red-100 text-red-500 rounded hover:bg-red-200"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {settings && formatCurrency(subtotal, settings.currency, settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({settings?.tax || 0}%):</span>
              <span>
                {settings && formatCurrency(tax, settings.currency, settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>
                {settings && formatCurrency(total, settings.currency, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}