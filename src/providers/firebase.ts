// src/providers/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, MessagePayload, onMessage } from 'firebase/messaging';
import { httpClient } from '../services/httpClient';
import { getSWRegistration } from './swManager';

const firebaseConfig = {
    apiKey: "AIzaSyASiN6DhFjj2kPJbke_MIXmLdRD0A7A1IU",
    authDomain: "tabla-d9fdb.firebaseapp.com",
    projectId: "tabla-d9fdb",
    storageBucket: "tabla-d9fdb.firebasestorage.app",
    messagingSenderId: "511226021492",
    appId: "1:511226021492:web:cd57bf0b58f828368fb321",
    measurementId: "G-C2G4FJ6HGL"
};


let app = null;
let messagingInstance = null;

// Only initialize Firebase on web platforms
if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
        app = initializeApp(firebaseConfig);
        messagingInstance = getMessaging(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Messaging, possibly due to unsupported environment (e.g., non-browser).", error);
    }
}

const registerTokenWithBackend = async (fcmToken: string) => {
    try {
        await httpClient.post('api/v1/device-tokens/', { // Assumes your Django API for device tokens
            token: fcmToken,
            device_type: 'WEB'
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            const axiosError = error as any;
            console.error('Error registering FCM token with backend:', axiosError.response?.data || error.message);
        } else {
            console.error('Error registering FCM token with backend:', String(error));
        }
    }
};

export const requestNotificationPermissionAndToken = async () => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return null;
    }
    if (!messagingInstance) { // Use the initialized instance
        console.error("Firebase Messaging not available.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await getSWRegistration();
            const currentToken = await getToken(messagingInstance, { // Use the initialized instance
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPO3O19QxBcc-j1k4wIZsrgxaFkqi8svWVMriCMltjFr1E1e58FcnAw-2Ogyttiryb7508I4O45fwDWnKpOf6FA",
                serviceWorkerRegistration: registration
            });
            if (currentToken) {
                await registerTokenWithBackend(currentToken);
                return currentToken;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const requestTokenOnly = async () => {
    if (!messagingInstance) {
        console.error("Firebase Messaging not available.");
        return null;
    }

    try {
        const registration = await getSWRegistration();
        if (!registration) {
            console.error('Service Worker registration not found.');
            return null;
        }
        const currentToken = await getToken(messagingInstance, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPO3O19QxBcc-j1k4wIZsrgxaFkqi8svWVMriCMltjFr1E1e58FcnAw-2Ogyttiryb7508I4O45fwDWnKpOf6FA",
            serviceWorkerRegistration: registration
        });

        if (currentToken) {
            await registerTokenWithBackend(currentToken);
            return currentToken;
        } else {
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onForegroundMessageHandler = (callback: { (payload: { notification: any; data: any; }): void; (arg0: MessagePayload): void; }) => {
    if (!messagingInstance) { // Use the initialized instance
        console.error("Firebase Messaging not available for foreground handler.");
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => { }; // Return an empty unsubscribe function
    }
    return onMessage(messagingInstance, (payload) => { // Use the initialized instance
        callback(payload);
    });
};