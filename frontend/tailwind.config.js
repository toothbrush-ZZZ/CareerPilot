module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base:           'var(--cp-bg)',
        panel:          'var(--cp-surface)',
        inset:          'var(--cp-card)',
        'panel-border': 'var(--cp-border)',
        primary:        'var(--cp-text-primary)',
        secondary:      'var(--cp-text-secondary)',
        muted:          'var(--cp-text-muted)',
        accent:         'var(--cp-accent)',
        'accent-dim':   'var(--cp-accent-dim)',
        'accent-glow':  'var(--cp-accent-glow)',
        gold:           'var(--cp-gold)',
        danger:         'var(--cp-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
