/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        tutora: {
          // Cores primárias (brandbook Tutora 01/2022)
          'azul-escuro': '#051C2C',     // Pantone 296C — fundo principal
          'laranja': '#FF6C37',          // Pantone 1645C — CTAs e destaques
          'verde-agua': '#1ECAD3',       // Pantone 319C — destaques secundários, links
          'cinza-claro': '#E5E1E6',      // Pantone 663C — neutros
          // Cores secundárias (uso pontual)
          'azul-secundario': '#303454',  // Pantone 7546C — cards sobre fundo escuro
          'vermelho': '#CE0E2D',         // Pantone 186C — alertas, lançamentos
        },
      },
      fontFamily: {
        // Baloo 2 — títulos, destaques (próxima ao logotipo)
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        // Montserrat — texto corrido
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw + 1rem, 4.75rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 3.5vw + 1rem, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.5rem, 2vw + 1rem, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        prose: '70ch',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(5, 28, 44, 0.06), 0 8px 24px -8px rgba(5, 28, 44, 0.18)',
        'card-hover': '0 4px 12px rgba(5, 28, 44, 0.1), 0 24px 48px -12px rgba(5, 28, 44, 0.32)',
        'sticky-up': '0 -4px 24px -6px rgba(5, 28, 44, 0.18)',
      },
      borderColor: {
        'tutora-sutil': 'rgba(48, 52, 84, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
