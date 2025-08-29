'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, MapPin, Filter, Search, AlertCircle, List, Clock, X, Navigation } from 'lucide-react'
import { useJsApiLoader } from '@react-google-maps/api'
import { DateRangePicker, Calendar as DateRangeCalendar } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { apiService } from '../../lib/api'
import { useStore } from '../../lib/store'
import EventCard from '../../components/EventCard'
import FilterBar from '../../components/FilterBar'
import LoadingSpinner from '../../components/LoadingSpinner'
import GoogleMapComponent from '../../components/GoogleMapComponent'

// Google Places integration
let autocomplete;
let service;

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState('')
  const [locationValue, setLocationValue] = useState('')
  const [eventTitleSearch, setEventTitleSearch] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [showFilters, setShowFilters] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ])
  const [singleDate, setSingleDate] = useState(new Date())
  const [hasDateFilter, setHasDateFilter] = useState(false) // Track if user has actively set a date filter
  const [isPolygonSearch, setIsPolygonSearch] = useState(false)
  const autocompleteRef = useRef(null)
  const inputRef = useRef(null)
  const datePickerRef = useRef(null)

  // Load Google Maps API with Places library
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const {
    events,
    setEvents,
    filters,
    setFilters,
    isLoadingEvents,
    setIsLoadingEvents,
    userLocation,
    setUserLocation,
    getCurrentLocation
  } = useStore()

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const title = searchParams.get('title')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')

    if (search) {
      setSearchValue(search)
    }
    
    if (location) {
      setLocationValue(location)
    }

    if (title) {
      setEventTitleSearch(title)
    }

    // Set coordinates from URL params if available
    if (lat && lng) {
      const coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
      setUserLocation(coordinates)
    } else {
      // Get user location for map view as fallback
      getCurrentLocation().catch(error => {
        console.error('Location error:', error)
        // Use default location (Accra, Ghana)
        setUserLocation({ lat: 5.6037, lng: -0.1870 })
      })
    }

    if (startDate || endDate) {
      setIsRangeMode(true)
      setDateRange([{
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        key: 'selection'
      }])
      setHasDateFilter(true)
    } else if (date) {
      setIsRangeMode(false)
      setSingleDate(new Date(date))
      setHasDateFilter(true)
    } else {
      setHasDateFilter(false)
    }
  }, [searchParams, getCurrentLocation, setUserLocation])

  // Handle click outside date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false)
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showDatePicker])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current) {
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types']
      })

      service = new window.google.maps.places.PlacesService(document.createElement('div'))

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry) {
          setLocationValue(place.formatted_address || place.name)
          // Extract coordinates and set them
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
          setUserLocation(coords)
        }
      })
    }
  }, [isLoaded])

  useEffect(() => {
    // Only fetch events if we have coordinates (either from URL or user location)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if ((lat && lng) || userLocation) {
      fetchEvents()
    }
  }, [filters, searchParams, userLocation, isRangeMode, dateRange, singleDate])

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      setError(null)
      
      // Get coordinates from URL params or use user location
      const lat = searchParams.get('lat')
      const lng = searchParams.get('lng')
      const radius = searchParams.get('radius')
      
      const coordinates = (lat && lng) ? {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      } : userLocation
      
      if (!coordinates) {
        console.warn('No coordinates available for API call')
        setEvents(getMockEvents())
        setIsLoadingEvents(false)
        return
      }
      
      // Prepare filters for the new API structure
      const apiFilters = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: radius ? parseInt(radius) : (
          filters.distance === 'nearby' ? 25000 : 
          filters.distance === '50km' ? 50000 : 
          filters.distance === '100km' ? 100000 : 25000
        ),
        // Add region filter if set
        ...(filters.region && filters.region !== 'all' && { region: filters.region })
      }
      
      // Add date filters from search params or current state
      if (hasDateFilter) {
        if (isRangeMode && dateRange[0]) {
          const { startDate, endDate } = dateRange[0]
          if (startDate) {
            apiFilters.startDate = startDate.toISOString()
          }
          if (endDate && endDate !== startDate) {
            apiFilters.endDate = endDate.toISOString()
          }
        } else if (singleDate) {
          apiFilters.date = singleDate.toISOString()
        }
      }

      // Add title search if provided
      const titleParam = searchParams.get('title')
      if (titleParam) {
        apiFilters.title = titleParam
      }
      
      console.log('API call with filters:', apiFilters)
      
      const response = await apiService.getAllEvents(apiFilters)
      
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
      setIsPolygonSearch(false) // Reset polygon search when using regular fetch
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setError('Failed to load events. Please try again.')
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
        // Add current search and filters
        ...(eventTitleSearch.trim() && { title: eventTitleSearch.trim() }),
        ...(filters.region && filters.region !== 'all' && { region: filters.region }),
        // Add date filters
        ...(hasDateFilter && isRangeMode && dateRange[0]?.startDate && {
          startDate: dateRange[0].startDate.toISOString(),
          ...(dateRange[0].endDate && dateRange[0].endDate !== dateRange[0].startDate && {
            endDate: dateRange[0].endDate.toISOString()
          })
        }),
        ...(hasDateFilter && !isRangeMode && singleDate && { date: singleDate.toISOString() }),
        // Add pagination
        page: 1,
        limit: 50
      }

      console.log('Fetching events in polygon:', polygonData)

      const response = await apiService.getEventsInPolygon(polygonData)

      // Handle response structure
      const eventsData = response.data?.success && response.data?.data?.events 
        ? response.data.data.events 
        : getMockEvents()

      // Transform events
      const transformedEvents = eventsData.map(event => ({
        ...event,
        id: event._id || event.id,
        location: {
          address: event.location?.address,
          coordinates: {
            lat: event.location?.coordinates?.[1] || 0,
            lng: event.location?.coordinates?.[0] || 0
          }
        }
      }))

      setEvents(transformedEvents)
      setIsPolygonSearch(true)
    } catch (error) {
      console.error('Failed to fetch events in polygon:', error)
      setError('Failed to load events in map area. Please try again.')
      // Fallback to regular fetch
      fetchEvents()
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleMapBoundsChange = (polygonCoordinates) => {
    // Debounce the polygon search
    clearTimeout(window.mapBoundsTimeout)
    window.mapBoundsTimeout = setTimeout(() => {
      fetchEventsInPolygon(polygonCoordinates)
    }, 1000)
  }

  const handleEventClick = (event) => {
    router.push(`/events/${event.id}`)
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    
    if (eventTitleSearch.trim()) {
      searchParams.append('title', eventTitleSearch.trim())
    }
    
    if (locationValue.trim()) {
      searchParams.append('location', locationValue.trim())
    }
    
    // Only include date parameters if user has actively set a date filter
    if (hasDateFilter) {
      if (isRangeMode) {
        const { startDate, endDate } = dateRange[0]
        if (startDate) {
          searchParams.append('startDate', startDate.toISOString())
        }
        if (endDate && endDate !== startDate) {
          searchParams.append('endDate', endDate.toISOString())
        }
      } else {
        if (singleDate) {
          searchParams.append('date', singleDate.toISOString())
        }
      }
    }
    
    const queryString = searchParams.toString()
    const url = queryString ? `/events?${queryString}` : '/events'
    router.push(url)
  }

  const clearSearch = () => {
    setEventTitleSearch('')
    setLocationValue('')
    setSearchValue('')
    setSingleDate(new Date())
    setDateRange([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }])
    setHasDateFilter(false) // Clear the date filter flag
    router.push('/events')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Filter events based on search and date
  const filteredEvents = events.filter(event => {
    // Text search filter - now only for title search
    const matchesSearch = eventTitleSearch === '' || 
      event.title.toLowerCase().includes(eventTitleSearch.toLowerCase())

    // Date filter
    const eventDate = new Date(event.date)
    let matchesDate = true
    
    // Only apply date filtering if user has actively set a date filter
    if (hasDateFilter) {
      if (isRangeMode) {
        const { startDate, endDate } = dateRange[0]
        if (startDate && endDate) {
          matchesDate = eventDate >= startDate && eventDate <= endDate
        }
      } else {
        const selectedDate = new Date(singleDate)
        selectedDate.setHours(0, 0, 0, 0)
        const eventDateOnly = new Date(eventDate)
        eventDateOnly.setHours(0, 0, 0, 0)
        
        matchesDate = eventDateOnly.getTime() === selectedDate.getTime()
      }
    }

    return matchesSearch && matchesDate
  })

  const formatDateRange = () => {
    if (!hasDateFilter) {
      return 'No date filter'
    }
    
    if (isRangeMode) {
      const { startDate, endDate } = dateRange[0]
      if (startDate && endDate && startDate !== endDate) {
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      } else if (startDate) {
        return startDate.toLocaleDateString()
      }
    } else {
      return singleDate.toLocaleDateString()
    }
    return 'Select dates'
  }

  const clearDateFilter = () => {
    setHasDateFilter(false)
    setSingleDate(new Date())
    setDateRange([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }])
    setShowDatePicker(false)
  }

  const groupEventsByDate = (events) => {
    const grouped = {}
    const now = new Date()
    
    events.forEach(event => {
      const eventDate = new Date(event.date)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      
      let groupKey
      if (eventDate < today) {
        groupKey = 'Past Events'
      } else if (eventDate.toDateString() === today.toDateString()) {
        groupKey = 'Today'
      } else if (eventDate.toDateString() === tomorrow.toDateString()) {
        groupKey = 'Tomorrow'
      } else if (eventDate < nextWeek) {
        groupKey = 'This Week'
      } else {
        groupKey = eventDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }
      grouped[groupKey].push(event)
    })
    
    return grouped
  }

  const groupOrder = ['Today', 'Tomorrow', 'This Week']

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Health Screening Events</h1>
                <p className="text-sm text-gray-500">Find screening events in your area</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4 mr-1.5" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Map
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-pink-50 text-pink-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Event Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. breast cancer screening"
                  value={eventTitleSearch}
                  onChange={(e) => setEventTitleSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
                {eventTitleSearch && (
                  <button
                    onClick={() => setEventTitleSearch('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter city or area"
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
                {locationValue && (
                  <button
                    onClick={() => setLocationValue('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Picker */}
            <div className="lg:col-span-3" ref={datePickerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between text-sm"
                >
                  <span className="truncate">{formatDateRange()}</span>
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </button>

                {showDatePicker && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDatePicker(false)}
                    />
                    
                    {/* Date Picker Dropdown */}
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={!isRangeMode}
                              onChange={() => setIsRangeMode(false)}
                              className="mr-2"
                            />
                            <span className="text-sm">Single Date</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={isRangeMode}
                              onChange={() => setIsRangeMode(true)}
                              className="mr-2"
                            />
                            <span className="text-sm">Date Range</span>
                          </label>
                        </div>
                        
                        {/* Close button */}
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {isRangeMode ? (
                        <DateRangePicker
                          ranges={dateRange}
                          onChange={(ranges) => {
                            setDateRange([ranges.selection])
                            setHasDateFilter(true)
                          }}
                          showSelectionPreview={true}
                          moveRangeOnFirstSelection={false}
                          months={1}
                          direction="horizontal"
                        />
                      ) : (
                        <DateRangeCalendar
                          date={singleDate}
                          onChange={(date) => {
                            setSingleDate(date)
                            setHasDateFilter(true)
                          }}
                        />
                      )}
                      
                      {/* Clear Date Filter Button */}
                      {hasDateFilter && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={clearDateFilter}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Clear date filter</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-transparent mb-2">Search</label>
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              regions={regions}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" 
               style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
            <GoogleMapComponent
              userLocation={userLocation}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onBoundsChange={handleMapBoundsChange}
              className="w-full h-full"
            />
            
            {/* Loading indicator for map */}
            {isLoadingEvents && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 z-10">
                <div className="flex items-center space-x-2 text-sm">
                  <LoadingSpinner size="small" />
                  <span className="text-gray-700">Loading events...</span>
                </div>
              </div>
            )}
            
            {/* Polygon Search Indicator */}
            {isPolygonSearch && !isLoadingEvents && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-gray-200 z-10">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">Showing events in visible area</span>
                  <button
                    onClick={fetchEvents}
                    className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Loading State for List View */}
            {isLoadingEvents && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <LoadingSpinner size="large" />
                  <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
              </div>
            )}

            {/* List Content */}
            {!isLoadingEvents && (
              <>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {(eventTitleSearch || locationValue) ? 'No matching events found' : 'No events found'}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {(eventTitleSearch || locationValue)
                          ? 'Try adjusting your search terms or date filters to find more events.'
                          : 'Try adjusting your filters or check back later for new screening events.'
                        }
                      </p>
                      {(eventTitleSearch || locationValue || filters.region !== 'all' || filters.dateRange !== 'all' || hasDateFilter) && (
                        <button
                          onClick={clearSearch}
                          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Results Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {(eventTitleSearch || locationValue) && (
                              `Results for ${eventTitleSearch ? `"${eventTitleSearch}"` : ''}${eventTitleSearch && locationValue ? ' in ' : ''}${locationValue ? `"${locationValue}"` : ''} • `
                            )}
                            <span className="text-pink-600">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} found
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {hasDateFilter ? (
                              isRangeMode 
                                ? `From ${formatDateRange()}`
                                : `For ${formatDateRange()}`
                            ) : (
                              'All upcoming events'
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Navigation className="h-4 w-4" />
                          <span>Sorted by date</span>
                        </div>
                      </div>
                    </div>

                    {/* Grouped Events */}
                    {Object.entries(groupEventsByDate(filteredEvents))
                      .sort(([a], [b]) => {
                        const aIndex = groupOrder.indexOf(a)
                        const bIndex = groupOrder.indexOf(b)
                        
                        if (aIndex !== -1 && bIndex !== -1) {
                          return aIndex - bIndex
                        } else if (aIndex !== -1) {
                          return -1
                        } else if (bIndex !== -1) {
                          return 1
                        } else {
                          return new Date(a) - new Date(b)
                        }
                      })
                      .map(([dateGroup, groupEvents]) => (
                        <div key={dateGroup} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <span>{dateGroup}</span>
                            </h2>
                            <p className="text-sm text-gray-500">{groupEvents.length} event{groupEvents.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {groupEvents
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map((event) => (
                                  <div key={event.id} className="hover:transform hover:scale-[1.02] transition-transform duration-200">
                                    <EventCard
                                      event={event}
                                      onClick={handleEventClick}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Mock events for development/fallback
function getMockEvents() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  return [
    {
      _id: "mock-1",
      id: 1,
      title: "Free Breast Cancer Screening - Korle Bu Hospital",
      date: today.toISOString(),
      location: {
        coordinates: [-0.2267, 5.5663], // GeoJSON format [lng, lat]
        address: "Korle Bu Teaching Hospital, Accra",
        region: "Greater Accra"
      },
      organizer: "Ghana Health Service",
      description: "Comprehensive breast cancer screening including mammograms and clinical examinations.",
      distance: 1500 // in meters
    },
    {
      _id: "mock-2", 
      id: 2,
      title: "Breast Health Awareness Program - University of Ghana",
      date: tomorrow.toISOString(),
      location: {
        coordinates: [-0.1870, 5.6508], // GeoJSON format [lng, lat]
        address: "University of Ghana Medical Centre, Legon",
        region: "Greater Accra"
      },
      organizer: "UG Medical Centre",
      description: "Educational program with free screening for students and staff.",
      distance: 2100 // in meters
    },
    {
      _id: "mock-3",
      id: 3,
      title: "Community Screening Day - Ridge Hospital",
      date: nextWeek.toISOString(),
      location: {
        coordinates: [-0.1969, 5.5731], // GeoJSON format [lng, lat]
        address: "Ridge Hospital, Accra",
        region: "Greater Accra"
      },
      organizer: "Ridge Hospital Foundation",
      description: "Walk-in screening available for women aged 40 and above.",
      distance: 800 // in meters
    },
    {
      _id: "mock-4",
      id: 4,
      title: "Mobile Screening Unit - Tema Community Center",
      date: nextMonth.toISOString(),
      location: {
        coordinates: [-0.0166, 5.6698], // GeoJSON format [lng, lat]
        address: "Tema Community Center, Tema",
        region: "Greater Accra"
      },
      organizer: "Ghana Cancer Society",
      description: "Mobile screening unit providing services to underserved communities.",
      distance: 25000 // in meters (25km)
    }
  ]
}
