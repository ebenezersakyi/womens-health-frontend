'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, OverlayView } from '@react-google-maps/api'
import { MapPin, Calendar, Clock, ExternalLink } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 5.6037,
  lng: -0.1870 // Accra, Ghana coordinates as default
}

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export default function GoogleMapComponent({ 
  userLocation, 
  events = [], 
  onEventClick,
  onBoundsChange,
  className = '',
  zoom = 12
}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [map, setMap] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [initialCenter, setInitialCenter] = useState(null)
  const [hasAutoFitted, setHasAutoFitted] = useState(false)
  const boundsChangeTimeoutRef = useRef(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const onLoad = useCallback((mapInstance) => {
    console.log('Map loaded')
    setMap(mapInstance)
    setIsInitialLoad(true)
    
    // Set initial center only once
    const center = userLocation || defaultCenter
    setInitialCenter(center)
    
    // Only auto-fit bounds on the very first load, not when events update
    if (!hasAutoFitted && events.length > 0 && userLocation) {
      const bounds = new window.google.maps.LatLngBounds()
      
      // Add user location
      bounds.extend(userLocation)
      
      // Add all event locations
      events.forEach(event => {
        if (event.location?.coordinates) {
          bounds.extend({
            lat: event.location.coordinates.lat,
            lng: event.location.coordinates.lng
          })
        }
      })
      
      mapInstance.fitBounds(bounds)
      setHasAutoFitted(true) // Mark that we've done the initial fit
    }

    // Allow bounds changes after initial setup
    setTimeout(() => {
      setIsInitialLoad(false)
    }, 1000)
  }, [userLocation, hasAutoFitted]) // Removed events from dependencies

  // Handle bounds change using the GoogleMap onBoundsChanged prop with debouncing
  const handleBoundsChanged = useCallback(() => {
    // Skip bounds changes during initial load
    if (isInitialLoad || !map || !onBoundsChange) return

    // Clear existing timeout
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current)
    }

    // Debounce the bounds change handler
    boundsChangeTimeoutRef.current = setTimeout(() => {
      console.log('Map bounds changed (debounced)')
      const bounds = map.getBounds()
      if (!bounds) {
        console.log('No bounds available')
        return
      }

      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      
      // Extract coordinates using the lat() and lng() methods
      const neLat = ne.lat()
      const neLng = ne.lng()
      const swLat = sw.lat()
      const swLng = sw.lng()

      // Create polygon coordinates for the visible map area
      const polygonCoordinates = [
        [swLng, swLat], // Southwest [lng, lat]
        [neLng, swLat], // Southeast  
        [neLng, neLat], // Northeast
        [swLng, neLat], // Northwest
        [swLng, swLat]  // Close polygon
      ]

      console.log('Calling onBoundsChange with polygon:', polygonCoordinates)
      onBoundsChange(polygonCoordinates)
    }, 500) // 500ms debounce
  }, [isInitialLoad, map, onBoundsChange])

  const onUnmount = useCallback(() => {
    // Clear timeout on unmount
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current)
    }
    setMap(null)
  }, [])

  const handleMarkerClick = (event) => {
    setSelectedEvent(event)
    onEventClick?.(event)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openInGoogleMaps = (event) => {
    if (event.location?.coordinates) {
      const { lat, lng } = event.location.coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      window.open(url, '_blank')
    }
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load Google Maps</div>
          <div className="text-sm text-gray-600">Please check your internet connection and try again</div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={isInitialLoad ? (userLocation || defaultCenter) : undefined}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onBoundsChanged={handleBoundsChanged}
        options={mapOptions}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }}
            title="Your Location"
          />
        )}

        {/* Event Card Markers */}
        {events.map((event) => (
          event.location?.coordinates && (
            <OverlayView
              key={event.id}
              position={{
                lat: event.location.coordinates.lat,
                lng: event.location.coordinates.lng
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => handleMarkerClick(event)}
                className="bg-white rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 min-w-48 max-w-52 overflow-hidden"
                style={{
                  transform: 'translate(-50%, -100%)',
                  marginBottom: '8px'
                }}
              >
                {/* Event Image */}
                {event.image?.url && (
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={event.image.url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Main Content */}
                <div className="p-3 space-y-2">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(event.date)}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 text-pink-500 flex-shrink-0" />
                    <span className="line-clamp-1 truncate">
                      {event.location.address.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'active' ? 'bg-green-500' : 
                    event.status === 'completed' ? 'bg-blue-500' :
                    event.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                </div>

                {/* Arrow pointer */}
                <div 
                  className="absolute left-1/2 bottom-0 w-0 h-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-white shadow-sm"
                  style={{ 
                    transform: 'translate(-50%, 100%)',
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                  }}
                ></div>
              </div>
            </OverlayView>
          )
        ))}

        {/* Info Window */}
        {selectedEvent && selectedEvent.location?.coordinates && (
          <InfoWindow
            position={{
              lat: selectedEvent.location.coordinates.lat,
              lng: selectedEvent.location.coordinates.lng
            }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <div className="p-2 max-w-sm">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {selectedEvent.title}
              </h3>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{formatTime(selectedEvent.date)}</span>
                </div>
                
                <div className="flex items-start text-gray-600 text-sm">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {selectedEvent.location.address}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/events/${selectedEvent.id}`}
                  className="text-xs bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700 transition-colors"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => openInGoogleMaps(selectedEvent)}
                  className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Directions
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
