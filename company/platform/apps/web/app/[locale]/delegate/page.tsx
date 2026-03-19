import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function DelegatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Delegates' });

  return (
    <div className="min-h-screen bg-certo-gray-light">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-certo-teal-darker">{t('title')}</h1>
          <button className="px-6 py-3 bg-certo-teal text-white font-bold text-sm tracking-wide rounded-[2px] hover:bg-certo-teal-dark transition-colors">
            + {t('add_delegate')}
          </button>
        </div>

        <div className="bg-white border border-certo-gray rounded-[2px] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-certo-gray-light border-b border-certo-gray">
                <th className="text-left px-6 py-4 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest">{t('delegate_id')}</th>
                <th className="text-left px-6 py-4 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest">{t('delegate_status')}</th>
                <th className="text-left px-6 py-4 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest">{t('primary_link')}</th>
                <th className="text-left px-6 py-4 text-xs font-mono font-bold text-certo-teal uppercase tracking-widest">{t('failover_link')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-certo-gray-dark">
                  Brak delegatów. Kliknij &quot;{t('add_delegate')}&quot; aby dodać pierwszego.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {(['plan_basic', 'plan_standard', 'plan_premium'] as const).map(plan => (
            <div key={plan} className="bg-white border border-certo-gray p-6 rounded-[2px] shadow-sm text-center">
              <h3 className="text-lg font-bold text-certo-teal-darker mb-2">{t(plan)}</h3>
              <p className="text-xs text-certo-gray-dark">Certo Delegate</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
