/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
];
export const darkMode = 'class';
export const theme = {
  extend: {
    animation: {
      progress: 'progress 1s infinite linear',
    },
    keyframes: {
      progress: {
        '0%': { transform: ' translateX(0) scaleX(0)' },
        '40%': { transform: 'translateX(0) scaleX(0.4)' },
        '100%': { transform: 'translateX(100%) scaleX(0.5)' },
      },
    },
    transformOrigin: {
      'left-right': '0% 50%',
    },
    screens: {
      // "Less than" variants
      'lt-sm': { max: '639px' },// Screens less than the default `sm` breakpoint
      'lt-md': { max: '767px' },
      'lt-lg': { max: '1023px' },
      'lt-xl': { max: '1279px' },

      // "Greater than" variants
      'gt-sm': { min: '640px' },
      'gt-md': { min: '768px' },
      'gt-lg': { min: '1024px' },
      'gt-xl': { min: '1280px' },

      'sm-only': { min: '640px', max: '767px' },
      'md-only': { min: '768px', max: '1023px' },
      'lg-only': { min: '1024px', max: '1279px' },
      'xl-only': { min: '1280px', max: '1535px' },
    },
    colors: {
      whitetheme: "#ffffff",
      softwhitetheme: "#ffffff77",
      greentheme: '#88AB61',
      softgreentheme: '#88AB611A',
      blacktheme: '#1A1A1A',
      subblack: '#1E1E1E80',
      softredtheme: '#FF4B4B1A',
      redtheme: '#FF4B4B',
      orangetheme: '#FFA500',
      softorangetheme: '#FFA5001A',
      purpletheme: '#7b2cbf',
      softpurpletheme: '#7b2cbf1A',
      blushtheme: '#b75d69',
      softblushtheme: '#b75d691A',
      bluetheme: '#3F72AF',
      softbluetheme: '#3F72AF1A',
      browntheme: '#9c6644',
      softbrowntheme: '#9c66441A',
      yellowtheme: '#F09300',
      softyellowtheme: '#FDE0301A',
      greytheme: '#1E1E1E',
      softgreytheme: '#f3f3f3',
      bgdarktheme: '#031911',
      bgdarktheme2: '#042117',
      darkthemeitems: '#05291c',
      textdarktheme: '#f5f4f2',
    },
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
  }
};
export const plugins = [];
