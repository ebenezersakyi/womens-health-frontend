'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Plus, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Heart,
  Activity,
  Stethoscope,
  Trash2,
  Eye,
  Edit3
} from 'lucide-react'
import { apiService } from '../../lib/api'
import { useStore } from '../../lib/store'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('reminders') // notifications, reminders
  const [notifications, setNotifications] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, high, medium, low

  const router = useRouter()
  const { user, isAuthenticated } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchData()
  }, [isAuthenticated, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [notificationsResponse, remindersResponse] = await Promise.allSettled([
        apiService.getNotifications({ limit: 50 }),
        apiService.getReminders({ limit: 50 })
      ])

      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.data?.notifications || [])
      }

      if (remindersResponse.status === 'fulfilled') {
        setReminders(remindersResponse.value.data?.reminders || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleCompleteReminder = async (reminderId) => {
    try {
      await apiService.updateReminder(reminderId, {
        isCompleted: true,
        completedAt: new Date().toISOString()
      })
      
      setReminders(prev => 
        prev.map(reminder => 
          reminder._id === reminderId 
            ? { ...reminder, isCompleted: true, completedAt: new Date().toISOString() }
            : reminder
        )
      )
    } catch (error) {
      console.error('Failed to complete reminder:', error)
      alert('Failed to mark reminder as complete. Please try again.')
    }
  }

  const handleDeleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      await apiService.deleteReminder(reminderId)
      setReminders(prev => prev.filter(r => r._id !== reminderId))
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      alert('Failed to delete reminder. Please try again.')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-5 w-5 text-yellow-600" />
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'health':
        return <Heart className="h-5 w-5 text-pink-600" />
      case 'system':
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getReminderIcon = (type) => {
    switch (type) {
      case 'self_exam':
        return <Activity className="h-5 w-5 text-pink-600" />
      case 'screening':
        return <Stethoscope className="h-5 w-5 text-blue-600" />
      case 'appointment':
        return <Calendar className="h-5 w-5 text-green-600" />
      case 'medication':
        return <Heart className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else if (diffDays === -1) {
      return 'Yesterday'
    } else if (diffDays > 1) {
      return `In ${diffDays} days`
    } else if (diffDays < -1) {
      return `${Math.abs(diffDays)} days ago`
    }
    
    return date.toLocaleDateString()
  }

  const filterNotifications = (notifications) => {
    return notifications.filter(notification => {
      if (filter === 'unread' && notification.isRead) return false
      if (filter !== 'all' && filter !== 'unread' && notification.priority !== filter) return false
      return true
    })
  }

  const filterReminders = (reminders) => {
    return reminders.filter(reminder => {
      if (filter === 'completed' && !reminder.isCompleted) return false
      if (filter === 'pending' && reminder.isCompleted) return false
      if (filter !== 'all' && filter !== 'completed' && filter !== 'pending' && reminder.priority !== filter) return false
      return true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const pendingReminders = reminders.filter(r => !r.isCompleted).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications & Reminders</h1>
              <p className="text-gray-600 mt-1">Stay on top of your health with smart reminders</p>
            </div>
            <button
              onClick={() => router.push('/notifications/reminders/create')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Reminder</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'reminders'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Reminders</span>
                {pendingReminders > 0 && (
                  <span className="bg-pink-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px]">
                    {pendingReminders}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-pink-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px]">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">All</option>
                {activeTab === 'notifications' ? (
                  <>
                    <option value="unread">Unread</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'reminders' ? (
          <div className="space-y-4">
            {filterReminders(reminders).length > 0 ? (
              filterReminders(reminders).map((reminder) => (
                <div key={reminder._id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                  reminder.isCompleted ? 'opacity-75' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        reminder.isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {reminder.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          getReminderIcon(reminder.type)
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {reminder.title}
                          </h3>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{reminder.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Due: {formatDate(reminder.dueDate)}</span>
                          </div>
                          
                          {reminder.recurring?.enabled && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              Recurring {reminder.recurring.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!reminder.isCompleted && (
                        <button
                          onClick={() => handleCompleteReminder(reminder._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/notifications/reminders/${reminder._id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => router.push(`/notifications/reminders/${reminder._id}/edit`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
                <p className="text-gray-600 mb-6">
                  Create your first health reminder to stay on track with your wellness routine.
                </p>
                <button
                  onClick={() => router.push('/notifications/reminders/create')}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Create Your First Reminder
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filterNotifications(notifications).length > 0 ? (
              filterNotifications(notifications).map((notification) => (
                <div key={notification._id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                  !notification.isRead ? 'border-l-4 border-l-pink-500' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        
                        <div className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-pink-600 hover:text-pink-500 text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "No notifications match your current filter."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
