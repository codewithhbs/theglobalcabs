/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          800: '#111B2E',
          700: '#1A2640',
        },
        amber: {
          400: '#FBBF24',
          500: '#F5A623',
          600: '#D98E0B',
        },
        mist: '#F6F8FB',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,.06), 0 8px 24px -8px rgba(11,18,32,.12)',
        lift: '0 24px 48px -16px rgba(11,18,32,.25)',
      },
      backgroundImage: {
        'lane-line': 'repeating-linear-gradient(90deg, #FBBF24 0 24px, transparent 24px 40px)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'drive': { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '80px 0' } },
      },
      animation: {
        'fade-up': 'fade-up .6s ease-out both',
        'drive': 'drive 2.4s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
