'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react'
import { apiService } from '../../../lib/api'
import { useStore } from '../../../lib/store'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { setUser, setAuthToken, setHealthProfile } = useStore()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiService.login(formData)
      
      if (response.data.success) {
        const { token, user } = response.data.data
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_id', user.id)
        
        // Update store
        setAuthToken(token)
        setUser(user)
        
        // Store health profile if available
        if (user.healthProfile) {
          setHealthProfile(user.healthProfile)
        }
        
        // Check if user has completed their health profile
        if (user.healthProfile && !user.healthProfile.hasCompletedProfile) {
          // Redirect to health profile onboarding
          router.push('/onboarding/health-profile')
        } else {
          // Redirect to dashboard
          router.push('/')
        }
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 p-6">
          <div className="w-full h-full relative">
            <Image
              src="/images/auth/medium-shot-woman-laying-couch-black-white.jpg"
              alt="Woman relaxing on couch"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back to PinkyTrust
          </h1>
          <p className="text-gray-600">
            Sign in to continue your health journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link 
              href="/auth/forgot-password"
              className="text-sm text-pink-600 hover:text-pink-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/register"
                className="text-pink-600 hover:text-pink-500 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/privacy" className="text-pink-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-pink-600 hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
