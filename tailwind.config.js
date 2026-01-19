/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		// Container query sizes
  		containers: {
  			'2xs': '16rem',
  			'xs': '20rem',
  			'sm': '24rem',
  			'md': '28rem',
  			'lg': '32rem',
  			'xl': '36rem',
  			'2xl': '42rem',
  			'3xl': '48rem',
  			'4xl': '56rem',
  		},
  		// Fluid spacing using clamp
  		spacing: {
  			'fluid-xs': 'clamp(0.25rem, 1vw, 0.5rem)',
  			'fluid-sm': 'clamp(0.5rem, 2vw, 1rem)',
  			'fluid-md': 'clamp(1rem, 3vw, 1.5rem)',
  			'fluid-lg': 'clamp(1.5rem, 4vw, 2.5rem)',
  			'fluid-xl': 'clamp(2rem, 5vw, 4rem)',
  			'fluid-2xl': 'clamp(3rem, 8vw, 6rem)',
  		},
  		// Fluid font sizes
  		fontSize: {
  			'fluid-xs': ['clamp(0.75rem, 1.5vw, 0.875rem)', { lineHeight: '1.5' }],
  			'fluid-sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5' }],
  			'fluid-base': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6' }],
  			'fluid-lg': ['clamp(1.125rem, 3vw, 1.25rem)', { lineHeight: '1.5' }],
  			'fluid-xl': ['clamp(1.25rem, 3.5vw, 1.5rem)', { lineHeight: '1.4' }],
  			'fluid-2xl': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.3' }],
  			'fluid-3xl': ['clamp(1.875rem, 5vw, 2.5rem)', { lineHeight: '1.2' }],
  			'fluid-4xl': ['clamp(2.25rem, 6vw, 3rem)', { lineHeight: '1.1' }],
  			'fluid-5xl': ['clamp(3rem, 8vw, 4rem)', { lineHeight: '1' }],
  			'fluid-hero': ['clamp(2rem, 6vw + 1rem, 4.5rem)', { lineHeight: '1.1', fontWeight: '800' }],
  		},
  		keyframes: {
  			'check-bounce': {
  				'0%': { transform: 'scale(0)', opacity: '0' },
  				'50%': { transform: 'scale(1.2)' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0', transform: 'translateY(-4px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'pulse-subtle': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.85' }
  			},
  			'glow-green': {
  				'0%, 100%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)' },
  				'50%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }
  			}
  		},
  		animation: {
  			'check-bounce': 'check-bounce 0.4s ease-out forwards',
  			'fade-in': 'fade-in 0.3s ease-out forwards',
  			'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
  			'glow-green': 'glow-green 1.5s ease-in-out'
  		},
  		fontFamily: {
  			// Primary brand font - industrial/coffee shop feel
  			'brand': ['Roboto Slab', 'serif'],
  			// Headers and emphasis - strong, industrial
  			'heading': ['Oswald', 'sans-serif'],
  			// Body text - clean, modern, readable
  			'body': ['Work Sans', 'sans-serif'],
  			// Alternative sans-serif - technical/modern
  			'sans-alt': ['Barlow', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			nav: {
  				active: 'hsl(var(--nav-active))',
  				inactive: 'hsl(var(--nav-inactive))',
  				hover: 'hsl(var(--nav-hover))'
  			}
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
}
