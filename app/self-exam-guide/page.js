'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Calendar, 
  Eye, 
  Hand, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Info
} from 'lucide-react'

export default function SelfExamGuidePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const steps = [
    {
      title: "When to Perform",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Best Time for Self-Exam</h3>
                <p className="text-blue-800 text-sm">
                  Perform your breast self-exam 3-5 days after your period ends, when breasts are least tender and swollen.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-50 rounded-lg p-4">
              <h4 className="font-semibold text-pink-900 mb-2">If you still menstruate:</h4>
              <p className="text-pink-800 text-sm">
                Choose the same day each month, 3-5 days after your period ends.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">If you don&apos;t menstruate:</h4>
              <p className="text-purple-800 text-sm">
                Pick the same date each month (like the 1st of every month).
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">Set a Reminder</span>
            </div>
            <p className="text-yellow-800 text-sm">
              Set a monthly reminder on your phone or calendar to make self-exams a regular habit.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Visual Inspection",
      icon: Eye,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-4">Step 1: Look in the Mirror</h3>
            <p className="text-green-800 mb-4">
              Stand undressed from the waist up in front of a mirror with good lighting.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Position 1: Arms at Your Sides</h4>
                <p className="text-gray-700 text-sm">
                  Look for any changes in size, shape, or skin texture. Check for dimpling, puckering, or changes in nipple direction.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Position 2: Arms Raised Above Head</h4>
                <p className="text-gray-700 text-sm">
                  Raise both arms above your head and look for the same changes from a different angle.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Position 3: Hands on Hips</h4>
                <p className="text-gray-700 text-sm">
                  Place hands firmly on hips and press down to flex chest muscles. Look for changes in contour.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">What to Look For:</h4>
                <ul className="text-red-800 text-sm space-y-1">
                  <li>• Changes in breast size or shape</li>
                  <li>• Skin dimpling or puckering</li>
                  <li>• Nipple changes (inversion, discharge)</li>
                  <li>• Skin texture changes (orange peel appearance)</li>
                  <li>• Unusual redness or swelling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Physical Examination",
      icon: Hand,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Step 2: Feel for Changes</h3>
            <p className="text-blue-800 mb-4">
              Use the pads of your fingers (not fingertips) to examine your breasts systematically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Lying Down</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-pink-600">1</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Lie down with a pillow under your right shoulder
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-pink-600">2</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Put your right arm behind your head
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-pink-600">3</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Use left hand to examine right breast in circular motions
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-pink-600">4</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Repeat on the other side
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">In the Shower</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Wet hands make it easier to glide over skin
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Use same circular motion technique
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Check entire breast area and underarm
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Examination Technique:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <p className="font-medium text-purple-900 mb-1">Light Pressure</p>
                <p className="text-purple-800">Feel tissue just under skin</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="font-medium text-purple-900 mb-1">Medium Pressure</p>
                <p className="text-purple-800">Feel deeper into breast tissue</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="font-medium text-purple-900 mb-1">Firm Pressure</p>
                <p className="text-purple-800">Feel down to chest wall</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What's Normal vs Concerning",
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Normal Findings</h3>
              </div>
              
              <ul className="space-y-2 text-green-800 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Breast tissue that feels lumpy or rope-like</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Breasts that are different sizes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Changes related to menstrual cycle</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Small bumps around nipple area</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Breast tenderness before periods</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="font-semibold text-red-900">See Your Doctor If You Notice</h3>
              </div>
              
              <ul className="space-y-2 text-red-800 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>A new lump or thickening</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Changes in breast size or shape</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Skin dimpling or puckering</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Nipple discharge (not during breastfeeding)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Persistent breast pain</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Nipple turning inward</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Remember:</h4>
                <p className="text-yellow-800 text-sm mb-3">
                  Most breast changes are not cancer. However, it&apos;s important to have any new or unusual changes checked by a healthcare provider.
                </p>
                <p className="text-yellow-800 text-sm font-medium">
                  Don&apos;t wait - early detection saves lives!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Breast Self-Examination Guide</h1>
            <p className="text-pink-100 text-lg">
              Learn how to perform a thorough breast self-exam in 4 simple steps
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Step {currentStep + 1} of {steps.length}</h2>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{currentStepData.title}</h2>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {currentStepData.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-pink-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/register')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Start Tracking</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Make Self-Exams a Habit?</h2>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            Join PinkyTrust to set monthly reminders, track your findings, and get personalized health insights.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors font-semibold"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-lg hover:bg-opacity-30 transition-colors font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
