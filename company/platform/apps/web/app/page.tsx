export default function Home() {
  return (
    <>
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-dot"><div className="nav-dot-inner" /></div>
          <span className="nav-wordmark">CERTO <span>ID</span></span>
        </a>
        <span className="nav-badge">PSA · WARSZAWA</span>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-scan" />
        <div className="hero-content">
          <div className="hero-tag">COMPLIANCE INFRASTRUCTURE</div>
          <h1>Tożsamość.<br />Zgodność.<br /><em>Pewność.</em></h1>
          <p className="hero-desc">
            Infrastruktura weryfikacji i compliance dla instytucji publicznych,
            korporacji i podmiotów regulowanych. Zbudowana na standardach
            Certo Governance Institute.
          </p>
          <div className="hero-cta">
            <a href="/kontakt" className="btn-primary">ROZPOCZNIJ WDROŻENIE →</a>
            <a href="/uslugi" className="btn-secondary">USŁUGI</a>
          </div>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-num">ISO<span>/IEC</span></div>
              <div className="stat-label">27001 · 37301</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">EU<span>·</span>PL</div>
              <div className="stat-label">REGULACJE</div>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="section-label">USŁUGI</div>
        <h2>Trzy warstwy infrastruktury compliance</h2>
        <div className="services-grid">
          {[
            { n: '01 / CERTO ID', t: 'Weryfikacja Tożsamości', d: 'KYC/AML dla podmiotów regulowanych. Automatyczna weryfikacja dokumentów, screening sankcji i PEP, integracja z rejestrami państwowymi.' },
            { n: '02 / CERTO SCORE', t: 'Rating Compliance', d: 'Automatyczny scoring zgodności oparty na metodologii Certo Governance Institute. Pięciostanowy system oceny z pełną ścieżką audytu.' },
            { n: '03 / CERTO ACTION', t: 'Remediation Engine', d: 'Automatyczne plany naprawcze i monitoring ich realizacji. Integracja z systemami ERP, GRC i platformami zarządzania ryzykiem.' },
          ].map((s) => (
            <div className="service-card" key={s.n}>
              <div className="service-num">{s.n}</div>
              <div className="service-title">{s.t}</div>
              <p className="service-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="arch">
        <div className="arch-inner">
          <div className="section-label">ARCHITEKTURA</div>
          <h2>Jak działa Certo ID</h2>
          <div className="arch-flow">
            {[
              { n: '01', t: 'Intake', d: 'Dane podmiotu + dokumenty + kontekst regulacyjny' },
              { n: '02', t: 'Verify', d: 'Weryfikacja tożsamości, screening, rejestr publiczny' },
              { n: '03', t: 'Score', d: 'Automatyczny rating zgodności Certo Vector' },
              { n: '04', t: 'Report', d: 'Raport PDF + API + dashboard Certo Online' },
            ].map((s) => (
              <div className="arch-step" key={s.n}>
                <div className="arch-step-num">{s.n}</div>
                <div className="arch-step-title">{s.t}</div>
                <div className="arch-step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><strong>CERTO ID PSA</strong> · KRS · WARSZAWA · {new Date().getFullYear()}</div>
        <div className="footer-links">
          <a href="https://certo.org.pl">FUNDACJA</a>
          <a href="/polityka">POLITYKA</a>
          <a href="/kontakt">KONTAKT</a>
        </div>
      </footer>
    </>
  );
}
