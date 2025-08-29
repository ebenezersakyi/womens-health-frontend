// Test script for API integration
const testApiIntegration = () => {
  // Test API endpoint construction
  const testParams = {
    lat: 5.6037,
    lng: -0.1870,
    radius: 10, // km
    date: '2025-12-25'
  }
  
  console.log('Testing API URL construction:')
  
  // Test nearby events URL
  const nearbyParams = new URLSearchParams({
    lat: testParams.lat.toString(),
    lng: testParams.lng.toString(),
    radius: (testParams.radius * 1000).toString(), // Convert to meters
    date: testParams.date
  })
  
  const nearbyUrl = `/api/events/nearby?${nearbyParams}`
  console.log('Nearby events URL:', nearbyUrl)
  
  // Test date range URL
  const rangeParams = new URLSearchParams({
    lat: testParams.lat.toString(),
    lng: testParams.lng.toString(), 
    radius: (testParams.radius * 1000).toString(),
    startDate: '2025-12-01',
    endDate: '2025-12-31'
  })
  
  const rangeUrl = `/api/events/nearby?${rangeParams}`
  console.log('Date range events URL:', rangeUrl)
  
  // Test response structure transformation
  const mockApiResponse = {
    success: true,
    data: {
      events: [
        {
          _id: "507f1f77bcf86cd799439011",
          title: "Breast Cancer Screening",
          date: "2025-12-25T09:00:00.000Z",
          location: {
            coordinates: [-0.1870, 5.6037],
            address: "Accra Community Center",
            region: "Greater Accra"
          },
          distance: 1500,
          organizerId: { name: "Ghana Health Service" }
        }
      ],
      filters: {
        location: { lat: 5.6037, lng: -0.1870, radius: 10000 },
        date: "2025-12-25",
        region: "Accra"
      },
      pagination: {
        current: 1,
        total: 1,
        count: 5,
        totalRecords: 5
      }
    }
  }
  
  // Transform for frontend use
  const transformedEvent = mockApiResponse.data.events.map(event => ({
    ...event,
    id: event._id,
    location: {
      address: event.location.address,
      coordinates: {
        lat: event.location.coordinates[1], // GeoJSON [lng, lat] -> lat
        lng: event.location.coordinates[0]  // GeoJSON [lng, lat] -> lng
      }
    },
    distance: event.distance / 1000 // meters to km
  }))
  
  console.log('Transformed event data:', JSON.stringify(transformedEvent, null, 2))
}

// Run test
testApiIntegration()
