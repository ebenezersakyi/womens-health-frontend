// Utility functions for the breast cancer screening app

export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    weekday: 'short',
    year: 'numeric', 
    month: 'short',
    day: 'numeric',
    ...options
  }
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions)
}

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return distance
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

export const generateCalendarUrl = (event, type = 'google') => {
  const startDate = new Date(event.date)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2-hour duration
  
  const formatCalendarDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const details = [
    event.description || 'Breast cancer screening event',
    event.organizer ? `Organized by: ${event.organizer}` : '',
    event.location?.address ? `Location: ${event.location.address}` : ''
  ].filter(Boolean).join('\n\n')
  
  switch (type) {
    case 'google':
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location?.address || '')}`
    
    case 'outlook':
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location?.address || '')}`
    
    case 'yahoo':
      const yahooDate = startDate.toISOString().replace(/[-:]/g, '').split('.')[0]
      return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(event.title)}&st=${yahooDate}&desc=${encodeURIComponent(details)}&in_loc=${encodeURIComponent(event.location?.address || '')}`
    
    default:
      return ''
  }
}

export const generateShareText = (event) => {
  return {
    title: event.title,
    text: `Join this important breast cancer screening event: ${event.title}`,
    url: typeof window !== 'undefined' ? window.location.href : ''
  }
}

export const isEventToday = (eventDate) => {
  const today = new Date()
  const event = new Date(eventDate)
  return (
    event.getDate() === today.getDate() &&
    event.getMonth() === today.getMonth() &&
    event.getFullYear() === today.getFullYear()
  )
}

export const isEventUpcoming = (eventDate) => {
  const today = new Date()
  const event = new Date(eventDate)
  return event >= today
}

export const getEventStatus = (eventDate) => {
  const today = new Date()
  const event = new Date(eventDate)
  
  if (event < today) return 'past'
  if (isEventToday(eventDate)) return 'today'
  if (event <= new Date(today.getTime() + 24 * 60 * 60 * 1000)) return 'tomorrow'
  if (event <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return 'this-week'
  return 'upcoming'
}

export const filterEventsByDateRange = (events, dateRange) => {
  const today = new Date()
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    
    switch (dateRange) {
      case 'today':
        return isEventToday(event.date)
      
      case 'week':
        const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return eventDate >= today && eventDate <= oneWeekFromNow
      
      case 'month':
        const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
        return eventDate >= today && eventDate <= oneMonthFromNow
      
      case 'upcoming':
        return isEventUpcoming(event.date)
      
      case 'all':
      default:
        return true
    }
  })
}

export const saveEventToStorage = (eventId) => {
  const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
  if (!savedEvents.includes(eventId)) {
    savedEvents.push(eventId)
    localStorage.setItem('savedEvents', JSON.stringify(savedEvents))
  }
}

export const removeEventFromStorage = (eventId) => {
  const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
  const updatedEvents = savedEvents.filter(id => id !== eventId)
  localStorage.setItem('savedEvents', JSON.stringify(updatedEvents))
}

export const isEventSaved = (eventId) => {
  const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
  return savedEvents.includes(eventId)
}
