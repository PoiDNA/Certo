export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-certo-gray-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-certo-teal-darker text-white py-24 md:py-32 px-6">
        <div className="absolute inset-0 opacity-10 bg-repeat" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-certo-teal-darker to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-certo-teal/20 border border-certo-teal/30 text-certo-teal font-mono text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-certo-teal animate-pulse-slow" />
            Compliance Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up delay-100">
            Tożsamość.<br />Zgodność.<br />
            <span className="text-certo-teal">Pewność.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-certo-gray-light/80 max-w-2xl leading-relaxed mb-10 animate-fade-up delay-200 font-medium">
            Infrastruktura weryfikacji i compliance dla instytucji publicznych,
            korporacji i podmiotów regulowanych. Zbudowana na standardach
            <strong className="text-white ml-1">Certo Governance Institute</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
            <a href="/kontakt" className="inline-flex items-center justify-center px-8 py-4 bg-certo-teal hover:bg-certo-teal-dark text-white font-bold tracking-wide transition-colors rounded-[2px] shadow-lg shadow-certo-teal/20">
              ROZPOCZNIJ WDROŻENIE
              <span className="ml-2">→</span>
            </a>
            <a href="#uslugi" className="inline-flex items-center justify-center px-8 py-4 border border-certo-gray-light/20 hover:border-certo-teal hover:text-certo-teal text-white font-bold tracking-wide transition-colors rounded-[2px] bg-white/5 backdrop-blur-sm">
              USŁUGI
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-certo-teal-darker text-white py-16 px-6 border-b border-certo-teal-darker/50">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Standardy ISO', value: '27001 · 37301' },
            { label: 'Zgodność regulacyjna', value: 'EU · PL GDPR' },
            { label: 'Weryfikacja tożsamości', value: 'KYC / AML' },
            { label: 'Ocena governance', value: 'Certo Vector' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col p-4 border-l-2 border-certo-teal/40">
              <span className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-2">{stat.label}</span>
              <span className="text-xl md:text-2xl font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="uslugi" className="py-24 px-6 mx-auto max-w-6xl w-full bg-certo-teal-darker text-white">
        <div className="mb-16">
          <h2 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-3">USŁUGI</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight max-w-2xl">
            Trzy warstwy infrastruktury compliance
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', t: 'Weryfikacja Tożsamości', d: 'KYC/AML dla podmiotów regulowanych. Automatyczna weryfikacja dokumentów, screening sankcji i PEP, integracja z rejestrami państwowymi.', tag: 'CERTO ID' },
            { n: '02', t: 'Rating Compliance', d: 'Automatyczny scoring zgodności oparty na metodologii Certo Governance Institute. Pięciostanowy system oceny z pełną ścieżką audytu.', tag: 'CERTO SCORE' },
            { n: '03', t: 'Remediation Engine', d: 'Automatyczne plany naprawcze i monitoring ich realizacji. Integracja z systemami ERP, GRC i platformami zarządzania ryzykiem.', tag: 'CERTO ACTION' },
          ].map((s) => (
            <div key={s.n} className="bg-certo-teal-darker border border-certo-teal/50 p-8 hover:border-certo-teal hover:shadow-lg transition-all duration-300 rounded-[2px] group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-certo-teal transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-mono font-bold text-certo-teal">{s.n}</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-certo-teal-darker/50 text-certo-teal rounded-sm">{s.tag}</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 group-hover:text-certo-teal transition-colors">{s.t}</h4>
              <p className="text-sm text-certo-gray-light/80 leading-relaxed font-medium">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section id="technologia" className="py-24 px-6 bg-certo-teal-darker border-t border-certo-teal-darker/50 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-xs font-mono font-bold text-certo-teal uppercase tracking-widest mb-3">ARCHITEKTURA</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Jak działa Certo ID
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', t: 'Intake', d: 'Dane podmiotu + dokumenty + kontekst regulacyjny' },
              { n: '02', t: 'Verify', d: 'Weryfikacja tożsamości, screening, rejestr publiczny' },
              { n: '03', t: 'Score', d: 'Automatyczny rating zgodności Certo Vector' },
              { n: '04', t: 'Report', d: 'Raport PDF + API + dashboard Certo Online' },
            ].map((s, i) => (
              <div key={s.n} className="relative p-6 bg-certo-teal-darker border border-certo-teal/50 rounded-[2px] z-10">
                {i !== 3 && <div className="hidden lg:block absolute top-1/2 -right-4 w-4 border-t-2 border-dashed border-certo-teal/30 z-0" />}
                <div className="text-xs font-mono font-bold text-certo-teal mb-3">{s.n}</div>
                <h4 className="text-lg font-bold text-white mb-2">{s.t}</h4>
                <p className="text-xs text-certo-gray-light/80 leading-relaxed font-medium">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
