import { locales } from "@certo/i18n/config";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function GalaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isPl = locale === "pl";

  const tenants = [
    { id: "schools", name: isPl ? "Szkoły" : "Schools", icon: "🏫", status: "active" },
    { id: "culture", name: isPl ? "Ośrodki Kultury" : "Culture Centers", icon: "🎭", status: "coming-q1-2027" },
    { id: "social-care", name: isPl ? "DPS-y" : "Social Care", icon: "🏥", status: "coming-q2-2027" },
    { id: "sports", name: isPl ? "Ośrodki Sportowe" : "Sports Centers", icon: "⚽", status: "coming-q3-2027" },
  ];

  const diamondCategories = [
    { name: isPl ? "Diament Transparentności" : "Diamond of Transparency", icon: "🔍", desc: isPl ? "Najwyższy Indeks Transparentności" : "Highest Transparency Index" },
    { name: isPl ? "Diament Społeczności" : "Diamond of Community", icon: "🤝", desc: isPl ? "Najlepsza relacja z interesariuszami" : "Best stakeholder relations" },
    { name: isPl ? "Diament Innowacji" : "Diamond of Innovation", icon: "💡", desc: isPl ? "Najbardziej kreatywne rozwiązania" : "Most creative solutions" },
    { name: isPl ? "Diament Mentorstwa" : "Diamond of Mentorship", icon: "🌱", desc: isPl ? "Organizacja, która pomogła innym" : "Organization that helped others" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-6">💎</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {isPl ? "Europejska Gala Diamentów Certo" : "European Certo Diamond Gala"}
        </h1>
        <p className="text-xl text-certo-navy/60 dark:text-certo-dark-muted max-w-2xl mx-auto">
          {isPl
            ? "Międzynarodowa ceremonia wręczenia Diamentów Certo — najwyższego wyróżnienia za doskonałość w zarządzaniu"
            : "International ceremony awarding Certo Diamonds — the highest recognition for governance excellence"}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-certo-gold/10 border border-certo-gold/20">
          <span className="text-certo-gold font-bold">
            {isPl ? "Maj 2027 — Pierwsza edycja" : "May 2027 — First edition"}
          </span>
        </div>
      </div>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isPl ? "Jak to działa?" : "How does it work?"}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold mb-2">{isPl ? "Krajowe gale" : "National galas"}</h3>
            <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
              {isPl
                ? "Każdy kraj przeprowadza własną galę, przyznając Diamenty Certo organizacjom z wynikiem 90+"
                : "Each country holds its own gala, awarding Certo Diamonds to organizations scoring 90+"}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border text-center">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-bold mb-2">{isPl ? "Europejska gala" : "European gala"}</h3>
            <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
              {isPl
                ? "Zwycięzcy krajowi spotykają się na wspólnej gali online/hybrydowej ze wszystkimi krajami UE"
                : "National winners gather at a joint online/hybrid gala with all EU countries"}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border text-center">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="font-bold mb-2">{isPl ? "Specjalne Diamenty" : "Special Diamonds"}</h3>
            <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
              {isPl
                ? "Patron Olimpiady przyznaje specjalne Diamenty w 4 kategoriach tematycznych"
                : "The Olympiad Patron awards special Diamonds in 4 thematic categories"}
            </p>
          </div>
        </div>
      </section>

      {/* Diamond categories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isPl ? "Kategorie Diamentów" : "Diamond categories"}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {diamondCategories.map((cat) => (
            <div
              key={cat.name}
              className="p-6 rounded-xl border border-certo-gold/20 bg-certo-gold/5 dark:bg-certo-gold/5 flex items-start gap-4"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="font-bold text-certo-gold">{cat.name}</h3>
                <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Participating sectors */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isPl ? "Sektory uczestniczące" : "Participating sectors"}
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {tenants.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-xl text-center border ${
                t.status === "active"
                  ? "border-certo-gold bg-white dark:bg-certo-dark-surface"
                  : "border-certo-navy/10 dark:border-certo-dark-border bg-certo-navy/5 dark:bg-certo-dark-surface/50 opacity-60"
              }`}
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <h3 className="font-bold mb-1">{t.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {t.status === "active"
                  ? isPl ? "Aktywny" : "Active"
                  : t.status.replace("coming-", "")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isPl ? "Harmonogram" : "Timeline"}
        </h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            { date: isPl ? "Wrzesień 2026" : "September 2026", event: isPl ? "Start pilotażu — Szkoły" : "Pilot launch — Schools" },
            { date: isPl ? "Grudzień 2026" : "December 2026", event: isPl ? "Krajowa Gala Diamentów — Szkoły" : "National Diamond Gala — Schools" },
            { date: "Q1 2027", event: isPl ? "Launch Ośrodków Kultury" : "Culture Centers launch" },
            { date: "Q2 2027", event: isPl ? "Launch DPS-ów" : "Social Care launch" },
            { date: isPl ? "Maj 2027" : "May 2027", event: isPl ? "Pierwsza Europejska Gala Diamentów Certo" : "First European Certo Diamond Gala" },
          ].map((item) => (
            <div key={item.date} className="flex items-center gap-4">
              <div className="w-32 text-right text-sm font-semibold text-certo-gold">
                {item.date}
              </div>
              <div className="w-3 h-3 rounded-full bg-certo-gold shrink-0" />
              <div className="flex-1 text-sm">{item.event}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <a
          href={`/${locale}/olympiad/schools/register`}
          className="inline-block px-8 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors"
        >
          {isPl ? "Zarejestruj organizację" : "Register organization"}
        </a>
        <p className="mt-3 text-sm text-certo-navy/40 dark:text-certo-dark-muted">
          {isPl
            ? "Rozpocznij swoją drogę do Diamentu Certo"
            : "Start your journey to a Certo Diamond"}
        </p>
      </div>
    </div>
  );
}
