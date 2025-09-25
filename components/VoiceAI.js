'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';

const VoiceAI = ({ onTranscription, onTTSAudio, language = 'tw', disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showReplayControls, setShowReplayControls] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

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
  }, []);

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

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Connect stream to analyser for audio level monitoring
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }

      // Try different MIME types for better compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      const options = mimeType ? { mimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      console.log('Recording with MIME type:', mediaRecorderRef.current.mimeType);
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleRecordingStop;

      recordingStartTime.current = Date.now();
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start duration tracking
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
      
      console.log('Recorded audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration: recordingDuration
      });

      // Check minimum duration and size
      if (recordingDuration < 0.5) {
        setError('Recording too short. Please record for at least 0.5 seconds.');
        return;
      }

      if (audioBlob.size < 1000) {
        setError('Recording file too small. Please try again.');
        return;
      }

      // Create audio URL for replay
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
    setError(null);
    
    try {
      // Convert to FormData for API
      const formData = new FormData();
      formData.append('audio', recordedAudio.blob, `recording.${recordedAudio.blob.type.includes('webm') ? 'webm' : 'wav'}`);

      console.log('Sending for transcription:', {
        size: recordedAudio.blob.size,
        type: recordedAudio.blob.type,
        language: language
      });

      const response = await fetch(`/api/transcribe?language=${language}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      console.log('Transcription response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }
      
      if (data.success && data.text) {
        onTranscription(data.text, language);
        setShowReplayControls(false);
        setRecordedAudio(null);
      } else {
        setError(data.error || 'No speech detected in recording. Please try recording again with clearer speech.');
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setError(error.message || 'Failed to process recording');
    } finally {
      setIsProcessing(false);
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
        // Combine audio chunks
        const audioBuffers = data.audioChunks.map(chunk => {
          const binaryString = atob(chunk);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        });

        // Calculate total length
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
      setIsProcessing(false);
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="voice-ai-controls space-y-3">
      {/* Recording Controls */}
      <div className="flex items-center space-x-3">
        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing || showReplayControls}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-pink-500 hover:bg-pink-600 text-white'
          } ${
            disabled || isProcessing || showReplayControls
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110 active:scale-95'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          
          {/* Audio level indicator */}
          {isRecording && (
            <div className="absolute -top-1 -right-1">
              <div 
                className="w-3 h-3 bg-green-400 rounded-full"
                style={{ 
                  opacity: 0.5 + audioLevel * 0.5,
                  transform: `scale(${0.8 + audioLevel * 0.4})`
                }}
              />
            </div>
          )}
        </button>

        {/* Recording Duration */}
        {isRecording && (
          <div className="text-sm text-gray-600 font-mono">
            {recordingDuration.toFixed(1)}s
          </div>
        )}

        {/* TTS Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? stopTTS : () => {}}
            disabled={disabled || isProcessing || !isPlaying}
            className={`p-2 rounded-full transition-all duration-200 ${
              isPlaying
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-300 text-gray-500'
            } ${
              disabled || isProcessing || !isPlaying
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 active:scale-95'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Indicators */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Replay Controls */}
      {showReplayControls && recordedAudio && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Recording ready ({recordingDuration.toFixed(1)}s)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Replay Button */}
            <button
              onClick={replayAudio}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Play className="w-4 h-4" />
              <span>Replay</span>
            </button>

            {/* Send Button */}
            <button
              onClick={sendForTranscription}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              <span>Send</span>
            </button>

            {/* Discard Button */}
            <button
              onClick={discardRecording}
              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Hidden audio elements */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setError('Audio playback failed');
        }}
        className="hidden"
      />
      
      <audio
        ref={replayAudioRef}
        className="hidden"
      />
    </div>
  );
};

export default VoiceAI;
