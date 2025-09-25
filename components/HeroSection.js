"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Calendar,
  Activity,
  ArrowRight,
  BookOpen,
  Search,
  MapPin,
  Menu,
  X,
  User,
  Shield,
  Phone,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useStore } from "../lib/store";
import Logo from "./Logo";

// Google Places integration
let autocomplete;
let service;

export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useStore();
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                lng: place.geometry.location.lng(),
              },
              place_id: place.place_id,
            });
            console.log("Selected place:", place);
          }
        });
      } catch (error) {
        console.error("Error initializing Google Places:", error);
      }
    }
  }, [isLoaded]);

  // Debug menu state changes
  useEffect(() => {
    console.log("Menu state changed:", isMenuOpen);
  }, [isMenuOpen]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    // Add search location if provided
    if (searchValue.trim()) {
      searchParams.append("search", searchValue);
    }

    // Use coordinates from selected place or default to Accra, Ghana
    const coordinates = selectedPlace?.coordinates || {
      lat: 5.6037,
      lng: -0.187,
    };

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
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover transform scale-110"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/BREAST.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.jpeg"
            alt="PinkyTrust Logo"
            width={68}
            height={68}
            className="w-16 h-16 rounded-lg shadow-lg cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Menu Button */}
        <button
          onClick={() => {
            console.log("Menu button clicked, current state:", isMenuOpen);
            setIsMenuOpen(!isMenuOpen);
          }}
          className="flex flex-col items-center justify-center px-4 py-2 hover:opacity-80 transition-opacity duration-300"
        >
          <div className="w-12 h-0.5 bg-white rounded-full mb-1"></div>
          <span className="text-white text-sm font-medium">Menu</span>
          <div className="w-12 h-0.5 bg-white rounded-full mt-1"></div>
        </button>
      </div>

      {/* Menu Overlay with enhanced drawer animation */}
      <div
        className={`fixed inset-0 z-30 ${
          isMenuOpen ? 'menu-slide-in' : 'menu-slide-out'
        }`}
        style={{ 
          pointerEvents: isMenuOpen ? "auto" : "none",
          background: 'linear-gradient(135deg, rgba(157, 23, 77, 0.95) 0%, rgba(147, 51, 234, 0.95) 50%, rgba(79, 70, 229, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          visibility: isMenuOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Close Button with enhanced animation */}
        <div className={`absolute top-6 right-6 z-50 ${isMenuOpen ? 'close-button-in' : 'close-button-out'}`}>
          <button
            onClick={() => {
              console.log("Close button clicked");
              setIsMenuOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Menu Content with staggered animation */}
        <div 
          className={`flex flex-col items-center justify-center h-full text-center px-8 ${
            isMenuOpen ? 'menu-content-in' : 'menu-content-out'
          }`}
        >
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/logo.jpeg"
              alt="PinkyTrust Logo"
              width={96}
              height={96}
              className="w-24 h-24 rounded-2xl shadow-2xl mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-2">PinkyTrust</h2>
            <p className="text-pink-200 text-lg">Early Detection Saves Lives</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-6 max-w-md w-full">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    router.push("/symptoms");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Activity className="w-5 h-5" />
                  <span>Symptoms</span>
                </button>

                <button
                  onClick={() => {
                    window.open("https://youtu.be/u-LzRJQJn3Q?si=F4e2hM-4cGYRAfud", "_blank");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Image src="/icons/breast.ico" alt="Self Check" width={20} height={20} className="w-5 h-5 brightness-0 invert" />
                  <span>Self Check Guide</span>
                </button>

                <button
                  onClick={() => {
                    router.push("/events");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Health Events</span>
                </button>

                {/* Auth buttons when logged out */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      router.push("/auth/login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-semibold text-white/90 bg-white/10 border border-white/20 rounded-xl py-3 hover:bg-white/20 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      router.push("/auth/register");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-semibold text-pink-700 bg-white rounded-xl py-3 hover:bg-white/90 transition"
                  >
                    Create account
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/symptoms/log");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Activity className="w-5 h-5" />
                  <span>Log Symptoms</span>
                </button>

                <button
                  onClick={() => {
                    window.open("https://youtu.be/u-LzRJQJn3Q?si=F4e2hM-4cGYRAfud", "_blank");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Image src="/icons/breast.ico" alt="Self Check" width={20} height={20} className="w-5 h-5 brightness-0 invert" />
                  <span>Self Check Guide</span>
                </button>

                <button
                  onClick={() => {
                    router.push("/appointments");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                {/* Auth actions when logged in */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      router.push("/events");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-semibold text-white/90 bg-white/10 border border-white/20 rounded-xl py-3 hover:bg-white/20 transition"
                  >
                    All Events
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      router.push("/");
                    }}
                    className="w-full text-sm font-semibold text-white/90 bg-white/10 border border-white/20 rounded-xl py-3 hover:bg-white/20 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Contact Information */}
            <div className="pt-8 border-t border-white/20 mt-8">
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <div className="flex items-center justify-center gap-2 text-pink-200 mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+233 55 666 0355</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-pink-200 mb-4">
                <Shield className="w-4 h-4" />
                <span className="text-sm">info@gi-kace.gov.gh</span>
              </div>
              
              {/* Powered by GI-KACE */}
              <div className="flex items-center justify-center gap-2 text-pink-200/80 text-xs">
                <span>Powered by</span>
                <span className="font-semibold text-white">GI-KACE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8 pt-20">

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Your Health,{" "}
              <span className="text-pink-400 relative">
                Your Priority
                <Heart
                  className="inline-block w-8 h-8 lg:w-12 lg:h-12 text-pink-400 ml-2 animate-pulse"
                  fill="currentColor"
                />
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Personalized health tracking, expert guidance, and early
              detection tools for a healthier tomorrow.
            </p>
          </div>

          {/* Google Places Search */}
          <div className="relative max-w-lg mx-auto w-full group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 group-focus-within:opacity-60 transition-opacity duration-300"></div>
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for locations near you to see events..."
              className="relative w-full pl-6 pr-16 py-4 rounded-2xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-white placeholder-white/70 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl text-base transition-all duration-300 focus:bg-white/20"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => window.open("https://youtu.be/u-LzRJQJn3Q?si=F4e2hM-4cGYRAfud", "_blank")}
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Image src="/icons/breast.ico" alt="Self Check" width={20} height={20} className="w-5 h-5 relative brightness-0 invert" />
                  <span className="relative">Self Check</span>
                </button>
                <button
                  onClick={() => router.push("/events")}
                  className="group relative flex items-center justify-center gap-2 border-2 border-white/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-pink-600 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <Calendar className="w-5 h-5 relative" />
                  <span className="relative">All Events</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.open("https://youtu.be/u-LzRJQJn3Q?si=F4e2hM-4cGYRAfud", "_blank")}
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Image src="/icons/breast.ico" alt="Self Check" width={20} height={20} className="w-5 h-5 relative brightness-0 invert" />
                  <span className="relative">Self Check</span>
                </button>
                <button
                  onClick={() => router.push("/appointments")}
                  className="group relative flex items-center justify-center gap-2 border-2 border-white/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-pink-600 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <Calendar className="w-5 h-5 relative" />
                  <span className="relative">Book Appointment</span>
                </button>
              </>
            )}
          </div>
          
          {/* Powered by GI-KACE - Home page branding */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <span>Powered by</span>
              <span className="font-semibold text-white">GI-KACE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes menuSlideIn {
          0% {
            transform: translateY(-100%);
            opacity: 0;
            visibility: visible;
          }
          1% {
            visibility: visible;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
        }

        @keyframes menuSlideOut {
          0% {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          99% {
            visibility: visible;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes menuContentIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          60% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes menuContentOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
          }
        }

        .menu-slide-in {
          animation: menuSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .menu-slide-out {
          animation: menuSlideOut 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }

        .menu-content-in {
          animation: menuContentIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
          opacity: 0;
        }

        .menu-content-out {
          animation: menuContentOut 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }

        @keyframes closeButtonIn {
          0% {
            opacity: 0;
            transform: scale(0.8) rotate(-180deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes closeButtonOut {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) rotate(180deg);
          }
        }

        .close-button-in {
          animation: closeButtonIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
          opacity: 0;
        }

        .close-button-out {
          animation: closeButtonOut 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }
      `}</style>
    </section>
  );
}
