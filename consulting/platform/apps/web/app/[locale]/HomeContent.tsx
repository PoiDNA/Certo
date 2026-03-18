'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const EXPERTISE_KEYS = ['area_health', 'area_local_gov', 'area_defense', 'area_finance', 'area_education'] as const;

const ADVISORS = [
  { id: 1, name: 'dr Anna Kowalska', spec: 'Ochrona zdrowia / Compliance', rating: 'A+' },
  { id: 2, name: 'Michał Nowak', spec: 'Finanse / Audyt', rating: 'A' },
  { id: 3, name: 'prof. Jan Wiśniewski', spec: 'Obronność / Cyberbezpieczeństwo', rating: 'A++' },
];

export default function HomeContent() {
  const t = useTranslations('Home');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <>
      <section className="relative bg-gradient-to-b from-[#060D18] to-certo-primary pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-certo-secondary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-6 md:px-20 relative z-10 w-full">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="font-display text-white text-5xl md:text-[72px] leading-[1.1] font-light tracking-[-0.02em] mb-10 whitespace-pre-line">
              {t('hero_title')}
            </h1>
            <p className="text-certo-surface/80 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl font-light">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <a href="#doradcy" className="inline-flex items-center justify-center px-10 py-5 border border-certo-accent text-certo-accent hover:bg-certo-accent hover:text-white transition-all duration-300 text-xs font-semibold uppercase tracking-[0.15em] bg-transparent">
                {t('hero_cta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="doradcy" className="py-24 md:py-32 bg-certo-surface">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="max-w-4xl mb-20">
            <h2 className="font-display text-4xl md:text-5xl text-certo-primary font-light mb-10">
              {t('finder_title')}
            </h2>
            <div className="flex flex-wrap gap-4">
              {EXPERTISE_KEYS.map(key => {
                const label = t(key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedArea(key === selectedArea ? null : key)}
                    className={`px-8 py-3 transition-all duration-300 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                      selectedArea === key
                        ? 'border border-certo-accent bg-certo-accent text-white'
                        : 'border border-certo-accent text-certo-primary bg-transparent hover:bg-certo-accent hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${selectedArea ? 'max-h-[800px] opacity-100 mb-20' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white p-10 md:p-12 border border-certo-border shadow-sm">
              <h3 className="text-xl md:text-2xl font-display text-certo-primary mb-8 font-light">
                {t('form_title')} <span className="text-certo-accent font-bold">{selectedArea ? t(selectedArea) : ''}</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder={t('form_name')} className="w-full p-4 border border-certo-border bg-certo-surface/30 focus:outline-none focus:border-certo-accent focus:bg-white transition-colors" />
                <input type="email" placeholder={t('form_email')} className="w-full p-4 border border-certo-border bg-certo-surface/30 focus:outline-none focus:border-certo-accent focus:bg-white transition-colors" />
                <input type="text" placeholder={t('form_org')} className="w-full p-4 border border-certo-border bg-certo-surface/30 focus:outline-none focus:border-certo-accent focus:bg-white transition-colors md:col-span-2" />
                <button className="md:col-span-2 mt-4 bg-certo-primary text-white py-5 px-8 font-semibold uppercase tracking-[0.15em] text-xs hover:bg-certo-secondary transition-colors duration-300 w-full md:w-auto md:ml-auto">
                  {t('form_submit')}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="font-display text-3xl text-certo-primary font-light mb-10 border-b border-certo-border pb-4">
              {t('advisors_title')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ADVISORS.map(adv => (
                <div key={adv.id} className="group bg-white border border-certo-border hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full">
                  <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative border-b border-certo-border">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Fotografia (cz/b)</div>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-6 gap-2">
                      <span className="text-[11px] text-certo-muted uppercase tracking-[0.15em] leading-relaxed">{adv.spec}</span>
                      <span className="bg-certo-surface text-certo-accent border border-certo-accent/30 text-[10px] px-2 py-1 uppercase font-bold whitespace-nowrap">RATING {adv.rating}</span>
                    </div>
                    <h4 className="font-display text-2xl text-certo-primary mb-4 group-hover:text-certo-accent transition-colors duration-300">{adv.name}</h4>
                    <p className="text-sm text-certo-muted leading-relaxed mt-auto font-light">
                      {t('advisor_bio')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
