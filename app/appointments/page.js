'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit3,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { apiService } from '../../lib/api'
import { useStore } from '../../lib/store'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('')

  const router = useRouter()
  const { user, isAuthenticated } = useStore()

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await apiService.getMyAppointments(params)
      setAppointments(response.data?.appointments || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchAppointments()
  }, [isAuthenticated, router, fetchAppointments])

  useEffect(() => {
    if (!loading) {
      fetchAppointments()
    }
  }, [filter, fetchAppointments, loading])

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await apiService.cancelAppointment(appointmentId, {
        cancellationReason: 'User requested cancellation'
      })
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      )
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <X className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const appointmentType = appointment.appointmentType?.toLowerCase() || ''
    const eventTitle = appointment.eventId?.title?.toLowerCase() || ''
    
    return appointmentType.includes(searchLower) || eventTitle.includes(searchLower)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-1">Manage your health screenings and consultations</p>
            </div>
            <button
              onClick={() => router.push('/events')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.appointmentType || 'Health Screening'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.eventId?.title || 'Appointment'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="capitalize">{appointment.status}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/appointments/${appointment._id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => router.push(`/appointments/${appointment._id}/edit`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Reschedule"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.timeSlot?.startTime 
                          ? `${formatTime(appointment.timeSlot.startTime)} - ${formatTime(appointment.timeSlot.endTime)}`
                          : 'Time TBD'
                        }
                      </p>
                    </div>
                  </div>

                  {appointment.eventId?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.eventId.location.address || 'Location TBD'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                {appointment.contactInfo && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      {appointment.contactInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.contactInfo.phone}</span>
                        </div>
                      )}
                      
                      {appointment.contactInfo.preferredContact && (
                        <div className="text-sm text-gray-600">
                          Preferred contact: <span className="font-medium">{appointment.contactInfo.preferredContact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Symptoms Shared */}
                {appointment.symptoms?.hasSymptoms && appointment.symptoms.symptomList?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Symptoms to discuss:</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.symptoms.symptomList.map((symptom, index) => (
                        <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                          {symptom.type?.replace('_', ' ')} (Severity: {symptom.severity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {appointment.notes?.userNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{appointment.notes.userNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't booked any appointments yet. Start by finding available screening events."
                : `No ${filter} appointments found. Try adjusting your filters.`
              }
            </p>
            <button
              onClick={() => router.push('/events')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Find Screening Events
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
