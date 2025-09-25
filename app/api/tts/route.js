import { NextResponse } from 'next/server';

// Function to split text into chunks optimized for Ghana NLP TTS
function chunkText(text, maxLength = 100) {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  
  // First, try to split by sentences (. ! ?)
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // If adding this sentence would exceed max length
    if (currentChunk.length + trimmedSentence.length + 1 > maxLength) {
      // Save current chunk if it exists
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If single sentence is too long, split by phrases/clauses
      if (trimmedSentence.length > maxLength) {
        const phrases = trimmedSentence.split(/(?<=[,;:])\s+/);
        let phraseChunk = '';
        
        for (const phrase of phrases) {
          if (phraseChunk.length + phrase.length + 1 <= maxLength) {
            phraseChunk += (phraseChunk ? ' ' : '') + phrase;
          } else {
            if (phraseChunk) {
              chunks.push(phraseChunk.trim());
              phraseChunk = phrase;
            } else {
              // If single phrase is still too long, split by words
              const words = phrase.split(' ');
              let wordChunk = '';
              
              for (const word of words) {
                if (wordChunk.length + word.length + 1 <= maxLength) {
                  wordChunk += (wordChunk ? ' ' : '') + word;
                } else {
                  if (wordChunk) {
                    chunks.push(wordChunk.trim());
                    wordChunk = word;
                  } else {
                    // Single word is too long, just add it
                    chunks.push(word);
                  }
                }
              }
              
              if (wordChunk) {
                phraseChunk = wordChunk;
              }
            }
          }
        }
        
        if (phraseChunk) {
          currentChunk = phraseChunk;
        }
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

export async function POST(request) {
  try {
    const { text, language = 'tw' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const ghanaApiKey = process.env.NEXT_PUBLIC_GHANA_NLP_API_KEY || '99b6177840d64638a6b8f08ab0572a18';
    
    console.log('TTS Request:', { text: text.substring(0, 100) + '...', language, textLength: text.length });
    
    // Split text into chunks for better processing
    const chunks = chunkText(text);
    console.log('Text split into chunks:', chunks.length, chunks.map(c => c.substring(0, 30) + '...'));
    
    const audioChunks = [];
    const failedChunks = [];

    // Process each chunk with retry logic and delays
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let success = false;
      let retries = 3;

      console.log(`Processing chunk ${i + 1}/${chunks.length}: "${chunk.substring(0, 50)}..."`);

      while (retries > 0 && !success) {
        try {
          const response = await fetch('https://translation-api.ghananlp.org/tts/v1/synthesize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': ghanaApiKey
            },
            body: JSON.stringify({
              text: chunk,
              language: language
            })
          });

          if (response.ok) {
            const audioBlob = await response.arrayBuffer();
            const audioBase64 = Buffer.from(audioBlob).toString('base64');
            
            audioChunks.push({
              index: i,
              audio: audioBase64,
              text: chunk,
              size: audioBlob.byteLength
            });
            
            console.log(`Chunk ${i + 1} processed successfully (${audioBlob.byteLength} bytes)`);
            success = true;
            
            // Small delay between successful requests to avoid rate limiting
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } else {
            const errorText = await response.text();
            console.error(`TTS API error for chunk ${i}:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              chunkText: chunk
            });
            retries--;
            
            if (retries === 0) {
              failedChunks.push({
                index: i,
                text: chunk,
                error: `API returned ${response.status}: ${errorText}`
              });
            }
          }
        } catch (error) {
          console.error(`TTS processing error for chunk ${i}:`, error);
          retries--;
          
          if (retries === 0) {
            failedChunks.push({
              index: i,
              text: chunk,
              error: error.message
            });
          }
        }

        // Longer delay between retries
        if (retries > 0 && !success) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Sort audio chunks by index to maintain order
    audioChunks.sort((a, b) => a.index - b.index);

    if (audioChunks.length === 0) {
      return NextResponse.json({
        error: 'Failed to synthesize any audio',
        failedChunks
      }, { status: 500 });
    }

    return NextResponse.json({
      audioChunks: audioChunks.map(chunk => chunk.audio),
      processedChunks: audioChunks.length,
      totalChunks: chunks.length,
      failedChunks: failedChunks.length > 0 ? failedChunks : null,
      language
    });

  } catch (error) {
    console.error('Error in TTS API:', error);
    
    return NextResponse.json({
      error: 'Failed to process text-to-speech',
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
