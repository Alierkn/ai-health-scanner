import { NextRequest, NextResponse } from 'next/server';
import { parseHealthAnalysis } from '@/lib/parseJson';

export const runtime = 'edge';

// Simple rate limiting with in-memory storage
const requestTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  
  // Remove timestamps older than 2 seconds
  const recentTimestamps = timestamps.filter(t => now - t < 2000);
  
  if (recentTimestamps.length >= 1) {
    return true;
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(ip, recentTimestamps);
  
  return false;
}

const NUTRITION_PROMPT = `You are a nutrition expert. The user is pointing their camera at a packaged food or beverage.

Return a STRICT JSON object ONLY with keys:
- score: integer 1-10
- pros: array of short bullets (max 5)
- cons: array of short bullets (max 5)

Scoring rubric:
10: minimally processed, whole ingredients, low sugar/sodium, high nutrient density.
7-9: generally healthy, balanced macros, limited additives.
4-6: acceptable in moderation; some added sugar/salt or processing.
1-3: highly processed or sugary/salty; low nutrient density.

If uncertain about the product identity, infer from visible cues and stay conservative.`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait.' },
        { 
          status: 429,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    const { dataUrl, model = 'gpt-4o-mini' } = await request.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { 
          status: 400,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { 
          status: 500,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: NUTRITION_PROMPT
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { 
          status: 500,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis received' },
        { 
          status: 500,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    // Parse the JSON response
    const analysis = parseHealthAnalysis(content);

    return NextResponse.json(analysis, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }
}
