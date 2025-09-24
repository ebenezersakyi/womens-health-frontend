'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Heart, 
  Shield, 
  Settings, 
  Bell,
  Edit3,
  LogOut,
  Calendar,
  Activity,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Users,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import { apiService } from '../../lib/api'
import { useStore } from '../../lib/store'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ProfilePage() {
  const [healthProfile, setHealthProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    symptomsLogged: 0,
    appointmentsBooked: 0,
    remindersActive: 0,
    lastScreening: null
  })

  const router = useRouter()
  const { 
    user, 
    isAuthenticated, 
    logout,
    symptoms,
    appointments,
    reminders
  } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchProfileData()
  }, [isAuthenticated, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Fetch health profile
      const profileResponse = await apiService.getHealthProfile()
      if (profileResponse.data) {
        setHealthProfile(profileResponse.data.profile || profileResponse.data)
      }

      // Calculate stats from store data
      const activeReminders = reminders.filter(r => !r.isCompleted).length
      const lastAppointment = appointments
        .filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]

      setStats({
        symptomsLogged: symptoms.length,
        appointmentsBooked: appointments.length,
        remindersActive: activeReminders,
        lastScreening: lastAppointment?.appointmentDate || null
      })
      
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to sign out?')) return

    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      router.push('/auth/login')
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-pink-100">{user?.email}</p>
              {healthProfile?.dateOfBirth && (
                <p className="text-pink-100 text-sm">
                  Age: {calculateAge(healthProfile.dateOfBirth)} years
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Overview</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-pink-600" />
                    <span className="text-gray-700">Symptoms Logged</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.symptomsLogged}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Appointments</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.appointmentsBooked}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Active Reminders</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.remindersActive}</span>
          </div>

                <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Screening</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(stats.lastScreening)}
                    </span>
                </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/symptoms/log')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-pink-600" />
                    <span className="text-gray-700">Log Symptom</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push('/events')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Book Screening</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push('/health/analytics')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">View Analytics</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Profile */}
            {healthProfile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Health Profile</h2>
                  <button
                    onClick={() => router.push('/profile/health/edit')}
                    className="flex items-center space-x-2 text-pink-600 hover:text-pink-500 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Date of Birth:</span>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(healthProfile.dateOfBirth)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Gender:</span>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {healthProfile.gender || 'Not specified'}
                        </p>
                      </div>
                      {healthProfile.lastScreeningDate && (
                        <div>
                          <span className="text-sm text-gray-500">Last Screening:</span>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(healthProfile.lastScreeningDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Family History */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Family History</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Breast Cancer:</span>
                        <span className={`text-sm font-medium ${
                          healthProfile.familyHistory?.breastCancer ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {healthProfile.familyHistory?.breastCancer ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Ovarian Cancer:</span>
                        <span className={`text-sm font-medium ${
                          healthProfile.familyHistory?.ovarianCancer ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {healthProfile.familyHistory?.ovarianCancer ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {healthProfile.familyHistory?.other && (
                        <div>
                          <span className="text-sm text-gray-500">Other Conditions:</span>
                          <p className="text-sm font-medium text-gray-900">
                            {healthProfile.familyHistory.other}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Lifestyle Factors</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Exercise:</span>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {healthProfile.riskFactors?.exerciseFrequency || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Smoking:</span>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {healthProfile.riskFactors?.smokingStatus || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Alcohol:</span>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {healthProfile.riskFactors?.alcoholConsumption || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {healthProfile.emergencyContact?.name && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Emergency Contact</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Name:</span>
                          <p className="text-sm font-medium text-gray-900">
                            {healthProfile.emergencyContact.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Relationship:</span>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {healthProfile.emergencyContact.relationship}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Phone:</span>
                          <p className="text-sm font-medium text-gray-900">
                            {healthProfile.emergencyContact.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences & Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences & Settings</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/profile/preferences')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Notification Preferences</p>
                      <p className="text-sm text-gray-500">Manage how you receive reminders</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/profile/privacy')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Privacy Settings</p>
                      <p className="text-sm text-gray-500">Control your data sharing preferences</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/profile/account')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Account Settings</p>
                      <p className="text-sm text-gray-500">Update your personal information</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Support & Help */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Support & Help</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/help')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Help Center</p>
                      <p className="text-sm text-gray-500">FAQs and user guides</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push('/contact')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Contact Support</p>
                      <p className="text-sm text-gray-500">Get help from our team</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}