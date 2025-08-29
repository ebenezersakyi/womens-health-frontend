'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
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

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const onLoad = useCallback((mapInstance) => {
    console.log('Map loaded, setting up event listeners')
    setMap(mapInstance)
    
    // Add bounds change listener
    if (onBoundsChange) {
      console.log('Setting up bounds change listener')
      mapInstance.addListener('idle', () => {
        console.log('Google Maps idle event fired')
        setTimeout(() => {
          const bounds = mapInstance.getBounds()
          if (!bounds) {
            console.log('No bounds available')
            return
          }

          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()
          const nw = { lat: ne.lat(), lng: sw.lng() }
          const se = { lat: sw.lat(), lng: ne.lng() }

          // Create polygon coordinates for the visible map area
          const polygonCoordinates = [
            [sw.lng(), sw.lat()], // Southwest [lng, lat]
            [se.lng(), se.lat()], // Southeast  
            [ne.lng(), ne.lat()], // Northeast
            [nw.lng(), nw.lat()], // Northwest
            [sw.lng(), sw.lat()]  // Close polygon
          ]

          console.log('Calling onBoundsChange with polygon:', polygonCoordinates)
          onBoundsChange(polygonCoordinates)
        }, 500) // Delay to ensure bounds are settled
      })

      // Also add dragend event for immediate feedback
      mapInstance.addListener('dragend', () => {
        console.log('Google Maps dragend event fired')
        setTimeout(() => {
          const bounds = mapInstance.getBounds()
          if (!bounds) return

          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()
          const nw = { lat: ne.lat(), lng: sw.lng() }
          const se = { lat: sw.lat(), lng: ne.lng() }

          const polygonCoordinates = [
            [sw.lng(), sw.lat()],
            [se.lng(), se.lat()], 
            [ne.lng(), ne.lat()],
            [nw.lng(), nw.lat()],
            [sw.lng(), sw.lat()]
          ]

          console.log('Dragend - calling onBoundsChange with polygon:', polygonCoordinates)
          onBoundsChange(polygonCoordinates)
        }, 100)
      })

      // Add zoom change event
      mapInstance.addListener('zoom_changed', () => {
        console.log('Google Maps zoom_changed event fired')
        setTimeout(() => {
          const bounds = mapInstance.getBounds()
          if (!bounds) return

          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()
          const nw = { lat: ne.lat(), lng: sw.lng() }
          const se = { lat: sw.lat(), lng: ne.lng() }

          const polygonCoordinates = [
            [sw.lng(), sw.lat()],
            [se.lng(), se.lat()], 
            [ne.lng(), ne.lat()],
            [nw.lng(), nw.lat()],
            [sw.lng(), sw.lat()]
          ]

          console.log('Zoom changed - calling onBoundsChange with polygon:', polygonCoordinates)
          onBoundsChange(polygonCoordinates)
        }, 100)
      })
    }
    
    // If we have events and user location, fit bounds to include all
    if (events.length > 0 && userLocation) {
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
    }
  }, [events, userLocation, onBoundsChange])

  const onUnmount = useCallback(() => {
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

  const center = userLocation || defaultCenter

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
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

        {/* Event Markers */}
        {events.map((event) => (
          event.location?.coordinates && (
            <Marker
              key={event.id}
              position={{
                lat: event.location.coordinates.lat,
                lng: event.location.coordinates.lng
              }}
              onClick={() => handleMarkerClick(event)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EC4899" stroke="#FFFFFF" stroke-width="2"/>
                    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32)
              }}
            />
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
