'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import HeroSection from '../components/HeroSection'
import TipsCarousel from '../components/TipsCarousel'
import StatsSection from '../components/StatsSection'

export default function Home() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      {/* <TipsCarousel tips={tips} /> */}
      {/* <StatsSection /> */}
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
]
