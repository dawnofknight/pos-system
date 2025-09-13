'use client'

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon,
  ...props 
}) {
  
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/25'
      case 'secondary':
        return 'bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border border-secondary-200 dark:border-secondary-700'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/25'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-500/25'
      case 'outline':
        return 'bg-transparent text-foreground border-2 border-border hover:bg-muted'
      case 'glass':
        return 'glass-effect text-foreground'
      default:
        return 'bg-muted text-foreground'
    }
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-3'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClasses} ${sizes[size]} ${getVariantClasses()} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export function Input({ 
  label, 
  error, 
  className = '', 
  icon,
  variant = 'default',
  ...props 
}) {
  
  const getInputClasses = () => {
    const baseClasses = 'border transition-all duration-300 text-foreground'
    const errorClasses = error ? 'border-red-500 dark:border-red-400' : 'border-border'
    
    switch (variant) {
      case 'glass':
        return `${baseClasses} ${errorClasses} bg-card/70 backdrop-blur-xl shadow-lg`
      default:
        return `${baseClasses} ${errorClasses} bg-card shadow-sm`
    }
  }
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-foreground transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">
              {icon}
            </span>
          </div>
        )}
        <input
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-primary-500 hover:shadow-lg placeholder-gray-500 dark:placeholder-gray-400 ${getInputClasses()} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium transition-colors text-red-600 dark:text-red-400">
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
  icon,
  variant = 'default',
  ...props 
}) {
  
  const getSelectClasses = () => {
    const baseClasses = 'border transition-all duration-300 text-foreground'
    const errorClasses = error ? 'border-red-500 dark:border-red-400' : 'border-border'
    
    switch (variant) {
      case 'glass':
        return `${baseClasses} ${errorClasses} bg-card/70 backdrop-blur-xl shadow-lg`
      default:
        return `${baseClasses} ${errorClasses} bg-card shadow-sm`
    }
  }
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className="text-gray-500 dark:text-gray-400">
              {icon}
            </span>
          </div>
        )}
        <select
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-primary-500 hover:shadow-lg appearance-none cursor-pointer ${getSelectClasses()} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-card text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors">
          {error}
        </p>
      )}
    </div>
  )
}

export function Card({ children, className = '', variant = 'default', hover = false, ...props }) {
  
  const getCardVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass-effect shadow-2xl'
      case 'gradient':
        return 'bg-gradient-to-br from-card/90 to-muted/90 border border-border/20 shadow-xl'
      default:
        return 'bg-card border border-border shadow-lg'
    }
  }
  
  const hoverClasses = hover ? 'hover:shadow-2xl cursor-pointer' : ''
  
  return (
    <div 
      className={`rounded-2xl transition-all duration-300 ${getCardVariantClasses()} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', variant = 'default', ...props }) {
  const getHeaderClasses = () => {
    switch (variant) {
      case 'glass':
        return 'border-b border-gray-600/20 dark:border-gray-600/20 bg-gray-50/30 dark:bg-gray-700/30'
      case 'gradient':
        return 'border-b border-gray-600/20 dark:border-gray-600/20 bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/30'
      default:
        return 'border-b border-gray-200 dark:border-gray-700'
    }
  }
  
  return (
    <div 
      className={`px-6 py-5 transition-all duration-300 rounded-t-2xl ${getHeaderClasses()} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Table({ children, className = '', ...props }) {
  return (
    <div className="overflow-x-auto">
      <table 
        className={`min-w-full transition-colors border border-gray-200 dark:border-gray-600 border-collapse rounded-lg ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead 
      className={`transition-colors bg-gray-50 dark:bg-gray-700 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody 
      className={`transition-colors bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr 
      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-sm transition-colors text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableHeaderCell({ children, className = '', ...props }) {
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function Modal({ isOpen, onClose, title, children, className = '' }) {
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
          className="fixed inset-0 opacity-75 transition-opacity bg-gray-500/60 dark:bg-gray-900/80" 
          aria-hidden="true"
        ></div>
        
        {/* Modal Content */}
        <div 
          className={`relative inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10 bg-white dark:bg-gray-800 ${className}`}
        >
          <div 
            className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-white dark:bg-gray-800"
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 
                    className="text-lg leading-6 font-medium transition-colors text-foreground"
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="focus:outline-none transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 ${sizes[size]}`}
    ></div>
  )
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '', 
  icon,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full transition-all duration-300 shadow-sm'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
      case 'primary':
        return 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-900 text-primary-800 dark:text-primary-200 shadow-md shadow-primary-500/20'
      case 'secondary':
        return 'bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-600 dark:text-gray-400 border border-gray-200/30 dark:border-gray-600/30'
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200 shadow-md shadow-green-500/20'
      case 'danger':
        return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 text-red-800 dark:text-red-200 shadow-md shadow-red-500/20'
      case 'warning':
        return 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 text-orange-800 dark:text-orange-200 shadow-md shadow-orange-500/20'
      case 'glass':
        return 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }
  
  const sizes = {
    sm: 'px-3 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  }
  
  return (
    <span
      className={`${baseClasses} ${sizes[size]} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
