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
  }, [isAuthenticated, healthProfile, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        symptomsResponse,
        appointmentsResponse,
        remindersResponse,
        analyticsResponse,
        tipsResponse,
      ] = await Promise.allSettled([
        apiService.getSymptomHistory({ limit: 5 }),
        apiService.getMyAppointments({ limit: 5, status: "pending" }),
        apiService.getReminders({ limit: 5, isCompleted: false }),
        apiService.getHealthAnalytics(),
        apiService.getTips({ limit: 3, priority: "high" }),
      ]);

      // Update store and local state
      if (symptomsResponse.status === "fulfilled") {
        console.log(
          "Dashboard symptoms API response:",
          symptomsResponse.value.data
        );
        const symptomsData =
          symptomsResponse.value.data?.data ||
          symptomsResponse.value.data?.symptoms ||
          [];
        console.log("Dashboard extracted symptoms:", symptomsData);
        setSymptoms(symptomsData);
        setDashboardData((prev) => ({
          ...prev,
          recentSymptoms: symptomsData.slice(0, 3),
        }));
        console.log("Dashboard recent symptoms set:", symptomsData.slice(0, 3));
      }

      if (appointmentsResponse.status === "fulfilled") {
        const appointmentsData =
          appointmentsResponse.value.data?.appointments || [];
        setAppointments(appointmentsData);
        setDashboardData((prev) => ({
          ...prev,
          upcomingAppointments: appointmentsData.slice(0, 3),
        }));
      }

      if (remindersResponse.status === "fulfilled") {
        const remindersData = remindersResponse.value.data?.reminders || [];
        setReminders(remindersData);
        setDashboardData((prev) => ({
          ...prev,
          activeReminders: remindersData.slice(0, 3),
        }));
      }

      if (analyticsResponse.status === "fulfilled") {
        const analyticsData = analyticsResponse.value.data;
        setHealthAnalytics(analyticsData);
        setDashboardData((prev) => ({
          ...prev,
          healthAnalytics: analyticsData,
        }));
      }

      if (tipsResponse.status === "fulfilled") {
        const tipsData =
          tipsResponse.value.data?.tips || defaultTips.slice(0, 3);
        setDashboardData((prev) => ({ ...prev, tips: tipsData }));
      } else {
        setDashboardData((prev) => ({
          ...prev,
          tips: defaultTips.slice(0, 3),
        }));
      }
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Show for ALL users */}
      <HeroSection />

      {isAuthenticated && (
        // Dashboard for authenticated users - seamless flow with hero
        <div className="relative bg-gradient-to-b from-transparent via-gray-50/50 to-gray-50">
          {/* Welcome Section - flows from hero */}
          <div className="relative bg-gradient-to-b from-pink-50/30 via-white/80 to-white py-16 overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 right-1/4 w-32 h-32 bg-pink-200/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-purple-200/10 rounded-full blur-xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {`${getGreeting()}, ${user?.name?.split(" ")[0]}! 🌸`}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Welcome back to your personalized health dashboard. Let&apos;s
                  continue your wellness journey together.
                </p>
              </div>

              {/* Health Status Overview Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Health Status
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Good
                  </h3>
                  <p className="text-sm text-gray-600">Last updated today</p>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Next Checkup
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    In 2 weeks
                  </h3>
                  <p className="text-sm text-gray-600">Annual screening due</p>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Health Score
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">85%</h3>
                  <p className="text-sm text-green-600 font-medium">
                    ↗ Improving
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <button
                  onClick={() => router.push("/symptoms/log")}
                  className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                      Log Symptom
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/events")}
                  className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      Book Screening
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/notifications/reminders/create")}
                  className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">
                      Set Reminder
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/health/analytics")}
                  className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                      View Analytics
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Health Insights Section */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/30 to-purple-100/20 rounded-full blur-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Health Insights
                          </h2>
                          <p className="text-sm text-gray-600">
                            Your personalized health overview
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Last updated
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Today, 2:30 PM
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="group text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {dashboardData.healthAnalytics?.riskLevel || "Low"}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Risk Level
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Excellent progress
                        </div>
                      </div>

                      <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Heart
                            className="h-8 w-8 text-white"
                            fill="currentColor"
                          />
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {dashboardData.healthAnalytics?.healthScore || "85"}%
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Health Score
                        </div>
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          ↗ +5% this month
                        </div>
                      </div>

                      <div className="group text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Activity className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {symptoms.length || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Symptoms Tracked
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          This month
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Health Journey - More engaging approach */}
                <div className="relative bg-gradient-to-br from-pink-50/50 via-white to-purple-50/30 rounded-3xl shadow-xl border border-gray-200/50 p-8 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-100/30 to-purple-100/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-indigo-100/15 rounded-full blur-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart
                          className="h-8 w-8 text-white"
                          fill="currentColor"
                        />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          Your Health Journey
                        </h2>
                        <p className="text-gray-600">
                          Track your progress and stay on top of your wellness
                          goals
                        </p>
                      </div>
                    </div>

                    {/* Journey Progress */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Recent Activity */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            Recent Activity
                          </h3>
                          <button
                            onClick={() => router.push("/symptoms")}
                            className="text-pink-600 hover:text-pink-500 text-sm font-medium flex items-center gap-1"
                          >
                            View All <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>

                        {dashboardData.recentSymptoms.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.recentSymptoms.map(
                              (symptom, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50/50 to-purple-50/30 rounded-xl"
                                >
                                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {symptom.symptoms?.[0]?.type?.replace(
                                        "_",
                                        " "
                                      ) || "Symptom"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(symptom.createdAt)}
                                    </p>
                                  </div>
                                  <div className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-lg">
                                    {symptom.symptoms?.[0]?.severity || "N/A"}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Activity className="h-8 w-8 text-pink-500" />
                            </div>
                            <p className="text-gray-600 mb-4">
                              Start tracking your symptoms
                            </p>
                            <button
                              onClick={() => router.push("/symptoms/log")}
                              className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                            >
                              Log First Symptom
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Wellness Tips */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          Today&apos;s Wellness Tip
                        </h3>
                        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">
                                Monthly Self-Examination
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Perform monthly breast self-exams to become
                                familiar with how your breasts normally look and
                                feel.
                              </p>
                              <button
                                onClick={() => router.push("/self-exam-guide")}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                              >
                                Learn More <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Health Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => router.push("/symptoms/log")}
                        className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Log Symptoms
                        </p>
                      </button>

                      <button
                        onClick={() => router.push("/appointments")}
                        className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Schedule
                        </p>
                      </button>

                      <button
                        onClick={() => router.push("/health/analytics")}
                        className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Analytics
                        </p>
                      </button>

                      <button
                        onClick={() => router.push("/events")}
                        className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Find Events
                        </p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personalized Health Companion */}
                <div className="relative bg-gradient-to-br from-purple-50/50 via-white to-blue-50/30 rounded-3xl shadow-xl border border-gray-200/50 p-8 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/20 to-rose-100/15 rounded-full blur-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          Your Health Companion
                        </h2>
                        <p className="text-gray-600">
                          Personalized guidance and support for your wellness
                          journey
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Health Image & Motivation */}
                      <div className="relative">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                          <div className="relative mb-6">
                            <img
                              src="/images/hero/hero1.png"
                              alt="Women's health consultation"
                              className="w-full h-48 object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Take Control of Your Health
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Join thousands of women who are proactively managing
                            their health with our comprehensive tracking and
                            guidance system.
                          </p>
                          <div className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                            <Heart className="h-4 w-4" fill="currentColor" />
                            <span>Trusted by 10,000+ women</span>
                          </div>
                        </div>
                      </div>

                      {/* Health Insights */}
                      <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                Early Detection
                              </h3>
                              <p className="text-sm text-gray-600">
                                Track symptoms and patterns
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Our intelligent tracking system helps you monitor
                            changes and provides personalized insights for early
                            detection.
                          </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                              <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                Health Analytics
                              </h3>
                              <p className="text-sm text-gray-600">
                                Personalized health insights
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get detailed analytics and trends about your health
                            data with actionable recommendations.
                          </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                Smart Reminders
                              </h3>
                              <p className="text-sm text-gray-600">
                                Never miss important checkups
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Automated reminders for self-exams, appointments,
                            and health screenings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Wellness Hub */}
              <div className="space-y-8">
                {/* Wellness Hub */}
                <div className="relative bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 rounded-3xl shadow-xl border border-gray-200/50 p-6 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/30 to-emerald-100/20 rounded-full blur-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Wellness Hub
                        </h2>
                        <p className="text-sm text-gray-600">
                          Stay on track with your health goals
                        </p>
                      </div>
                    </div>

                    {isAuthenticated &&
                    dashboardData.activeReminders.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Active Reminders
                        </h3>
                        {dashboardData.activeReminders.map(
                          (reminder, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {reminder.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Due: {formatDate(reminder.dueDate)}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          All caught up!
                        </p>
                        <p className="text-sm text-gray-500">
                          No pending reminders
                        </p>
                      </div>
                    )}

                    {/* Quick Health Tips */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm">
                        💡 Quick Tip
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Did you know? Regular self-examinations can help detect
                        changes early. Set a monthly reminder to perform your
                        self-exam.
                      </p>
                      <button
                        onClick={() => router.push("/self-exam-guide")}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                      >
                        Learn How <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Get Started section for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Get Started Today
                      </h2>
                      <Shield className="h-5 w-5 text-pink-500" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-pink-50 rounded-lg">
                        <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-pink-600">
                            1
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Create Your Account
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Quick and secure registration
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">
                            2
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Complete Health Profile
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Personalized risk assessment
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-green-600">
                            3
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Start Tracking
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Log symptoms and set reminders
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => router.push("/auth/register")}
                        className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                      >
                        Start Free Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Health Tips */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Health Tips
                    </h2>
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    {dashboardData.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          {tip.content}
                        </p>
                        {tip.action && (
                          <p className="text-xs text-pink-600 font-medium">
                            💡 {tip.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        // Landing page content for non-authenticated users
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-pink-50/30 py-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-32 h-32 bg-pink-200/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200/15 rounded-full blur-xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Health Tips Section */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Essential Health Tips
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Expert guidance for your wellness journey. Start your health
                transformation today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {defaultTips.slice(0, 3).map((tip, index) => {
                const icons = [
                  {
                    icon: Heart,
                    color: "from-pink-500 to-rose-500",
                    bgHover: "from-pink-50/50 to-rose-50/30",
                  },
                  {
                    icon: Shield,
                    color: "from-blue-500 to-indigo-500",
                    bgHover: "from-blue-50/50 to-indigo-50/30",
                  },
                  {
                    icon: Users,
                    color: "from-purple-500 to-violet-500",
                    bgHover: "from-purple-50/50 to-violet-50/30",
                  },
                ];
                const IconComponent = icons[index]?.icon || Heart;
                const iconColor =
                  icons[index]?.color || "from-pink-500 to-rose-500";
                const bgHover =
                  icons[index]?.bgHover || "from-pink-50/50 to-rose-50/30";

                return (
                  <div
                    key={index}
                    className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/60 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden"
                  >
                    {/* Animated background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${bgHover} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                    ></div>

                    {/* Floating decorative elements */}
                    <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-pink-200/20 to-purple-200/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-200/15 to-indigo-200/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10">
                      {/* Enhanced icon with number badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className={`w-18 h-18 bg-gradient-to-r ${iconColor} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}
                        >
                          <IconComponent
                            className="h-9 w-9 text-white"
                            fill="currentColor"
                          />
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-sm font-bold text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors duration-300">
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed text-base">
                        {tip.content}
                      </p>

                      {tip.action && (
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50/80 to-purple-50/60 rounded-xl border border-pink-100/50 group-hover:border-pink-200 transition-colors duration-300">
                          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">💡</span>
                          </div>
                          <p className="text-sm text-pink-800 font-semibold leading-relaxed">
                            {tip.action}
                          </p>
                        </div>
                      )}

                      {/* Progress indicator */}
                      <div className="mt-6 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${iconColor} rounded-full transition-all duration-1000 group-hover:w-full`}
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Take Control of Your Health?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of women who are already on their journey to
                  better health.
                </p>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Get Started Free</span>
                  <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
