/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#155E63',
        background: '#F7F3E8',
        card: '#FFFFFF',
        accent: '#D99A5B',
        text: '#252525',
        'text-secondary': '#6B6B6B',
        'status-available-bg': '#ECFDF5',
        'status-available-text': '#047857',
        'status-limited-bg': '#FFFBEB',
        'status-limited-text': '#B45309',
        'status-unavailable-bg': '#FEF2F2',
        'status-unavailable-text': '#B91C1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
    },
  },
  plugins: [],
}
