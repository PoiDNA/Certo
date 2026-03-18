import { locales } from '@certo/i18n/config';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile' });

  return (
    <div className="min-h-screen bg-certo-gray-light">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-certo-teal-darker mb-8">{t('title')}</h1>

        <div className="bg-white border border-certo-gray p-8 rounded-[2px] shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-certo-gray">
            <div className="w-16 h-16 rounded-full bg-certo-teal/10 flex items-center justify-center text-certo-teal text-2xl font-bold">
              ?
            </div>
            <div>
              <div className="text-lg font-bold text-certo-teal-darker">—</div>
              <div className="text-sm text-certo-gray-dark flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-certo-teal/10 text-certo-teal px-2 py-0.5 rounded-sm font-medium">
                  ✓ {t('verified_badge')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-1 block">{t('organization')}</label>
              <p className="text-certo-teal-darker font-medium">—</p>
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-1 block">{t('contact_person')}</label>
              <p className="text-certo-teal-darker font-medium">—</p>
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-1 block">{t('sector')}</label>
              <p className="text-certo-teal-darker font-medium">—</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-certo-gray">
            <button className="px-6 py-3 bg-certo-teal text-white font-bold text-sm tracking-wide rounded-[2px] hover:bg-certo-teal-dark transition-colors">
              {t('edit_profile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
