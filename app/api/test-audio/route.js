import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic audio file analysis
    const analysis = {
      fileName: audioFile.name,
      fileType: audioFile.type,
      fileSize: audioFile.size,
      bufferSize: buffer.length,
      firstBytes: Array.from(buffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '),
      lastBytes: Array.from(buffer.slice(-20)).map(b => b.toString(16).padStart(2, '0')).join(' '),
      isWebM: buffer.slice(0, 4).toString('hex') === '1a45dfa3',
      isWAV: buffer.slice(0, 4).toString() === 'RIFF',
      isMP3: buffer.slice(0, 3).toString('hex') === 'fff3' || buffer.slice(0, 3).toString('hex') === 'fff2',
      timestamp: new Date().toISOString()
    };

    // Try to detect audio characteristics
    if (analysis.isWebM) {
      analysis.format = 'WebM';
    } else if (analysis.isWAV) {
      analysis.format = 'WAV';
    } else if (analysis.isMP3) {
      analysis.format = 'MP3';
    } else {
      analysis.format = 'Unknown';
    }

    console.log('Audio file analysis:', analysis);

    return NextResponse.json({
      success: true,
      message: 'Audio file received and analyzed',
      analysis
    });

  } catch (error) {
    console.error('Error in test-audio API:', error);
    
    return NextResponse.json({
      error: 'Failed to process audio file',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  // Test Ghana NLP API connectivity
  try {
    const testResponse = await fetch('https://translation-api.ghananlp.org/asr/v1/transcribe?language=tw', {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': process.env.GHANA_NLP_API_KEY || '99b6177840d64638a6b8f08ab0572a18'
      },
      body: Buffer.from('test') // Dummy data just to test connectivity
    });

    return NextResponse.json({
      message: 'Audio test endpoint is working',
      timestamp: new Date().toISOString(),
      supportedFormats: [
        'audio/webm',
        'audio/webm;codecs=opus', 
        'audio/mp4',
        'audio/wav',
        'audio/mpeg'
      ],
      ghanaApiTest: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
        accessible: testResponse.status !== 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Audio test endpoint is working',
      timestamp: new Date().toISOString(),
      supportedFormats: [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4', 
        'audio/wav',
        'audio/mpeg'
      ],
      ghanaApiTest: {
        error: error.message,
        accessible: false
      }
    });
  }
}
