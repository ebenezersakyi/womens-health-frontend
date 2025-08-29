'use client'

import { Filter } from 'lucide-react'

export default function FilterBar({ filters, onFilterChange, regions = [], className = '' }) {
  const handleRegionChange = (e) => {
    onFilterChange({ region: e.target.value })
  }

  const handleDistanceChange = (e) => {
    onFilterChange({ distance: e.target.value })
  }

  const handleDateChange = (e) => {
    onFilterChange({ dateRange: e.target.value })
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={filters.region}
            onChange={handleRegionChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance
          </label>
          <select
            value={filters.distance}
            onChange={handleDistanceChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="nearby">Within 25km</option>
            <option value="50km">Within 50km</option>
            <option value="100km">Within 100km</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={handleDateChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="upcoming">Upcoming Only</option>
          </select>
        </div>
      </div>
    </div>
  )
}
