'use client'

import { TrendingUp, Shield, Heart, Users } from 'lucide-react'

export default function StatsSection() {
  const stats = [
    {
      id: 1,
      number: "1 in 8",
      description: "Women will develop breast cancer",
      subtext: "in their lifetime",
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    },
    {
      id: 2,
      number: "99%",
      description: "5-year survival rate",
      subtext: "when caught early",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 3,
      number: "40+",
      description: "Recommended age",
      subtext: "for annual mammograms",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 4,
      number: "10,000+",
      description: "Women helped",
      subtext: "through our platform",
      icon: Heart,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Early Detection Matters
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding the importance of regular screening and early intervention 
            in the fight against breast cancer.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.id}
                className="text-center group hover:transform hover:scale-105 transition-all duration-200"
              >
                <div className="relative">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-200"></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    {/* Icon */}
                    <div className={`${stat.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    
                    {/* Number */}
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.number}
                    </div>
                    
                    {/* Description */}
                    <div className="text-gray-900 font-medium mb-1">
                      {stat.description}
                    </div>
                    
                    {/* Subtext */}
                    <div className="text-sm text-gray-600">
                      {stat.subtext}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Take Action Today
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't wait for symptoms to appear. Regular screening is your best defense 
              against breast cancer. Find a screening center near you and schedule your appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Schedule Screening
              </button>
              <button className="btn-outline">
                Learn About Self-Exams
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
