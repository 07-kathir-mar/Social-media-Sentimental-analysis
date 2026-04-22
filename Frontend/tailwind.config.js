/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0b0b0f',
        panel: '#101018',
        glow: '#f97316',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #facc15, #fb923c, #ef4444)',
        'mesh-gradient':
          'radial-gradient(circle at top left, rgba(250, 204, 21, 0.18), transparent 30%), radial-gradient(circle at top right, rgba(239, 68, 68, 0.14), transparent 28%), radial-gradient(circle at bottom center, rgba(251, 146, 60, 0.16), transparent 32%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(251, 146, 60, 0.04), 0 6px 14px rgba(251, 146, 60, 0.025), 0 10px 22px rgba(239, 68, 68, 0.015)',
        card: '0 20px 50px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};