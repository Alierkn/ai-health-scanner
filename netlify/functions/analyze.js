const { parseHealthAnalysis } = require('../../lib/parseJson.cjs');

// Simple rate limiting with in-memory storage
const requestTimestamps = new Map();

function isRateLimited(ip) {
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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Rate limiting
    const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    if (isRateLimited(ip)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Rate limit exceeded. Please wait.' })
      };
    }

    const { dataUrl, model = 'gpt-4o-mini' } = JSON.parse(event.body);

    if (!dataUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to analyze image' })
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No analysis received' })
      };
    }

    // Parse the JSON response
    const analysis = parseHealthAnalysis(content);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
