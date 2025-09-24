'use client'

import { useState, useEffect } from 'react'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react'
import StarRating, { AverageRating } from './StarRating'
import LoadingSpinner from './LoadingSpinner'
import { apiService } from '../lib/api'
import { useStore } from '../lib/store'

export default function ReviewList({ 
  eventId,
  onEditReview = () => {},
  onDeleteReview = () => {},
  refreshTrigger = 0
}) {
  const [reviews, setReviews] = useState([])
  const [ratingStats, setRatingStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [ratingFilter, setRatingFilter] = useState('')
  const [votingLoading, setVotingLoading] = useState({})
  
  const { user } = useStore()

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        ...(ratingFilter && { rating: ratingFilter })
      }
      
      const response = await apiService.getEventReviews(eventId, params)
      
      if (response.data.success) {
        const { reviews: reviewsData, ratingStats: stats, pagination: paginationData } = response.data.data
        setReviews(reviewsData || [])
        setRatingStats(stats || null)
        setPagination(paginationData || null)
      } else {
        setError('Failed to load reviews')
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setError('Failed to load reviews. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchReviews()
    }
  }, [eventId, sortBy, sortOrder, ratingFilter, refreshTrigger])

  const handleVote = async (reviewId, isHelpful) => {
    if (!user) return
    
    setVotingLoading(prev => ({ ...prev, [reviewId]: true }))
    
    try {
      const response = await apiService.voteOnReview(reviewId, isHelpful)
      
      if (response.data.success) {
        // Update the review in the list with new vote counts
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                helpfulVotes: response.data.data.helpfulVotes,
                totalVotes: response.data.data.totalVotes,
                helpfulPercentage: response.data.data.helpfulPercentage
              }
            : review
        ))
      }
    } catch (error) {
      console.error('Failed to vote on review:', error)
    } finally {
      setVotingLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canUserEditReview = (review) => {
    if (!user || !review.userId) return false
    return user.id === review.userId._id
  }

  const getRatingDistributionPercentage = (rating, total) => {
    return total > 0 ? Math.round((rating / total) * 100) : 0
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {ratingStats && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Review Summary
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <div>
                  <StarRating 
                    rating={ratingStats.averageRating}
                    size="large"
                    readonly={true}
                    showValue={false}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-6">
                    {rating}★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ 
                        width: `${getRatingDistributionPercentage(
                          ratingStats.ratingDistribution[rating] || 0, 
                          ratingStats.totalReviews
                        )}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">
                    {ratingStats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
            <option value="helpfulVotes-desc">Most Helpful</option>
          </select>
          
          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !loading ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">
            Be the first to share your experience with this event!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-pink-600" />
                  </div>
                  
                  {/* User Info and Rating */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {review.isAnonymous ? 'Anonymous' : review.userId?.name || 'Unknown User'}
                      </h4>
                      <StarRating 
                        rating={review.rating}
                        size="small"
                        readonly={true}
                        showValue={false}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Menu for Review Author */}
                {canUserEditReview(review) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditReview(review)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReview(review)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h5>
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Organizer Response */}
              {review.response && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-900">
                      Response from {review.response.respondedBy?.name || 'Organizer'}
                    </span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    {review.response.text}
                  </p>
                </div>
              )}

              {/* Helpfulness Voting */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Was this helpful?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(review._id, true)}
                      disabled={!user || votingLoading[review._id]}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => handleVote(review._id, false)}
                      disabled={!user || votingLoading[review._id]}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
                
                {review.totalVotes > 0 && (
                  <div className="text-sm text-gray-500">
                    {review.helpfulVotes} of {review.totalVotes} found this helpful
                    {review.helpfulPercentage > 0 && (
                      <span className="ml-2">({review.helpfulPercentage}%)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination && pagination.current < pagination.total && (
        <div className="text-center">
          <button
            onClick={() => fetchReviews(pagination.current + 1)}
            disabled={loading}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  )
}
