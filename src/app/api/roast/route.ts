// OpenRouter API proxy — calls OpenRouter from the server so the API key stays private
// Only anonymized stats are sent, never actual chat messages

import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL =
  process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

const ROAST_PROMPTS: Record<string, string> = {
  savage: `You are a savage but friendly roast comedian. Roast this WhatsApp user based ONLY on their chat statistics. Be brutally honest, sharp, and funny. Use the numbers to make jokes. Keep it under 4 sentences. Do not be mean or offensive — it should feel like a friend roasting a friend. Address the person directly as "you".`,

  friendly: `You are a warm, fun friend playfully teasing another friend. Roast this WhatsApp user based ONLY on their chat statistics. Be light-hearted, funny, and make it feel like a friendly joke among close friends. Keep it under 4 sentences. Address the person directly as "you".`,

  bollywood: `You are a dramatic Bollywood scriptwriter. Roast this WhatsApp user based ONLY on their chat statistics using filmy references, dramatic Hindi dialogues, and Bollywood movie tropes. Mix Hindi and English (Hinglish). Keep it under 4 sentences. Make it dramatic and funny. Address the person directly as "you" or "tum".`,

  cricket: `You are a cricket commentator roasting a player's batting/bowling stats. Roast this WhatsApp user based ONLY on their chat statistics using cricket metaphors and analogies. Talk about strike rate, batting average, dot balls in conversation, etc. Keep it under 4 sentences. Make it funny for cricket fans. Address the person directly as "you".`,

  corporate: `You are giving an employee performance review. Roast this WhatsApp user based ONLY on their chat statistics formatted like a corporate performance review. Use terms like "KPIs", "deliverables", "quarterly results", "needs improvement", "areas of concern", "let's circle back". Keep it under 4 sentences. Make it funny for anyone who has worked in a corporate. Address the person directly as "you".`,
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { statBlock, tone } = body;

    if (!statBlock || !tone) {
      return NextResponse.json(
        { error: 'Missing statBlock or tone in request.' },
        { status: 400 }
      );
    }

    const systemPrompt = ROAST_PROMPTS[tone];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Unknown tone: ${tone}` },
        { status: 400 }
      );
    }

    const model =
      process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

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
          { role: 'user', content: statBlock },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API returned ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const roast = data.choices?.[0]?.message?.content?.trim();

    if (!roast) {
      return NextResponse.json(
        { error: 'No roast generated — empty response from model.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ roast });
  } catch (error) {
    console.error('Roast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast.' },
      { status: 500 }
    );
  }
}
