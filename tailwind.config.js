/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        panel: '#141414',
        panel2: '#1A1A1A',
        line: 'rgba(255,255,255,0.06)',
        line2: 'rgba(255,255,255,0.1)',
        muted: '#8C8C8C',
        muted2: '#999999',
        live: '#E53E3E',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
};
