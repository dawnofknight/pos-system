'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

import { useRBAC, withPermission } from '@/contexts/RBACContext'
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Input, 
  LoadingSpinner,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeaderCell
} from '@/components/ui'

export default function SettingsPage() {
  const { user } = useAuth()


  const { hasPermission } = useRBAC()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  // General Settings
  const [settings, setSettings] = useState({
    currency: 'IDR',
    currencySymbol: 'Rp',
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax',
    tableCount: 6,
    appName: 'POS System Restaurant Management',
    logoPath: null
  })
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  
  // Table Form
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: 4
  })
  const [editingTable, setEditingTable] = useState(null)
  
  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([])
  
  // Role Permissions
  const [rolePermissions, setRolePermissions] = useState([])
  
  // User Management
  const [users, setUsers] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER'
  })

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'payments', name: 'Payment Methods', icon: '💳' },
    { id: 'tables', name: 'Table Management', icon: '🍽️' },
    ...(hasPermission('settings', 'edit') && user?.role === 'ADMIN' ? [
      { id: 'roles', name: 'Role Management', icon: '👥' },
      { id: 'users', name: 'User Management', icon: '👤' }
    ] : [])
  ]

  const resources = [
    { id: 'dashboard', name: 'Dashboard', description: 'Access to dashboard overview' },
    { id: 'items', name: 'Items', description: 'Manage product inventory' },
    { id: 'sales', name: 'Sales', description: 'Process and view sales' },
    { id: 'categories', name: 'Categories', description: 'Manage product categories' },
    { id: 'tables', name: 'Tables', description: 'Manage restaurant tables' },
    { id: 'users', name: 'Users', description: 'Manage user accounts' },
    { id: 'settings', name: 'Settings', description: 'System configuration' }
  ]

  useEffect(() => {
    fetchSettings()
    fetchPaymentMethods()
    if (user?.role === 'ADMIN') {
      fetchRolePermissions()
      fetchUsers()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/settings/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch('/api/settings/roles')
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data)
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      if (response.ok) {
        alert('User created successfully!')
        setUserForm({ name: '', email: '', password: '', role: 'CASHIER' })
        setShowUserForm(false)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = { ...userForm }
      if (!updateData.password) {
        delete updateData.password // Don't update password if empty
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        alert('User updated successfully!')
        setUserForm({ name: '', email: '', password: '', role: 'CASHIER' })
        setEditingUser(null)
        setShowUserForm(false)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert("You cannot delete your own account")
      return
    }

    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('User deleted successfully!')
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password:')
    if (!newPassword) return

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })

      if (response.ok) {
        alert('Password reset successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error resetting password')
    }
  }

  const startEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowUserForm(true)
  }

  const cancelUserForm = () => {
    setShowUserForm(false)
    setEditingUser(null)
    setUserForm({ name: '', email: '', password: '', role: 'CASHIER' })
  }

  const saveGeneralSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  // Logo upload handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setLogoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(s => ({ ...s, logoPath: data.logoPath }))
        setLogoFile(null)
        setLogoPreview(null)
        alert('Logo uploaded successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const deleteLogo = async () => {
    if (!settings.logoPath) return

    try {
      const response = await fetch('/api/settings/logo', {
        method: 'DELETE'
      })

      if (response.ok) {
        setSettings(s => ({ ...s, logoPath: null }))
        alert('Logo deleted successfully!')
      } else {
        alert('Failed to delete logo')
      }
    } catch (error) {
      console.error('Error deleting logo:', error)
      alert('Error deleting logo')
    }
  }
  
  // Table Management
  const [tables, setTables] = useState([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  
  const fetchTables = async () => {
    setIsLoadingTables(true)
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setIsLoadingTables(false)
    }
  }
  
  const createTable = async (tableData) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData)
      })
      
      if (response.ok) {
        fetchTables()
      } else {
        const error = await response.json()
        console.error('Error creating table:', error)
      }
    } catch (error) {
      console.error('Error creating table:', error)
    }
  }
  
  const updateTable = async (id, tableData) => {
    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData)
      })
      
      if (response.ok) {
        fetchTables()
      } else {
        const error = await response.json()
        console.error('Error updating table:', error)
      }
    } catch (error) {
      console.error('Error updating table:', error)
    }
  }
  
  const deleteTable = async (id) => {
    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchTables()
      } else {
        const error = await response.json()
        console.error('Error deleting table:', error)
      }
    } catch (error) {
      console.error('Error deleting table:', error)
    }
  }
  
  useEffect(() => {
    if (activeTab === 'tables') {
      fetchTables()
    }
  }, [activeTab])

  const togglePaymentMethod = async (methodId, enabled) => {
    try {
      const response = await fetch(`/api/settings/payment-methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        setPaymentMethods(methods =>
          methods.map(method =>
            method.id === methodId ? { ...method, enabled } : method
          )
        )
      }
    } catch (error) {
      console.error('Error updating payment method:', error)
    }
  }

  const updateRolePermission = async (role, resource, permissionType, value) => {
    try {
      const response = await fetch('/api/settings/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          resource,
          [permissionType]: value
        })
      })

      if (response.ok) {
        fetchRolePermissions()
      }
    } catch (error) {
      console.error('Error updating role permission:', error)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold transition-colors text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="transition-colors text-gray-600 dark:text-gray-400">
              Manage your POS system configuration
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b transition-colors border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold transition-colors text-gray-900 dark:text-white">
                  General Settings
                </h2>
                <p className="text-sm transition-colors text-gray-600 dark:text-gray-400">
                  Configure currency and tax settings
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Currency Settings */}
                  <div>
                    <h3 className="text-md font-medium mb-4 transition-colors text-gray-900 dark:text-white">
                      Currency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Currency Code"
                        value={settings.currency}
                        onChange={(e) => setSettings(s => ({ ...s, currency: e.target.value }))}
                        placeholder="USD"
                      />
                      <Input
                        label="Currency Symbol"
                        value={settings.currencySymbol}
                        onChange={(e) => setSettings(s => ({ ...s, currencySymbol: e.target.value }))}
                        placeholder="$"
                      />
                    </div>
                  </div>

                  {/* Branding Settings */}
                  <div className="border-t pt-6">
                    <div className="mb-4">
                      <h3 className="text-md font-medium transition-colors text-gray-900">
                        Branding Configuration
                      </h3>
                      <p className="text-sm transition-colors text-gray-600">
                        Customize your application name and logo
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Application Name"
                        value={settings.appName}
                        onChange={(e) => setSettings(s => ({ ...s, appName: e.target.value }))}
                        placeholder="POS System Restaurant Management"
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo
                        </label>
                        
                        {/* Current Logo Display */}
                        {settings.logoPath && (
                          <div className="mb-4">
                            <img 
                              src={settings.logoPath} 
                              alt="Current Logo" 
                              className="h-16 w-auto object-contain border rounded"
                            />
                            <Button
                              onClick={deleteLogo}
                              className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Logo
                            </Button>
                          </div>
                        )}
                        
                        {/* Logo Upload */}
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                          />
                          {logoFile && (
                            <Button
                              onClick={uploadLogo}
                              disabled={uploadingLogo}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              {uploadingLogo ? 'Uploading...' : 'Upload'}
                            </Button>
                          )}
                        </div>
                        
                        {/* Logo Preview */}
                        {logoPreview && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <img 
                              src={logoPreview} 
                              alt="Logo Preview" 
                              className="h-16 w-auto object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tax Settings */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-md font-medium transition-colors text-gray-900">
                          Tax Configuration
                        </h3>
                        <p className="text-sm transition-colors text-gray-600">
                          Enable and configure tax calculations
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.taxEnabled}
                          onChange={(e) => setSettings(s => ({ ...s, taxEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-100"></div>
                      </label>
                    </div>
                    
                    {settings.taxEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Tax Name"
                          value={settings.taxName}
                          onChange={(e) => setSettings(s => ({ ...s, taxName: e.target.value }))}
                          placeholder="Tax"
                        />
                        <Input
                          label="Tax Rate (%)"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.taxRate}
                          onChange={(e) => setSettings(s => ({ ...s, taxRate: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={saveGeneralSettings}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving && <LoadingSpinner size="sm" />}
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold transition-colors text-gray-900">
                  Payment Methods
                </h2>
                <p className="text-sm transition-colors text-gray-600">
                  Configure available payment options
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className="flex items-center justify-between p-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl text-gray-700">
                          {method.name === 'Cash' ? '💵' : 
                           method.name === 'Transfer' ? '🏦' : 
                           method.name === 'Debit' ? '💳' : '💰'}
                        </span>
                        <div>
                          <h4 className="font-medium transition-colors" style={{ color: 'var(--foreground)' }}>
                            {method.name}
                          </h4>
                          <p className="text-sm transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                            {method.enabled ? 'Available for transactions' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={method.enabled ? 'warning' : 'secondary'}>
                          {method.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={(e) => togglePaymentMethod(method.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-100"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Table Management Tab */}
          {activeTab === 'tables' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold transition-colors text-gray-900 dark:text-white">
                  Table Management
                </h2>
                <p className="text-sm transition-colors text-gray-600 dark:text-gray-400">
                  Configure restaurant tables and capacity
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Table Count Setting */}
                  <div>
                    <h3 className="text-md font-medium mb-4 transition-colors text-gray-900 dark:text-white">
                      Table Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Input
                        type="number"
                        label="Number of Tables"
                        value={settings.tableCount}
                        min={1}
                        max={50}
                        onChange={(e) => setSettings({
                          ...settings,
                          tableCount: parseInt(e.target.value) || 1
                        })}
                      />
                      <div className="flex items-end">
                        <Button onClick={saveGeneralSettings} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Table Count'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Table List */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium transition-colors text-gray-900 dark:text-white">
                        Tables
                      </h3>
                      <Button
                        onClick={() => {
                          setEditingTable(null)
                          setTableForm({ name: '', capacity: 4 })
                          document.getElementById('tableFormModal').showModal()
                        }}
                      >
                        Add Table
                      </Button>
                    </div>
                    
                    {isLoadingTables ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Capacity</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tables.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                No tables found. Add your first table.
                              </TableCell>
                            </TableRow>
                          ) : (
                            tables.map((table) => (
                              <TableRow key={table.id}>
                                <TableCell>{table.name}</TableCell>
                                <TableCell>{table.capacity}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={table.status === 'available' ? 'success' : 
                                           table.status === 'occupied' ? 'danger' : 'warning'}
                                  >
                                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingTable(table)
                                        setTableForm({
                                          name: table.name,
                                          capacity: table.capacity
                                        })
                                        document.getElementById('tableFormModal').showModal()
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => document.getElementById(`deleteTableConfirm-${table.id}`).showModal()}
                                    >
                                      Delete
                                    </Button>
                                    
                                    {/* Delete Confirmation Dialog */}
                                    <dialog id={`deleteTableConfirm-${table.id}`} className="modal">
                                      <div className="modal-box">
                                        <h3 className="font-bold text-lg">Confirm Deletion</h3>
                                        <p className="py-4">Are you sure you want to delete table {table.name}?</p>
                                        <div className="modal-action">
                                          <form method="dialog">
                                            <div className="flex space-x-2">
                                              <Button variant="outline" onClick={() => document.getElementById(`deleteTableConfirm-${table.id}`).close()}>Cancel</Button>
                                              <Button variant="danger" onClick={() => {
                                                 document.getElementById(`deleteTableConfirm-${table.id}`).close()
                                                 deleteTable(table.id)
                                               }}>Delete</Button>
                                            </div>
                                          </form>
                                        </div>
                                      </div>
                                    </dialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          
          {/* Table Form Modal */}
          <dialog id="tableFormModal" className="modal">
            <div className="modal-box rounded-2xl shadow-2xl border border-orange-100 dark:border-orange-800/30 p-0 overflow-hidden">
              <div className="flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border-b border-orange-200/30 dark:border-orange-700/30">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                  <span className="text-white text-lg">{editingTable ? '✏️' : '➕'}</span>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h3>
              </div>
              <form className="space-y-4 p-6">
                <Input
                  label="Table Name"
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="e.g., Table 1"
                  required
                  icon="🏷️"
                  className="bg-orange-50/50 border-orange-200 focus:border-orange-400 rounded-xl transition-all duration-300"
                />
                <Input
                  type="number"
                  label="Capacity"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={20}
                  required
                  icon="👥"
                  className="bg-orange-50/50 border-orange-200 focus:border-orange-400 rounded-xl transition-all duration-300"
                />
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('tableFormModal').close()}
                    icon="❌"
                    className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      if (!tableForm.name) return
                      
                      if (editingTable) {
                        updateTable(editingTable.id, tableForm)
                      } else {
                        createTable(tableForm)
                      }
                      
                      document.getElementById('tableFormModal').close()
                    }}
                    icon={editingTable ? '✏️' : '✅'}
                    className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {editingTable ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </dialog>
          
          {/* Role Management Tab */}
          {activeTab === 'roles' && user?.role === 'ADMIN' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold transition-colors text-gray-900">
                  Role Management
                </h2>
                <p className="text-sm transition-colors text-gray-600">
                  Configure permissions for different user roles
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {['ADMIN', 'CASHIER'].map((role) => (
                    <div key={role} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={role === 'ADMIN' ? 'primary' : 'secondary'}>
                          {role}
                        </Badge>
                        <span className="text-lg font-medium transition-colors text-gray-900">
                          {role} Permissions
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell>Resource</TableHeaderCell>
                              <TableHeaderCell>View</TableHeaderCell>
                              <TableHeaderCell>Create</TableHeaderCell>
                              <TableHeaderCell>Edit</TableHeaderCell>
                              <TableHeaderCell>Delete</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resources.map((resource) => {
                              const permission = rolePermissions.find(p => p.role === role && p.resource === resource.id)
                              return (
                                <TableRow key={resource.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium transition-colors text-gray-900">
                                        {resource.name}
                                      </div>
                                      <div className="text-sm transition-colors text-gray-600">
                                        {resource.description}
                                      </div>
                                    </div>
                                  </TableCell>
                                  {['canView', 'canCreate', 'canEdit', 'canDelete'].map((permType) => (
                                    <TableCell key={permType}>
                                      <input
                                        type="checkbox"
                                        checked={permission?.[permType] || false}
                                        onChange={(e) => updateRolePermission(role, resource.id, permType, e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        disabled={role === 'ADMIN' && resource.id === 'settings'} // Admin always has settings access
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* User Management Tab (Admin Only) */}
          {activeTab === 'users' && user?.role === 'ADMIN' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">User Management</h2>
                    <p className="text-sm text-gray-600">Create, edit, and manage user accounts</p>
                  </div>
                  <Button
                    onClick={() => setShowUserForm(true)}
                    variant="primary"
                  >
                    Add New User
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {/* User Form Modal */}
                {showUserForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md transition-colors">
                      <h3 className="text-lg font-semibold mb-4 transition-colors text-gray-900">
                        {editingUser ? 'Edit User' : 'Create New User'}
                      </h3>
                      <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <Input
                              type="text"
                              value={userForm.name}
                              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                              required
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <Input
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              required
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password {editingUser && "(leave empty to keep current)"}
                            </label>
                            <Input
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              required={!editingUser}
                              placeholder={editingUser ? "Enter new password" : "Enter password"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <select
                              value={userForm.role}
                              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              required
                            >
                              <option value="CASHIER">Cashier</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={saving}
                            className="flex-1"
                          >
                            {saving ? (
                              <div className="flex items-center space-x-2">
                                <LoadingSpinner size="sm" />
                                <span>{editingUser ? 'Updating...' : 'Creating...'}</span>
                              </div>
                            ) : (
                              editingUser ? 'Update User' : 'Create User'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelUserForm}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Users List */}
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No users found</p>
                      <p className="text-sm">Click "Add New User" to create the first user</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>User</TableHeaderCell>
                            <TableHeaderCell>Role</TableHeaderCell>
                            <TableHeaderCell>Created</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{u.name}</div>
                                  <div className="text-sm text-gray-600">{u.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={u.role === 'ADMIN' ? 'primary' : 'secondary'}>
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditUser(u)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResetPassword(u.id)}
                                    className="text-orange-600 hover:text-orange-700"
                                  >
                                    Reset Password
                                  </Button>
                                  {u.id !== user.id && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteUser(u.id)}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
