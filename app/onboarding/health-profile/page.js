'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Heart, Users, Activity, Shield, Settings } from 'lucide-react'
import { apiService } from '../../../lib/api'
import { useStore } from '../../../lib/store'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function HealthProfileOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    // Demographics
    dateOfBirth: '',
    gender: 'female',
    
    // Family History
    familyHistory: {
      breastCancer: false,
      ovarianCancer: false,
      other: '',
      details: ''
    },
    
    // Risk Factors
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
    
    // Medical History
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
    
    // Preferences
    preferences: {
      reminderFrequency: 'monthly',
      language: 'en',
      contactMethod: 'push',
      privacySettings: {
        shareDataForResearch: false,
        allowCommunityInteraction: true
      }
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  })

  const router = useRouter()
  const { setHealthProfile } = useStore()

  const totalSteps = 6

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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.dateOfBirth) {
          setError('Please enter your date of birth')
          return false
        }
        
        // Validate age (18-120 years)
        const birthDate = new Date(formData.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        if (age < 18 || age > 120) {
          setFieldErrors({ dateOfBirth: 'Age must be between 18 and 120 years' })
          setError('Please fix the validation errors below.')
          return false
        }
        break
      case 3:
        // Validate risk factors
        const errors = {}
        
        if (!formData.riskFactors.weight || formData.riskFactors.weight < 20 || formData.riskFactors.weight > 300) {
          errors['riskFactors.weight'] = 'Weight must be between 20 and 300 kg'
        }
        
        if (!formData.riskFactors.height || formData.riskFactors.height < 100 || formData.riskFactors.height > 250) {
          errors['riskFactors.height'] = 'Height must be between 100 and 250 cm'
        }
        
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          setError('Please fix the validation errors below.')
          return false
        }
        break
      case 6:
        if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
          setError('Please provide emergency contact information')
          return false
        }
        break
      default:
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    setError('')

    try {
      const response = await apiService.createHealthProfile(formData)
      
      if (response.data.success || response.data) {
        setHealthProfile(response.data.profile || response.data)
        router.push('/onboarding/welcome')
      } else {
        setError('Failed to create health profile. Please try again.')
      }
    } catch (error) {
      console.error('Health profile creation error:', error)
      
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
          'Failed to create health profile. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return Heart
      case 2: return Users
      case 3: return Activity
      case 4: return Shield
      case 5: return Settings
      case 6: return Heart
      default: return Heart
    }
  }

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Basic Information'
      case 2: return 'Family History'
      case 3: return 'Lifestyle & Risk Factors'
      case 4: return 'Medical History'
      case 5: return 'Preferences'
      case 6: return 'Emergency Contact'
      default: return 'Health Profile'
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange(null, 'dateOfBirth', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  fieldErrors['dateOfBirth'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors['dateOfBirth'] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors['dateOfBirth']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange(null, 'gender', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        )

      case 2:
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you have children?
                </label>
                <select
                  value={formData.riskFactors.hasChildren === null ? '' : formData.riskFactors.hasChildren.toString()}
                  onChange={(e) => handleInputChange('riskFactors', 'hasChildren', e.target.value === 'true')}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Smoking status
              </label>
              <select
                value={formData.riskFactors.smokingStatus}
                onChange={(e) => handleInputChange('riskFactors', 'smokingStatus', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  fieldErrors['riskFactors.exerciseFrequency'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
              {fieldErrors['riskFactors.exerciseFrequency'] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors['riskFactors.exerciseFrequency']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.riskFactors.height || ''}
                  onChange={(e) => handleInputChange('riskFactors', 'height', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    fieldErrors['riskFactors.height'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 165"
                />
                {fieldErrors['riskFactors.height'] && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors['riskFactors.height']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={formData.riskFactors.weight || ''}
                  onChange={(e) => handleInputChange('riskFactors', 'weight', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    fieldErrors['riskFactors.weight'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 60"
                />
                {fieldErrors['riskFactors.weight'] && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors['riskFactors.weight']}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="pre">Pre-menopause</option>
                <option value="peri">Peri-menopause</option>
                <option value="post">Post-menopause</option>
              </select>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often would you like health reminders?
              </label>
              <select
                value={formData.preferences.reminderFrequency}
                onChange={(e) => handleInputChange('preferences', 'reminderFrequency', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="push">Push notifications</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
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

      case 6:
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleInputChange('emergencyContact', 'relationship', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const StepIcon = getStepIcon(currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Health Profile Setup</h1>
            <span className="text-sm text-gray-500">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {getStepTitle(currentStep)}
            </h2>
            <p className="text-gray-600">
              Help us create your personalized health profile
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Heart className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
