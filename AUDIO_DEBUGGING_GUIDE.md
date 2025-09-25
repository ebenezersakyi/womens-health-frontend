# Audio Debugging Guide

## Current Issue: "No speech detected in recording"

The Ghana NLP API is returning empty text, which suggests either:
1. Audio format incompatibility
2. Audio quality issues
3. API configuration problems

## Debugging Steps

### 1. Check Browser Console

When you record audio, check the browser console for these logs:
```
Audio file details: { name, type, size, language }
Buffer size: [number]
Calling Ghana NLP API with: { url, bufferSize, contentType }
Ghana NLP response status: [number]
Ghana NLP result: { ... }
```

### 2. Audio Format Issues

The system now tries multiple MIME types in order of preference:
1. `audio/webm;codecs=opus` (preferred)
2. `audio/webm`
3. `audio/mp4`
4. Browser default

### 3. Audio Quality Requirements

**Minimum Requirements:**
- Duration: At least 0.5 seconds
- File size: At least 1KB
- Clear speech (not too quiet)

**Optimal Settings:**
- Sample rate: 48kHz
- Channels: Mono (1 channel)
- Echo cancellation: Enabled
- Noise suppression: Enabled

### 4. Testing Different Browsers

Try testing in different browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### 5. Microphone Testing

1. Test your microphone with other applications
2. Check browser microphone permissions
3. Ensure microphone is not muted
4. Try speaking closer to the microphone

### 6. API Key Verification

Verify your Ghana NLP API key is working:
```bash
curl -X POST "https://translation-api.ghananlp.org/asr/v1/transcribe?language=tw" \
  -H "Ocp-Apim-Subscription-Key: 99b6177840d64638a6b8f08ab0572a18" \
  -H "Content-Type: audio/mpeg" \
  --data-binary @test-audio.mp3
```

## New Features Added

### 1. Audio Replay Functionality

Users can now:
- Record their voice
- Replay the recording before sending
- Send for transcription or discard

### 2. Better Error Handling

- Minimum duration validation (0.5s)
- File size validation (1KB)
- Detailed error messages
- Debug information in API responses

### 3. Recording Quality Improvements

- Higher sample rate (48kHz)
- Better audio constraints
- MIME type detection and fallback
- Real-time duration display

## Usage Instructions

### For Users:

1. **Enable Voice Mode**: Click the language toggle in the chat header
2. **Select Language**: Choose your Akan language (Twi, Ga, etc.)
3. **Record**: Click the microphone button and speak clearly
4. **Review**: The recording duration will be shown
5. **Replay**: Click "Replay" to listen to your recording
6. **Send or Discard**: Choose to send for transcription or record again

### Recording Tips:

- Speak clearly and at normal volume
- Record for at least 1-2 seconds
- Avoid background noise
- Speak close to the microphone
- Use simple, clear sentences

## Troubleshooting Common Issues

### "Recording too short"
- Record for at least 0.5 seconds
- Make sure you're actually speaking during recording

### "Recording file too small"
- Check microphone permissions
- Ensure microphone is not muted
- Try speaking louder

### "No speech detected"
- The audio might be too quiet
- Try speaking more clearly
- Check if the correct language is selected
- Verify the API key is working

### "Failed to access microphone"
- Check browser permissions
- Reload the page and allow microphone access
- Try a different browser

## API Response Examples

### Successful Response:
```json
{
  "text": "Me pɛ sɛ mehu me maame yadeɛ ho nsɛm",
  "language": "tw",
  "confidence": 0.95,
  "success": true
}
```

### Empty Response (Current Issue):
```json
{
  "text": "",
  "language": "tw", 
  "confidence": null,
  "error": "No speech detected in recording"
}
```

### Error Response:
```json
{
  "error": "Failed to transcribe audio",
  "details": "Ghana NLP API returned 400: Invalid audio format"
}
```

## Next Steps

1. Test with the new replay functionality
2. Check console logs for detailed debugging info
3. Try different browsers and devices
4. Test with different audio content (louder, clearer speech)
5. Verify API key with direct curl requests

The replay functionality should help identify if the issue is with:
- Audio recording (can you hear your voice clearly in replay?)
- API processing (clear audio but empty transcription?)
- Network/API key issues (API errors in console?)
