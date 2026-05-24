import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0e1a',
          panel: '#0f1628',
          card: '#141d35',
          elevated: '#1a2440',
          border: 'rgba(255,255,255,0.06)',
        },
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          elevated: '#f59e0b',
          moderate: '#eab308',
          low: '#22c55e',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          red: '#ef4444',
          orange: '#f97316',
          green: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 60s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 16px rgba(239,68,68,0.35)',
        'glow-orange': '0 0 16px rgba(249,115,22,0.35)',
        'glow-cyan': '0 0 16px rgba(6,182,212,0.25)',
        'glow-green': '0 0 16px rgba(34,197,94,0.25)',
        panel: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        card: '0 2px 12px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
