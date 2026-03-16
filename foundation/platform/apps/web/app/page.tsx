export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
        Certo Governance Institute
      </h1>
      <p style={{ color: '#4A5568', marginBottom: '2rem' }}>
        Niezależny rating jakości governance dla sektora publicznego.
      </p>
      <a href="/docs" style={{ 
        display: 'inline-block', padding: '0.75rem 1.5rem',
        background: '#0F1F3D', color: '#fff', borderRadius: 4,
        textDecoration: 'none', fontWeight: 600
      }}>
        Dokumenty Fundacji →
      </a>
    </main>
  );
}
