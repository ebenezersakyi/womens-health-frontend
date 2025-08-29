'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, List, Filter, Navigation, AlertCircle } from 'lucide-react'
import { useStore } from '../../lib/store'
import { apiService } from '../../lib/api'
import GoogleMapComponent from '../../components/GoogleMapComponent'
import FilterBar from '../../components/FilterBar'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MapPage() {
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState(null)
  const [isPolygonSearch, setIsPolygonSearch] = useState(false)
  const [mapPolygon, setMapPolygon] = useState(null)
  const router = useRouter()

  const {
    userLocation,
    setUserLocation,
    events,
    setEvents,
    filters,
    setFilters,
    isLoadingLocation,
    isLoadingEvents,
    setIsLoadingEvents,
    getCurrentLocation
  } = useStore()

  useEffect(() => {
    initializeLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchNearbyEvents()
    }
  }, [userLocation, filters])

  const initializeLocation = async () => {
    try {
      await getCurrentLocation()
      setError(null)
    } catch (error) {
      console.error('Location error:', error)
      setError('Unable to get your location. Please enable location services.')
      
      // Use default location (Accra, Ghana) if geolocation fails
      const defaultLocation = { lat: 5.6037, lng: -0.1870 }
      setUserLocation(defaultLocation)
    }
  }

  const fetchNearbyEvents = async () => {
    if (!userLocation) return

    try {
      setIsLoadingEvents(true)
      setError(null)

      const radius = getRadiusFromFilter(filters.distance)
      
      // Use the updated API structure
      const response = await apiService.getNearbyEvents(
        userLocation.lat, 
        userLocation.lng, 
        radius
      )

      // Handle new response structure
      const eventsData = response.data?.success && response.data?.data?.events 
        ? response.data.data.events 
        : getMockEvents()

      // Transform events to match expected format
      const transformedEvents = eventsData.map(event => ({
        ...event,
        id: event._id || event.id,
        location: {
          address: event.location?.address,
          coordinates: {
            lat: event.location?.coordinates?.[1] || 0, // GeoJSON format [lng, lat]
            lng: event.location?.coordinates?.[0] || 0
          }
        },
        // Add distance if provided by API (in meters, convert to km)
        ...(event.distance && { distance: event.distance / 1000 })
      }))

      setEvents(transformedEvents)
      setIsPolygonSearch(false) // Reset polygon search flag
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setError('Failed to load events. Please try again.')
      // Use mock data if API fails
      setEvents(getMockEvents())
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const fetchEventsInPolygon = async (polygonCoordinates) => {
    try {
      setIsLoadingEvents(true)
      setError(null)

      // Prepare polygon request data
      const polygonData = {
        coordinates: polygonCoordinates,
        // Add current filters
        ...(filters.region !== 'all' && { region: filters.region }),
        // Add date filters if available
        ...(filters.dateRange !== 'all' && {
          // Add date logic based on filter
        }),
        // Add pagination
        page: 1,
        limit: 50
      }

      console.log('Fetching events in polygon:', polygonData)

      const response = await apiService.getEventsInPolygon(polygonData)

      // Handle new response structure
      const eventsData = response.data?.success && response.data?.data?.events 
        ? response.data.data.events 
        : getMockEvents()

      // Transform events to match expected format
      const transformedEvents = eventsData.map(event => ({
        ...event,
        id: event._id || event.id,
        location: {
          address: event.location?.address,
          coordinates: {
            lat: event.location?.coordinates?.[1] || 0, // GeoJSON format [lng, lat]
            lng: event.location?.coordinates?.[0] || 0
          }
        }
      }))

      setEvents(transformedEvents)
      setIsPolygonSearch(true)
      setMapPolygon(polygonCoordinates)
    } catch (error) {
      console.error('Failed to fetch events in polygon:', error)
      setError('Failed to load events in map area. Please try again.')
      // Fallback to regular nearby events
      fetchNearbyEvents()
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleMapBoundsChange = (polygonCoordinates) => {
    console.log('Map bounds changed, received polygon:', polygonCoordinates)
    // Debounce the polygon search to avoid too many API calls
    clearTimeout(window.mapBoundsTimeout)
    window.mapBoundsTimeout = setTimeout(() => {
      console.log('Executing debounced polygon search')
      fetchEventsInPolygon(polygonCoordinates)
    }, 1000) // Wait 1 second after user stops moving the map
  }

  const getRadiusFromFilter = (distance) => {
    switch (distance) {
      case 'nearby': return 25
      case '50km': return 50
      case '100km': return 100
      default: return 25
    }
  }

  const handleEventClick = (event) => {
    router.push(`/events/${event.id}`)
  }

  const handleLocationRefresh = () => {
    initializeLocation()
  }

  const regions = [
    { value: 'greater-accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'western', label: 'Western' },
    { value: 'central', label: 'Central' },
    { value: 'eastern', label: 'Eastern' },
    { value: 'northern', label: 'Northern' },
    { value: 'brong-ahafo', label: 'Brong Ahafo' },
    { value: 'upper-east', label: 'Upper East' },
    { value: 'upper-west', label: 'Upper West' },
    { value: 'volta', label: 'Volta' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-pink-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Screening Centers Near You
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLocationRefresh}
                disabled={isLoadingLocation}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Refresh location"
              >
                <Navigation className={`h-5 w-5 ${isLoadingLocation ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-5 w-5" />
              </button>

              <div className="border-l pl-2 ml-2">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded ${viewMode === 'map' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <MapPin className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mt-4">
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                regions={regions}
              />
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {(isLoadingLocation || isLoadingEvents) && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600">
                {isLoadingLocation ? 'Getting your location...' : 'Loading nearby events...'}
              </p>
            </div>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && !isLoadingLocation && !isLoadingEvents && (
          <div className="relative bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <GoogleMapComponent
              userLocation={userLocation}
              events={events}
              onEventClick={handleEventClick}
              onBoundsChange={handleMapBoundsChange}
              className="w-full h-full"
            />
            
            {/* Map Search Indicator */}
            {isPolygonSearch && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-pink-100 z-10">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Showing events in map area</span>
                  <button
                    onClick={fetchNearbyEvents}
                    className="text-pink-600 hover:text-pink-700 font-medium ml-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && !isLoadingEvents && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or check back later for new events.
                </p>
                <button
                  onClick={() => setFilters({ region: 'all', distance: 'all', dateRange: 'all' })}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location?.address || event.location}</span>
                      </div>
                      <div>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    {event.distance && (
                      <div className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                        {event.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Mock events for development/fallback
function getMockEvents() {
  return [
    {
      _id: "mock-1",
      id: 1,
      title: "Free Breast Cancer Screening - Korle Bu Hospital",
      date: "2025-09-05T09:00:00.000Z",
      location: {
        coordinates: [-0.2267, 5.5663], // GeoJSON format [lng, lat]
        address: "Korle Bu Teaching Hospital, Accra",
        region: "Greater Accra"
      },
      organizer: "Ghana Health Service",
      distance: 12500 // in meters
    },
    {
      _id: "mock-2",
      id: 2,
      title: "Breast Health Awareness Program - University of Ghana", 
      date: "2025-09-10T14:00:00.000Z",
      location: {
        coordinates: [-0.1870, 5.6508], // GeoJSON format [lng, lat]
        address: "University of Ghana Medical Centre, Legon",
        region: "Greater Accra"
      },
      organizer: "UG Medical Centre",
      distance: 8200 // in meters
    },
    {
      _id: "mock-3",
      id: 3,
      title: "Community Screening Day - Ridge Hospital",
      date: "2025-09-15T08:00:00.000Z",
      location: {
        coordinates: [-0.1969, 5.5731], // GeoJSON format [lng, lat]
        address: "Ridge Hospital, Accra",
        region: "Greater Accra"
      },
      organizer: "Ridge Hospital Foundation",
      distance: 15300 // in meters
    }
  ]
}
