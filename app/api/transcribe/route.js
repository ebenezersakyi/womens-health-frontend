import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export async function POST(request) {
  try {
    // Get the uploaded audio file and language parameter
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const language = new URL(request.url).searchParams.get('language') || 'tw'; // Default to Twi

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('Audio file details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      language: language
    });

    // Convert the audio file to a buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Buffer size:', buffer.length);

    // Validate minimum audio size
    if (buffer.length < 1000) {
      return NextResponse.json({
        error: 'Audio file too small',
        details: 'Recording appears to be too short or empty'
      }, { status: 400 });
    }

    // Call Ghana NLP ASR API directly with buffer
    // Using the API key you provided: 99b6177840d64638a6b8f08ab0572a18
    // But the docs show: 553c9e557b49474badfc69e724b00188
    const ghanaApiKey = process.env.NEXT_PUBLIC_GHANA_NLP_API_KEY || '99b6177840d64638a6b8f08ab0572a18';
    
    console.log('Using API key:', ghanaApiKey.substring(0, 8) + '...');
    
    console.log('Calling Ghana NLP API with:', {
      url: `https://translation-api.ghananlp.org/asr/v1/transcribe?language=${language}`,
      bufferSize: buffer.length,
      contentType: audioFile.type || 'audio/webm'
    });

    // Ghana NLP API documentation specifies Content-Type: audio/mpeg
    // Let's try that first, regardless of the original format
    let contentType = 'audio/mpeg';
    
    console.log('Original file type:', audioFile.type);
    console.log('Using Content-Type:', contentType);

    const response = await fetch(
      `https://translation-api.ghananlp.org/asr/v1/transcribe?language=${language}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': ghanaApiKey
        },
        body: buffer,
      }
    );

    console.log('Ghana NLP response status:', response.status);
    console.log('Ghana NLP response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ghana NLP API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return NextResponse.json({
        error: 'Failed to transcribe audio',
        details: `Ghana NLP API returned ${response.status}: ${errorText}`,
        debug: {
          contentType,
          bufferSize: buffer.length,
          language
        }
      }, { status: response.status });
    }

    // Ghana NLP returns plain text string, not JSON!
    const transcribedText = await response.text();
    console.log('Ghana NLP raw response:', transcribedText);

    // Remove quotes if present (API sometimes returns quoted strings)
    const cleanedText = transcribedText.replace(/^"(.*)"$/, '$1').trim();
    
    console.log('Cleaned transcription:', cleanedText);

    // Check if we got meaningful text
    if (!cleanedText || cleanedText.length === 0) {
      console.log('Empty transcription result');
      return NextResponse.json({
        error: 'No speech detected in recording',
        details: 'The audio may be too quiet, too short, or not contain clear speech',
        text: '',
        language: language,
        confidence: null,
        debug: {
          rawResponse: transcribedText,
          cleanedText: cleanedText,
          contentType,
          bufferSize: buffer.length
        }
      }, { status: 200 }); // Return 200 but with error message
    }

    return NextResponse.json({
      text: cleanedText,
      language: language,
      confidence: null, // Ghana NLP doesn't seem to return confidence in this format
      success: true
    });

  } catch (error) {
    console.error('Error in transcribe API:', error);
    
    return NextResponse.json({
      error: 'Failed to process audio transcription',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
