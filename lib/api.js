import axios from 'axios'

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
})

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API endpoints
export const apiService = {
  // Tips
  getTips: () => api.get('/tips'),
  
  // Events
  getNearbyEvents: (lat, lng, radius = 25, date = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: (radius * 1000).toString(), // Convert km to meters as per your API
    })
    
    if (date) {
      params.append('date', date)
    }
    if (startDate) {
      params.append('startDate', startDate)
    }
    if (endDate) {
      params.append('endDate', endDate)
    }
    
    return api.get(`/events/nearby?${params}`)
  },

  getEventsInPolygon: (polygonData) => {
    return api.post('/events/polygon', polygonData)
  },
  
  getAllEvents: (filters = {}) => {
    const params = new URLSearchParams()
    
    // Handle location-based filtering
    if (filters.lat && filters.lng) {
      params.append('lat', filters.lat.toString())
      params.append('lng', filters.lng.toString())
      if (filters.radius) {
        params.append('radius', (filters.radius * 1000).toString()) // Convert to meters
      }
    }
    
    // Handle title search
    if (filters.title) {
      params.append('title', filters.title)
    }
    
    // Handle date filtering
    if (filters.date) {
      params.append('date', filters.date)
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    
    // Handle region filtering
    if (filters.region && filters.region !== 'all') {
      params.append('region', filters.region)
    }
    
    // Handle pagination
    if (filters.page) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString())
    }
    
    return api.get(`/events/nearby?${params}`)
  },

  // Search events by title specifically
  searchEvents: (title, filters = {}) => {
    const params = new URLSearchParams({
      title: title
    })
    
    // Add other filters if provided
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key].toString())
      }
    })
    
    return api.get(`/events/search?${params}`)
  },
  
  getEvent: (id) => api.get(`/events/${id}`),
  
  // User
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout')
}

export default api
