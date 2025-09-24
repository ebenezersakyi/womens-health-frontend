'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Heart, Users, Activity, Shield, Settings, Phone } from 'lucide-react'
import { apiService } from '../../../../lib/api'
import { useStore } from '../../../../lib/store'
import LoadingSpinner from '../../../../components/LoadingSpinner'

export default function EditHealthProfilePage() {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: 'female',
    lastScreeningDate: '',
    familyHistory: {
      breastCancer: false,
      ovarianCancer: false,
      other: '',
      details: ''
    },
    riskFactors: {
      hasChildren: null,
      numberOfChildren: 0,
      ageAtFirstChild: null,
      breastfeedingHistory: null,
      breastfeedingDuration: 0,
      hormoneTherapy: false,
      birthControl: false,
      smokingStatus: 'never',
      alcoholConsumption: 'none',
      exerciseFrequency: 'never',
      weight: null,
      height: null
    },
    medicalHistory: {
      previousBreastProblems: false,
      breastBiopsy: false,
      breastCancer: false,
      menstrualHistory: {
        ageAtFirstPeriod: '',
        menopauseStatus: 'pre',
        ageAtMenopause: null
      }
    },
    preferences: {
      reminderFrequency: 'monthly',
      language: 'en',
      contactMethod: 'push',
      privacySettings: {
        shareDataForResearch: false,
        allowCommunityInteraction: true
      }
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [activeSection, setActiveSection] = useState('basic')

  const router = useRouter()
  const { isAuthenticated, setHealthProfile } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchHealthProfile()
  }, [isAuthenticated, router])

  const fetchHealthProfile = async () => {
    try {
      setLoading(true)
      const response = await apiService.getHealthProfile()
      
      if (response.data?.profile || response.data) {
        const profile = response.data.profile || response.data
        setFormData(prev => ({
          ...prev,
          ...profile,
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          lastScreeningDate: profile.lastScreeningDate ? profile.lastScreeningDate.split('T')[0] : '',
        }))
      }
    } catch (error) {
      console.error('Failed to fetch health profile:', error)
      // If no profile exists, keep default form data
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        }
      } else if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }
      } else {
        return {
          ...prev,
          [field]: value
        }
      }
    })
    
    if (error) setError('')
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await apiService.updateHealthProfile(formData)
      
      if (response.data) {
        setHealthProfile(response.data.profile || response.data)
        router.push('/profile')
      } else {
        setError('Failed to update health profile. Please try again.')
      }
    } catch (error) {
      console.error('Failed to update health profile:', error)
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors = {}
        error.response.data.errors.forEach(err => {
          if (err.path) {
            errors[err.path] = err.msg
          }
        })
        setFieldErrors(errors)
        setError('Please fix the validation errors below.')
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to update health profile. Please try again.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: Heart },
    { id: 'family', title: 'Family History', icon: Users },
    { id: 'lifestyle', title: 'Lifestyle & Risk Factors', icon: Activity },
    { id: 'medical', title: 'Medical History', icon: Shield },
    { id: 'preferences', title: 'Preferences', icon: Settings },
    { id: 'emergency', title: 'Emergency Contact', icon: Phone }
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange(null, 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange(null, 'gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Screening Date
                </label>
                <input
                  type="date"
                  value={formData.lastScreeningDate}
                  onChange={(e) => handleInputChange(null, 'lastScreeningDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        )

      case 'family':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.familyHistory.breastCancer}
                  onChange={(e) => handleInputChange('familyHistory', 'breastCancer', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Family history of breast cancer</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.familyHistory.ovarianCancer}
                  onChange={(e) => handleInputChange('familyHistory', 'ovarianCancer', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Family history of ovarian cancer</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other family health conditions
              </label>
              <input
                type="text"
                value={formData.familyHistory.other}
                onChange={(e) => handleInputChange('familyHistory', 'other', e.target.value)}
                placeholder="e.g., Heart disease, diabetes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details
              </label>
              <textarea
                value={formData.familyHistory.details}
                onChange={(e) => handleInputChange('familyHistory', 'details', e.target.value)}
                placeholder="Any additional family health information..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        )

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you have children?
                </label>
                <select
                  value={formData.riskFactors.hasChildren === null ? '' : formData.riskFactors.hasChildren.toString()}
                  onChange={(e) => handleInputChange('riskFactors', 'hasChildren', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              {formData.riskFactors.hasChildren && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of children
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.riskFactors.numberOfChildren}
                    onChange={(e) => handleInputChange('riskFactors', 'numberOfChildren', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking status
                </label>
                <select
                  value={formData.riskFactors.smokingStatus}
                  onChange={(e) => handleInputChange('riskFactors', 'smokingStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcohol consumption
                </label>
                <select
                  value={formData.riskFactors.alcoholConsumption}
                  onChange={(e) => handleInputChange('riskFactors', 'alcoholConsumption', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="none">None</option>
                  <option value="light">Light (1-3 drinks per week)</option>
                  <option value="moderate">Moderate (4-7 drinks per week)</option>
                  <option value="heavy">Heavy (8+ drinks per week)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise frequency
                </label>
                <select
                  value={formData.riskFactors.exerciseFrequency}
                  onChange={(e) => handleInputChange('riskFactors', 'exerciseFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="none">None</option>
                  <option value="weekly">1-2 times per week</option>
                  <option value="regular">3-4 times per week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.riskFactors.weight}
                  onChange={(e) => handleInputChange('riskFactors', 'weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.riskFactors.height}
                  onChange={(e) => handleInputChange('riskFactors', 'height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        )

      case 'medical':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.medicalHistory.previousBreastProblems}
                  onChange={(e) => handleInputChange('medicalHistory', 'previousBreastProblems', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Previous breast problems</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.medicalHistory.breastBiopsy}
                  onChange={(e) => handleInputChange('medicalHistory', 'breastBiopsy', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Previous breast biopsy</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.medicalHistory.breastCancer}
                  onChange={(e) => handleInputChange('medicalHistory', 'breastCancer', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Previous breast cancer diagnosis</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age at first menstrual period
                </label>
                <input
                  type="number"
                  min="8"
                  max="18"
                  value={formData.medicalHistory.menstrualHistory.ageAtFirstPeriod}
                  onChange={(e) => handleInputChange('medicalHistory', 'menstrualHistory', e.target.value, 'ageAtFirstPeriod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menopause status
                </label>
                <select
                  value={formData.medicalHistory.menstrualHistory.menopauseStatus}
                  onChange={(e) => handleInputChange('medicalHistory', 'menstrualHistory', e.target.value, 'menopauseStatus')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="pre">Pre-menopause</option>
                  <option value="peri">Peri-menopause</option>
                  <option value="post">Post-menopause</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder frequency
                </label>
                <select
                  value={formData.preferences.reminderFrequency}
                  onChange={(e) => handleInputChange('preferences', 'reminderFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred contact method
                </label>
                <select
                  value={formData.preferences.contactMethod}
                  onChange={(e) => handleInputChange('preferences', 'contactMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="push">Push notifications</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.preferences.privacySettings.shareDataForResearch}
                  onChange={(e) => handleInputChange('preferences', 'privacySettings', e.target.checked, 'shareDataForResearch')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Allow anonymous data sharing for research</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.preferences.privacySettings.allowCommunityInteraction}
                  onChange={(e) => handleInputChange('preferences', 'privacySettings', e.target.checked, 'allowCommunityInteraction')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Enable community features</span>
              </label>
            </div>
          </div>
        )

      case 'emergency':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency contact name
              </label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleInputChange('emergencyContact', 'name', e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleInputChange('emergencyContact', 'relationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">Select relationship...</option>
                <option value="spouse">Spouse/Partner</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleInputChange('emergencyContact', 'phone', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Health Profile</h1>
              <p className="text-gray-600 mt-1">Update your health information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                
                {renderSection()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
