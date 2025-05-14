import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Consider 'prompt' for more user control over updates
      injectRegister: null, // We will use the manual registration in src/providers/firebase.ts
      devOptions: {
        enabled: true, // Enable PWA features in development mode
        type: 'module', // Recommended for development service worker type
      },
      manifest: {
        name: 'Tabla Back Office',
        short_name: 'TablaBO',
        description: 'Tabla Back Office For Online Restaurant Booking System',
        theme_color: '#ffffff', // Adjust to your app's theme color
        background_color: '#ffffff', // Adjust to your app's background color
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png', // Path relative to your public folder (public/logo.png)
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo.png', // Path relative to your public folder (public/logo.png)
            sizes: '512x512',
            type: 'image/png',
          },
          // You can add more icon sizes and types here
          // e.g., for maskable icons:
          // {
          //   src: 'maskable_icon.png',
          //   sizes: '196x196',
          //   type: 'image/png',
          //   purpose: 'maskable'
          // }
        ],
      },
      // Configuration for injectManifest strategy
      strategies: 'injectManifest',
      srcDir: 'src', // The directory where your custom service worker source file is located
      filename: 'custom-sw.js', // The name of your custom service worker source file in srcDir
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'], // Files to be precached
        swDest: 'sw.js', // The name of the output service worker file in the dist directory
      },
    }),
  ],
});
