'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  X, 
  Plus, 
  Minus, 
  Calendar,
  Heart,
  AlertTriangle,
  Save,
  ArrowLeft
} from 'lucide-react'
import { apiService } from '../../../lib/api'
import { useStore } from '../../../lib/store'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function LogSymptomPage() {
  const [formData, setFormData] = useState({
    symptoms: [
      {
        type: '',
        location: '',
        severity: 3,
        description: '',
        duration: '',
        frequency: ''
      }
    ],
    notes: '',
    overallMood: '',
    painLevel: 5,
    menstrualCycle: {
      dayOfCycle: '',
      cyclePhase: ''
    },
    triggers: []
  })
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [newTrigger, setNewTrigger] = useState('')

  const fileInputRef = useRef(null)
  const router = useRouter()
  const { addSymptom } = useStore()

  const symptomTypes = [
    { value: 'breast_pain', label: 'Breast Pain' },
    { value: 'breast_tenderness', label: 'Breast Tenderness' },
    { value: 'lump', label: 'Lump or Mass' },
    { value: 'thickening', label: 'Thickening' },
    { value: 'nipple_discharge', label: 'Nipple Discharge' },
    { value: 'nipple_inversion', label: 'Nipple Inversion' },
    { value: 'skin_changes', label: 'Skin Changes' },
    { value: 'skin_dimpling', label: 'Skin Dimpling' },
    { value: 'breast_swelling', label: 'Breast Swelling' },
    { value: 'armpit_lump', label: 'Armpit Lump' },
    { value: 'breast_size_change', label: 'Breast Size Change' },
    { value: 'breast_shape_change', label: 'Breast Shape Change' },
    { value: 'rash', label: 'Rash' },
    { value: 'itching', label: 'Itching' },
    { value: 'warmth', label: 'Warmth' },
    { value: 'redness', label: 'Redness' },
    { value: 'other', label: 'Other' }
  ]

  const locations = [
    { value: 'left_breast', label: 'Left Breast' },
    { value: 'right_breast', label: 'Right Breast' },
    { value: 'both_breasts', label: 'Both Breasts' },
    { value: 'left_armpit', label: 'Left Armpit' },
    { value: 'right_armpit', label: 'Right Armpit' },
    { value: 'both_armpits', label: 'Both Armpits' },
    { value: 'nipple_left', label: 'Left Nipple' },
    { value: 'nipple_right', label: 'Right Nipple' },
    { value: 'both_nipples', label: 'Both Nipples' }
  ]

  const durations = [
    { value: 'less_than_day', label: 'Less than a day' },
    { value: '1_3_days', label: '1-3 days' },
    { value: '1_week', label: '1 week' },
    { value: '2_weeks', label: '2 weeks' },
    { value: '1_month', label: '1 month' },
    { value: 'more_than_month', label: 'More than a month' }
  ]

  const frequencies = [
    { value: 'constant', label: 'Constant' },
    { value: 'intermittent', label: 'Intermittent' },
    { value: 'during_cycle', label: 'During Menstrual Cycle' },
    { value: 'before_cycle', label: 'Before Menstrual Cycle' },
    { value: 'after_cycle', label: 'After Menstrual Cycle' }
  ]

  const moods = [
    { value: 'excellent', label: '😊 Excellent' },
    { value: 'good', label: '🙂 Good' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'anxious', label: '😰 Anxious' },
    { value: 'worried', label: '😟 Worried' },
    { value: 'depressed', label: '😢 Depressed' }
  ]

  const cyclePhases = [
    { value: 'menstruation', label: 'Menstruation' },
    { value: 'follicular', label: 'Follicular' },
    { value: 'ovulation', label: 'Ovulation' },
    { value: 'luteal', label: 'Luteal' }
  ]

  const commonTriggers = [
    'stress', 'diet', 'exercise', 'menstrual_cycle', 'medication', 
    'caffeine', 'alcohol', 'sleep', 'weather', 'other'
  ]

  const handleSymptomChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom, i) => 
        i === index ? { ...symptom, [field]: value } : symptom
      )
    }))
  }

  const addSymptomField = () => {
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, {
        type: '',
        location: '',
        severity: 3,
        description: '',
        duration: '',
        frequency: ''
      }]
    }))
  }

  const removeSymptom = (index) => {
    if (formData.symptoms.length > 1) {
      setFormData(prev => ({
        ...prev,
        symptoms: prev.symptoms.filter((_, i) => i !== index)
      }))
    }
  }

  const handleInputChange = (field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: value
          }
        }
      } else {
        return {
          ...prev,
          [field]: value
        }
      }
    })
  }

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files)
    const maxFiles = 5
    
    if (photos.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} photos`)
      return
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isUnder5MB = file.size <= 5 * 1024 * 1024
      
      if (!isImage) {
        setError('Please select only image files')
        return false
      }
      if (!isUnder5MB) {
        setError('Image size must be under 5MB')
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setPhotos(prev => [...prev, ...validFiles])
      setError('')
    }
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.triggers.includes(newTrigger.trim())) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, newTrigger.trim()]
      }))
      setNewTrigger('')
    }
  }

  const removeTrigger = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }))
  }

  const addCommonTrigger = (trigger) => {
    if (!formData.triggers.includes(trigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }))
    }
  }

  const validateForm = () => {
    if (!formData.symptoms[0].type) {
      setError('Please select at least one symptom type')
      return false
    }

    if (!formData.symptoms[0].location) {
      setError('Please select the location of your symptom')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      let response

      if (photos.length > 0) {
        // Create FormData for photo upload
        const formDataWithPhotos = new FormData()
        
        // Add photos
        photos.forEach((photo, index) => {
          formDataWithPhotos.append('photo', photo)
        })
        
        // Add symptoms array - each symptom as a separate JSON string
        formData.symptoms.forEach((symptom, index) => {
          formDataWithPhotos.append(`symptoms[${index}][type]`, symptom.type)
          formDataWithPhotos.append(`symptoms[${index}][location]`, symptom.location)
          formDataWithPhotos.append(`symptoms[${index}][severity]`, symptom.severity.toString())
          formDataWithPhotos.append(`symptoms[${index}][description]`, symptom.description)
          formDataWithPhotos.append(`symptoms[${index}][duration]`, symptom.duration)
          formDataWithPhotos.append(`symptoms[${index}][frequency]`, symptom.frequency)
        })
        
        // Add other data
        formDataWithPhotos.append('notes', formData.notes)
        formDataWithPhotos.append('overallMood', formData.overallMood)
        formDataWithPhotos.append('painLevel', formData.painLevel.toString())
        
        // Add menstrual cycle data
        formDataWithPhotos.append('menstrualCycle[dayOfCycle]', formData.menstrualCycle.dayOfCycle.toString())
        formDataWithPhotos.append('menstrualCycle[cyclePhase]', formData.menstrualCycle.cyclePhase)
        
        // Add triggers array
        formData.triggers.forEach((trigger, index) => {
          formDataWithPhotos.append(`triggers[${index}]`, trigger)
        })

        response = await apiService.createSymptomLogWithPhoto(formDataWithPhotos)
      } else {
        // Regular JSON submission
        response = await apiService.createSymptomLog(formData)
      }

      if (response.data) {
        addSymptom(response.data.symptom || response.data)
        router.push('/symptoms')
      } else {
        setError('Failed to log symptom. Please try again.')
      }
    } catch (error) {
      console.error('Failed to log symptom:', error)
      
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
          'Failed to log symptom. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Log Symptom</h1>
              <p className="text-gray-600 mt-1">Record your symptoms for better health tracking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Symptoms Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Symptoms</h2>
              <button
                type="button"
                onClick={addSymptomField}
                className="flex items-center space-x-2 text-pink-600 hover:text-pink-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Symptom</span>
              </button>
            </div>

            {formData.symptoms.map((symptom, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">Symptom {index + 1}</h3>
                  {formData.symptoms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptom Type *
                    </label>
                    <select
                      value={symptom.type}
                      onChange={(e) => handleSymptomChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="">Select symptom type...</option>
                      {symptomTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      value={symptom.location}
                      onChange={(e) => handleSymptomChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="">Select location...</option>
                      {locations.map(location => (
                        <option key={location.value} value={location.value}>{location.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity: {symptom.severity}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={symptom.severity}
                      onChange={(e) => handleSymptomChange(index, 'severity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Mild</span>
                      <span>Very Severe</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={symptom.duration}
                      onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Select duration...</option>
                      {durations.map(duration => (
                        <option key={duration.value} value={duration.value}>{duration.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={symptom.frequency}
                      onChange={(e) => handleSymptomChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Select frequency...</option>
                      {frequencies.map(frequency => (
                        <option key={frequency.value} value={frequency.value}>{frequency.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={symptom.description}
                    onChange={(e) => handleSymptomChange(index, 'description', e.target.value)}
                    placeholder="Describe the symptom in detail..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Mood
                </label>
                <select
                  value={formData.overallMood}
                  onChange={(e) => handleInputChange('overallMood', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Select mood...</option>
                  {moods.map(mood => (
                    <option key={mood.value} value={mood.value}>{mood.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level: {formData.painLevel}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.painLevel}
                  onChange={(e) => handleInputChange('painLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No Pain</span>
                  <span>Severe Pain</span>
                </div>
              </div>
            </div>

            {/* Menstrual Cycle */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Menstrual Cycle (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Cycle
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.menstrualCycle.dayOfCycle}
                    onChange={(e) => handleInputChange('menstrualCycle', e.target.value, 'dayOfCycle')}
                    placeholder="e.g., 14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Phase
                  </label>
                  <select
                    value={formData.menstrualCycle.cyclePhase}
                    onChange={(e) => handleInputChange('menstrualCycle', e.target.value, 'cyclePhase')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Select phase...</option>
                    {cyclePhases.map(phase => (
                      <option key={phase.value} value={phase.value}>{phase.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about your symptoms..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Triggers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Potential Triggers</h2>

            {/* Common Triggers */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Common triggers:</p>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => addCommonTrigger(trigger)}
                    disabled={formData.triggers.includes(trigger)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.triggers.includes(trigger)
                        ? 'bg-pink-100 text-pink-800 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {trigger.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Trigger Input */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Add custom trigger..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                />
                <button
                  type="button"
                  onClick={addTrigger}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Triggers */}
            {formData.triggers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Selected triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.triggers.map(trigger => (
                    <div key={trigger} className="flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full">
                      <span className="text-sm">{trigger.replace('_', ' ')}</span>
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="text-pink-600 hover:text-pink-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Photos (Optional)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload photos to document visual symptoms. Maximum 5 photos, 5MB each.
            </p>

            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 5}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  {photos.length === 0 ? 'Add Photos' : `Add More Photos (${photos.length}/5)`}
                </span>
              </button>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Log Symptom</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
