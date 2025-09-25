'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, Waveform, Radio, Zap } from 'lucide-react';

const ImmersiveVoiceAI = ({ onTranscription, onTTSAudio, language = 'tw', disabled = false, isActive = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showReplayControls, setShowReplayControls] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioRef = useRef(null);
  const replayAudioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingStartTime = useRef(null);
  const durationIntervalRef = useRef(null);

  // Initialize audio context for level monitoring
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initAudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio.url);
      }
    };
  }, [recordedAudio]);

  // Monitor audio levels during recording
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setRecordedAudio(null);
      setShowReplayControls(false);
      setRecordingDuration(0);
      setProcessingStage('');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const options = mimeType ? { mimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleRecordingStop;

      recordingStartTime.current = Date.now();
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      
      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTime.current) {
          const duration = (Date.now() - recordingStartTime.current) / 1000;
          setRecordingDuration(duration);
        }
      }, 100);

      monitorAudioLevel();
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioLevel(0);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded');
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });

      if (recordingDuration < 0.5) {
        setError('Recording too short. Please record for at least 0.5 seconds.');
        return;
      }

      if (audioBlob.size < 1000) {
        setError('Recording file too small. Please try again.');
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudio({ blob: audioBlob, url: audioUrl });
      setShowReplayControls(true);
      setError(null);

    } catch (error) {
      console.error('Error processing recording:', error);
      setError('Failed to process recording');
    }
  };

  const replayAudio = () => {
    if (recordedAudio && replayAudioRef.current) {
      replayAudioRef.current.src = recordedAudio.url;
      replayAudioRef.current.play();
    }
  };

  const sendForTranscription = async () => {
    if (!recordedAudio) {
      setError('No recorded audio to transcribe');
      return;
    }

    setIsProcessing(true);
    setProcessingStage('Transcribing speech...');
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', recordedAudio.blob, `recording.${recordedAudio.blob.type.includes('webm') ? 'webm' : 'wav'}`);

      const response = await fetch(`/api/transcribe?language=${language}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }
      
      if (data.success && data.text) {
        setProcessingStage('Speech recognized!');
        setTimeout(() => {
          onTranscription(data.text, language);
          setShowReplayControls(false);
          setRecordedAudio(null);
          setProcessingStage('');
        }, 500);
      } else {
        setError(data.error || 'No speech detected in recording. Please try recording again with clearer speech.');
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setError(error.message || 'Failed to process recording');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStage('');
      }, 1000);
    }
  };

  const discardRecording = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setShowReplayControls(false);
    setError(null);
  };

  const playTTS = async (text) => {
    if (!text || isPlaying) return;

    setIsProcessing(true);
    setProcessingStage('Generating speech...');
    setError(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS failed');
      }

      const data = await response.json();
      
      if (data.audioChunks && data.audioChunks.length > 0) {
        setProcessingStage('Stitching audio...');
        
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
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          setProcessingStage('Playing audio...');
          
          if (onTTSAudio) {
            onTTSAudio(audioUrl);
          }
        }
      } else {
        setError('No audio generated');
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
      setError(error.message || 'Failed to generate speech');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStage('');
      }, 1000);
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProcessingStage('');
    }
  };

  // Animation variants
  const containerVariants = {
    inactive: { 
      scale: 1,
      opacity: 0.7,
      filter: 'blur(0px)'
    },
    active: { 
      scale: 1.02,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.3 }
    }
  };

  const pulseVariants = {
    recording: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      scale: 1,
      opacity: 1
    }
  };

  const waveVariants = {
    visible: {
      scaleY: [0.5, 1, 0.5],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hidden: {
      scaleY: 0.5
    }
  };

  return (
    <motion.div 
      className="immersive-voice-ai"
      variants={containerVariants}
      animate={isActive ? 'active' : 'inactive'}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Immersive Header */}
            <motion.div 
              className="text-center py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <motion.div
                  animate={isRecording || isProcessing ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: isRecording || isProcessing ? Infinity : 0, ease: "linear" }}
                >
                  <Radio className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800">Voice Assistant</h3>
              </div>
              <p className="text-sm text-gray-600">Speak naturally in {language === 'tw' ? 'Twi' : language.toUpperCase()}</p>
            </motion.div>

            {/* Main Recording Interface */}
            <div className="relative">
              {/* Background Glow Effect */}
              <AnimatePresence>
                {(isRecording || isProcessing) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>

              {/* Central Recording Button */}
              <div className="relative flex flex-col items-center space-y-4">
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={disabled || isProcessing || showReplayControls}
                  className={`relative p-8 rounded-full transition-all duration-300 ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-2xl shadow-red-500/50'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl shadow-purple-500/30'
                  } ${
                    disabled || isProcessing || showReplayControls
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-110 active:scale-95 hover:shadow-purple-500/50'
                  }`}
                  variants={pulseVariants}
                  animate={isRecording ? 'recording' : 'idle'}
                  whileHover={!disabled && !isProcessing && !showReplayControls ? { scale: 1.1 } : {}}
                  whileTap={!disabled && !isProcessing && !showReplayControls ? { scale: 0.95 } : {}}
                >
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Zap className="w-8 h-8" />
                      </motion.div>
                    ) : isRecording ? (
                      <motion.div
                        key="recording"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <MicOff className="w-8 h-8" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Mic className="w-8 h-8" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Audio Level Visualization */}
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-white/30"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ 
                          scale: 1 + audioLevel * 0.3,
                          opacity: 0.6 + audioLevel * 0.4
                        }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Recording Duration & Status */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-mono font-bold text-gray-800 mb-1">
                        {recordingDuration.toFixed(1)}s
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-6 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                            variants={waveVariants}
                            animate={audioLevel > 0.1 ? 'visible' : 'hidden'}
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              opacity: Math.max(0.3, audioLevel * (1 + i * 0.2))
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing Status */}
                <AnimatePresence>
                  {processingStage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                        {processingStage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Replay Controls */}
            <AnimatePresence>
              {showReplayControls && recordedAudio && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50"
                >
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Recording Ready</h4>
                    <p className="text-sm text-gray-600">Duration: {recordingDuration.toFixed(1)}s</p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <motion.button
                      onClick={replayAudio}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4" />
                      <span>Replay</span>
                    </motion.button>

                    <motion.button
                      onClick={sendForTranscription}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Send</span>
                    </motion.button>

                    <motion.button
                      onClick={discardRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Discard</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden Audio Elements */}
            <audio
              ref={audioRef}
              onEnded={() => {
                setIsPlaying(false);
                setProcessingStage('');
              }}
              onError={() => {
                setIsPlaying(false);
                setError('Audio playback failed');
                setProcessingStage('');
              }}
              className="hidden"
            />
            
            <audio ref={replayAudioRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImmersiveVoiceAI;
