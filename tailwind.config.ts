import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: '#6B7F5E',
        'teal-light': '#E8EDE4',
        'island-green': '#4A5A3E',
        'warm-yellow': '#FFD166',
        'coral-red': '#EF6461',
        cream: '#FFF8F0',
        'cream-dark': '#FEF0DB',
        surface: '#FEF6EC',
        'surface-cool': '#F0F3ED',
        'text-primary': '#5A5E6A',
        'text-secondary': '#6B7280',
        'warm-border': '#E8D5B5',
        'warm-gray': '#F5F0EB',
      },
      borderRadius: {
        card: '16px',
        'card-lg': '20px',
      },
      fontFamily: {
        display: ['var(--font-suka-coffee)', 'sans-serif'],
        body: ['var(--font-figtree)', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 2px 12px rgba(139, 109, 71, 0.08)',
        'warm-lg': '0 4px 20px rgba(139, 109, 71, 0.12)',
      },
    },
  },
  plugins: [],
}
export default config
