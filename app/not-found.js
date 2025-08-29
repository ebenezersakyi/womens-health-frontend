'use client'

import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, MapPin } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
              <MapPin className="h-16 w-16 text-pink-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
              <span className="text-lg">?</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for seems to have wandered off. 
          Let&apos;s get you back on track to finding the healthcare resources you need.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center justify-center gap-2 font-medium"
          >
            <Home className="h-5 w-5" />
            Go to Home
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Links</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/map')}
              className="text-sm text-gray-600 hover:text-pink-600 py-2 px-3 rounded hover:bg-white transition-colors"
            >
              Find Centers
            </button>
            <button
              onClick={() => router.push('/events')}
              className="text-sm text-gray-600 hover:text-pink-600 py-2 px-3 rounded hover:bg-white transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
