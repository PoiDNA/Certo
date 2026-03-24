export default function PhotoDivider({
  imageUrl,
  alt,
  height = 'h-64 md:h-96',
}: {
  imageUrl?: string;
  alt: string;
  height?: string;
}) {
  return (
    <div
      className={`w-full ${height} bg-fixed-cover relative overflow-hidden hidden md:block`}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      role="img"
      aria-label={alt}
    >
      {/* Subtle gradient vignette */}
      {imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-certo-navy/20 via-transparent to-certo-navy/20" />
      )}

      {/* Placeholder when no image */}
      {!imageUrl && (
        <div className="absolute inset-0 bg-certo-surface flex items-center justify-center">
          <span className="text-xs text-certo-fg-muted uppercase tracking-widest">{alt}</span>
        </div>
      )}
    </div>
  );
}
