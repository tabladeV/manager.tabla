import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabla.tablamanager',
  appName: 'Tabla Back Office',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Uncomment for development with live reload
    // url: 'http://192.168.1.100:5173',
    // cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "DEFAULT",
      overlaysWebView: false
    }
  }
};

export default config;
