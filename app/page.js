"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Calendar,
  Bell,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Shield,
  Users,
  BookOpen,
  MapPin,
} from "lucide-react";
import { apiService } from "../lib/api";
import { useStore } from "../lib/store";
import LoadingSpinner from "../components/LoadingSpinner";
import HeroSection from "../components/HeroSection";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentSymptoms: [],
    upcomingAppointments: [],
    activeReminders: [],
    healthAnalytics: null,
    tips: [],
  });

  const router = useRouter();
  const {
    user,
    isAuthenticated,
    healthProfile,
    symptoms,
    appointments,
    reminders,
    setSymptoms,
    setAppointments,
    setReminders,
    setHealthAnalytics,
  } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      // Check if user has completed their health profile
      if (healthProfile && !healthProfile.hasCompletedProfile) {
        router.push("/onboarding/health-profile");
        return;
      }
      fetchDashboardData();
    } else {
      // For non-authenticated users, show public dashboard
      setDashboardData((prev) => ({
        ...prev,
        tips: defaultTips.slice(0, 3),
      }));
      setLoading(false);
    }
    // Fetch dashboard data if authenticated
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Set default data first
        setDashboardData((prev) => ({
          ...prev,
          tips: defaultTips.slice(0, 3),
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set default data on error
        setDashboardData((prev) => ({
          ...prev,
          tips: defaultTips.slice(0, 3),
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, healthProfile, router]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Show for ALL users */}
      <HeroSection />
    </div>
  );
}

// Default tips in case API is unavailable
const defaultTips = [
  {
    id: 1,
    title: "Monthly Self-Examination",
    content:
      "Perform monthly breast self-exams to become familiar with how your breasts normally look and feel. The best time is 3-5 days after your period ends.",
    action: "Set a monthly reminder on your phone",
    icon: "heart",
  },
  {
    id: 2,
    title: "Know the Warning Signs",
    content:
      "Look for lumps, changes in breast size or shape, skin dimpling, nipple discharge, or any unusual changes. Early detection is key.",
    action: "Report any changes to your healthcare provider immediately",
    icon: "shield",
  },
  {
    id: 3,
    title: "Annual Mammograms",
    content:
      "Women aged 40+ should get annual mammograms. Those with family history may need to start earlier. Discuss your risk factors with your doctor.",
    action: "Schedule your mammogram appointment today",
    icon: "users",
  },
  {
    id: 4,
    title: "Maintain a Healthy Lifestyle",
    content:
      "Regular exercise, maintaining a healthy weight, limiting alcohol, and avoiding smoking can help reduce breast cancer risk.",
    action: "Aim for 150 minutes of moderate exercise per week",
    icon: "heart",
  },
  {
    id: 5,
    title: "Know Your Family History",
    content:
      "About 5-10% of breast cancers are hereditary. Share your family history with your healthcare provider to assess your risk level.",
    action: "Create a family health tree",
    icon: "users",
  },
];
