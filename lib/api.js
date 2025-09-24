import axios from 'axios'

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
})

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_id')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiService = {
  // Authentication
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),

  // Health Profile Management
  getHealthProfile: () => api.get('/health/profile'),
  createHealthProfile: (data) => api.post('/health/profile', data),
  updateHealthProfile: (data) => api.put('/health/profile', data),
  getHealthAnalytics: () => api.get('/health/analytics'),

  // Symptom Tracking
  createSymptomLog: (data) => api.post('/health/symptoms', data),
  getSymptomHistory: (params = {}) => api.get('/health/symptoms', { params }),
  getSymptomById: (id) => api.get(`/health/symptoms/${id}`),
  updateSymptomLog: (id, data) => api.put(`/health/symptoms/${id}`, data),
  deleteSymptomLog: (id) => api.delete(`/health/symptoms/${id}`),
  getSymptomStats: () => api.get('/health/symptoms/stats'),

  // Symptom Tracking with Photo Upload
  createSymptomLogWithPhoto: (formData) => api.post('/health/symptoms', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Appointment Management
  bookAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: (params = {}) => api.get('/appointments/my', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id, data) => api.delete(`/appointments/${id}`, { data }),

  // Notifications & Reminders
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  createReminder: (data) => api.post('/notifications/reminders', data),
  getReminders: (params = {}) => api.get('/notifications/reminders', { params }),
  updateReminder: (id, data) => api.put(`/notifications/reminders/${id}`, data),
  deleteReminder: (id) => api.delete(`/notifications/reminders/${id}`),

  // Events & Tips
  getEvents: (params = {}) => api.get('/events', { params }),
  searchEventsByLocation: (params) => api.get('/events/search', { params }),
  getTips: (params = {}) => api.get('/tips', { params }),
  
  // Legacy event methods (keeping for backward compatibility)
  getNearbyEvents: (lat, lng, radius = 25, date = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: (radius * 1000).toString(),
    })
    
    if (date) params.append('date', date)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return api.get(`/events/search?${params}`)
  },

  getEventsInPolygon: (polygonData) => {
    return api.post('/events/polygon', polygonData)
  },
  
  getAllEvents: (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.lat && filters.lng) {
      params.append('lat', filters.lat.toString())
      params.append('lng', filters.lng.toString())
      if (filters.radius) {
        params.append('radius', (filters.radius * 1000).toString())
      }
    }
    
    if (filters.title) params.append('title', filters.title)
    if (filters.date) params.append('date', filters.date)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.region && filters.region !== 'all') params.append('region', filters.region)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    return api.get(`/events?${params}`)
  },

  searchEvents: (title, filters = {}) => {
    const params = new URLSearchParams({ title })
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key].toString())
      }
    })
    
    return api.get(`/events/search?${params}`)
  },
  
  getEvent: (id) => api.get(`/events/${id}`),
  
  // User Profile (legacy)
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),

  // Event Reviews
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getEventReviews: (eventId, params = {}) => api.get(`/reviews/event/${eventId}`, { params }),
  getMyReviews: (params = {}) => api.get('/reviews/my', { params }),
  getReview: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  voteOnReview: (id, isHelpful) => api.post(`/reviews/${id}/vote`, { isHelpful }),
  respondToReview: (id, response) => api.post(`/reviews/${id}/respond`, { response }),
  getRecentReviews: (params = {}) => api.get('/reviews/recent', { params }),
  getOrganizerReviewStats: () => api.get('/reviews/organizer/stats'),
}

export default api
