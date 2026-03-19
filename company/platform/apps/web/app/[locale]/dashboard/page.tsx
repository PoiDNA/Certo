import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  return (
    <div className="min-h-screen bg-certo-gray-light">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-certo-teal-darker mb-2">{t('title')}</h1>
        <p className="text-certo-gray-dark mb-10">{t('welcome', { name: 'User' })}</p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm">
            <h3 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-2">{t('your_rating')}</h3>
            <div className="text-4xl font-bold text-certo-teal-darker">—</div>
            <p className="text-sm text-certo-gray-dark mt-2">Brak aktywnego ratingu</p>
          </div>
          <div className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm">
            <h3 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-2">{t('your_delegates')}</h3>
            <div className="text-4xl font-bold text-certo-teal-darker">0</div>
            <p className="text-sm text-certo-gray-dark mt-2">Certo Delegate</p>
          </div>
          <div className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm">
            <h3 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-2">{t('your_accords')}</h3>
            <div className="text-4xl font-bold text-certo-teal-darker">0</div>
            <p className="text-sm text-certo-gray-dark mt-2">Certo Accord</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm">
            <h3 className="text-lg font-bold text-certo-teal-darker mb-4">{t('recent_activity')}</h3>
            <p className="text-sm text-certo-gray-dark">Brak aktywności</p>
          </div>
          <div className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm">
            <h3 className="text-lg font-bold text-certo-teal-darker mb-4">{t('quick_actions')}</h3>
            <div className="flex flex-col gap-3">
              <a href={`/${locale}/profile`} className="text-sm text-certo-teal hover:text-certo-teal-dark font-medium">→ Edytuj profil</a>
              <a href={`/${locale}/delegate`} className="text-sm text-certo-teal hover:text-certo-teal-dark font-medium">→ Zarządzaj delegatami</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
