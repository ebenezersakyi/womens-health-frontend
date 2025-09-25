'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Heart, MessageCircle, Phone, Video, Calendar, Languages, Volume2, Mic, Type, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceAI from './VoiceAI';
import ImmersiveVoiceAI from './ImmersiveVoiceAI';

const ChatInterface = ({ isOpen, onClose }) => {
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
  const [chatMode, setChatMode] = useState('ai'); // 'ai' or 'professional'
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
            // Find the VoiceAI component and trigger TTS
            const voiceAIElement = document.querySelector('.voice-ai-controls');
            if (voiceAIElement) {
              // This will be handled by the VoiceAI component
              playResponseTTS(data.response, data.language || 'tw');
            }
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

  const switchToProfessional = () => {
    setChatMode('professional');
    const switchMessage = {
      id: Date.now(),
      content: "You've switched to professional chat mode. A qualified health professional will assist you with your concerns. Please note that response times may vary.",
      sender: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  const switchToAI = () => {
    setChatMode('ai');
    const switchMessage = {
      id: Date.now(),
      content: "Welcome back! I'm Pinky Trust AI, ready to help with your women's health questions. How can I assist you today? 💕",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {chatMode === 'ai' ? (
                <Bot className="w-6 h-6" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {chatMode === 'ai' ? 'Pinky Trust AI' : 'Health Professional'}
              </h3>
              <p className="text-sm text-pink-100">
                {chatMode === 'ai' ? (voiceMode ? 'Voice Assistant (Akan)' : 'Women\'s Health Assistant') : 'Connect with an expert'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Enhanced Voice Mode Toggle */}
            {chatMode === 'ai' && (
              <motion.div 
                className="relative"
                initial={false}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <motion.button
                  onClick={() => {
                    console.log('Toggle clicked, current voiceMode:', voiceMode);
                    setVoiceMode(!voiceMode);
                  }}
                  className={`relative flex items-center space-x-3 px-5 py-2.5 rounded-full transition-all duration-500 overflow-hidden ${
                    voiceMode 
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/40' 
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20'
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
                      className="font-semibold text-sm"
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
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
                
                {/* Enhanced glow effect */}
                <AnimatePresence>
                  {voiceMode && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl"
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
            
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Mode Toggle */}
        <div className="bg-gray-50 p-3 border-b">
          <div className="flex space-x-2">
            <button
              onClick={switchToAI}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                chatMode === 'ai'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={switchToProfessional}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                chatMode === 'professional'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Professional</span>
            </button>
          </div>
        </div>

        {/* Professional Options (when in professional mode) */}
        {chatMode === 'professional' && (
          <div className="bg-purple-50 p-3 border-b">
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center p-2 rounded-lg bg-white hover:bg-purple-100 transition-colors">
                <MessageCircle className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs text-purple-700">Chat</span>
              </button>
              <button className="flex flex-col items-center p-2 rounded-lg bg-white hover:bg-purple-100 transition-colors">
                <Phone className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs text-purple-700">Call</span>
              </button>
              <button className="flex flex-col items-center p-2 rounded-lg bg-white hover:bg-purple-100 transition-colors">
                <Video className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs text-purple-700">Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-pink-500 text-white'
                    : message.sender === 'ai'
                    ? 'bg-gray-100 text-gray-800'
                    : message.sender === 'professional'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {message.sender !== 'user' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.sender === 'ai' ? 'bg-pink-200' : 
                      message.sender === 'professional' ? 'bg-purple-200' : 'bg-blue-200'
                    }`}>
                      {message.sender === 'ai' ? (
                        <Bot className="w-4 h-4 text-pink-600" />
                      ) : message.sender === 'professional' ? (
                        <User className="w-4 h-4 text-purple-600" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {message.sender === 'ai' ? 'Pinky Trust AI' : 
                       message.sender === 'professional' ? 'Health Professional' : 'System'}
                    </span>
                  </div>
                )}
                {message.sender === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-pink prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-li:text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-gray-50">
          <AnimatePresence mode="wait" initial={false}>
            {voiceMode && chatMode === 'ai' ? (
              /* Immersive Voice Mode */
              <motion.div
                key="voice-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                {/* Language Selector */}
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Language:</span>
                    <motion.select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-4"
              >
                <div className="flex space-x-3">
                  <motion.input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      chatMode === 'ai' 
                        ? "Ask me about women's health..." 
                        : "Describe your concern..."
                    }
                    className="flex-1 border-2 border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
