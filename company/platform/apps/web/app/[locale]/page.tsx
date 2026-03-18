import { locales } from '@certo/i18n/config';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <div className="flex flex-col min-h-screen bg-certo-teal-darker">
      <section className="relative overflow-hidden bg-certo-teal-darker text-white py-24 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-repeat" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-certo-teal-darker to-transparent" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-certo-teal/20 border border-certo-teal/30 text-certo-teal font-mono text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-certo-teal animate-pulse-slow" />
            {t('badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up delay-100">
            {t('hero_line1')}<br />{t('hero_line2')}<br />
            <span className="text-certo-teal">{t('hero_line3')}</span>
          </h1>
          <p className="text-lg md:text-xl text-certo-gray-light/80 max-w-2xl leading-relaxed mb-10 animate-fade-up delay-200 font-medium">
            {t('hero_description')} <strong className="text-white ml-1">{t('hero_built_on')}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
            <a href={`/${locale}/login`} className="inline-flex items-center justify-center px-8 py-4 bg-certo-teal hover:bg-certo-teal-dark text-white font-bold tracking-wide transition-colors rounded-[2px] shadow-lg shadow-certo-teal/20">
              {t('cta_primary')}
              <span className="ml-2">→</span>
            </a>
            <a href="#uslugi" className="inline-flex items-center justify-center px-8 py-4 border border-certo-gray-light/20 hover:border-certo-teal hover:text-certo-teal text-white font-bold tracking-wide transition-colors rounded-[2px] bg-white/5 backdrop-blur-sm">
              {t('cta_secondary')}
            </a>
          </div>
        </div>
      </section>

      <section id="uslugi" className="py-24 w-full bg-certo-teal-darker text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16">
            <h2 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-3">{t('services_label')}</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight max-w-2xl">
              {t('services_title')}
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', tag: 'CERTO ID', title: t('service1_title'), desc: t('service1_desc') },
              { num: '02', tag: 'CERTO SCORE', title: t('service2_title'), desc: t('service2_desc') },
              { num: '03', tag: 'CERTO ACTION', title: t('service3_title'), desc: t('service3_desc') },
            ].map(({ num, tag, title, desc }) => (
              <div key={num} className="bg-certo-teal-darker border border-certo-teal/50 p-8 hover:border-certo-teal hover:shadow-lg transition-all duration-300 rounded-[2px] group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-certo-teal transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <div className="flex justify-between items-start mb-6">
                  <span className="text-sm font-mono font-bold text-certo-teal">{num}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-certo-teal-darker/50 text-certo-teal rounded-sm">{tag}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-certo-teal transition-colors">{title}</h4>
                <p className="text-sm text-certo-gray-light/80 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technologia" className="py-24 bg-certo-teal-darker border-t border-certo-teal-darker/50 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-3">{t('arch_label')}</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('arch_title')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', title: t('step1_title'), desc: t('step1_desc') },
              { num: '02', title: t('step2_title'), desc: t('step2_desc') },
              { num: '03', title: t('step3_title'), desc: t('step3_desc') },
              { num: '04', title: t('step4_title'), desc: t('step4_desc') },
            ].map(({ num, title, desc }, i) => (
              <div key={num} className="relative p-6 bg-certo-teal-darker border border-certo-teal/50 rounded-[2px] z-10">
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-4 w-4 border-t-2 border-dashed border-certo-teal/30 z-0" />}
                <div className="text-xs font-mono font-bold text-certo-teal mb-3">{num}</div>
                <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                <p className="text-xs text-certo-gray-light/80 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-certo-teal-darker text-white py-16 border-b border-certo-teal-darker/50">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: t('badge_iso'), value: '27001 · 37301' },
            { label: t('badge_compliance'), value: 'EU · PL GDPR' },
            { label: t('badge_kyc'), value: 'KYC / AML' },
            { label: t('badge_governance'), value: 'Certo Vector' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col p-4 border-l-2 border-certo-teal/40">
              <span className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-2">{label}</span>
              <span className="text-xl md:text-2xl font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
