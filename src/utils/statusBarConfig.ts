import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const initializeStatusBar = async () => {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Default });

    // Make status bar transparent and overlay false to prevent content from going under it
    await StatusBar.setOverlaysWebView({ overlay: false });

    // Show the status bar if it's hidden
    await StatusBar.show();

    // Set background color (only works on Android)
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (error) {
    console.error('Error initializing status bar:', error);
  }
};

export const updateStatusBarStyle = async (isDarkMode: boolean) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({
      style: isDarkMode ? Style.Dark : Style.Light
    });

    // Update background color on Android
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({
        color: isDarkMode ? '#031911' : '#ffffff'
      });
    }
  } catch (error) {
    console.error('Error updating status bar style:', error);
  }
};