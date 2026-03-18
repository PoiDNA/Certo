'use client';

const R2_BASE = process.env.NEXT_PUBLIC_R2_URL ?? 'https://pub-4d688aa7ff85432985833ce88b08ec4d.r2.dev';

interface LocalizedImageProps {
  /** Ścieżka względem R2, np. "foundation/images/infographic.png" */
  src: string;
  locale: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Renderuje obraz próbując najpierw wersji zlokalizowanej:
 *   R2_BASE/{locale}/{src}
 * Na błędzie (brak pliku) cofa się do wersji neutralnej:
 *   R2_BASE/{src}
 *
 * Konwencja R2:
 *   Neutralne:   r2.dev/foundation/images/logo.png
 *   Per locale:  r2.dev/pl/foundation/images/infographic.png
 */
export function LocalizedImage({ src, locale, alt, width, height, className }: LocalizedImageProps) {
  const localizedUrl = `${R2_BASE}/${locale}/${src}`;
  const neutralUrl = `${R2_BASE}/${src}`;

  return (
    <img
      src={localizedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== neutralUrl) {
          img.src = neutralUrl;
        }
      }}
    />
  );
}
