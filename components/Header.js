"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  X,
  MapPin,
  Calendar,
  User,
  Home,
  Bell,
  Settings,
} from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Find Centers", icon: MapPin },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const handleNavigation = (href) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`bg-white sticky top-0 z-50 transition-all duration-300 h-[10vh] ${
          isScrolled
            ? "shadow-sm border-b border-gray-200"
            : "border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo Section */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigation("/")}
                className="hover:opacity-80 transition-opacity"
              >
                <Logo size="medium" showText={true} />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {/* Notification dot */}
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleNavigation("/profile")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* CTA Button */}
              <button
                onClick={() => handleNavigation("/profile")}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium hidden sm:flex items-center gap-2 shadow-sm"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-xl">
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

              {/* Mobile CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <User className="h-5 w-5" />
                  Sign In
                </button>
              </div>

              {/* Mobile Actions */}
              <div className="mt-4 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    2
                  </span>
                </button>

                <button
                  onClick={() => handleNavigation("/profile")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Supporting Women&apos;s Health
                </p>
                <div className="flex justify-center items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-500" />
                  <span className="text-xs text-gray-400">Made with care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
