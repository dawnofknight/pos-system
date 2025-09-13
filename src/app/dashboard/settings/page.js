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
    currency: 'USD',
    currencySymbol: '$',
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax'
  })
  
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

          {/* Role Management Tab (Admin Only) */}
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
