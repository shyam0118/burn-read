// OpenRouter API proxy — calls OpenRouter from the server so the API key stays private
// Only anonymized stats are sent, never actual chat messages
// Protected by rate limiting and Cloudflare Turnstile verification

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitServerless } from '@/lib/rate-limit';

const OPENROUTER_URL =
  process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ROAST_PROMPTS: Record<string, string> = {
  savage: `You are a savage but friendly roast comedian. Roast this WhatsApp user based ONLY on their chat statistics. Be brutally honest, sharp, and funny. Use the numbers to make jokes. Keep it under 4 sentences. Do not be mean or offensive — it should feel like a friend roasting a friend. Address the person directly as "you".`,

  friendly: `You are a warm, fun friend playfully teasing another friend. Roast this WhatsApp user based ONLY on their chat statistics. Be light-hearted, funny, and make it feel like a friendly joke among close friends. Keep it under 4 sentences. Address the person directly as "you".`,

  bollywood: `You are a dramatic Bollywood scriptwriter. Roast this WhatsApp user based ONLY on their chat statistics using filmy references, dramatic Hindi dialogues, and Bollywood movie tropes. Mix Hindi and English (Hinglish). Keep it under 4 sentences. Make it dramatic and funny. Address the person directly as "you" or "tum".`,

  cricket: `You are a cricket commentator roasting a player's batting/bowling stats. Roast this WhatsApp user based ONLY on their chat statistics using cricket metaphors and analogies. Talk about strike rate, batting average, dot balls in conversation, etc. Keep it under 4 sentences. Make it funny for cricket fans. Address the person directly as "you".`,

  corporate: `You are giving an employee performance review. Roast this WhatsApp user based ONLY on their chat statistics formatted like a corporate performance review. Use terms like "KPIs", "deliverables", "quarterly results", "needs improvement", "areas of concern", "let's circle back". Keep it under 4 sentences. Make it funny for anyone who has worked in a corporate. Address the person directly as "you".`,
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  // Parse request body once at the top
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { statBlock, statBlocks, tone, isBatched, turnstileToken } = body;

  // --- Rate limiting ---
  const ip = getClientIp(request);
  const rateLimit = checkRateLimitServerless(ip, {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 5,      // Reduced to 5/min as batched calls are heavier
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // --- Turnstile verification ---
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Bot verification required. Please complete the CAPTCHA.' },
        { status: 400 }
      );
    }

    const verifyForm = new FormData();
    verifyForm.append('secret', turnstileSecret);
    verifyForm.append('response', turnstileToken);
    verifyForm.append('remoteip', ip);

    const verifyResp = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: verifyForm,
    });

    const verifyData = await verifyResp.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { error: 'Bot verification failed. Please try again.' },
        { status: 400 }
      );
    }
  }

  // --- API key check ---
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    if ((!statBlock && !statBlocks) || !tone) {
      return NextResponse.json(
        { error: 'Missing statBlock(s) or tone in request.' },
        { status: 400 }
      );
    }

    let systemPrompt = ROAST_PROMPTS[tone];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Unknown tone: ${tone}` },
        { status: 400 }
      );
    }

    if (isBatched) {
      systemPrompt += `\n\nCRITICAL: You are roasting MULTIPLE people. Return your response ONLY as a JSON object where the keys are the person labels (e.g., "Person A", "Person B") and values are the roast strings. Example: { "Person A": "roast text", "Person B": "roast text" }. Do not include any other text.`;
    }

    // const model =  process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

    const model = 'deepseek/deepseek-v4-flash:free';

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': request.headers.get('origin') || 'http://localhost:3000',
        'X-Title': 'Burn Read',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: isBatched ? statBlocks : statBlock },
        ],
        max_tokens: isBatched ? 1000 : 300,
        temperature: 0.9,
        // Removed response_format: { type: 'json_object' } because some free models
        // on OpenRouter fail with "Provider returned error" when this is enabled.
        // We rely on the system prompt instead.
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      console.error('OpenRouter API error:', response.status, errorData);
      
      const errorMessage = errorData.error?.message || errorData.message || `OpenRouter API returned ${response.status}`;
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated — empty response from model.' },
        { status: 500 }
      );
    }

    if (isBatched) {
      try {
        // Find JSON in content in case the model added markdown blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const roasts = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return NextResponse.json({ roasts });
      } catch {
        console.error('Failed to parse batched JSON:', content);
        return NextResponse.json(
          { error: 'AI returned invalid formatting for batched roasts.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { roast: content },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Roast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast.' },
      { status: 500 }
    );
  }
}
