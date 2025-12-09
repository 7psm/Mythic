/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./*.html", // Au cas où vous avez des HTML à la racine
  ],
  theme: {
    extend: {
      colors: {
        'background-dark': '#0a0a0e',
        'gold': {
          light: '#fceabb',
          DEFAULT: '#d4af37',
          dark: '#c29d28',
        },
        'text': {
          white: '#ffffff',
          light: '#e0e0e0',
          gray: '#cccccc',
          'gray-dark': '#999999',
        },
        gold: {
          primary: "#d4af37",
          light: "#fceabb",
          dark: "#c29d28",
        },
        textc: {
          white: "#ffffff",
          gray: "#cccccc",
          dark: "#495057",
        },
        bgc: {
          dark: "#0a0a0e",
          light: "#ffffff",
        },
        borderc: {
          dark: "rgba(212,175,55,0.2)",
        },
      },
      boxShadow: {
        gold: "0 4px 20px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(45deg, #c29d28, #d4af37, #fceabb)',
        'gold-gradient-90': 'linear-gradient(90deg, #fceabb 0%, #d4af37 60%, #c29d28 100%)',
      },
      animation: {
        'gradient': 'gradient-animation 3s ease infinite',
      },
      keyframes: {
        'gradient-animation': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      boxShadow: {
        'gold': '0 8px 25px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 12px 30px rgba(212, 175, 55, 0.4)',
      },
      keyframes: {
        logoGlow: {
          '0%': { boxShadow: '0 15px 40px rgba(0,122,204,0.4)', transform: 'scale(1)' },
          '100%': { boxShadow: '0 20px 50px rgba(111,66,193,0.6)', transform: 'scale(1.02)' },
        },
        logoShine: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '50%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' },
          '100%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
        },
        dots: {
          '0%,20%': { content: "''" },
          '40%': { content: "'.'" },
          '60%': { content: "'..'" },
          '80%,100%': { content: "'...'" },
        },
        fadeOut: {
          '100%': { opacity: 0, transform: 'scale(.95)' }
        },
        gradientMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        logoGlow: 'logoGlow 2s ease-in-out infinite alternate',
        logoShine: 'logoShine 3s ease-in-out infinite',
        dots: 'dots 1.5s infinite',
        fadeOut: 'fadeOut .5s ease-out forwards',
        'gradient-move': 'gradientMove 6s ease infinite'
      },
      
    },
  },
  plugins: [],
}