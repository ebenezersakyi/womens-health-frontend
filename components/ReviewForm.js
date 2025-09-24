'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import StarRating from './StarRating'
import LoadingSpinner from './LoadingSpinner'
import { apiService } from '../lib/api'

export default function ReviewForm({ 
  eventId,
  existingReview = null,
  onSuccess = () => {},
  onCancel = () => {},
  isOpen = true 
}) {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    isAnonymous: existingReview?.isAnonymous || false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isEditing = !!existingReview

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        title: existingReview.title,
        comment: existingReview.comment,
        isAnonymous: existingReview.isAnonymous
      })
    }
  }, [existingReview])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (formData.rating === 0) {
      setError('Please select a rating')
      return false
    }
    if (formData.title.trim().length < 2) {
      setError('Title must be at least 2 characters long')
      return false
    }
    if (formData.title.trim().length > 100) {
      setError('Title must be less than 100 characters')
      return false
    }
    if (formData.comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long')
      return false
    }
    if (formData.comment.trim().length > 1000) {
      setError('Comment must be less than 1000 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const reviewData = {
        ...formData,
        title: formData.title.trim(),
        comment: formData.comment.trim()
      }

      if (!isEditing) {
        reviewData.eventId = eventId
      }

      const response = isEditing
        ? await apiService.updateReview(existingReview._id, reviewData)
        : await apiService.createReview(reviewData)

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess(response.data.data)
        }, 1500)
      } else {
        setError(response.data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to submit review. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isEditing ? 'Review Updated!' : 'Review Submitted!'}
          </h3>
          <p className="text-gray-600">
            {isEditing 
              ? 'Your review has been successfully updated.'
              : 'Thank you for sharing your experience!'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating *
            </label>
            <StarRating
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              size="large"
              showValue={true}
              allowHalf={true}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              maxLength={100}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              placeholder="Give your review a title..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              id="comment"
              name="comment"
              required
              value={formData.comment}
              onChange={handleInputChange}
              rows={5}
              maxLength={1000}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
              placeholder="Share your experience with this event..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.comment.length}/1000 characters (minimum 10)
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
                Submit anonymously
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Your name won&apos;t be shown with this review
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="flex-1 bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                isEditing ? 'Update Review' : 'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
