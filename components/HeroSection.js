"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Calendar,
  Activity,
  ArrowRight,
  BookOpen,
  Search,
  MapPin,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useStore } from "../lib/store";

// Google Places integration
let autocomplete;
let service;

export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const inputRef = useRef(null);

  // Load Google Maps API with Places library
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    // Initialize Google Places Autocomplete when API is loaded
    if (isLoaded && inputRef.current && !autocomplete) {
      try {
        autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "gh" }, // Ghana
            fields: [
              "place_id",
              "geometry",
              "name",
              "formatted_address",
              "types",
            ],
          }
        );

        service = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setSearchValue(place.formatted_address || place.name);
            // Store the selected place with coordinates
            setSelectedPlace({
              name: place.formatted_address || place.name,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              place_id: place.place_id
            });
            console.log("Selected place:", place);
          }
        });
      } catch (error) {
        console.error("Error initializing Google Places:", error);
      }
    }
  }, [isLoaded]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    // Add search location if provided
    if (searchValue.trim()) {
      searchParams.append("search", searchValue);
    }

    // Use coordinates from selected place or default to Accra, Ghana
    const coordinates = selectedPlace?.coordinates || { lat: 5.6037, lng: -0.1870 };
    
    // Always include coordinates for API compatibility
    searchParams.append("lat", coordinates.lat.toString());
    searchParams.append("lng", coordinates.lng.toString());
    searchParams.append("radius", "25000"); // 25km default radius in meters

    const queryString = searchParams.toString();
    const url = `/events?${queryString}`;
    router.push(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-pink-200/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-16 h-16 bg-purple-200/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '8s' }}></div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-purple-50/50 animate-pulse pointer-events-none" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
          {/* Left Content */}
          <div className="flex flex-col justify-center h-full space-y-8">
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
                Your Health,{" "}
                <span className="text-pink-600 relative bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                  Your Priority
                  <Heart className="inline-block w-8 h-8 lg:w-10 lg:h-10 text-pink-500 ml-2 animate-pulse" fill="currentColor" />
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                Empowering women with personalized health tracking, expert guidance, and early detection tools for a healthier tomorrow.
              </p>
            </div>

            {/* Google Places Search */}
            <div className="relative max-w-lg w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 group-focus-within:opacity-40 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl opacity-0 group-focus-within:opacity-50 transition-opacity duration-300"></div>
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for locations near you to see events..."
                className="relative w-full pl-6 pr-16 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700 placeholder-gray-400 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl text-base transition-all duration-300 focus:bg-white focus:shadow-2xl"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full group-focus-within:w-full transition-all duration-500"></div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push("/auth/register")}
                    className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative">Get Started Free</span>
                    <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => router.push("/self-exam-guide")}
                    className="group relative flex items-center justify-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:text-white transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <BookOpen className="w-5 h-5 relative" />
                    <span className="relative">Self-Exam Guide</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/symptoms/log")}
                    className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Activity className="w-5 h-5 relative" />
                    <span className="relative">Log Symptoms</span>
                  </button>
                  <button
                    onClick={() => router.push("/appointments")}
                    className="group relative flex items-center justify-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:text-white transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <Calendar className="w-5 h-5 relative" />
                    <span className="relative">Book Appointment</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex items-center justify-center h-full overflow-hidden">
            <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg h-full flex items-center justify-center">
              {/* Subtle glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-3xl scale-110 animate-pulse"></div>
              
              <img
                src="/images/hero/hero1.png"
                alt="Women's health consultation"
                className="relative w-full h-auto max-h-full object-contain hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Floating elements around the image */}
              <div className="absolute -top-8 -right-8 w-4 h-4 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -bottom-12 -left-8 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/4 -right-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-1/3 -left-6 w-3 h-3 bg-pink-300 rounded-full animate-bounce opacity-30" style={{ animationDelay: '3s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
