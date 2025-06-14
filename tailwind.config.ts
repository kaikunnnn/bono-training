import type { Config } from 'tailwindcss'

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./src/training/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        'training': {
          DEFAULT: '#FF9900',
          'background': '#FFF9F4',
          'dark': '#0D221D',
          'text': '#1D382F',
          'primary': 'hsl(var(--training-primary))',
          'primary-foreground': 'hsl(var(--training-primary-foreground))',
          'secondary': 'hsl(var(--training-secondary))',
          'secondary-foreground': 'hsl(var(--training-secondary-foreground))',
          'card': 'hsl(var(--training-card))',
          'border': 'hsl(var(--training-border))',
          'accent': 'hsl(var(--training-accent))',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'training-card': '1.5rem'
      },
      boxShadow: {
        'training-card': '0 4px 20px rgba(0,0,0,0.08)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
      fontFamily: {
        'futura': ['Futura', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'rounded-mplus': ['Rounded Mplus 1c', 'sans-serif'],
        'dot': ['DotGothic16', 'monospace'],
        'training-primary': ['var(--training-font-primary)'],
        'training-secondary': ['var(--training-font-secondary)'],
        'training-mono': ['var(--training-font-mono)'],
      },
      spacing: {
        'training-1': 'var(--training-space-1)',
        'training-2': 'var(--training-space-2)',
        'training-3': 'var(--training-space-3)',
        'training-4': 'var(--training-space-4)',
        'training-6': 'var(--training-space-6)',
        'training-8': 'var(--training-space-8)',
        'training-12': 'var(--training-space-12)',
        'training-16': 'var(--training-space-16)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
