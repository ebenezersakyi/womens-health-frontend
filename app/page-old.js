import Image from "next/image";

export default function Home() {
  return (
    'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Heart, Shield, Users } from 'lucide-react'
import { apiService } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Home() {
  const [tips, setTips] = useState([])
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTips()
      setTips(response.data || defaultTips)
    } catch (error) {
      console.error('Failed to fetch tips:', error)
      // Use default tips if API fails
      setTips(defaultTips)
    } finally {
      setLoading(false)
    }
  }

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)
  }

  const handleFindScreening = () => {
    router.push('/map')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const currentTip = tips[currentTipIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-full">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Breast Health Awareness</h1>
              <p className="text-gray-600">Your guide to prevention and early detection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Knowledge is Your Best Protection
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Learn essential breast health tips and find accredited screening centers near you. 
            Early detection saves lives.
          </p>
        </div>

        {/* Tips Carousel */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Daily Health Tips</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {currentTipIndex + 1} of {tips.length}
            </div>
          </div>

          {currentTip && (
            <div className="relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-pink-100 p-3 rounded-full flex-shrink-0">
                  {currentTip.icon === 'shield' && <Shield className="h-6 w-6 text-pink-600" />}
                  {currentTip.icon === 'heart' && <Heart className="h-6 w-6 text-pink-600" />}
                  {currentTip.icon === 'users' && <Users className="h-6 w-6 text-pink-600" />}
                  {!currentTip.icon && <Heart className="h-6 w-6 text-pink-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {currentTip.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {currentTip.content}
                  </p>
                  {currentTip.action && (
                    <p className="text-pink-600 font-medium mt-2">
                      💡 {currentTip.action}
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevTip}
                  disabled={tips.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {tips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTipIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTipIndex ? 'bg-pink-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTip}
                  disabled={tips.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={handleFindScreening}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <MapPin className="h-5 w-5" />
            Find Screening Near Me
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            Discover accredited screening centers and events in your area
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600 mb-2">1 in 8</div>
            <div className="text-gray-700">Women will develop breast cancer</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600 mb-2">99%</div>
            <div className="text-gray-700">5-year survival when caught early</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600 mb-2">40+</div>
            <div className="text-gray-700">Start annual mammograms</div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Default tips in case API is unavailable
const defaultTips = [
  {
    id: 1,
    title: "Monthly Self-Examination",
    content: "Perform monthly breast self-exams to become familiar with how your breasts normally look and feel. The best time is 3-5 days after your period ends.",
    action: "Set a monthly reminder on your phone",
    icon: "heart"
  },
  {
    id: 2,
    title: "Know the Warning Signs",
    content: "Look for lumps, changes in breast size or shape, skin dimpling, nipple discharge, or any unusual changes. Early detection is key.",
    action: "Report any changes to your healthcare provider immediately",
    icon: "shield"
  },
  {
    id: 3,
    title: "Annual Mammograms",
    content: "Women aged 40+ should get annual mammograms. Those with family history may need to start earlier. Discuss your risk factors with your doctor.",
    action: "Schedule your mammogram appointment today",
    icon: "users"
  },
  {
    id: 4,
    title: "Maintain a Healthy Lifestyle",
    content: "Regular exercise, maintaining a healthy weight, limiting alcohol, and avoiding smoking can help reduce breast cancer risk.",
    action: "Aim for 150 minutes of moderate exercise per week",
    icon: "heart"
  },
  {
    id: 5,
    title: "Know Your Family History",
    content: "About 5-10% of breast cancers are hereditary. Share your family history with your healthcare provider to assess your risk level.",
    action: "Create a family health tree",
    icon: "users"
  }
]" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.js
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
