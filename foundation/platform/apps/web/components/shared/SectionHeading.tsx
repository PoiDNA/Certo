export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className={`text-3xl md:text-4xl font-serif font-bold mb-4 ${light ? 'text-certo-cream' : 'text-certo-navy'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${light ? 'text-certo-cream/70' : 'text-certo-navy/60'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
