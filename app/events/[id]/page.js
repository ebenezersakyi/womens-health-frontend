"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Share2,
  Bookmark,
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  Star,
  MessageSquare,
  Edit3,
} from "lucide-react";
import { apiService } from "../../../lib/api";
import { useStore } from "../../../lib/store";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ReviewForm from "../../../components/ReviewForm";
import ReviewList from "../../../components/ReviewList";
import { AverageRating } from "../../../components/StarRating";

export default function EventDetailPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  const router = useRouter();
  const params = useParams();
  const { user } = useStore();

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getEvent(params.id);
      console.log("API Response:", response); // Debug log

      // Handle the nested response structure
      const eventData = response.data?.data || response.data;
      setEvent(eventData || getMockEvent(params.id));

      // Check if event is saved (you can implement this with local storage or user preferences)
      const savedEvents = JSON.parse(
        localStorage.getItem("savedEvents") || "[]"
      );
      setIsSaved(savedEvents.includes(params.id));
    } catch (error) {
      console.error("Failed to fetch event:", error);
      setError("Failed to load event details. Please try again.");
      setEvent(getMockEvent(params.id));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id, fetchEvent]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if user can review this event
  const canUserReview = () => {
    if (!user || !event) return false;

    // Event must be in the past to be reviewed
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate < now;
  };

  // Check if user has already reviewed this event
  const checkUserReview = async () => {
    if (!user || !event) return;

    try {
      const response = await apiService.getMyReviews({ eventId: event._id });
      if (response.data.success && response.data.data.reviews.length > 0) {
        setUserReview(response.data.data.reviews[0]);
      }
    } catch (error) {
      console.error("Failed to check user review:", error);
    }
  };

  // Handle review form success
  const handleReviewSuccess = (review) => {
    setShowReviewForm(false);
    setEditingReview(null);
    setUserReview(review);
    setReviewRefreshTrigger((prev) => prev + 1);
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Handle delete review
  const handleDeleteReview = async (review) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await apiService.deleteReview(review._id);
      if (response.data.success) {
        setUserReview(null);
        setReviewRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  // Check for user's existing review when event loads
  useEffect(() => {
    if (event && user) {
      checkUserReview();
    }
  }, [event, user]);

  const openInGoogleMaps = () => {
    console.log("Opening Google Maps for event:", event);
    if (event?.latitude && event?.longitude) {
      console.log("Using latitude/longitude:", event.latitude, event.longitude);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
      window.open(url, "_blank");
    } else if (event?.location?.coordinates) {
      const [lng, lat] = event.location.coordinates; // GeoJSON format [lng, lat]
      console.log("Using coordinates array:", lat, lng);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      console.log("No coordinates available for this event");
      alert("Location coordinates not available for this event");
    }
  };

  const addToCalendar = () => {
    console.log("Adding event to calendar:", event);
    if (!event) {
      console.log("No event data available");
      return;
    }

    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2-hour duration

    const formatCalendarDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const details = encodeURIComponent(
      [
        event.description || "Breast cancer screening event",
        event.organizerId?.name
          ? `Organized by: ${event.organizerId.name}`
          : "",
        event.location?.address ? `Location: ${event.location.address}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(
      endDate
    )}&details=${details}&location=${encodeURIComponent(
      event.location?.address || ""
    )}`;

    window.open(googleCalendarUrl, "_blank");
  };

  const toggleSaveEvent = () => {
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");

    if (isSaved) {
      const updatedEvents = savedEvents.filter((id) => id !== params.id);
      localStorage.setItem("savedEvents", JSON.stringify(updatedEvents));
      setIsSaved(false);
    } else {
      savedEvents.push(params.id);
      localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
      setIsSaved(true);
    }
  };

  const shareEvent = async () => {
    const shareData = {
      title: event.title,
      text: `Join this breast cancer screening event: ${event.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The event you're looking for could not be found."}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push("/events")}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                View All Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={shareEvent}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={toggleSaveEvent}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isSaved
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                }`}
                title={isSaved ? "Remove from saved" : "Save event"}
              >
                <Bookmark
                  className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Event Image */}
          {event.image?.url && (
            <div className="relative h-72 md:h-96 overflow-hidden">
              <img
                src={event.image.url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10" />

              {/* Image Caption */}
              {/* <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg">
                  <p className="text-sm text-gray-700 font-medium">
                    📸 Event Image • Uploaded{" "}
                    {new Date(event.image.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div> */}
            </div>
          )}

          {/* Event Header */}
          <div className="p-8 lg:p-10 border-b border-gray-200/50">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Debug Section - Remove in production */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                <details>
                  <summary className="cursor-pointer font-medium">Debug: Event Data</summary>
                  <pre className="mt-2 overflow-auto max-h-40">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </details>
              </div>
            )} */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date & Time */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100/50">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl shadow-lg shadow-pink-500/25">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {formatDate(event.date)}
                    </div>
                    <div className="text-pink-600 font-medium">
                      {formatTime(event.date)}
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                {event.organizerId && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg shadow-blue-500/25">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Organized by</div>
                      <div className="font-semibold text-gray-900">
                        {event.organizerId.name}
                      </div>
                      {event.organizerId.email && (
                        <div className="text-sm text-gray-600">
                          {event.organizerId.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100/50">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg shadow-green-500/25">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-2 text-lg">
                    {event.location?.address || "Address not specified"}
                  </div>
                  {event.location?.region && (
                    <div className="text-sm text-green-600 font-medium mb-3">
                      📍 {event.location.region} Region
                    </div>
                  )}
                  <button
                    onClick={openInGoogleMaps}
                    className="inline-flex items-center gap-2 text-sm bg-white/80 hover:bg-white text-green-700 px-4 py-2 rounded-lg transition-all duration-200 border border-green-200/50 hover:shadow-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200/30">
            <div className="px-8 lg:px-10">
              <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1 max-w-md">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 flex-1 text-center ${
                    activeTab === "details"
                      ? "bg-white text-pink-600 shadow-sm border border-pink-100/50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  Event Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 flex-1 flex items-center justify-center gap-2 ${
                    activeTab === "reviews"
                      ? "bg-white text-pink-600 shadow-sm border border-pink-100/50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Reviews
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div className="p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                Event Details
              </h2>

              {event.description ? (
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-100/50">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {event.description}
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 mb-8 border border-pink-100/50">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    🎯 Join us for this important breast cancer screening event.
                    Early detection saves lives.
                  </p>
                </div>
              )}

              {/* Contact Information */}
              {(event.contactInfo?.phone || event.contactInfo?.email) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100/50">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📞</span>
                    </div>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {event.contactInfo?.phone && (
                      <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <a
                          href={`tel:${event.contactInfo.phone}`}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {event.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {event.contactInfo?.email && (
                      <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <a
                          href={`mailto:${event.contactInfo.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {event.contactInfo.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Status and Participants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Event Status */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100/50">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    Event Status
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                    <div
                      className={`w-3 h-3 rounded-full shadow-lg ${
                        event.status === "active"
                          ? "bg-green-500 shadow-green-500/25"
                          : event.status === "completed"
                          ? "bg-blue-500 shadow-blue-500/25"
                          : event.status === "cancelled"
                          ? "bg-red-500 shadow-red-500/25"
                          : "bg-gray-500 shadow-gray-500/25"
                      }`}
                    ></div>
                    <span
                      className={`font-semibold capitalize ${
                        event.status === "active"
                          ? "text-green-700"
                          : event.status === "completed"
                          ? "text-blue-700"
                          : event.status === "cancelled"
                          ? "text-red-700"
                          : "text-gray-700"
                      }`}
                    >
                      {event.status || "Active"}
                    </span>
                  </div>
                </div>

                {/* Participation Info */}
                {event.maxParticipants && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">👥</span>
                      </div>
                      Participation
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-600">Registered:</span>
                        <span className="text-purple-600">{event.registeredParticipants || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-600">Max capacity:</span>
                        <span className="text-purple-600">{event.maxParticipants}</span>
                      </div>
                      {event.maxParticipants > 0 && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                              style={{
                                width: `${Math.min(
                                  ((event.registeredParticipants || 0) /
                                    event.maxParticipants) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-purple-600 font-medium mt-2 text-center">
                            {Math.round(
                              ((event.registeredParticipants || 0) /
                                event.maxParticipants) *
                                100
                            )}% full
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Register Button - Only show if event is active and has space */}
                {event.status === "active" &&
                  (!event.maxParticipants ||
                    (event.registeredParticipants || 0) <
                      event.maxParticipants) && (
                    <button
                      className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-3 font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transform hover:scale-[1.02]"
                      onClick={() => {
                        // TODO: Implement registration logic
                        alert("Registration feature coming soon!");
                      }}
                    >
                      <User className="h-5 w-5" />
                      Register for Event
                    </button>
                  )}

                <button
                  onClick={openInGoogleMaps}
                  className={`${
                    event.status === "active" &&
                    (!event.maxParticipants ||
                      (event.registeredParticipants || 0) <
                        event.maxParticipants)
                      ? "flex-1 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 shadow-gray-500/25 hover:shadow-gray-500/40"
                      : "flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/25 hover:shadow-pink-500/40"
                  } text-white px-8 py-4 rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-3 font-semibold shadow-lg transform hover:scale-[1.02]`}
                >
                  <MapPin className="h-5 w-5" />
                  Get Directions
                </button>

                <button
                  onClick={addToCalendar}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-3 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
                >
                  <Calendar className="h-5 w-5" />
                  Add to Calendar
                </button>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="p-8 lg:p-10">
              {/* Review Header with Write Review Button */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    Event Reviews
                  </h2>
                  <p className="text-gray-600 text-lg">
                    💭 Share your experience and read what others have to say about
                    this event.
                  </p>
                </div>

                {/* Write Review Button */}
                {user && canUserReview() && !userReview && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transform hover:scale-[1.02]"
                  >
                    <Star className="h-5 w-5" />
                    Write Review
                  </button>
                )}

                {/* Edit Review Button */}
                {user && userReview && (
                  <button
                    onClick={() => handleEditReview(userReview)}
                    className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 transform hover:scale-[1.02]"
                  >
                    <Edit3 className="h-5 w-5" />
                    Edit Review
                  </button>
                )}
              </div>

              {/* Login Prompt for Non-Users */}
              {!user && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-2 text-lg">
                        Want to write a review?
                      </h3>
                      <p className="text-blue-800 mb-4 leading-relaxed">
                        Sign in to share your experience and help others make
                        informed decisions about this event.
                      </p>
                      <button
                        onClick={() => router.push("/auth/login")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Guidelines for Past Events */}
              {user && !canUserReview() && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2 text-lg">
                        Reviews Not Available Yet
                      </h3>
                      <p className="text-yellow-800 leading-relaxed">
                        Reviews can only be written for events that have already taken place.
                        Check back after the event to share your experience!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <ReviewList
                eventId={params.id}
                onEditReview={handleEditReview}
                onDeleteReview={handleDeleteReview}
                refreshTrigger={reviewRefreshTrigger}
              />
            </div>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            eventId={params.id}
            existingReview={editingReview}
            onSuccess={handleReviewSuccess}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            isOpen={showReviewForm}
          />
        )}

        {/* Event Metadata */}
        {(event.createdAt || event.updatedAt) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500 space-y-1">
              {event.createdAt && (
                <div>
                  Event created:{" "}
                  {new Date(event.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
              {event.updatedAt && event.updatedAt !== event.createdAt && (
                <div>
                  Last updated:{" "}
                  {new Date(event.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
              {event.id && (
                <div className="font-mono">Event ID: {event.id}</div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {/* <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            Important Information
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Please bring a valid ID and any relevant medical records</li>
            <li>• Arrive 15 minutes before your scheduled time</li>
            <li>• Wear comfortable, easy-to-remove clothing</li>
            <li>• Results will be available within 5-7 business days</li>
            <li>• This screening is free of charge</li>
          </ul>
        </div> */}
      </main>
    </div>
  );
}

// Mock event data for development/fallback
function getMockEvent(id) {
  const events = {
    1: {
      id: "1",
      title: "Free Breast Cancer Screening - Korle Bu Hospital",
      date: "2025-09-05T09:00:00Z",
      location: {
        address: "Korle Bu Teaching Hospital, P.O. Box 77, Korle Bu, Accra",
        coordinates: { lat: 5.5663, lng: -0.2267 },
      },
      organizer: "Ghana Health Service",
      description:
        "Join us for a comprehensive breast cancer screening program at Korle Bu Teaching Hospital. This free screening includes:\n\n• Clinical breast examination by qualified healthcare professionals\n• Mammography for women aged 40 and above\n• Ultrasound screening when necessary\n• Educational session on breast self-examination\n• Consultation with oncology specialists\n\nOur team of experienced medical professionals will be available to answer any questions you may have about breast health and cancer prevention.",
      contactPhone: "+233 30 202 5401",
      contactEmail: "screening@korlebu.gov.gh",
    },
    2: {
      id: "2",
      title: "Breast Health Awareness Program - University of Ghana",
      date: "2025-09-10T14:00:00Z",
      location: {
        address: "University of Ghana Medical Centre, Legon, Accra",
        coordinates: { lat: 5.6508, lng: -0.187 },
      },
      organizer: "UG Medical Centre",
      description:
        "The University of Ghana Medical Centre invites you to our Breast Health Awareness Program. This educational event focuses on prevention and early detection.\n\nProgram includes:\n• Educational presentations by medical experts\n• Free breast cancer screening\n• Q&A session with oncologists\n• Distribution of educational materials\n• Light refreshments\n\nThis program is open to all women aged 18 and above. Students and staff receive priority scheduling.",
      contactPhone: "+233 30 213 3150",
      contactEmail: "info@ugmc.ug.edu.gh",
    },
    3: {
      id: "3",
      title: "Community Screening Day - Ridge Hospital",
      date: "2025-09-15T08:00:00Z",
      location: {
        address: "Ridge Hospital, Asylum Down, Accra",
        coordinates: { lat: 5.5731, lng: -0.1969 },
      },
      organizer: "Ridge Hospital Foundation",
      description:
        "Ridge Hospital Foundation presents a community-wide breast cancer screening day. This walk-in event is designed to make screening accessible to everyone in the community.\n\nServices offered:\n• Walk-in screening (no appointment necessary)\n• Clinical breast examination\n• Mammography services\n• Health education sessions every hour\n• Referral services for follow-up care\n\nScreening is recommended for all women aged 40 and above, or younger women with family history of breast cancer.",
      contactPhone: "+233 30 222 3060",
      contactEmail: "foundation@ridgehospital.gov.gh",
    },
  };

  return events[id] || events["1"];
}
