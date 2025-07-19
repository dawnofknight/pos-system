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
  Badge
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

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'payments', name: 'Payment Methods', icon: '💳' },
    ...(hasPermission('settings', 'edit') && user?.role === 'ADMIN' ? [{ id: 'roles', name: 'Role Management', icon: '👥' }] : [])
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your POS system configuration</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
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
                <h2 className="text-lg font-semibold">General Settings</h2>
                <p className="text-sm text-gray-600">Configure currency and tax settings</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Currency Settings */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Currency</h3>
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
                        <h3 className="text-md font-medium text-gray-900">Tax Configuration</h3>
                        <p className="text-sm text-gray-600">Enable and configure tax calculations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.taxEnabled}
                          onChange={(e) => setSettings(s => ({ ...s, taxEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                <p className="text-sm text-gray-600">Configure available payment options</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {method.name === 'Cash' ? '💵' : 
                           method.name === 'Transfer' ? '🏦' : 
                           method.name === 'Debit' ? '💳' : '💰'}
                        </span>
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-gray-600">
                            {method.enabled ? 'Available for transactions' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={method.enabled ? 'success' : 'secondary'}>
                          {method.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={(e) => togglePaymentMethod(method.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                <h2 className="text-lg font-semibold">Role Management</h2>
                <p className="text-sm text-gray-600">Configure permissions for different user roles</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {['ADMIN', 'CASHIER'].map((role) => (
                    <div key={role} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={role === 'ADMIN' ? 'primary' : 'secondary'}>
                          {role}
                        </Badge>
                        <span className="text-lg font-medium">{role} Permissions</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Resource</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">View</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Create</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Edit</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {resources.map((resource) => {
                              const permission = rolePermissions.find(p => p.role === role && p.resource === resource.id)
                              return (
                                <tr key={resource.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <div>
                                      <div className="font-medium text-gray-900">{resource.name}</div>
                                      <div className="text-sm text-gray-600">{resource.description}</div>
                                    </div>
                                  </td>
                                  {['canView', 'canCreate', 'canEdit', 'canDelete'].map((permType) => (
                                    <td key={permType} className="px-4 py-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={permission?.[permType] || false}
                                        onChange={(e) => updateRolePermission(role, resource.id, permType, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={role === 'ADMIN' && resource.id === 'settings'} // Admin always has settings access
                                      />
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
