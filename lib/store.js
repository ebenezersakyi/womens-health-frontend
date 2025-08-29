import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // User location
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Filters
  filters: {
    region: 'all',
    dateRange: 'all',
    distance: 'nearby'
  },
  setFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Events
  events: [],
  setEvents: (events) => set({ events }),

  // Loading states
  isLoadingLocation: false,
  setIsLoadingLocation: (loading) => set({ isLoadingLocation: loading }),
  
  isLoadingEvents: false,
  setIsLoadingEvents: (loading) => set({ isLoadingEvents: loading }),

  // User data
  user: null,
  setUser: (user) => set({ user }),

  // Get user's current location
  getCurrentLocation: async () => {
    const { setUserLocation, setIsLoadingLocation } = get()
    
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.')
    }

    setIsLoadingLocation(true)
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setIsLoadingLocation(false)
          resolve(location)
        },
        (error) => {
          setIsLoadingLocation(false)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }
}))
