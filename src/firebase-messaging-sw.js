// src/firebase-messaging-sw.js
// eslint-disable-next-line no-undef
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);
// eslint-disable-next-line no-undef
const { precacheAndRoute } = workbox.precaching;
precacheAndRoute(self.__WB_MANIFEST)

/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// --- IMPORTANT: REPLACE WITH YOUR ACTUAL FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyASiN6DhFjj2kPJbke_MIXmLdRD0A7A1IU",
    authDomain: "tabla-d9fdb.firebaseapp.com",
    projectId: "tabla-d9fdb",
    storageBucket: "tabla-d9fdb.firebasestorage.app",
    messagingSenderId: "511226021492",
    appId: "1:511226021492:web:cd57bf0b58f828368fb321",
    measurementId: "G-C2G4FJ6HGL"
};
// --- END OF IMPORTANT CONFIG ---

// eslint-disable-next-line no-undef
if (!firebase.apps.length) {
    // eslint-disable-next-line no-undef
    firebase.initializeApp(firebaseConfig);
}
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        icon: '/logo.png', // Replace with your app icon (e.g., /logo192.png if you add one)
        badge: '/logo.png',
        data: payload.data,
        tag: payload.data?.notification_type || 'default' // Group similar notifications
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
    event.notification.close();
    const urlToOpen = event.notification.data?.url || event.notification.data?.link || '/';
    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // eslint-disable-next-line no-undef
            if (clients.openWindow) {
                // eslint-disable-next-line no-undef
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
