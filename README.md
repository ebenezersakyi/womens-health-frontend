# Women's Health Frontend - Breast Cancer Screening App

A Next.js application that helps users find breast cancer screening events and centers near them. This is the normal user side of a comprehensive breast cancer awareness platform.

## Features

### 🏠 Onboarding / Tips Page (/)
- Display breast cancer awareness tips in an interactive carousel
- Educational content fetched from backend API
- Call-to-action button to navigate to map view
- Health statistics and awareness information

### 🗺️ Home / Map Page (/map)
- Google Maps integration showing user's current location
- Display nearby screening events as markers
- Interactive event popups with details and directions
- Filter events by distance, region, and date
- Toggle between map and list view

### 📅 Events List Page (/events)
- Browse all upcoming screening events
- Filter by region, distance, and date range
- Search functionality for events
- Events grouped by date (Today, Tomorrow, This Week, etc.)
- Direct navigation to event details

### 📋 Event Detail Page (/events/[id])
- Comprehensive event information
- Contact details and description
- "Open in Google Maps" for directions
- "Add to Calendar" functionality
- Share event feature
- Save/bookmark events

### 👤 Profile / Settings Page (/profile)
- User profile management
- Notification preferences
- View saved events
- Account settings and logout

## Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Styling**: Tailwind CSS v4
- **Maps**: Google Maps (@react-google-maps/api)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd womens-health-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env.local` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
├── page.js                 # Onboarding/Tips page
├── layout.js               # Root layout with navigation
├── globals.css             # Global styles
├── map/
│   └── page.js            # Map page
├── events/
│   ├── page.js            # Events list page
│   └── [id]/
│       └── page.js        # Event detail page
└── profile/
    └── page.js            # Profile page

components/
├── BottomNavigation.js    # Mobile bottom navigation
├── EventCard.js           # Event card component
├── FilterBar.js           # Event filtering component
├── GoogleMapComponent.js  # Google Maps wrapper
└── LoadingSpinner.js      # Loading indicator

lib/
├── api.js                 # API service functions
└── store.js               # Zustand state management
```

## API Integration

The app expects a backend API with the following endpoints:

- `GET /tips` - Fetch health tips
- `GET /events/nearby?lat={lat}&lng={lng}&radius={radius}` - Fetch nearby events
- `GET /events` - Fetch all events with optional filters
- `GET /events/{id}` - Fetch specific event details
- `GET /user/profile` - Fetch user profile
- `PUT /user/profile` - Update user profile

## Features Implemented

### ✅ Google Maps Integration
- Real-time user location detection
- Interactive map with custom markers
- Event info windows with actions
- Directions to Google Maps

### ✅ Geolocation
- Automatic user location detection
- Fallback to default location (Accra, Ghana)
- Location-based event filtering

### ✅ Responsive Design
- Mobile-first design approach
- Bottom navigation for mobile
- Responsive grid layouts
- Touch-friendly interactions

### ✅ State Management
- Zustand for global state
- Local storage for preferences
- Loading and error states

### ✅ Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast design

## Development Notes

- Mock data is provided for development when API is unavailable
- All components are client-side rendered where needed
- Error boundaries handle API failures gracefully
- Loading states provide good user experience

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Make sure to set environment variables in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
