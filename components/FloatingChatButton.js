'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Heart, Bot, User } from 'lucide-react';

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();

  const handleMainClick = () => {
    router.push('/chat');
  };

  const handleAIChat = () => {
    router.push('/chat?mode=ai');
  };

  const handleProfessionalChat = () => {
    router.push('/chat?mode=professional');
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className="fixed bottom-6 right-6 z-40"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <button
          onClick={handleMainClick}
          className="relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transform hover:scale-110 active:scale-95"
        >
          {/* Main Icon */}
          <div className="flex items-center justify-center w-full h-full text-white">
            <MessageCircle className="w-7 h-7" />
          </div>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-ping opacity-20"></div>

          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
        </button>

        {/* Quick Action Buttons (when hovered) */}
        {showOptions && (
          <div className="absolute bottom-full right-0 mb-4 flex flex-col space-y-3 animate-fade-in">
            <button
              onClick={handleAIChat}
              className="w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group relative"
            >
              <Bot className="w-6 h-6" />
              <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
                AI Assistant
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900"></div>
              </div>
            </button>
            
            <button
              onClick={handleProfessionalChat}
              className="w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group relative"
            >
              <User className="w-6 h-6" />
              <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
                Health Professional
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900"></div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FloatingChatButton;
