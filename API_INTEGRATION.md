# API Integration Documentation

## Overview
This document outlines the integration with the new events API structure that includes location-based filtering and improved response format. The API requires latitude and longitude coordinates for all requests.

## API Endpoints

### Get Nearby Events
```
GET /api/events/nearby
```

#### Required Parameters:
- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate  

#### Optional Parameters:
- `radius` (optional): Search radius in meters (default: 25000)
- `date` (optional): Single date filter (ISO string)
- `startDate` (optional): Range start date (ISO string)
- `endDate` (optional): Range end date (ISO string)
- `region` (optional): Region filter
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

#### Example Requests:
```
GET /api/events/nearby?lat=5.6037&lng=-0.1870&radius=10000&date=2025-12-25
GET /api/events/nearby?lat=5.6037&lng=-0.1870&startDate=2025-12-01&endDate=2025-12-31
```

## Response Structure

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Breast Cancer Screening",
        "date": "2025-12-25T09:00:00.000Z",
        "location": {
          "coordinates": [-0.1870, 5.6037],
          "address": "Accra Community Center",
          "region": "Greater Accra"
        },
        "distance": 1500,
        "organizerId": {...}
      }
    ],
    "filters": {
      "location": {"lat": 5.6037, "lng": -0.1870, "radius": 10000},
      "date": "2025-12-25",
      "region": "Accra"
    },
    "pagination": {
      "current": 1,
      "total": 1,
      "count": 5,
      "totalRecords": 5
    }
  }
}
```

## Frontend Integration

### Hero Section (components/HeroSection.js)
The hero section now:
- **Stores selected place coordinates** when user selects from Google Places autocomplete
- **Always includes coordinates** in navigation URLs (either selected place or default Accra coordinates)
- **Passes radius parameter** (25km default) for API compatibility
- **Maintains backward compatibility** with existing search functionality

### Events Page (app/events/page.js)
The events page now:
- **Extracts coordinates from URL parameters** (lat, lng, radius)
- **Uses URL coordinates for API calls** instead of just user location
- **Fallback to user location** if no URL coordinates provided
- **Validates coordinates** before making API calls
- **Logs API calls** for debugging purposes

### API Service (lib/api.js)
The API service has been updated to:
- **Require coordinates** for all event queries
- Convert radius from km to meters (multiply by 1000)
- Handle both single date and date range parameters
- Support location-based and region-based filtering
- Handle pagination parameters

### Map Page (app/map/page.js)
The map page has been updated to:
- Use the new API structure for nearby events
- Transform coordinate format for Google Maps compatibility
- Handle distance display in kilometers

## Data Transformations

### Coordinate Format Conversion
```javascript
// API Response (GeoJSON format)
"coordinates": [-0.1870, 5.6037] // [lng, lat]

// Frontend Format (Google Maps compatible)
"coordinates": {
  "lat": 5.6037,
  "lng": -0.1870
}
```

### Distance Conversion
```javascript
// API Response (meters)
"distance": 1500

// Frontend Display (kilometers)
"distance": 1.5
```

### Event ID Handling
```javascript
// API Response
"_id": "507f1f77bcf86cd799439011"

// Frontend Format (backward compatibility)
"id": "507f1f77bcf86cd799439011"
```

## Error Handling

The integration includes comprehensive error handling:
- Fallback to mock data if API fails
- User-friendly error messages
- Graceful degradation for missing data fields
- Loading states during API calls

## URL Parameters

The events page supports URL parameters for search persistence and API compatibility:
- `search`: Location or text search
- `lat` & `lng`: Coordinates (required for API calls)
- `radius`: Search radius in meters (default: 25000)
- `date`: Single date filter
- `startDate` & `endDate`: Date range filter

Example URLs:
```
/events?search=Accra&lat=5.6037&lng=-0.1870&radius=25000&date=2025-08-28
/events?search=Kumasi&lat=6.6666&lng=-1.6163&radius=25000&startDate=2025-12-01&endDate=2025-12-31
```

## Coordinate Handling

### Hero Section Navigation
1. **Google Places Selection**: When user selects a place, coordinates are stored and used in navigation
2. **Default Coordinates**: If no place selected, defaults to Accra, Ghana (5.6037, -0.1870)
3. **URL Construction**: Always includes lat, lng, and radius parameters

### Events Page Processing
1. **URL Parameter Extraction**: Reads coordinates from URL parameters first
2. **Fallback to User Location**: Uses geolocation if no URL coordinates
3. **API Call Validation**: Ensures coordinates exist before making API calls
4. **Error Handling**: Shows mock data if coordinates unavailable

## Testing

Mock data has been updated to match the new API structure:
- Uses `_id` field for MongoDB compatibility
- Includes GeoJSON coordinate format
- Distance values in meters
- Proper date formatting

## Performance Considerations

- Radius is converted to meters to match API expectations
- Coordinate transformation is done client-side to minimize API changes
- Pagination support for large datasets
- Error boundary with fallback data ensures app stability
