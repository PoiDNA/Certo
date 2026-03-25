/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'certo': {
          /* ── Raw palette (immutable — never change with theme) ── */
          'teal':        '#2A7A8C',
          'teal-dark':   '#1B4F5A',
          'teal-darker': '#0D3340',
          'white':       '#FFFFFF',
          'gray-light':  '#F4F6F7',
          'gray':        '#E2E8EA',

          /* ── Semantic tokens (reference CSS vars, adapt to theme) ── */
          'bg':           'var(--certo-bg)',
          'fg':           'var(--certo-fg)',
          'fg-muted':     'var(--certo-fg-muted)',
          'card':         'var(--certo-card)',
          'card-border':  'var(--certo-card-border)',
          'surface':      'var(--certo-surface)',
          'header-bg':    'var(--certo-header-bg)',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
