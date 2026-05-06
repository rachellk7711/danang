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
        navy: {
          DEFAULT: '#0d1b2a',
          card: '#1e2d3d',
          sub: '#12202e',
        },
        teal: {
          DEFAULT: '#0e7c7b',
        },
        mint: {
          DEFAULT: '#2ab5b3',
        },
        coral: {
          DEFAULT: '#e8312a',
        },
        mango: {
          DEFAULT: '#f5a623',
        },
        forsythia: {
          DEFAULT: '#f9d000',
        },
        card: {
          local: '#112028',
          tourist: '#1e2010',
        },
        text: {
          primary: '#e5e7eb',
          secondary: '#9ca3af',
          hint: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
