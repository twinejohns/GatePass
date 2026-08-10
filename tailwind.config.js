/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1698E1',      // Primary Sky Blue
          gold: '#F7D06B',      // Primary Gold Amber
          ocean: '#1D69D6',     // Secondary Deep Ocean
          dark: '#222222',      // Secondary Dark Charcoal
          electric: '#3250FF',  // Secondary Royal Electric
          emerald: '#01BD9B',   // Secondary Vibrant Mint Green
          coral: '#E55555',     // Secondary Coral Red
          cyan: '#58BAD7',      // Secondary Light Cyan
          grey: '#666666',      // Secondary Medium Grey
          muted: '#6E6E6E'      // Secondary Muted Slate
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
