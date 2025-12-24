import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
      },
      backgroundColor: {
        primary: 'hsl(var(--primary))',
      },
    },
  },
  plugins: [typography],
}