import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('OpenAI API key not found. Chat streaming will not work.');
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
      return new Response(
        JSON.stringify({ error: 'OpenAI API not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: message },
    ];

    // OPTIMIZED: Stream response for better UX
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
