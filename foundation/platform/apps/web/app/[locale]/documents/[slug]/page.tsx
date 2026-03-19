import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function DocumentPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return (
    <div className="py-8">
      <div className="mb-12 border-b-[3px] border-certo-gold pb-6">
        <h1 className="text-4xl font-serif font-bold text-certo-navy tracking-tight">{slug}</h1>
      </div>
    </div>
  );
}
