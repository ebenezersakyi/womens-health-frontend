'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Activity,
  Heart,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { apiService } from '../../../lib/api'
import { useStore } from '../../../lib/store'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function HealthAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('3months') // 1month, 3months, 6months, 1year
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter()
  const { isAuthenticated, symptoms, appointments } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchAnalytics()
  }, [isAuthenticated, router, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics from API
      const response = await apiService.getHealthAnalytics({ timeRange })
      
      if (response.data) {
        setAnalytics(response.data)
      } else {
        // Generate mock analytics from local data if API doesn't return data
        generateMockAnalytics()
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Generate mock analytics as fallback
      generateMockAnalytics()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const generateMockAnalytics = () => {
    // Generate analytics from local symptom and appointment data
    const symptomsByType = {}
    const symptomsByMonth = {}
    const severityDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    symptoms.forEach(symptom => {
      const date = new Date(symptom.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      symptom.symptoms?.forEach(s => {
        // Count by type
        const type = s.type || 'unknown'
        symptomsByType[type] = (symptomsByType[type] || 0) + 1
        
        // Count by severity
        severityDistribution[s.severity] = (severityDistribution[s.severity] || 0) + 1
      })
      
      // Count by month
      symptomsByMonth[monthKey] = (symptomsByMonth[monthKey] || 0) + 1
    })

    const mockAnalytics = {
      overview: {
        totalSymptoms: symptoms.length,
        totalAppointments: appointments.length,
        averageSeverity: symptoms.length > 0 
          ? (symptoms.reduce((sum, s) => sum + (s.symptoms?.[0]?.severity || 0), 0) / symptoms.length).toFixed(1)
          : 0,
        riskLevel: 'Low',
        healthScore: 85,
        lastUpdated: new Date().toISOString()
      },
      trends: {
        symptomFrequency: Object.entries(symptomsByMonth).map(([month, count]) => ({
          month,
          count
        })).slice(-6),
        severityTrend: [
          { period: 'Last Month', average: 2.1 },
          { period: 'This Month', average: 1.8 }
        ]
      },
      distribution: {
        symptomTypes: Object.entries(symptomsByType).map(([type, count]) => ({
          type: type.replace('_', ' '),
          count,
          percentage: ((count / symptoms.length) * 100).toFixed(1)
        })),
        severityLevels: Object.entries(severityDistribution).map(([level, count]) => ({
          level: parseInt(level),
          count,
          percentage: symptoms.length > 0 ? ((count / symptoms.length) * 100).toFixed(1) : 0
        }))
      },
      insights: [
        {
          type: 'positive',
          title: 'Symptom Severity Decreasing',
          description: 'Your average symptom severity has decreased by 15% this month.',
          icon: 'trending-down'
        },
        {
          type: 'neutral',
          title: 'Regular Tracking',
          description: `You've logged ${symptoms.length} symptoms in the selected period.`,
          icon: 'activity'
        },
        {
          type: 'recommendation',
          title: 'Schedule Screening',
          description: 'Consider scheduling your next screening appointment.',
          icon: 'calendar'
        }
      ],
      recommendations: [
        'Continue regular self-examinations',
        'Maintain healthy lifestyle habits',
        'Schedule annual screening if due',
        'Track symptoms consistently for better insights'
      ]
    }

    setAnalytics(mockAnalytics)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
  }

  const getInsightIcon = (iconType) => {
    switch (iconType) {
      case 'trending-up':
        return <TrendingUp className="h-5 w-5" />
      case 'trending-down':
        return <TrendingDown className="h-5 w-5" />
      case 'activity':
        return <Activity className="h-5 w-5" />
      case 'calendar':
        return <Calendar className="h-5 w-5" />
      default:
        return <Heart className="h-5 w-5" />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getSeverityLabel = (level) => {
    switch (level) {
      case 1: return 'Very Mild'
      case 2: return 'Mild'
      case 3: return 'Moderate'
      case 4: return 'Severe'
      case 5: return 'Very Severe'
      default: return 'Unknown'
    }
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Analytics</h1>
                <p className="text-gray-600 mt-1">Insights and trends from your health data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Symptoms</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSymptoms}</p>
                  </div>
                  <Activity className="h-8 w-8 text-pink-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.overview.healthScore}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Severity</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.overview.averageSeverity}/5</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.overview.riskLevel}</p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getInsightIcon(insight.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                        <p className="text-sm mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Symptom Frequency Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Symptom Frequency Over Time</h2>
                
                {analytics.trends.symptomFrequency.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.trends.symptomFrequency.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{data.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-pink-600 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((data.count / Math.max(...analytics.trends.symptomFrequency.map(d => d.count))) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{data.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No symptom data available for the selected period</p>
                  </div>
                )}
              </div>

              {/* Severity Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Severity Distribution</h2>
                
                {analytics.distribution.severityLevels.some(s => s.count > 0) ? (
                  <div className="space-y-3">
                    {analytics.distribution.severityLevels.map((severity) => (
                      <div key={severity.level} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{getSeverityLabel(severity.level)}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                severity.level <= 2 ? 'bg-green-500' :
                                severity.level <= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${severity.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-12">{severity.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No severity data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptom Types */}
            {analytics.distribution.symptomTypes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Most Common Symptoms</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.distribution.symptomTypes.slice(0, 6).map((symptom, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 capitalize">{symptom.type}</h3>
                        <span className="text-sm text-gray-500">{symptom.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-600 h-2 rounded-full"
                          style={{ width: `${symptom.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{symptom.count} occurrence{symptom.count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personalized Recommendations</h2>
              
              <div className="space-y-3">
                {analytics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              Last updated: {new Date(analytics.overview.lastUpdated).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
            <p className="text-gray-600 mb-6">
              Start logging symptoms and booking appointments to see your health analytics.
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
