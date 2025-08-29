"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { apiService } from "../../../lib/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

export default function EventDetailPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
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
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={shareEvent}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={toggleSaveEvent}
                className={`p-2 rounded-lg ${
                  isSaved
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Event Image */}
          {event.image?.url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={event.image.url}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Image Caption */}
              <div className="absolute bottom-4 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-600">
                    Event Image • Uploaded {new Date(event.image.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(event.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(event.date)}
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                {event.organizerId && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Organized by</div>
                      <div className="font-medium text-gray-900">
                        {event.organizerId.name}
                      </div>
                      {event.organizerId.email && (
                        <div className="text-sm text-gray-500">
                          {event.organizerId.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">
                    {event.location?.address || "Address not specified"}
                  </div>
                  {event.location?.region && (
                    <div className="text-sm text-gray-600 mb-2">
                      {event.location.region} Region
                    </div>
                  )}
                  <button
                    onClick={openInGoogleMaps}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Details
            </h2>

            {event.description ? (
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-700 mb-6">
                Join us for this important breast cancer screening event. Early
                detection saves lives.
              </p>
            )}

            {/* Contact Information */}
            {(event.contactInfo?.phone || event.contactInfo?.email) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {event.contactInfo?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${event.contactInfo.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {event.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {event.contactInfo?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a
                        href={`mailto:${event.contactInfo.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {event.contactInfo.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Status and Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Event Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Event Status</h4>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.status === "active"
                        ? "bg-green-500"
                        : event.status === "completed"
                        ? "bg-blue-500"
                        : event.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium capitalize ${
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Participation
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>{event.registeredParticipants || 0} registered</div>
                    <div>Max capacity: {event.maxParticipants}</div>
                    {event.maxParticipants > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-pink-600 h-2 rounded-full"
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
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(
                            ((event.registeredParticipants || 0) /
                              event.maxParticipants) *
                              100
                          )}
                          % full
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
                    className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center justify-center gap-2 font-medium"
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
                    (event.registeredParticipants || 0) < event.maxParticipants)
                    ? "flex-1 bg-gray-600 hover:bg-gray-700"
                    : "flex-1 bg-pink-600 hover:bg-pink-700"
                } text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2`}
              >
                <MapPin className="h-5 w-5" />
                Get Directions
              </button>

              <button
                onClick={addToCalendar}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Add to Calendar
              </button>
            </div>
          </div>
        </div>

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
