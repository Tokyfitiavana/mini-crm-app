/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  darkMode: 'class',

  theme: {
    extend: {

      colors: {
        'bg': 'var(--color-bg)',
        'card': 'var(--color-card)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'border': 'var(--color-border)',
        'primary': 'var(--color-primary)',
      },
    },
  },
  plugins: [],
}