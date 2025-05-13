// public/firebase-messaging-sw.js
/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        icon: '/vite.svg', // Replace with your app icon (e.g., /logo192.png if you add one)
        badge: '/vite.svg',
        data: payload.data
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
    event.notification.close();
    const urlToOpen = event.notification.data?.url || event.notification.data?.link || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});