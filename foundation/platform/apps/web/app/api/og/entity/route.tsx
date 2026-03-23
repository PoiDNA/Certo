import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const R2_BASE = 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev/og';

// All text is dynamic — R2 template only has logo + background art
const OG_TEXTS: Record<string, { headline: string; cta: string; votesLabel: string }> = {
  pl: { headline: 'Zgłoś ocenę wiarygodności publicznej', cta: 'Podbij!', votesLabel: 'głosów poparcia' },
  en: { headline: 'Request a public credibility assessment', cta: 'Vote!', votesLabel: 'votes' },
  de: { headline: 'Bewertung der öffentlichen Glaubwürdigkeit beantragen', cta: 'Abstimmen!', votesLabel: 'Stimmen' },
  fr: { headline: 'Demander une évaluation de crédibilité publique', cta: 'Votez !', votesLabel: 'votes' },
  it: { headline: 'Richiedi una valutazione della credibilità pubblica', cta: 'Vota!', votesLabel: 'voti' },
  es: { headline: 'Solicitar una evaluación de credibilidad pública', cta: '¡Vota!', votesLabel: 'votos' },
  pt: { headline: 'Solicitar uma avaliação da credibilidade pública', cta: 'Vote!', votesLabel: 'votos' },
  nl: { headline: 'Verzoek een beoordeling van publieke geloofwaardigheid', cta: 'Stem!', votesLabel: 'stemmen' },
  cs: { headline: 'Požádat o hodnocení veřejné důvěryhodnosti', cta: 'Hlasujte!', votesLabel: 'hlasů' },
  sk: { headline: 'Požiadať o hodnotenie verejnej dôveryhodnosti', cta: 'Hlasujte!', votesLabel: 'hlasov' },
  hu: { headline: 'Közintézményi hitelesség értékelése', cta: 'Szavazz!', votesLabel: 'szavazat' },
  ro: { headline: 'Solicită o evaluare a credibilității publice', cta: 'Votează!', votesLabel: 'voturi' },
  bg: { headline: 'Заявете оценка на обществената достоверност', cta: 'Гласувайте!', votesLabel: 'гласа' },
  hr: { headline: 'Zatražite ocjenu javne vjerodostojnosti', cta: 'Glasajte!', votesLabel: 'glasova' },
  sl: { headline: 'Zahtevajte oceno javne verodostojnosti', cta: 'Glasujte!', votesLabel: 'glasov' },
  lt: { headline: 'Prašyti viešojo patikimumo vertinimo', cta: 'Balsuokite!', votesLabel: 'balsų' },
  lv: { headline: 'Pieprasīt publiskās uzticamības novērtējumu', cta: 'Balsojiet!', votesLabel: 'balsu' },
  et: { headline: 'Taotlege avaliku usaldusväärsuse hindamist', cta: 'Hääleta!', votesLabel: 'häält' },
  fi: { headline: 'Pyydä julkisen uskottavuuden arviointia', cta: 'Äänestä!', votesLabel: 'ääntä' },
  sv: { headline: 'Begär en bedömning av offentlig trovärdighet', cta: 'Rösta!', votesLabel: 'röster' },
  da: { headline: 'Anmod om en vurdering af offentlig troværdighed', cta: 'Stem!', votesLabel: 'stemmer' },
  el: { headline: 'Αίτηση αξιολόγησης δημόσιας αξιοπιστίας', cta: 'Ψηφίστε!', votesLabel: 'ψήφοι' },
  ga: { headline: 'Iarr measúnú ar inchreidteacht phoiblí', cta: 'Vótáil!', votesLabel: 'vótaí' },
  mt: { headline: 'Itlob valutazzjoni tal-kredibbiltà pubblika', cta: 'Ivvota!', votesLabel: 'voti' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') || 'Podmiot';
  const city = searchParams.get('city') || '';
  const country = searchParams.get('country') || '';
  const votes = searchParams.get('votes') || '0';
  const locale = searchParams.get('locale') || 'en';

  const location = [city, country].filter(Boolean).join(', ');
  const texts = OG_TEXTS[locale] || OG_TEXTS.en;

  // Fetch background from R2 (logo only) — try locale, fallback to en
  let backgroundData: ArrayBuffer | null = null;
  for (const loc of [locale, 'en']) {
    try {
      const res = await fetch(`${R2_BASE}/entity-${loc}.png`);
      if (res.ok) {
        backgroundData = await res.arrayBuffer();
        break;
      }
    } catch { /* try next */ }
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
          position: 'relative',
          backgroundColor: '#0A1628',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background — logo only from R2 */}
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

        {/* Headline — centered, white, two lines, bigger */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '200px',
            right: '200px',
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {texts.headline}
          </span>
        </div>

        {/* Location — top right, aligned with Certo logo center (~35px) */}
        {location && (
          <div
            style={{
              position: 'absolute',
              top: '35px',
              right: '60px',
              display: 'flex',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '22px',
              fontWeight: '600',
            }}
          >
            {location}
          </div>
        )}

        {/* Entity name — centered, large, dominant */}
        <div
          style={{
            position: 'absolute',
            top: '170px',
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
              fontSize: name.length > 40 ? '42px' : '52px',
              fontWeight: 'bold',
              lineHeight: 1.3,
              maxWidth: '1080px',
            }}
          >
            {name}
          </span>
        </div>

        {/* Votes — white 👍 text + number, bottom center */}
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            left: '0',
            right: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <span
              style={{
                fontSize: '56px',
                color: 'white',
              }}
            >
              ☝
            </span>
            <span
              style={{
                color: 'white',
                fontSize: '56px',
                fontWeight: 'bold',
              }}
            >
              {votes}
            </span>
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '16px',
            }}
          >
            {texts.votesLabel}
          </span>
        </div>

        {/* CTA — "Podbij!" same size as entity name */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#C8A55A',
              fontSize: '48px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            {texts.cta}
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
