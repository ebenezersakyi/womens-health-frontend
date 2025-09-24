'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ 
  rating = 0, 
  onRatingChange = null, 
  maxStars = 5, 
  size = 'medium',
  showValue = true,
  allowHalf = true,
  readonly = false 
}) {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    xl: 'h-8 w-8'
  }
  
  const handleClick = (starValue) => {
    if (readonly || !onRatingChange) return
    onRatingChange(starValue)
  }
  
  const handleMouseEnter = (starValue) => {
    if (readonly) return
    setHoverRating(starValue)
  }
  
  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(0)
  }
  
  const getStarFill = (starIndex) => {
    const currentRating = hoverRating || rating
    const starValue = starIndex + 1
    
    if (currentRating >= starValue) {
      return 'fill-yellow-400 text-yellow-400'
    } else if (allowHalf && currentRating >= starValue - 0.5) {
      return 'fill-yellow-400/50 text-yellow-400'
    } else {
      return 'fill-gray-200 text-gray-200'
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(maxStars)].map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform duration-150 ${
              !readonly && onRatingChange ? 'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 rounded' : ''
            }`}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => handleMouseEnter(index + 1)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star 
              className={`${sizeClasses[size]} ${getStarFill(index)} transition-colors duration-150`}
            />
          </button>
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  )
}

// Helper component for displaying average rating with count
export function AverageRating({ 
  averageRating = 0, 
  totalReviews = 0, 
  size = 'medium',
  showCount = true 
}) {
  return (
    <div className="flex items-center gap-2">
      <StarRating 
        rating={averageRating}
        size={size}
        readonly={true}
        showValue={true}
      />
      {showCount && (
        <span className="text-sm text-gray-500">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  )
}
