import { getTranslations } from 'next-intl/server';

export default async function Footer({ locale }: { locale: string }) {
  const tf = await getTranslations({ locale, namespace: 'Footer' });

  return (
    <footer className="bg-certo-navy dark:bg-certo-dark-header border-t-[3px] border-certo-gold mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-certo-gold-light font-serif text-xl tracking-wide mb-2">Certo Governance Institute</div>
            <p className="text-xs text-certo-cream/50 leading-relaxed">00-124 Warszawa, ul. Rondo ONZ 1</p>
            <a href="mailto:rating@certogov.org" className="text-xs text-certo-cream/50 hover:text-certo-gold transition-colors">rating@certogov.org</a>
          </div>
          <div />
          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <a href={`/${locale}/pilot`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('pilot')}</a>
            <a href={`/${locale}/privacy`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('privacy')}</a>
            <a href={`/${locale}/terms`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('terms')}</a>
            <a href={`/${locale}/contact`} className="text-certo-gold hover:text-certo-gold-light transition-colors">{tf('contact')}</a>
          </div>
        </div>
        <div className="border-t border-certo-gold/20 pt-6 text-center">
          <div className="text-xs text-certo-cream/40">
            {tf('copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>
    </footer>
  );
}
