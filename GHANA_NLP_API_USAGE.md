# Ghana NLP API Usage in Twi Tutor

This document outlines how the Ghana NLP API has been integrated and used throughout the Twi Tutor project for speech-to-text transcription and text-to-speech synthesis.

## Overview

The Twi Tutor project leverages Ghana NLP's Translation API to provide:
1. **Automatic Speech Recognition (ASR)** - Converting audio to text in African languages
2. **Text-to-Speech (TTS)** - Converting text back to speech in African languages

## API Configuration

### Base URL
```
https://translation-api.ghananlp.org
```

### Authentication
The API uses subscription key authentication via the `Ocp-Apim-Subscription-Key` header:
```typescript
'Ocp-Apim-Subscription-Key': process.env.GHANA_NLP_API_KEY
```

### Environment Variables
- `GHANA_NLP_API_KEY`: Required API subscription key (stored in `.env` files, excluded from git)

## API Endpoints Used

### 1. Automatic Speech Recognition (ASR)

**Endpoint**: `/asr/v1/transcribe`

**Implementation**: `app/api/transcribe/route.ts`

```typescript
const response = await fetch(
  `https://translation-api.ghananlp.org/asr/v1/transcribe?language=${language}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': process.env.GHANA_NLP_API_KEY || ''
    },
    body: buffer, // Audio file buffer
  }
);
```

**Features**:
- Accepts audio files in MPEG format
- Supports multiple African languages (Twi, Ga, Dagbani, Yoruba, Ewe, Kikuyu)
- Language specified via query parameter
- Returns transcribed text from audio input

**Usage Flow**:
1. Client uploads audio file via multipart/form-data
2. Server saves audio to temporary file
3. Audio buffer sent to Ghana NLP ASR API
4. Transcribed text returned to client

### 2. Text-to-Speech (TTS)

**Endpoint**: `/tts/v1/synthesize`

**Implementation**: `app/components/TwiAI.tsx` (lines 325-340)

```typescript
const ttsResponse = await fetch('https://translation-api.ghananlp.org/tts/v1/synthesize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_GHANA_NLP_API_KEY
  },
  body: JSON.stringify({
    text: chunk,
    language: selectedLanguage
  })
});
```

**Features**:
- Converts text to speech in African languages
- Supports chunked processing for longer texts
- Returns audio blob for playback
- Implements retry logic (up to 3 attempts per chunk)

**Text Chunking Strategy**:
- Splits long text into chunks of 100-150 characters
- Prioritizes sentence boundaries for natural speech
- Processes chunks sequentially to maintain audio order
- Combines audio blobs for seamless playback

## Supported Languages

The application supports the following African languages:

| Language | Code | Ghana NLP Support |
|----------|------|-------------------|
| Twi      | tw   | ✅ ASR + TTS      |
| Ga       | gaa  | ✅ ASR + TTS      |
| Dagbani  | dag  | ✅ ASR + TTS      |
| Yoruba   | yo   | ✅ ASR + TTS      |
| Ewe      | ee   | ✅ ASR + TTS      |
| Kikuyu   | ki   | ✅ ASR + TTS      |

## Integration Architecture

### Audio Processing Pipeline

1. **Audio Capture** → Browser MediaRecorder API
2. **Audio Upload** → Next.js API route (`/api/transcribe`)
3. **ASR Processing** → Ghana NLP ASR API
4. **Translation** → Google Cloud Translate API
5. **AI Response** → Google Gemini AI
6. **TTS Synthesis** → Ghana NLP TTS API
7. **Audio Playback** → Browser Audio API

### Component Integration

#### Primary Components Using Ghana NLP:

1. **`TwiAI.tsx`** - Full conversational AI with TTS
   - ASR via `/api/transcribe` endpoint
   - TTS via direct API calls with chunking

2. **`TwiResponseTranslator.tsx`** - Response translation with TTS
   - Similar to TwiAI but focused on response translation

3. **`QuickTranslator.tsx`** - Simple transcription and translation
   - ASR via `/api/transcribe` endpoint
   - No TTS functionality

4. **`AudioTranscriber.tsx`** - Basic transcription tool
   - ASR via `/api/transcribe` endpoint

### API Route Structure

```
app/api/
├── transcribe/
│   └── route.ts          # Ghana NLP ASR integration
├── translate/
│   └── route.ts          # Google Cloud Translate
└── chat/
    └── route.ts          # Google Gemini AI
```

## Error Handling

### ASR Error Handling
- Validates audio file presence and format
- Handles API response errors gracefully
- Returns structured error messages to client

### TTS Error Handling
- Implements retry logic (up to 3 attempts per chunk)
- Tracks failed chunks for user notification
- Graceful degradation when TTS fails
- Continues processing remaining chunks on partial failures

## Performance Optimizations

### TTS Optimizations
- **Text Chunking**: Splits long text into optimal chunks (100-150 chars)
- **Retry Logic**: Automatic retry on failed requests
- **Sequential Processing**: Maintains audio order for natural playback
- **Blob Concatenation**: Combines audio chunks into single playable file

### ASR Optimizations
- **Temporary File Handling**: Efficient file I/O with cleanup
- **Streaming Support**: Handles large audio files
- **Content-Type Validation**: Ensures proper audio format

## Security Considerations

1. **API Key Protection**: Environment variables prevent key exposure
2. **File Cleanup**: Temporary audio files are properly managed
3. **Input Validation**: Validates audio files and parameters
4. **Error Sanitization**: Prevents sensitive information leakage

## Dependencies

The Ghana NLP integration requires:
- Node.js built-in modules: `fs/promises`, `path`, `os`, `crypto`
- Next.js framework for API routes
- No additional npm packages specifically for Ghana NLP

## Usage Examples

### ASR Usage
```typescript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch(`/api/transcribe?language=tw`, {
  method: 'POST',
  body: formData,
});

const { text } = await response.json();
```

### TTS Usage
```typescript
const response = await fetch('https://translation-api.ghananlp.org/tts/v1/synthesize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': apiKey
  },
  body: JSON.stringify({
    text: 'Hello world',
    language: 'tw'
  })
});

const audioBlob = await response.blob();
```

## Future Improvements

1. **Caching**: Implement audio caching for repeated TTS requests
2. **Streaming TTS**: Real-time audio streaming for better UX
3. **Language Detection**: Automatic language detection for ASR
4. **Audio Quality**: Support for higher quality audio formats
5. **Offline Support**: Cache common phrases for offline usage

---

*This documentation reflects the current implementation as of the project's latest version. For API updates and new features, refer to the [Ghana NLP API documentation](https://translation-api.ghananlp.org/docs).*
