'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Heart, Shield, Users, Clock, BookOpen } from 'lucide-react'

export default function TipsCarousel({ tips = [] }) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || tips.length <= 1) return

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length)
    }, 5000) // Change tip every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, tips.length])

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const goToTip = (index) => {
    setCurrentTipIndex(index)
    setIsAutoPlaying(false)
  }

  const getIconComponent = (iconName) => {
    const icons = {
      'shield': Shield,
      'heart': Heart,
      'users': Users,
      'clock': Clock,
      'book': BookOpen
    }
    return icons[iconName] || Heart
  }

  if (!tips.length) return null

  const currentTip = tips[currentTipIndex]
  const Icon = getIconComponent(currentTip.icon)

  return (
    <section id="tips-section" className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Daily Health Tips
          </h2>
          <p className="text-lg text-gray-600">
            Expert advice to help you stay informed about breast health
          </p>
        </div>

        {/* Main carousel card */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl transform rotate-1"></div>
          
          {/* Main card */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Health Tip #{currentTipIndex + 1}</h3>
                    <p className="text-pink-100 text-sm">
                      {currentTipIndex + 1} of {tips.length} tips
                    </p>
                  </div>
                </div>
                
                {/* Auto-play indicator */}
                {isAutoPlaying && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-pink-100">Auto-playing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="bg-pink-100 p-4 rounded-full">
                    <Icon className="h-8 w-8 text-pink-600" />
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 min-h-[200px]">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentTip.title}
                  </h4>
                  
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    {currentTip.content}
                  </p>
                  
                  {currentTip.action && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-pink-600 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                          💡
                        </div>
                        <div>
                          <p className="font-semibold text-pink-800 mb-1">Action Step:</p>
                          <p className="text-pink-700">{currentTip.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                {/* Previous button */}
                <button
                  onClick={prevTip}
                  disabled={tips.length <= 1}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 hover:text-pink-600 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>

                {/* Dots indicator */}
                <div className="flex gap-2">
                  {tips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTip(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentTipIndex 
                          ? 'bg-pink-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to tip ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={nextTip}
                  disabled={tips.length <= 1}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white hover:bg-pink-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-600 to-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentTipIndex + 1) / tips.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}
