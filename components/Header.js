"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  Calendar,
  User,
  Home,
  Bell,
  Settings,
  Search,
  Activity,
  LogIn,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../lib/store";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, notifications, logout } = useStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simplified navigation structure
  const navigationLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/symptoms", label: "Symptoms", icon: Activity },
    { href: "/appointments", label: "Appointments", icon: Stethoscope },
    { href: "/events", label: "Events", icon: Calendar },
    // { href: "/map", label: "Find Centers", icon: MapPin },
  ];


  // Get unread notifications count
  const unreadNotifications = notifications?.filter(n => !n.isRead)?.length || 0;

  const isActive = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const handleNavigation = (href) => {
    router.push(href);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    // Close the user menu first
    setShowUserMenu(false);
    
    // Call logout from store (this clears all data)
    logout();
    
    // Navigate to home page
    router.push("/");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg border-b border-gray-200/50"
            : "bg-gradient-to-br from-pink-50 via-white to-purple-50 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigation("/")}
                className="hover:scale-105 transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500/20 rounded-lg p-1"
              >
                <Logo size="medium" showText={true} />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? "text-pink-600 bg-gradient-to-r from-pink-50 to-pink-100/50 shadow-sm"
                        : "text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 hover:scale-105"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${!active ? 'group-hover:scale-110' : ''}`} />
                    <span className="relative">{link.label}</span>
                    {!active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-400 group-hover:w-full transition-all duration-300"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                      {/* Search Icon */}
                      <button
                        onClick={() => handleNavigation("/search")}
                        className="group p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        title="Search"
                      >
                        <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => handleNavigation("/notifications")}
                    className="group relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-red-400 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="group flex items-center gap-2 p-1 text-gray-600 hover:text-pink-600 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <span className="text-white text-sm font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 hidden sm:block transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''} group-hover:scale-110`} />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={() => handleNavigation("/profile")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </button>
                          <button
                            onClick={() => handleNavigation("/notifications")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Bell className="h-4 w-4" />
                            Notifications
                            {unreadNotifications > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {unreadNotifications}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleNavigation("/profile")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </button>
                        </div>
                        
                        <div className="pt-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                        <>
                          {/* Auth Button */}
                          <button
                            onClick={() => handleNavigation("/auth/login")}
                            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-pink-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          >
                            <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            Sign In
                          </button>
                        </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="group lg:hidden p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 ml-2 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

                  {/* Menu Panel */}
                  <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-200/50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Logo size="small" showText={true} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info for Authenticated Users */}
            {isAuthenticated && user && (
              <div className="p-4 bg-pink-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4">
              <div className="space-y-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleNavigation(link.href)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive(link.href)
                          ? "text-pink-600 bg-pink-50"
                          : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Additional Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation("/search")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>

                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => handleNavigation("/notifications")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                        {unreadNotifications > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handleNavigation("/profile")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation("/auth/login")}
                        className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
