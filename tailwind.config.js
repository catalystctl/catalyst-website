import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{astro,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Outfit Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'Fira Code', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(25 55% 95%)',
          100: 'hsl(25 55% 90%)',
          200: 'hsl(25 55% 80%)',
          300: 'hsl(25 55% 70%)',
          400: 'hsl(25 55% 65%)',
          500: 'hsl(25 55% 58%)',
          600: 'hsl(25 55% 50%)',
          700: 'hsl(25 55% 42%)',
          800: 'hsl(25 55% 32%)',
          900: 'hsl(25 55% 22%)',
          950: 'hsl(25 55% 12%)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        ring: 'hsl(var(--ring))',
        success: {
          DEFAULT: 'hsl(var(--success))',
          muted: 'hsl(var(--success-muted))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          muted: 'hsl(var(--warning-muted))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          muted: 'hsl(var(--danger-muted))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          muted: 'hsl(var(--info-muted))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface-1))',
          0: 'hsl(var(--surface-0))',
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        zinc: {
          50: 'hsl(var(--zinc-50))',
          100: 'hsl(var(--zinc-100))',
          200: 'hsl(var(--zinc-200))',
          300: 'hsl(var(--zinc-300))',
          400: 'hsl(var(--zinc-400))',
          500: 'hsl(var(--zinc-500))',
          600: 'hsl(var(--zinc-600))',
          700: 'hsl(var(--zinc-700))',
          800: 'hsl(var(--zinc-800))',
          900: 'hsl(var(--zinc-900))',
          950: 'hsl(var(--zinc-950))',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'surface-light': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'surface-dark': '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        'elevated': '0 4px 12px -2px rgb(0 0 0 / 0.1)',
        'elevated-dark': '0 4px 12px -2px rgb(0 0 0 / 0.6)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
