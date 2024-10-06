/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'lt-sm': {'max': '639px'}, // Screens less than the default `sm` breakpoint
      },
      colors: {
        greentheme: '#88AB61',
        softgreentheme: '#88AB611A',
        blacktheme: '#1A1A1A',
        subblack: '#1E1E1E80',
        softredtheme: '#FF4B4B1A',
        redtheme: '#FF4B4B',
        bluetheme: '#3F72AF',
        softbluetheme: '#3F72AF1A',
        yellowtheme: '#F09300',
        softyellowtheme: '#FDE0301A',
        greytheme: '#1E1E1E',
        softgreytheme: '#f3f3f3',

      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
