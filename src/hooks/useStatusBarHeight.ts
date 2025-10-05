import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export const useIOSNotchHeight = () => {
  const [notchHeight, setNotchHeight] = useState(0);

  useEffect(() => {
    const getIOSNotchHeight = () => {
      // Only calculate for iOS - Android handles spacing automatically via StatusBar plugin
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
        setNotchHeight(0);
        return;
      }

      // Try to get safe area from CSS environment variables first (most accurate)
      const safeAreaTop = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('env(safe-area-inset-top)')
          .replace('px', '') ||
        getComputedStyle(document.documentElement)
          .getPropertyValue('constant(safe-area-inset-top)')
          .replace('px', '') || '0'
      );

      if (safeAreaTop > 20) {
        // Use actual safe area if available (includes notch height)
        setNotchHeight(safeAreaTop);
      } else {
        // Fallback: Detect notch based on device characteristics
        const { screen } = window;
        const isIPhoneX = screen.height === 812 && screen.width === 375; // iPhone X/XS
        const isIPhoneXR = screen.height === 896 && screen.width === 414; // iPhone XR
        const isIPhoneXMax = screen.height === 896 && screen.width === 414; // iPhone XS Max
        const isIPhone12Mini = screen.height === 812 && screen.width === 375; // iPhone 12 Mini
        const isIPhone12 = screen.height === 844 && screen.width === 390; // iPhone 12/13
        const isIPhone12Pro = screen.height === 926 && screen.width === 428; // iPhone 12/13 Pro Max
        const isIPhone14 = screen.height === 852 && screen.width === 393; // iPhone 14
        const isIPhone14Pro = screen.height === 932 && screen.width === 430; // iPhone 14 Pro/Pro Max

        const hasNotch = isIPhoneX || isIPhoneXR || isIPhoneXMax || isIPhone12Mini ||
                        isIPhone12 || isIPhone12Pro || isIPhone14 || isIPhone14Pro ||
                        (screen.height >= 812 && screen.width >= 375); // General notch detection

        if (hasNotch) {
          // Notch devices: safe area typically 44-47px
          setNotchHeight(44);
        } else {
          // Non-notch devices: standard status bar 20px
          setNotchHeight(20);
        }
      }
    };

    getIOSNotchHeight();
  }, []);

  return notchHeight;
};