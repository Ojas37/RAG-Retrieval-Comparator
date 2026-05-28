/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        cardBg: 'var(--card-bg)',
        accentCyan: 'var(--accent-cyan)',
        accentPurple: 'var(--accent-purple)',
        accentBlue: 'var(--accent-blue)',
        accentGreen: 'var(--accent-green)',
        accentYellow: 'var(--accent-yellow)',
        accentRed: 'var(--accent-red)',
        borderMuted: 'var(--border-muted)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 15px -3px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
        'dash-pulse': 'dashPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, filter: 'drop-shadow(0 0 5px var(--accent-cyan))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 15px var(--accent-cyan))' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        },
        dashPulse: {
          '0%, 100%': { strokeDashoffset: 0 },
          '50%': { strokeDashoffset: 20 },
        }
      }
    },
  },
  plugins: [],
}
