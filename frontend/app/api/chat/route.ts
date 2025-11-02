import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI API key - can be server-side only (no NEXT_PUBLIC needed for API routes)
// But we check both for flexibility
const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('OpenAI API key not found. Chat will not work.');
}

const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
}) : null as unknown as OpenAI;

const SYSTEM_PROMPT = `Olet Converto Business OS:n asiakastukichatbot. Autat käyttäjiä Converto Business OS -alustan käytössä.

Converto Business OS on automaatioplattforma suomalaisille yrittäjille. Pääominaisuudet:
- OCR-kuittien automaattinen käsittely
- ALV-laskelmat automaattisesti
- Dashboard taloushallintaan
- Automaatio-työkalut

Vastaa lyhyesti, ystävällisesti ja suomeksi. Jos et tiedä vastausta, ohjaa käyttäjä asiakaspalveluun: hello@converto.fi`;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'Anteeksi, en pysty vastaamaan juuri nyt.';

    return NextResponse.json({
      response,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
