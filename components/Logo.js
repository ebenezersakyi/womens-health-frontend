'use client'

import { Heart } from 'lucide-react'

export default function Logo({ size = 'medium', showText = true, className = '' }) {
  const sizeClasses = {
    small: {
      container: 'p-1.5',
      icon: 'h-4 w-4',
      title: 'text-lg',
      subtitle: 'text-xs'
    },
    medium: {
      container: 'p-2',
      icon: 'h-6 w-6',
      title: 'text-xl',
      subtitle: 'text-xs'
    },
    large: {
      container: 'p-3',
      icon: 'h-8 w-8',
      title: 'text-2xl',
      subtitle: 'text-sm'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`bg-pink-600 ${currentSize.container} rounded-lg shadow-sm`}>
        <Heart className={`${currentSize.icon} text-white`} />
      </div>
      {showText && (
        <div className="flex flex-col items-start">
          <h1 className={`${currentSize.title} font-bold text-gray-900 leading-none`}>
            WomanCare
          </h1>
          <p className={`${currentSize.subtitle} text-pink-600 leading-tight -mt-0.5`}>
            Early Detection Saves Lives
          </p>
        </div>
      )}
    </div>
  )
}
