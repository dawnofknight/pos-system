'use client'

import Image from 'next/image'

export default function ProductImage({ item, size = 'sm', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const sizeClass = sizes[size] || sizes.sm

  // If item has an image, display it
  if (item.image) {
    const imageSrc = item.image.startsWith('http') 
      ? item.image 
      : `/uploads/items/${item.image}`

    return (
      <div className={`${sizeClass} ${className} relative overflow-hidden rounded-md flex-shrink-0 bg-gray-100`}>
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to emoji on image error
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div 
          className="absolute inset-0 hidden items-center justify-center text-gray-500 bg-gray-100"
          style={{ fontSize: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '20px' : size === 'lg' ? '24px' : '28px' }}
        >
          {item.emoji || '📦'}
        </div>
      </div>
    )
  }

  // Fallback to emoji
  return (
    <div 
      className={`${sizeClass} ${className} flex items-center justify-center bg-gray-100 rounded-md flex-shrink-0`}
      style={{ fontSize: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '20px' : size === 'lg' ? '24px' : '28px' }}
    >
      {item.emoji || '📦'}
    </div>
  )
}
