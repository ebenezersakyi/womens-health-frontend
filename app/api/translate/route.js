import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, from, to } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Default languages: from Akan (tw) to English (en) and vice versa
    const sourceLanguage = from || 'tw';
    const targetLanguage = to || 'en';

    const translateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || 'AIzaSyBwqeiu4BhOGg3BnOaC_DV_u4Df17l5cw4';

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${translateApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Translate API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json({
        error: 'Translation failed',
        details: `Google Translate API returned ${response.status}: ${errorData}`
      }, { status: response.status });
    }

    const result = await response.json();
    
    const translatedText = result.data?.translations?.[0]?.translatedText || text;

    return NextResponse.json({
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
      detectedLanguage: result.data?.translations?.[0]?.detectedSourceLanguage
    });

  } catch (error) {
    console.error('Error in translate API:', error);
    
    return NextResponse.json({
      error: 'Failed to translate text',
      details: error.message
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
