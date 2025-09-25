'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Heart, MessageCircle, Phone, Video, Calendar, ArrowLeft, Shield, Clock, Star, Languages, Volume2, Mic, Type, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceAI from '../../components/VoiceAI';
import ImmersiveVoiceAI from '../../components/ImmersiveVoiceAI';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') || null;
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi there! I'm Pinky Trust AI, your personal women's health companion. I'm here to help you with any questions about menstrual health, pregnancy, reproductive health, and more. How can I support you today? 💕",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState(initialMode || 'ai');
  const [showModeSelection, setShowModeSelection] = useState(!initialMode);
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('tw'); // Default to Twi
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!showModeSelection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModeSelection]);

  // Initialize messages based on mode when component mounts
  useEffect(() => {
    if (initialMode === 'professional') {
      setMessages([
        {
          id: 1,
          content: "Welcome to professional consultation! You'll be connected with a qualified health professional. Please describe your concern in detail so we can match you with the right specialist.",
          sender: 'system',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMode]);

  const handleVoiceTranscription = (transcribedText, language) => {
    setInputMessage(transcribedText);
    setSelectedLanguage(language);
    // Automatically send the transcribed message
    sendMessage(transcribedText, true, language);
  };

  const handleTTSAudio = (audioUrl) => {
    // Audio is already playing through the VoiceAI component
    console.log('TTS audio ready:', audioUrl);
  };

  const playResponseTTS = async (text, language = 'tw') => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.audioChunks && data.audioChunks.length > 0) {
          // Combine and play audio chunks
          const audioBuffers = data.audioChunks.map(chunk => {
            const binaryString = atob(chunk);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
          });

          const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
          const combinedBuffer = new Uint8Array(totalLength);
          
          let offset = 0;
          audioBuffers.forEach(buffer => {
            combinedBuffer.set(buffer, offset);
            offset += buffer.length;
          });

          const audioBlob = new Blob([combinedBuffer], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Error playing response TTS:', error);
    }
  };

  const sendMessage = async (messageText = null, isVoiceInput = false, language = 'en') => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: messageToSend,
      sender: 'user',
      timestamp: new Date(),
      isVoiceInput,
      language: isVoiceInput ? language : 'en'
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage(''); // Only clear input if not from voice
    setIsLoading(true);

    if (chatMode === 'ai') {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageToSend,
            conversationHistory: messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            isAkanInput: isVoiceInput && language === 'tw',
            language: isVoiceInput ? language : 'en'
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const aiMessage = {
          id: Date.now() + 1,
          content: data.response,
          sender: 'ai',
          timestamp: new Date(),
          isRelevant: data.isRelevant,
          isAkanResponse: data.isAkanInput,
          language: data.language,
          canPlayTTS: voiceMode && data.isAkanInput
        };

        setMessages(prev => [...prev, aiMessage]);

        // Auto-play TTS if in voice mode and response is in Akan
        if (voiceMode && data.isAkanInput && data.response) {
          setTimeout(() => {
            playResponseTTS(data.response, data.language || 'tw');
          }, 500);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: Date.now() + 1,
          content: "I'm sorry, I encountered an issue. Please try again or consider chatting with a health professional.",
          sender: 'ai',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Professional chat mode - simulate connection
      const professionalMessage = {
        id: Date.now() + 1,
        content: "Thank you for reaching out. A health professional will be with you shortly. In the meantime, please provide some details about your concern so we can connect you with the right specialist.",
        sender: 'professional',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, professionalMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectMode = (mode) => {
    setChatMode(mode);
    setShowModeSelection(false);
    
    if (mode === 'professional') {
      const welcomeMessage = {
        id: Date.now(),
        content: "Welcome to professional consultation! You'll be connected with a qualified health professional. Please describe your concern in detail so we can match you with the right specialist.",
        sender: 'system',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const goBack = () => {
    setShowModeSelection(true);
    setMessages([
      {
        id: 1,
        content: "Hi there! I'm Pinky Trust AI, your personal women's health companion. I'm here to help you with any questions about menstrual health, pregnancy, reproductive health, and more. How can I support you today? 💕",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  if (showModeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Women&apos;s Health Support</h1>
                <p className="text-gray-600">Choose how you&apos;d like to get help today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Assistant Option */}
            <div 
              onClick={() => selectMode('ai')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-200 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Pinky Trust AI</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant answers to your women&apos;s health questions from our AI assistant, available 24/7. 
                  Perfect for general inquiries, health tips, and guidance.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-green-500 mr-2" />
                    <span>Instant responses</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span>Privacy focused</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-green-500 mr-2" />
                    <span>Women&apos;s health specialized</span>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-pink-800">
                    <strong>Great for:</strong> Menstrual health, pregnancy questions, general wellness, 
                    reproductive health, and educational content.
                  </p>
                </div>

                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200">
                  Chat with AI Assistant
                </button>
              </div>
            </div>

            {/* Professional Consultation Option */}
            <div 
              onClick={() => selectMode('professional')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Professional</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with qualified healthcare professionals for personalized advice, 
                  diagnosis, and treatment recommendations.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-green-500 mr-2" />
                    <span>Certified professionals</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span>Confidential consultations</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-green-500 mr-2" />
                    <span>Flexible scheduling</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-purple-800">
                    <strong>Great for:</strong> Medical concerns, diagnosis needs, treatment plans, 
                    prescription guidance, and complex health issues.
                  </p>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200">
                    Connect with Professional
                  </button>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <span className="text-gray-600">Chat</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <Phone className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <span className="text-gray-600">Call</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <Video className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <span className="text-gray-600">Video</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Privacy Matters</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              All conversations are encrypted and confidential. Our AI assistant follows strict privacy guidelines, 
              and our healthcare professionals are bound by medical confidentiality. Your health information is 
              never shared without your explicit consent.
            </p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  chatMode === 'ai' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}>
                  {chatMode === 'ai' ? (
                    <Bot className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900">
                    {chatMode === 'ai' ? 'Pinky Trust AI' : 'Health Professional'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {chatMode === 'ai' ? (voiceMode ? 'Voice Assistant (Akan)' : 'Women&apos;s Health Assistant') : 'Professional Consultation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Enhanced Voice Mode Toggle */}
              {chatMode === 'ai' && (
                <motion.div 
                  className="relative"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.button
                    onClick={() => {
                      console.log('Full page toggle clicked, current voiceMode:', voiceMode);
                      setVoiceMode(!voiceMode);
                    }}
                    className={`relative flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-500 overflow-hidden ${
                      voiceMode 
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/40' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg border border-gray-200'
                    }`}
                    title={voiceMode ? 'Switch to text mode' : 'Switch to voice mode (Akan)'}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Background sliding effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                      initial={false}
                      animate={{
                        x: voiceMode ? "0%" : "100%",
                        opacity: voiceMode ? 1 : 0
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 flex items-center space-x-3">
                      <motion.div
                        key={voiceMode ? 'voice' : 'text'}
                        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {voiceMode ? (
                          <Mic className="w-5 h-5" />
                        ) : (
                          <Type className="w-5 h-5" />
                        )}
                      </motion.div>
                      
                      <motion.span 
                        className="font-semibold"
                        key={voiceMode ? 'voice-text' : 'text-text'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {voiceMode ? 'Voice Mode' : 'Text Mode'}
                      </motion.span>
                      
                      {/* Pulsing indicator for voice mode */}
                      <AnimatePresence>
                        {voiceMode && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-3 h-3 bg-white rounded-full"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                  
                  {/* Enhanced glow effect */}
                  <AnimatePresence>
                    {voiceMode && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-xl"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                          opacity: [0.2, 0.4, 0.2],
                          scale: [1.2, 1.4, 1.2]
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              
              {chatMode === 'professional' && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative z-10 pb-32">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`max-w-[70%] ${
                  message.sender === 'user' ? 'order-2' : 'order-1'
                }`}>
                  {message.sender !== 'user' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'ai' ? 'bg-pink-100' : 
                        message.sender === 'professional' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {message.sender === 'ai' ? (
                          <Bot className="w-5 h-5 text-pink-600" />
                        ) : message.sender === 'professional' ? (
                          <User className="w-5 h-5 text-purple-600" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {message.sender === 'ai' ? 'Pinky Trust AI' : 
                         message.sender === 'professional' ? 'Health Professional' : 'System'}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl p-6 shadow-lg backdrop-blur-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-200'
                        : message.sender === 'ai'
                        ? 'bg-white/90 border border-gray-200/50 text-gray-800 shadow-gray-200'
                        : message.sender === 'professional'
                        ? 'bg-purple-50/90 border border-purple-200/50 text-purple-800 shadow-purple-200'
                        : 'bg-blue-50/90 border border-blue-200/50 text-blue-800 shadow-blue-200'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-pink prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-li:text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 max-w-[70%] shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Pinky Trust AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait" initial={false}>
            {voiceMode && chatMode === 'ai' ? (
              /* Immersive Voice Mode */
              <motion.div
                key="voice-mode"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="space-y-6"
              >
                {/* Language Selector */}
                <div className="text-center">
                  <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-700">Language:</span>
                    <motion.select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-transparent border-none text-sm font-medium text-gray-800 focus:outline-none"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="tw">🇬🇭 Twi</option>
                      <option value="gaa">🇬🇭 Ga</option>
                      <option value="dag">🇬🇭 Dagbani</option>
                      <option value="yo">🇳🇬 Yoruba</option>
                      <option value="ee">🇬🇭 Ewe</option>
                      <option value="ki">🇰🇪 Kikuyu</option>
                    </motion.select>
                  </div>
                </div>

                {/* Immersive Voice Interface */}
                <ImmersiveVoiceAI
                  onTranscription={handleVoiceTranscription}
                  onTTSAudio={handleTTSAudio}
                  language={selectedLanguage}
                  disabled={isLoading}
                  isActive={voiceMode}
                />
              </motion.div>
            ) : (
              /* Traditional Text Mode */
              <motion.div
                key="text-mode"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <motion.input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        chatMode === 'ai' 
                          ? "Ask me about women&apos;s health..." 
                          : "Describe your concern in detail..."
                      }
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-0 focus:border-pink-400 text-gray-700 bg-white/90 backdrop-blur-sm shadow-lg placeholder-gray-400 transition-all duration-200"
                      disabled={isLoading}
                      whileFocus={{ scale: 1.01 }}
                    />
                    <AnimatePresence>
                      {inputMessage.trim() && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl px-8 py-4 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Send</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick suggestions for AI mode */}
          {chatMode === 'ai' && messages.length === 1 && !inputMessage && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("What are the early signs of pregnancy?")}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm hover:bg-pink-200 transition-colors"
              >
                Early pregnancy signs
              </button>
              <button
                onClick={() => setInputMessage("How can I manage menstrual cramps?")}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Menstrual cramps
              </button>
              <button
                onClick={() => setInputMessage("Tell me about breast self-exams")}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm hover:bg-pink-200 transition-colors"
              >
                Breast health
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
