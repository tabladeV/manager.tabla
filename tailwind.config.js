/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        'lt-sm': {'max': '639px'}, // Screens less than the default `sm` breakpoint
      },
      colors: {
        whitetheme: "#ffffff",
        softwhitetheme: "#ffffff50",
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
    darkMode: {
      colors: {
        whitetheme: "#1A1A1A", // Dark mode equivalent for white
        softwhitetheme: "#1A1A1A50",
        greentheme: '#6B8B3C',
        softgreentheme: '#6B8B3C1A',
        blacktheme: '#ffffff', // Dark mode background as white
        subblack: '#D3D3D380',
        softredtheme: '#FF4B4B33',
        redtheme: '#D72638',
        bluetheme: '#2C5379',
        softbluetheme: '#2C53791A',
        yellowtheme: '#D07800',
        softyellowtheme: '#F1C40F1A',
        greytheme: '#2E2E2E',
        softgreytheme: '#3C3C3C',
      }
    }
  },
  plugins: [],
};
