import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const R2_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/og';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') || 'Podmiot';
  const city = searchParams.get('city') || '';
  const country = searchParams.get('country') || '';
  const votes = searchParams.get('votes') || '0';
  const locale = searchParams.get('locale') || 'en';

  const location = [city, country].filter(Boolean).join(', ');

  // Try locale-specific template, fall back to English
  let backgroundUrl = `${R2_BASE}/entity-${locale}.png`;
  let backgroundData: ArrayBuffer | null = null;

  try {
    const res = await fetch(backgroundUrl);
    if (res.ok) {
      backgroundData = await res.arrayBuffer();
    }
  } catch {
    // ignore, try fallback
  }

  if (!backgroundData) {
    try {
      backgroundUrl = `${R2_BASE}/entity-en.png`;
      const res = await fetch(backgroundUrl);
      if (res.ok) {
        backgroundData = await res.arrayBuffer();
      }
    } catch {
      // proceed without background
    }
  }

  const backgroundSrc = backgroundData
    ? `data:image/png;base64,${arrayBufferToBase64(backgroundData)}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: '#0A1628',
          fontFamily: 'sans-serif',
        }}
      >
        {backgroundSrc && (
          <img
            src={backgroundSrc}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '630px',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(180deg, rgba(10,22,40,0.4) 0%, rgba(10,22,40,0.7) 100%)',
            display: 'flex',
          }}
        />

        {/* Location - top right */}
        {location && (
          <div
            style={{
              position: 'absolute',
              top: '30px',
              right: '40px',
              color: 'white',
              fontSize: '18px',
              opacity: 0.9,
              display: 'flex',
            }}
          >
            {location}
          </div>
        )}

        {/* Entity name - centered upper area */}
        <div
          style={{
            position: 'absolute',
            top: '200px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '38px',
              fontWeight: 'bold',
              lineHeight: 1.3,
              maxWidth: '1080px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </span>
        </div>

        {/* Votes - center bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '0',
            right: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {votes}
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
            }}
          >
            {locale === 'pl' ? 'głosów poparcia' : 'votes'}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    },
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
