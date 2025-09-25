# Akan Voice AI Integration Setup Guide

This document provides instructions for setting up and using the integrated Akan voice AI system with Ghana NLP and Google services.

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Ghana NLP API Configuration
GHANA_NLP_API_KEY=99b6177840d64638a6b8f08ab0572a18
NEXT_PUBLIC_GHANA_NLP_API_KEY=99b6177840d64638a6b8f08ab0572a18

# Google Translate API Configuration  
GOOGLE_TRANSLATE_API_KEY=AIzaSyBwqeiu4BhOGg3BnOaC_DV_u4Df17l5cw4

# Google Gemini AI Configuration (existing)
GOOGLE_AI_API_KEY=AIzaSyBB1NKAQPg8S8_pozh0f_fd64ct9_Xl0ME
```

## Features Implemented

### 1. Voice Input (ASR - Automatic Speech Recognition)
- **Endpoint**: `/api/transcribe`
- **Functionality**: Converts Akan speech to Akan text using Ghana NLP ASR
- **Supported Languages**: Twi, Ga, Dagbani, Yoruba, Ewe, Kikuyu
- **Usage**: Click the microphone button in voice mode

### 2. Translation Pipeline
- **Endpoint**: `/api/translate`
- **Functionality**: Translates between Akan and English using Google Translate
- **Flow**: Akan → English → Gemini AI → English → Akan

### 3. AI Response Generation
- **Endpoint**: `/api/chat` (updated)
- **Functionality**: Uses Google Gemini to generate women's health responses
- **Enhancement**: Now supports Akan input/output pipeline

### 4. Text-to-Speech (TTS)
- **Endpoint**: `/api/tts`
- **Functionality**: Converts Akan text to speech using Ghana NLP TTS
- **Features**: Text chunking, retry logic, sequential audio playback

### 5. Voice AI Component
- **Component**: `VoiceAI.js`
- **Features**: 
  - Audio recording with level monitoring
  - Real-time transcription
  - TTS playback controls
  - Error handling and retry logic

## How to Use

### 1. Enable Voice Mode
1. Open the chat interface (either modal or full page)
2. Click the language/voice toggle button in the header
3. The interface will show "Voice Assistant (Akan)" mode

### 2. Voice Input Process
1. Select your preferred Akan language from the dropdown
2. Click the microphone button to start recording
3. Speak your question in Akan
4. The system will:
   - Transcribe your speech to Akan text
   - Translate to English for AI processing
   - Generate response using Gemini AI
   - Translate response back to Akan
   - Play the Akan response using TTS

### 3. Supported Languages
- **Twi (tw)** - Default
- **Ga (gaa)**
- **Dagbani (dag)**
- **Yoruba (yo)**
- **Ewe (ee)**
- **Kikuyu (ki)**

## Technical Flow

```
User speaks Akan → Ghana NLP ASR → Akan text → 
Google Translate → English text → Gemini AI → 
English response → Google Translate → Akan response → 
Ghana NLP TTS → Akan speech
```

## API Endpoints Summary

### `/api/transcribe`
- **Method**: POST
- **Input**: Audio file (FormData)
- **Query**: `?language=tw` (language code)
- **Output**: Transcribed text in specified language

### `/api/translate`
- **Method**: POST
- **Input**: `{ text, from, to }`
- **Output**: `{ translatedText, originalText, sourceLanguage, targetLanguage }`

### `/api/tts`
- **Method**: POST
- **Input**: `{ text, language }`
- **Output**: `{ audioChunks, processedChunks, totalChunks, language }`

### `/api/chat` (Updated)
- **Method**: POST
- **Input**: `{ message, conversationHistory, isAkanInput, language }`
- **Output**: `{ response, isRelevant, isAkanInput, language }`

## Testing the Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Voice Input
1. Navigate to `/chat`
2. Enable voice mode
3. Select Twi language
4. Click microphone and say "Me pɛ sɛ mehu me maame yadeɛ ho nsɛm" (I want to know about women's health)
5. Verify the system transcribes, translates, processes, and responds

### 3. Test Text-to-Speech
1. Type a women's health question in English
2. Verify you get an English response
3. Enable voice mode and ask the same question in Akan
4. Verify the response is played back in Akan

## Error Handling

The system includes comprehensive error handling for:
- Microphone access permissions
- Network connectivity issues
- API failures and retries
- Audio processing errors
- Translation failures

## Performance Optimizations

1. **Audio Processing**: Efficient temporary file handling
2. **TTS Chunking**: Splits long text for better speech synthesis
3. **Retry Logic**: Automatic retry for failed API calls
4. **Sequential Processing**: Maintains audio order for natural playback

## Troubleshooting

### Common Issues

1. **Microphone not working**: Check browser permissions
2. **No audio output**: Verify browser audio settings
3. **Translation errors**: Check Google Translate API key
4. **TTS not playing**: Verify Ghana NLP API key and network connection

### Debug Information

Check browser console for detailed error messages and API response logs.

## Future Enhancements

1. **Caching**: Implement audio caching for repeated TTS requests
2. **Streaming**: Real-time audio streaming for better UX
3. **Language Detection**: Automatic language detection for ASR
4. **Offline Support**: Cache common phrases for offline usage

---

**Note**: Make sure all API keys are properly set in your environment variables before testing the system.
