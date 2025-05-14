// filepath: src/custom-sw.js
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precaching setup (self.__WB_MANIFEST is injected by Workbox)
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup outdated caches
cleanupOutdatedCaches();

// Optional: Example caching strategies for external resources like Google Fonts
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);
registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }), // 1 year
    ],
  })
);

// Firebase Cloud Messaging Service Worker Logic
// Import Firebase scripts (ensure versions are what you need)
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyASiN6DhFjj2kPJbke_MIXmLdRD0A7A1IU",
    authDomain: "tabla-d9fdb.firebaseapp.com",
    projectId: "tabla-d9fdb",
    storageBucket: "tabla-d9fdb.firebasestorage.app",
    messagingSenderId: "511226021492",
    appId: "1:511226021492:web:cd57bf0b58f828368fb321",
    measurementId: "G-C2G4FJ6HGL"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[custom-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        icon: '/logo.png', // Ensure 'public/logo.png' exists
        badge: '/logo.png', // Ensure 'public/logo.png' exists for badging
        data: payload.data // Pass along any data from the push notification
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[custom-sw.js] Notification click Received.', event.notification);
    event.notification.close();

    // Customize this to open the correct URL based on notification data
    const urlToOpen = event.notification.data?.url || event.notification.data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                // If a window with the target URL is already open, focus it
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Optional: Allows the new service worker to activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});