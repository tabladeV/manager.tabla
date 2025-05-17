import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import * as path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ─── DEV OPTIONS ─────────────────────────────────────────────────────────────
      // serve & register your SW even in dev, so you can test push locally
      devOptions: {
        enabled: true,
        type: 'module',
      },

      // ─── INJECT-MANIFEST ─────────────────────────────────────────────────────────
      strategies: 'injectManifest',
      srcDir: 'src',                           // ← look in `src/`
      filename: 'firebase-messaging-sw.js',    // ← your SW file in `src/`
      injectManifest: {
        globDirectory: path.resolve(__dirname, 'dist'),
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,  // bump to 5 MiB
      },

      // ─── REGISTRATION & MANIFEST ─────────────────────────────────────────────────
      injectRegister: false,
      // registerType: 'autoUpdate',
      registerType:'prompt',
      manifest: {
        name: 'Tabla Back Office',
        short_name: 'Tabla BO',
        description: 'Tabla Back Office',
        theme_color: '#06091c',
        background_color: '#06091c',
        display: 'standalone',
        icons: [
          { src: '/logo.png', sizes: '48x48',   type: 'image/png' },
          { src: '/logo.png', sizes: '96x96',   type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' }
        ]
      }
    })
  ],
});
