'use client'

import { MapPin, Calendar, Clock, ExternalLink } from 'lucide-react'
import { AverageRating } from './StarRating'
import Image from 'next/image'

export default function EventCard({ event, onClick }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 overflow-hidden"
      onClick={() => onClick?.(event)}
    >
      {/* Event Image */}
      {event.image?.url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.image.url}
            alt={event.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Status badge overlay */}
          {event.status && (
            <div className="absolute top-3 right-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'active' ? 'bg-green-100/90 text-green-700' : 
                event.status === 'completed' ? 'bg-blue-100/90 text-blue-700' :
                event.status === 'cancelled' ? 'bg-red-100/90 text-red-700' : 'bg-gray-100/90 text-gray-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  event.status === 'active' ? 'bg-green-500' : 
                  event.status === 'completed' ? 'bg-blue-500' :
                  event.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="capitalize">{event.status}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {formatDate(event.date)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {formatTime(event.date)}
            </span>
          </div>
          
          <div className="flex items-start text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm line-clamp-2">
              {event.location?.address || 'Address not specified'}
            </span>
          </div>

          {event.location?.region && (
            <div className="flex items-center text-gray-500 ml-6">
              <span className="text-xs">
                {event.location.region} Region
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          {event.organizerId?.name && (
            <div className="text-sm text-gray-500 truncate">
              Organized by: {event.organizerId.name}
            </div>
          )}
          
          {/* Status badge for cards without images */}
          {!event.image?.url && event.status && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                event.status === 'active' ? 'bg-green-500' : 
                event.status === 'completed' ? 'bg-blue-500' :
                event.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className={`text-xs font-medium capitalize ${
                event.status === 'active' ? 'text-green-700' : 
                event.status === 'completed' ? 'text-blue-700' :
                event.status === 'cancelled' ? 'text-red-700' : 'text-gray-700'
              }`}>
                {event.status}
              </span>
            </div>
          )}
        </div>

        {/* Rating and Distance/Participants */}
        <div className="space-y-2">
          {/* Average Rating */}
          {event.reviewStats && event.reviewStats.averageRating > 0 && (
            <div className="flex items-center justify-between">
              <AverageRating 
                averageRating={event.reviewStats.averageRating}
                totalReviews={event.reviewStats.totalReviews}
                size="small"
                showCount={true}
              />
            </div>
          )}
          
          {/* Distance and Participants */}
          <div className="flex items-center justify-between">
            {event.distance && (
              <div className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                {event.distance.toFixed(1)} km away
              </div>
            )}
            
            {event.maxParticipants && (
              <div className="text-xs text-gray-500">
                {event.registeredParticipants || 0}/{event.maxParticipants} participants
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
