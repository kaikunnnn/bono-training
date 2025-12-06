import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

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
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
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
          'text': {
            'primary': 'hsl(var(--training-text-primary))',
            'secondary': 'hsl(var(--training-text-secondary))'
          },
          'gradient': {
            'start': 'hsl(var(--training-gradient-start))',
            'middle': 'hsl(var(--training-gradient-middle))',
            'end': 'hsl(var(--training-gradient-end))'
          }
        },
        'lesson': {
          // Hero Section
          'hero-gradient-start': 'rgba(253, 251, 245, 0.88)',
          'hero-gradient-mid': 'rgba(244, 232, 223, 1)',
          'hero-gradient-end': 'rgba(239, 237, 255, 0.08)',
          'hero-overlay': 'rgba(0, 0, 0, 0.2)',
          'hero-text': '#0D221D',
          'hero-nav-text': '#909090',

          // Quest Section
          'quest-title': '#151834',
          'quest-detail': '#6F7178',
          'quest-meta': '#7D8691',
          'quest-border': 'rgba(0, 0, 0, 0.06)',
          'quest-card-bg': '#FFFFFF',
          'quest-divider': '#EEEEEE',

          // Content Item
          'item-number': '#414141',
          'item-title': '#5A5A5A',
          'item-duration': '#8C8C8C',
          'item-thumbnail-bg': '#E0DFDF',

          // Tab
          'tab-active': '#000000',
          'tab-inactive': '#737373',
          'tab-border': 'rgba(0, 0, 0, 0.1)',

          // Overview Tab
          'overview-heading': '#151834',
          'overview-text': '#0D0F18',
          'overview-checkbox-bg': '#FAFAFA',
          'overview-image-bg': '#F3F3F3',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'training-card': '1.5rem'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(252deg, rgba(253, 251, 245, 0.88) 15%, rgba(244, 232, 223, 1) 55%, rgba(239, 237, 255, 0.08) 94%)',
      },
      boxShadow: {
        'training-card': '0 4px 20px rgba(0,0,0,0.08)',
        'quest-card': '1px 1px 4px 0px rgba(0, 0, 0, 0.08)',
        'hero-icon': '1px 1px 13.56px 0px rgba(0, 0, 0, 0.33)',
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
        'gradient-fade-in': {
          '0%': {
            opacity: '0',
            background: 'linear-gradient(180deg, hsl(var(--training-gradient-start)) 0%, transparent 100%)'
          },
          '100%': {
            opacity: '1', 
            background: 'var(--training-gradient-bg)'
          }
        },
        'gradient-slide': {
          '0%': { 
            'background-position': '-100% center',
            'background-size': '200% 100%'
          },
          '100%': { 
            'background-position': '0% center',
            'background-size': '100% 100%'
          }
        },
        'gradient-scale-slide': {
          '0%': { 
            'background-position': '-100% center',
            'background-size': '400% 250%',
            'transform': 'scale(2.0)'
          },
          '100%': { 
            'background-position': '0% center',
            'background-size': '100% 100%',
            'transform': 'scale(1)'
          }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'gradient-fade-in': 'gradient-fade-in 0.8s ease-out forwards',
        'gradient-slide': 'gradient-slide 1.2s ease-out forwards',
        'gradient-scale-slide': 'gradient-scale-slide 2.0s cubic-bezier(0.215, 0.61, 0.355, 1) -0.3s forwards',
      },
      fontFamily: {
        'futura': ['Futura', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'noto-sans-jp': ['Noto Sans JP', 'Noto Sans', 'sans-serif'],
        'noto': ['Noto Sans JP', 'sans-serif'], // Blog用ショートハンド
        'hind': ['Hind', 'sans-serif'], // Blog用フォント
        'rounded-mplus': ['M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
        'rounded-mplus-bold': ['M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
        'dot': ['DotGothic16', 'monospace'],
        'geist': ['Inter', 'sans-serif'], // Geistの代わりにInterを使用
        'luckiest': ['Luckiest Guy', 'sans-serif'],
      },
      // アイコンブロック用のカスタムクラス
      extend: {
        spacing: {
          'icon-block-sm': '80px',
          'icon-block-md': '100px', 
          'icon-block-lg': '120px',
          'icon-inner-sm': '44px',
          'icon-inner-md': '56px',
          'icon-inner-lg': '68px',
        }
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
