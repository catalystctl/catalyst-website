import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Catalyst website theme.
 *
 * Mirrors the Catalyst panel's design system ("deck") so the marketing site and
 * the product read as one surface. The panel ships a warm-charcoal neutral ramp,
 * a 4px control radius, Oxanium display type, and JetBrains Mono tabular data.
 * Values here are 1:1 with the panel's `:root` / `.dark` token blocks, with the
 * brand accent pinned to the peach `--signal` used across the site.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{astro,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Oxanium Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Panel micro-type scale
        micro: ['.6875rem', { lineHeight: '1.35' }],
        mini: ['.75rem', { lineHeight: '1.4' }],
        data: ['.8125rem', { lineHeight: '1.45' }],
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
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
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
        // Panel semantic neutrals
        ink: 'hsl(var(--ink))',
        chalk: 'hsl(var(--chalk))',
        dust: 'hsl(var(--dust))',
        edge: 'hsl(var(--edge))',
        panel: {
          DEFAULT: 'hsl(var(--panel))',
          2: 'hsl(var(--panel-2))',
        },
        scrim: 'hsl(var(--scrim))',
        surface: {
          DEFAULT: 'hsl(var(--surface-1))',
          0: 'hsl(var(--surface-0))',
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        // Cool zinc ramp, matching the panel's `.dark` block
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
        // Control radius is 4px (`--radius`), frames step up from there.
        sm: 'var(--radius)',
        DEFAULT: 'var(--radius)',
        md: 'calc(var(--radius) + 2px)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 10px)',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        surface: 'var(--shadow-surface)',
        elevated: 'var(--shadow-elevated)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
