'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '../lib/store'
import { apiService } from '../lib/api'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import FloatingChatButton from './FloatingChatButton'

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const { user, setUser, setAuthToken, setHealthProfile } = useStore()

  // Paths that don't need navigation
  const noNavPaths = ['/auth/login', '/auth/register', '/onboarding']
  // Also hide navigation on home page and chat page
  const shouldShowNav = !noNavPaths.some(path => pathname.startsWith(path)) && pathname !== '/' && pathname !== '/chat'
  
  // Show floating chat button on most pages except auth, onboarding, and chat page itself
  const shouldShowChatButton = !noNavPaths.some(path => pathname.startsWith(path)) && pathname !== '/chat'

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        
        if (token && !user) {
          setAuthToken(token)
          
          // Fetch user data to complete authentication
          try {
            const userResponse = await apiService.getCurrentUser()
            if (userResponse.data.user) {
              setUser(userResponse.data.user)
              
              // Also fetch health profile if available
              try {
                const profileResponse = await apiService.getHealthProfile()
                if (profileResponse.data.profile) {
                  setHealthProfile(profileResponse.data.profile)
                }
              } catch (profileError) {
                // Profile might not exist yet, that's okay
                console.log('No health profile found')
              }
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error)
            // If token is invalid, clear it
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_id')
            setAuthToken(null)
          }
        }
      }
    }
    
    initializeAuth()
  }, [user, setUser, setAuthToken, setHealthProfile])

  return (
    <>
      {shouldShowNav && <Header />}
      <main className={shouldShowNav ? "pt-0" : ""}>
        {children}
      </main>
      {shouldShowNav && <BottomNavigation />}
      {shouldShowNav && (
        <div className="pb-16 md:pb-0"> {/* Add padding for mobile bottom nav */}
        </div>
      )}
      {shouldShowChatButton && <FloatingChatButton />}
    </>
  )
}
