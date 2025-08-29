'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Map, Calendar, User, Menu, X } from 'lucide-react'

export default function BottomNavigation() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform duration-300 md:hidden ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                active 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
