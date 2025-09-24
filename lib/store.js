import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Authentication
      user: null,
      isAuthenticated: false,
      authToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthToken: (token) => set({ authToken: token, isAuthenticated: !!token }),
      logout: () => {
        try {
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pinky-trust-storage');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
          }
          
          // Reset state immediately
          set({ 
            user: null, 
            isAuthenticated: false, 
            authToken: null,
            healthProfile: null,
            symptoms: [],
            appointments: [],
            reminders: [],
            notifications: [],
            userLocation: null,
            events: [],
            healthAnalytics: null,
            settings: {
              notifications: {
                push: true,
                email: true,
                sms: false
              },
              privacy: {
                shareDataForResearch: false,
                allowCommunityInteraction: true
              },
              language: 'en',
              theme: 'light'
            }
          });
        } catch (error) {
          console.error('Error during logout:', error);
          // Still reset state even if localStorage fails
          set({ 
            user: null, 
            isAuthenticated: false, 
            authToken: null,
            healthProfile: null,
            symptoms: [],
            appointments: [],
            reminders: [],
            notifications: [],
            userLocation: null,
            events: [],
            healthAnalytics: null,
            settings: {
              notifications: {
                push: true,
                email: true,
                sms: false
              },
              privacy: {
                shareDataForResearch: false,
                allowCommunityInteraction: true
              },
              language: 'en',
              theme: 'light'
            }
          });
        }
      },

      // User location
      userLocation: null,
      setUserLocation: (location) => set({ userLocation: location }),

      // Health Profile
      healthProfile: null,
      setHealthProfile: (profile) => set({ healthProfile: profile }),

      // Symptom Tracking
      symptoms: [],
      setSymptoms: (symptoms) => set({ symptoms }),
      addSymptom: (symptom) => set(state => ({ 
        symptoms: [symptom, ...state.symptoms] 
      })),
      updateSymptom: (id, updatedSymptom) => set(state => ({
        symptoms: state.symptoms.map(s => s._id === id ? updatedSymptom : s)
      })),
      removeSymptom: (id) => set(state => ({
        symptoms: state.symptoms.filter(s => s._id !== id)
      })),

      // Appointments
      appointments: [],
      setAppointments: (appointments) => set({ appointments }),
      addAppointment: (appointment) => set(state => ({ 
        appointments: [appointment, ...state.appointments] 
      })),
      updateAppointment: (id, updatedAppointment) => set(state => ({
        appointments: state.appointments.map(a => a._id === id ? updatedAppointment : a)
      })),
      removeAppointment: (id) => set(state => ({
        appointments: state.appointments.filter(a => a._id !== id)
      })),

      // Reminders
      reminders: [],
      setReminders: (reminders) => set({ reminders }),
      addReminder: (reminder) => set(state => ({ 
        reminders: [reminder, ...state.reminders] 
      })),
      updateReminder: (id, updatedReminder) => set(state => ({
        reminders: state.reminders.map(r => r._id === id ? updatedReminder : r)
      })),
      removeReminder: (id) => set(state => ({
        reminders: state.reminders.filter(r => r._id !== id)
      })),

      // Notifications
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set(state => ({ 
        notifications: [notification, ...state.notifications] 
      })),
      markNotificationAsRead: (id) => set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        )
      })),

      // Events
      events: [],
      setEvents: (events) => set({ events }),

      // Filters
      filters: {
        region: 'all',
        dateRange: 'all',
        distance: 'nearby'
      },
      setFilters: (newFilters) => set(state => ({
        filters: { ...state.filters, ...newFilters }
      })),

      // Loading states
      isLoadingLocation: false,
      setIsLoadingLocation: (loading) => set({ isLoadingLocation: loading }),
      
      isLoadingEvents: false,
      setIsLoadingEvents: (loading) => set({ isLoadingEvents: loading }),

      isLoadingProfile: false,
      setIsLoadingProfile: (loading) => set({ isLoadingProfile: loading }),

      isLoadingSymptoms: false,
      setIsLoadingSymptoms: (loading) => set({ isLoadingSymptoms: loading }),

      isLoadingAppointments: false,
      setIsLoadingAppointments: (loading) => set({ isLoadingAppointments: loading }),

      // Health Analytics
      healthAnalytics: null,
      setHealthAnalytics: (analytics) => set({ healthAnalytics: analytics }),

      // Reviews
      reviews: [],
      setReviews: (reviews) => set({ reviews }),
      addReview: (review) => set(state => ({ 
        reviews: [review, ...state.reviews] 
      })),
      updateReview: (id, updatedReview) => set(state => ({
        reviews: state.reviews.map(r => r._id === id ? updatedReview : r)
      })),
      removeReview: (id) => set(state => ({
        reviews: state.reviews.filter(r => r._id !== id)
      })),
      
      // Review statistics per event
      eventReviewStats: {},
      setEventReviewStats: (eventId, stats) => set(state => ({
        eventReviewStats: { ...state.eventReviewStats, [eventId]: stats }
      })),
      
      // User's own reviews
      myReviews: [],
      setMyReviews: (reviews) => set({ myReviews: reviews }),
      addMyReview: (review) => set(state => ({ 
        myReviews: [review, ...state.myReviews] 
      })),
      updateMyReview: (id, updatedReview) => set(state => ({
        myReviews: state.myReviews.map(r => r._id === id ? updatedReview : r)
      })),
      removeMyReview: (id) => set(state => ({
        myReviews: state.myReviews.filter(r => r._id !== id)
      })),

      isLoadingReviews: false,
      setIsLoadingReviews: (loading) => set({ isLoadingReviews: loading }),

      // App Settings
      settings: {
        notifications: {
          push: true,
          email: true,
          sms: false
        },
        privacy: {
          shareDataForResearch: false,
          allowCommunityInteraction: true
        },
        language: 'en',
        theme: 'light'
      },
      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings }
      })),

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
    }),
    {
      name: 'pinky-trust-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        healthProfile: state.healthProfile,
        settings: state.settings,
        userLocation: state.userLocation
      })
    }
  )
)
