/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141414',
          soft: '#262626',
        },
        canvas: {
          DEFAULT: '#ffffff',
          soft: '#f3f3f3',
        },
        field: '#f0f0f0',
        hairline: {
          DEFAULT: '#e0e0e0',
          soft: '#f0f0f0',
        },
        text: {
          muted: '#707070',
          faint: '#adadad',
        },
        accent: {
          DEFAULT: '#0066ff',
          hover: '#0052cc',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontWeight: {
        light: '300',
        normal: '456',
        medium: '500',
        semibold: '600',
        heading: '652',
        bold: '700',
      },
      lineHeight: {
        tight: '1.0',
        heading: '1.13',
        snug: '1.25',
        title: '1.3',
        body: '1.38',
        relaxed: '1.43',
      },
      borderRadius: {
        none: '0px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        squircle: '30%',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        soft: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      letterSpacing: {
        normal: '0',
      },
    },
  },
  plugins: [],
}
