import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e50914',
        'primary-light': '#f40612',
        accent: '#46d369',
        dark: {
          bg: '#0a0a0f',
          surface: '#141420',
          elevated: '#1c1c2e',
          card: '#24243a',
          border: '#2a2a42',
        },
        netflix: {
          red: '#e50914',
          dark: '#141414',
          gray: '#808080',
          'light-gray': '#b3b3b3',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #e50914 0%, #ff4d4d 50%, #ff8a80 100%)',
        'gradient-dark': 'linear-gradient(180deg, transparent 0%, #0a0a0f 100%)',
        'gradient-hero': 'linear-gradient(to right, #0a0a0f 0%, rgba(10,10,15,0.7) 50%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
