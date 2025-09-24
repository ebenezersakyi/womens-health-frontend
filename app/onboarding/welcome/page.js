'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Calendar, Bell, Activity, ArrowRight, CheckCircle } from 'lucide-react'
import { useStore } from '../../../lib/store'

export default function WelcomePage() {
  const router = useRouter()
  const { user, healthProfile } = useStore()

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  const features = [
    {
      icon: Heart,
      title: 'Symptom Tracking',
      description: 'Log and monitor your breast health symptoms with photo documentation'
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Schedule screenings and consultations with healthcare providers'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Receive personalized reminders for self-exams and screenings'
    },
    {
      icon: Activity,
      title: 'Health Analytics',
      description: 'Get insights and trends based on your health data'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to PinkyTrust, {user?.name?.split(' ')[0]}! 🌸
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your health profile has been successfully created. You&apos;re now ready to start your personalized health journey.
        </p>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-pink-50 rounded-lg p-6 text-left">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600">1</span>
              </div>
              <span className="text-sm text-gray-700">Explore your personalized dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600">2</span>
              </div>
              <span className="text-sm text-gray-700">Set up your first health reminders</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600">3</span>
              </div>
              <span className="text-sm text-gray-700">Find and book your next screening appointment</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="w-full border border-pink-600 text-pink-600 py-3 px-6 rounded-lg hover:bg-pink-50 transition-colors"
          >
            View My Profile
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <p className="text-xs text-gray-500 mt-6">
          You&apos;ll be automatically redirected to your dashboard in a few seconds
        </p>
      </div>
    </div>
  )
}
