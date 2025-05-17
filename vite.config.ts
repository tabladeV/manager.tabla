import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import * as path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifestFilename: 'manifest.json',   // ← this makes the generated file manifest.json
      devOptions: {
        enabled: true,
        type: 'module',
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'firebase-messaging-sw.js',
      injectManifest: {
        globDirectory: path.resolve(__dirname, 'dist'),
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      injectRegister: false,
      // registerType: 'prompt',
      registerType:'prompt',
      manifest: {
        id: '1:511226021492:web:cd57bf0b58f828368fb321',
        name: 'Tabla Back Office',
        short_name: 'Tabla BO',
        description: 'Tabla Back Office For Online Restaurant Booking System',
        start_url: '.',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#88ab61',
        icons: [
          {
            src: '/src/assets/LOGO.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/src/assets/LOGO.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});

