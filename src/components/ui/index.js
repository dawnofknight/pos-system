'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDark ? '#1d4ed8' : '#2563eb',
          color: '#ffffff',
          ':hover': isDark ? '#1e40af' : '#1d4ed8'
        }
      case 'secondary':
        return {
          backgroundColor: isDark ? '#374151' : '#e5e7eb',
          color: isDark ? '#f3f4f6' : '#111827'
        }
      case 'danger':
        return {
          backgroundColor: isDark ? '#b91c1c' : '#dc2626',
          color: '#ffffff'
        }
      case 'success':
        return {
          backgroundColor: isDark ? '#059669' : '#16a34a',
          color: '#ffffff'
        }
      case 'outline':
        return {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#d1d5db' : '#374151',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isDark ? '#4b5563' : '#d1d5db'
        }
      default:
        return {}
    }
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClasses} ${sizes[size]} ${disabledClasses} ${className}`}
      style={getVariantStyles()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-1"
          style={{ color: isDark ? '#d1d5db' : '#374151' }}
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${className}`}
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#4b5563' : '#d1d5db'),
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#4b5563' : '#d1d5db')
        }}
        {...props}
      />
      {error && (
        <p 
          className="mt-1 text-sm"
          style={{ color: isDark ? '#fca5a5' : '#dc2626' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export function Select({ 
  label, 
  error, 
  options = [], 
  className = '', 
  ...props 
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-1 transition-colors"
          style={{ color: isDark ? '#d1d5db' : '#374151' }}
        >
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${className}`}
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#4b5563' : '#d1d5db'),
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#4b5563' : '#d1d5db')
        }}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p 
          className="mt-1 text-sm transition-colors"
          style={{ color: isDark ? '#fca5a5' : '#dc2626' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div 
      className={`shadow rounded-lg transition-colors ${className}`}
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        shadowColor: isDark ? '#00000040' : '#00000010'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div 
      className={`px-6 py-4 transition-colors ${className}`}
      style={{ 
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: isDark ? '#374151' : '#e5e7eb' 
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Table({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className="overflow-x-auto">
      <table 
        className={`min-w-full transition-colors ${className}`}
        style={{ 
          borderColor: isDark ? '#374151' : '#e5e7eb',
          borderCollapse: 'collapse'
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <thead 
      className={`transition-colors ${className}`}
      style={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <tbody 
      className={`transition-colors ${className}`}
      style={{ 
        backgroundColor: isDark ? '#1f2937' : '#ffffff'
      }}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <tr 
      className={`transition-colors hover:bg-opacity-50 ${className}`}
      style={{
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: isDark ? '#374151' : '#e5e7eb',
        '--hover-bg': isDark ? '#374151' : '#f9fafb'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f9fafb'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${className}`}
      style={{ color: isDark ? '#f3f4f6' : '#111827' }}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableHeaderCell({ children, className = '', ...props }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${className}`}
      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
      {...props}
    >
      {children}
    </th>
  )
}

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  if (!isOpen) return null
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 opacity-75 transition-opacity" 
          style={{ backgroundColor: isDark ? '#111827dd' : '#6b728099' }}
          aria-hidden="true"
        ></div>
        
        {/* Modal Content */}
        <div 
          className={`relative inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10 ${className}`}
          style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }}
        >
          <div 
            className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
            style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }}
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 
                    className="text-lg leading-6 font-medium transition-colors"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="focus:outline-none transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    onMouseEnter={(e) => {
                      e.target.style.color = isDark ? '#d1d5db' : '#374151'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = isDark ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div 
      className={`animate-spin rounded-full ${sizes[size]}`}
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        borderTopColor: isDark ? '#3b82f6' : '#2563eb'
      }}
    ></div>
  )
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '', 
  ...props 
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors'
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          color: isDark ? '#d1d5db' : '#1f2937'
        }
      case 'primary':
        return {
          backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
          color: isDark ? '#93c5fd' : '#1e40af'
        }
      case 'secondary':
        return {
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          color: isDark ? '#9ca3af' : '#4b5563'
        }
      case 'success':
        return {
          backgroundColor: isDark ? '#14532d' : '#dcfce7',
          color: isDark ? '#86efac' : '#166534'
        }
      case 'danger':
        return {
          backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
          color: isDark ? '#fca5a5' : '#991b1b'
        }
      case 'warning':
        return {
          backgroundColor: isDark ? '#78350f' : '#fef3c7',
          color: isDark ? '#fcd34d' : '#92400e'
        }
      default:
        return {
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          color: isDark ? '#d1d5db' : '#1f2937'
        }
    }
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }
  
  return (
    <span
      className={`${baseClasses} ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </span>
  )
}
