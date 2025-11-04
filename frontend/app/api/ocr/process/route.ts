import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Tarkista että OpenAI API key on saatavilla
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Ei tiedostoa' },
        { status: 400 }
      );
    }

    // Tarkista että OpenAI on käytettävissä
    if (!openai) {
      return NextResponse.json(
        {
          success: false,
          message: 'OCR palvelu ei ole käytettävissä. Tarkista API-avaimet.',
          mock: true
        },
        { status: 503 }
      );
    }

    // Muunna kuva base64:ksi
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type;

    console.log('Processing OCR for file:', file.name, 'Size:', file.size, 'Type:', mimeType);

    // Käytä OpenAI Vision API:ta OCR:ään
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analysoi tämä kuitti ja poimi tärkeimmät tiedot JSON-muodossa:
              {
                "merchant": "kauppiaan nimi",
                "date": "YYYY-MM-DD",
                "total": "kokonaissumma numeroina",
                "vat_amount": "ALV-summa numeroina",
                "vat_rate": "ALV-prosentti",
                "items": [
                  {
                    "name": "tuotteen nimi",
                    "price": "hinta numeroina",
                    "vat": "ALV-prosentti"
                  }
                ],
                "payment_method": "maksutapa",
                "receipt_number": "kuittin numero"
              }

              Vastaa VAIN JSON-muodossa, ei muuta tekstiä. Jos et pysty lukemaan jotain, käytä null arvoa.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const ocrResult = response.choices[0]?.message?.content;

    if (!ocrResult) {
      throw new Error('OCR analyysi epäonnistui');
    }

    // Yritä parsia JSON
    let parsedResult;
    try {
      // Poista mahdollinen markdown-koodaus
      const cleanResult = ocrResult.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanResult);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Jos JSON-parsinta epäonnistuu, palauta raakadata
      parsedResult = {
        raw_text: ocrResult,
        merchant: null,
        date: null,
        total: null,
        vat_amount: null,
        vat_rate: null,
        items: [],
        payment_method: null,
        receipt_number: null,
        parse_error: true
      };
    }

    return NextResponse.json({
      success: true,
      message: 'OCR analyysi onnistui',
      data: {
        ...parsedResult,
        file_name: file.name,
        file_size: file.size,
        file_type: mimeType,
        processed_at: new Date().toISOString(),
        ai_model: 'gpt-4o'
      }
    });

  } catch (error: any) {
    console.error('OCR processing error:', error);

    // Jos OpenAI API epäonnistuu, palauta mock-data
    return NextResponse.json({
      success: false,
      message: `OCR käsittely epäonnistui: ${error.message}`,
      mock: true,
      mock_data: {
        merchant: "Mock Kauppa Oy",
        date: new Date().toISOString().split('T')[0],
        total: 25.50,
        vat_amount: 5.50,
        vat_rate: 24,
        items: [
          {
            name: "Mock tuote",
            price: 20.00,
            vat: 24
          }
        ],
        payment_method: "Kortti",
        receipt_number: "MOCK-001",
        file_name: "mock_receipt.jpg",
        processed_at: new Date().toISOString(),
        ai_model: "mock"
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OCR API Ready',
    openai_available: !!openai,
    mock_mode: !openai,
    message: openai
      ? 'OCR toimii oikeilla OpenAI-avaimilla'
      : 'OCR mock-tilassa - lisää OPENAI_API_KEY'
  });
}
