'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Activity,
  Camera,
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react'
import { apiService } from '../../lib/api'
import { useStore } from '../../lib/store'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterTimeRange, setFilterTimeRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const router = useRouter()
  const { user, isAuthenticated, authToken } = useStore()

  useEffect(() => {
    // Wait for auth initialization to complete
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      
      // If there's no token and not authenticated, redirect to login
      if (!token && !isAuthenticated) {
        router.push('/auth/login')
        return
      }
      
      // If authenticated, fetch symptoms
      if (isAuthenticated && user) {
        fetchSymptoms()
      }
      
      // If there's a token but not yet authenticated, wait for ClientLayout to initialize
      if (token && !isAuthenticated) {
        // Authentication is being initialized, don't redirect yet
        return
      }
    }
  }, [isAuthenticated, user, router])

  const fetchSymptoms = async (pageNum = 1, reset = true) => {
    try {
      setLoading(pageNum === 1)
      
      const params = {
        page: pageNum,
        limit: 10
      }

      if (filterSeverity !== 'all') {
        params.severity = filterSeverity
      }

      if (filterTimeRange !== 'all') {
        const now = new Date()
        switch (filterTimeRange) {
          case 'week':
            params.startDate = new Date(now.setDate(now.getDate() - 7)).toISOString()
            break
          case 'month':
            params.startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString()
            break
          case '3months':
            params.startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString()
            break
        }
      }

      const response = await apiService.getSymptomHistory(params)
      console.log('Symptoms API Response:', response.data)
      const newSymptoms = response.data?.data || response.data?.symptoms || []
      console.log('Extracted symptoms:', newSymptoms)
      
      if (reset) {
        setSymptoms(newSymptoms)
        console.log('Set symptoms (reset):', newSymptoms)
      } else {
        setSymptoms(prev => [...prev, ...newSymptoms])
        console.log('Added symptoms to existing:', newSymptoms)
      }
      
      setHasMore(newSymptoms.length === 10)
      setPage(pageNum)
    } catch (error) {
      console.error('Failed to fetch symptoms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchSymptoms(page + 1, false)
    }
  }

  const handleFilterChange = () => {
    setPage(1)
    fetchSymptoms(1, true)
  }

  const handleDeleteSymptom = async (symptomId) => {
    if (!confirm('Are you sure you want to delete this symptom log?')) return

    try {
      await apiService.deleteSymptomLog(symptomId)
      setSymptoms(prev => prev.filter(s => s._id !== symptomId))
    } catch (error) {
      console.error('Failed to delete symptom:', error)
      alert('Failed to delete symptom. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 1: return 'Very Mild'
      case 2: return 'Mild'
      case 3: return 'Moderate'
      case 4: return 'Severe'
      case 5: return 'Very Severe'
      default: return 'Unknown'
    }
  }

  const filteredSymptoms = symptoms.filter(symptom => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const symptomTypes = symptom.symptoms?.map(s => s.type?.toLowerCase().replace('_', ' ')).join(' ') || ''
    const notes = symptom.notes?.toLowerCase() || ''
    
    return symptomTypes.includes(searchLower) || notes.includes(searchLower)
  })

  console.log('All symptoms:', symptoms)
  console.log('Filtered symptoms:', filteredSymptoms)
  console.log('Search term:', searchTerm)

  if (loading && page === 1) {
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
              <h1 className="text-2xl font-bold text-gray-900">Symptom Tracker</h1>
              <p className="text-gray-600 mt-1">Monitor and track your health symptoms</p>
            </div>
            <button
              onClick={() => router.push('/symptoms/log')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Log Symptom</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search symptoms or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => router.push('/symptoms/analytics')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={filterSeverity}
                  onChange={(e) => {
                    setFilterSeverity(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Severities</option>
                  <option value="1">Very Mild (1)</option>
                  <option value="2">Mild (2)</option>
                  <option value="3">Moderate (3)</option>
                  <option value="4">Severe (4)</option>
                  <option value="5">Very Severe (5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <select
                  value={filterTimeRange}
                  onChange={(e) => {
                    setFilterTimeRange(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="3months">Past 3 Months</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Symptoms List */}
        {filteredSymptoms.length > 0 ? (
          <div className="space-y-6">
            {filteredSymptoms.map((symptom) => (
              <div key={symptom._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(symptom.createdAt)}
                      </p>
                      {symptom.menstrualCycle && (
                        <p className="text-xs text-gray-500">
                          Cycle Day {symptom.menstrualCycle.dayOfCycle} ({symptom.menstrualCycle.cyclePhase})
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/symptoms/${symptom._id}`)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/symptoms/${symptom._id}/edit`)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSymptom(symptom._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {symptom.symptoms?.map((s, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
                          {s.type?.replace('_', ' ') || 'Unknown'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(s.severity)}`}>
                          {getSeverityText(s.severity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {symptom.overallMood && (
                    <div>
                      <p className="text-xs text-gray-500">Mood</p>
                      <p className="text-sm font-medium capitalize">{symptom.overallMood}</p>
                    </div>
                  )}
                  
                  {symptom.painLevel && (
                    <div>
                      <p className="text-xs text-gray-500">Pain Level</p>
                      <p className="text-sm font-medium">{symptom.painLevel}/10</p>
                    </div>
                  )}
                  
                  {symptom.triggers && symptom.triggers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Triggers</p>
                      <p className="text-sm font-medium">{symptom.triggers.join(', ')}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {symptom.notes && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{symptom.notes}</p>
                  </div>
                )}

                {/* Photos */}
                {symptom.photos && symptom.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Camera className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {symptom.photos.length} photo{symptom.photos.length > 1 ? 's' : ''} attached
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {symptom.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Symptom photo ${photoIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(photo.url, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          {/* Error fallback */}
                          <div 
                            className="hidden w-full h-24 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center"
                          >
                            <div className="text-center">
                              <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">Image unavailable</p>
                            </div>
                          </div>
                          {/* Encrypted indicator */}
                          {photo.isEncrypted && (
                            <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                              🔒
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <span>Load More</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No symptoms logged yet</h3>
            <p className="text-gray-600 mb-6">
              Start tracking your symptoms to get personalized insights and better understand your health patterns.
            </p>
            <button
              onClick={() => router.push('/symptoms/log')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Log Your First Symptom
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
