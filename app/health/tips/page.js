'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, BookOpen, ArrowRight, Star, Clock, Users, Shield } from 'lucide-react'
import { apiService } from '../../../lib/api'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function HealthTipsPage() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, prevention, early-detection, lifestyle

  const router = useRouter()

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTips()
      setTips(response.data?.tips || defaultTips)
    } catch (error) {
      console.error('Failed to fetch tips:', error)
      setTips(defaultTips)
    } finally {
      setLoading(false)
    }
  }

  const filteredTips = tips.filter(tip => {
    if (filter === 'all') return true
    return tip.category === filter
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
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Health Tips & Education</h1>
            <p className="text-pink-100 text-lg max-w-2xl mx-auto">
              Expert-backed advice for breast health, early detection, and overall wellness
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Tips' },
              { key: 'prevention', label: 'Prevention' },
              { key: 'early-detection', label: 'Early Detection' },
              { key: 'lifestyle', label: 'Lifestyle' }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setFilter(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === category.key
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  tip.category === 'prevention' ? 'bg-green-100' :
                  tip.category === 'early-detection' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <Heart className={`h-6 w-6 ${
                    tip.category === 'prevention' ? 'text-green-600' :
                    tip.category === 'early-detection' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                </div>
                {tip.priority === 'high' && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-medium">High Priority</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {tip.title}
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {tip.content}
              </p>

              {tip.action && (
                <div className="p-3 bg-pink-50 rounded-lg mb-4">
                  <p className="text-sm text-pink-800 font-medium">
                    💡 Action: {tip.action}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>2 min read</span>
                </div>
                <span className="capitalize">{tip.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            Join PinkyTrust to get personalized health recommendations, track your symptoms, 
            and connect with healthcare professionals.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors font-semibold"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/events')}
              className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-lg hover:bg-opacity-30 transition-colors font-semibold"
            >
              Find Events
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const defaultTips = [
  {
    id: 1,
    title: "Monthly Self-Examination",
    content: "Perform monthly breast self-exams to become familiar with how your breasts normally look and feel. The best time is 3-5 days after your period ends. Early detection is key to successful treatment.",
    action: "Set a monthly reminder on your phone",
    category: "early-detection",
    priority: "high"
  },
  {
    id: 2,
    title: "Know the Warning Signs",
    content: "Look for lumps, changes in breast size or shape, skin dimpling, nipple discharge, or any unusual changes. Don't ignore persistent changes that last longer than a menstrual cycle.",
    action: "Report any changes to your healthcare provider immediately",
    category: "early-detection",
    priority: "high"
  },
  {
    id: 3,
    title: "Annual Mammograms",
    content: "Women aged 40+ should get annual mammograms. Those with family history may need to start earlier. Mammograms can detect cancer before you can feel a lump.",
    action: "Schedule your mammogram appointment today",
    category: "prevention",
    priority: "high"
  },
  {
    id: 4,
    title: "Maintain a Healthy Lifestyle",
    content: "Regular exercise, maintaining a healthy weight, limiting alcohol, and avoiding smoking can help reduce breast cancer risk. Even small changes make a difference.",
    action: "Aim for 150 minutes of moderate exercise per week",
    category: "lifestyle",
    priority: "medium"
  },
  {
    id: 5,
    title: "Know Your Family History",
    content: "About 5-10% of breast cancers are hereditary. Share your family history with your healthcare provider to assess your risk level and determine appropriate screening schedules.",
    action: "Create a family health tree",
    category: "prevention",
    priority: "high"
  },
  {
    id: 6,
    title: "Limit Hormone Therapy",
    content: "Long-term use of hormone replacement therapy increases breast cancer risk. If you need hormone therapy, discuss the lowest effective dose for the shortest time with your doctor.",
    action: "Discuss alternatives with your healthcare provider",
    category: "prevention",
    priority: "medium"
  },
  {
    id: 7,
    title: "Breastfeed if Possible",
    content: "Breastfeeding for a total of one year or more (combined for all children) reduces breast cancer risk. The longer you breastfeed, the greater the protection.",
    action: "Consider breastfeeding benefits when planning your family",
    category: "prevention",
    priority: "medium"
  },
  {
    id: 8,
    title: "Stay Informed About Dense Breast Tissue",
    content: "Dense breast tissue can make mammograms harder to read and may increase cancer risk. Ask your doctor about your breast density and additional screening options.",
    action: "Discuss breast density results with your healthcare provider",
    category: "early-detection",
    priority: "medium"
  },
  {
    id: 9,
    title: "Manage Stress and Mental Health",
    content: "While stress doesn't directly cause breast cancer, managing stress improves overall health and helps maintain healthy lifestyle habits that reduce cancer risk.",
    action: "Practice stress-reduction techniques like meditation or yoga",
    category: "lifestyle",
    priority: "medium"
  }
]
