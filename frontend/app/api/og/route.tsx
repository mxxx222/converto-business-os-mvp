import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'DocFlow - Automaatio, joka kasvattaa kassavirtaa';
  const subtitle = searchParams.get('subtitle') || 'Vähennä manuaalityötä, nopeuta laskutusta ja seuraa tuloksia hallintapaneelissa';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            maxWidth: '1100px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#1e3a8a',
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#475569',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              fontWeight: 600,
              color: '#2563eb',
            }}
          >
            docflow.fi
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

