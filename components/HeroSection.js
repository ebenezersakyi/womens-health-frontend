"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  Calendar,
  MapPin,
  Shield,
  Clock,
  Navigation,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  DateRangePicker,
  Calendar as DateRangeCalendar,
} from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

// Google Places integration
let autocomplete;
let service;

export default function HeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [singleDate, setSingleDate] = useState(new Date());
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Load Google Maps API with Places library
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    // Initialize Google Places Autocomplete when API is loaded
    if (isLoaded && inputRef.current) {
      autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
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

    if (isRangeMode) {
      // Date range mode
      const { startDate, endDate } = dateRange[0];
      if (startDate) {
        searchParams.append("startDate", startDate.toISOString());
      }
      if (endDate && endDate !== startDate) {
        searchParams.append("endDate", endDate.toISOString());
      }
    } else {
      // Single date mode
      if (singleDate) {
        searchParams.append("date", singleDate.toISOString());
      }
    }

    const queryString = searchParams.toString();
    const url = `/events?${queryString}`;
    router.push(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDatePicker &&
        !event.target.closest(".react-datepicker-wrapper") &&
        !event.target.closest("button")
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // Animation variants for smoother animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoothness
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const heartVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
      opacity: 0,
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        yoyo: Infinity,
      },
    },
  };

  const featureVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
    hover: {
      scale: 1.03,
      y: -2,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-white h-[90vh]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <motion.div
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left content */}
          <div className="space-y-6 lg:space-y-8">
            <motion.div
              className="space-y-4 lg:space-y-6"
              variants={itemVariants}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                <motion.span className="font-light" variants={itemVariants}>
                  When your
                </motion.span>{" "}
                <span className="relative">
                  <motion.div
                    variants={heartVariants}
                    whileHover="hover"
                    className="inline-block"
                  >
                    <Heart
                      className="inline w-8 h-8 lg:w-10 lg:h-10 text-pink-500 mx-1"
                      fill="currentColor"
                    />
                  </motion.div>
                </span>
                <br />
                <motion.span
                  className="text-gray-700 font-black"
                  variants={itemVariants}
                >
                  Health Screening
                </motion.span>{" "}
                <motion.span
                  className="text-pink-500 font-black"
                  variants={itemVariants}
                >
                  comes first
                </motion.span>
              </h1>

              <motion.p
                className="text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed"
                variants={itemVariants}
              >
                &quot;Taking care of your health today creates a foundation for a
                healthier tomorrow.&quot;
              </motion.p>
            </motion.div>

            {/* Search input with Google Places */}
            <motion.div
              className="relative max-w-lg w-full"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search place..."
                className="w-full pl-6 pr-20 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700 placeholder-gray-400 bg-white shadow-sm transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <div className="relative">
                  <motion.button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Calendar className="w-5 h-5 text-pink-500" />
                  </motion.button>
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="absolute right-0 top-8 z-50"
                      >
                        <div className="bg-white rounded-lg shadow-lg border p-2">
                          {/* Date mode toggle */}
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                            <span className="text-xs font-medium text-gray-700">
                              Date Selection
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setIsRangeMode(false);
                                  setSingleDate(new Date());
                                }}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  !isRangeMode
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Single
                              </button>
                              <button
                                onClick={() => {
                                  setIsRangeMode(true);
                                  setDateRange([
                                    {
                                      startDate: new Date(),
                                      endDate: new Date(),
                                      key: "selection",
                                    },
                                  ]);
                                }}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  isRangeMode
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Range
                              </button>
                            </div>
                          </div>

                          {/* Date Picker */}
                          <div className="react-daterange-picker-wrapper-compact">
                            {isRangeMode ? (
                              <DateRangePicker
                                ranges={dateRange}
                                onChange={(ranges) => {
                                  setDateRange([ranges.selection]);
                                  // Close when both dates are selected and different
                                  if (
                                    ranges.selection.startDate &&
                                    ranges.selection.endDate &&
                                    ranges.selection.startDate.getTime() !==
                                      ranges.selection.endDate.getTime()
                                  ) {
                                    setTimeout(
                                      () => setShowDatePicker(false),
                                      300
                                    );
                                  }
                                }}
                                showSelectionPreview={true}
                                moveRangeOnFirstSelection={false}
                                months={1}
                                direction="horizontal"
                                staticRanges={[]}
                                inputRanges={[]}
                                showDateDisplay={false}
                              />
                            ) : (
                              <DateRangeCalendar
                                date={singleDate}
                                onChange={(date) => {
                                  setSingleDate(date);
                                  setTimeout(
                                    () => setShowDatePicker(false),
                                    200
                                  );
                                }}
                                showDateDisplay={false}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  onClick={handleSearch}
                  className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors duration-200"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(236, 72, 153, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Service features */}
            <motion.div
              className="grid grid-cols-2 gap-3 pt-2 max-w-lg w-full"
              variants={itemVariants}
            >
              <motion.div
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                variants={featureVariants}
                whileHover="hover"
              >
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Easy Booking
                  </span>
                  <span className="text-xs text-gray-500">
                    Quick scheduling
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                variants={featureVariants}
                whileHover="hover"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Find Centers
                  </span>
                  <span className="text-xs text-gray-500">
                    Nearby locations
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                variants={featureVariants}
                whileHover="hover"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Scheduling
                  </span>
                  <span className="text-xs text-gray-500">
                    Appointment times
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                variants={featureVariants}
                whileHover="hover"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Directions
                  </span>
                  <span className="text-xs text-gray-500">
                    Location guidance
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right content - Hero Image */}
          <motion.div
            className="relative h-full flex items-stretch"
            variants={itemVariants}
          >
            <motion.div
              className="relative w-full h-full"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="/images/hero/hero1.png"
                alt="Health screening consultation"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
