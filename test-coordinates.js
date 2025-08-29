// Test coordinate URL construction
const testUrlConstruction = () => {
  console.log('Testing URL construction with coordinates...')
  
  // Test case 1: Default coordinates (no place selected)
  const searchParams1 = new URLSearchParams()
  searchParams1.append('search', 'Health screening')
  searchParams1.append('lat', '5.6037')
  searchParams1.append('lng', '-0.1870') 
  searchParams1.append('radius', '25000')
  searchParams1.append('date', '2025-08-28T11:44:46.704Z')
  
  console.log('URL 1 (Default Accra):', `/events?${searchParams1}`)
  
  // Test case 2: Selected place coordinates
  const searchParams2 = new URLSearchParams()
  searchParams2.append('search', 'Kumasi')
  searchParams2.append('lat', '6.6666')
  searchParams2.append('lng', '-1.6163')
  searchParams2.append('radius', '25000')
  searchParams2.append('startDate', '2025-08-01T00:00:00.000Z')
  searchParams2.append('endDate', '2025-08-31T23:59:59.999Z')
  
  console.log('URL 2 (Selected Place):', `/events?${searchParams2}`)
  
  // Test API URL construction
  console.log('\nExpected API calls:')
  console.log(`API 1: http://localhost:5001/api/events/nearby?${searchParams1}`)
  console.log(`API 2: http://localhost:5001/api/events/nearby?${searchParams2}`)
}

testUrlConstruction()
